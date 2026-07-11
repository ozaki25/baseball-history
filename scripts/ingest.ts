#!/usr/bin/env tsx
/**
 * 取り込み(ingest): data/dates.json の観戦日をもとに公式サイトを取得・解析し、
 * data/games.json を生成する。GitHub Actions 上で実行する想定（外部ネット必須）。
 *
 * ルール:
 * - データ源はスクレイピングのみ（手編集・override なし）。
 * - 確定済み(win/lose/draw)は再取得しない。scheduled・cancelled・失敗分は再取得（自己修復）。
 * - 試合前の日は scheduled として保存（事前登録の受け皿）。
 * - --force で全件再取得。--year YYYY で対象年を限定。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { DatesData, Game, GamesData } from "#/types/game";
import {
  buildGame,
  scheduledGame,
  toIsoDate,
  isFutureDate,
  looksCancelled,
  withResolvedIds,
} from "#/lib/ingestCore";
import { sleep, SCRAPING_DELAY_MS } from "#/lib/sleepUtils";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATES_PATH = resolve(root, "data/dates.json");
const GAMES_PATH = resolve(root, "data/games.json");
const REPORT_PATH = resolve(root, "data/ingest-report.json");

interface Args {
  force: boolean;
  year?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--force") args.force = true;
    else if (a === "--year") args.year = argv[(i += 1)];
  }
  return args;
}

function gameUrl(year: string, mmdd: string): string {
  return `https://www.fighters.co.jp/gamelive/result/${year}${mmdd}01/`;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
    headers: {
      "User-Agent": "kansen-note-ingest/1.0 (+https://github.com/ozaki25/baseball-history)",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dates = JSON.parse(readFileSync(DATES_PATH, "utf-8")) as DatesData;

  const existing = new Map<string, Game>();
  if (existsSync(GAMES_PATH)) {
    const prev = JSON.parse(readFileSync(GAMES_PATH, "utf-8")) as GamesData;
    for (const g of prev.games) existing.set(g.id, g);
  }

  // 確定＝勝敗が付いた試合のみ。scheduled と cancelled は毎回再取得して自己修復させる
  // （中止判定の誤検知が固着しないように）。
  const DECIDED = new Set<Game["result"]>(["win", "lose", "draw"]);
  const isConfirmed = (g: Game | undefined) =>
    g !== undefined && DECIDED.has(g.result) && !args.force;

  const result: Game[] = [];
  const failures: { id: string; error: string }[] = [];
  let fetched = 0;

  for (const [year, list] of Object.entries(dates)) {
    if (args.year && year !== args.year) {
      // 対象外の年は既存をそのまま維持
      for (const mmdd of list) {
        const id = toIsoDate(year, mmdd);
        const prev = existing.get(id);
        if (prev) result.push(withResolvedIds(prev));
      }
      continue;
    }

    for (const mmdd of list) {
      const isoDate = toIsoDate(year, mmdd);
      const id = isoDate;
      const prev = existing.get(id);

      if (isConfirmed(prev)) {
        result.push(withResolvedIds(prev!));
        continue;
      }

      if (isFutureDate(isoDate)) {
        result.push(scheduledGame(id, isoDate));
        continue;
      }

      try {
        const html = await fetchHtml(gameUrl(year, mmdd));
        fetched += 1;
        try {
          result.push(buildGame(id, isoDate, html));
        } catch (parseErr) {
          if (looksCancelled(html)) {
            result.push({
              id,
              date: isoDate,
              opponent: "",
              opponentId: "",
              stadium: "",
              stadiumId: "",
              homeAway: null,
              result: "cancelled",
              score: { fighters: null, opponent: null },
            });
          } else {
            throw parseErr;
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        failures.push({ id, error: message });
        console.error(`  ✗ ${id}: ${message}`);
        // 失敗時は既存レコードを保持（データ消失を防ぐ）。新規で未取得なら次回リトライ。
        if (prev) result.push(withResolvedIds(prev));
      } finally {
        await sleep(SCRAPING_DELAY_MS);
      }
    }
  }

  result.sort((a, b) => a.date.localeCompare(b.date));

  const output: GamesData = {
    generatedAt: new Date().toISOString(),
    games: result,
  };
  writeFileSync(GAMES_PATH, `${JSON.stringify(output, null, 2)}\n`);
  writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({ generatedAt: output.generatedAt, failures }, null, 2)}\n`,
  );

  const scheduled = result.filter((g) => g.result === "scheduled").length;
  console.log(
    `Done. total=${result.length} fetched=${fetched} scheduled=${scheduled} failures=${failures.length}`,
  );
  if (failures.length > 0) console.log(`  failures recorded in ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
