#!/usr/bin/env tsx
/**
 * 取り込み(ingest): data/dates.json の観戦日をもとに公式サイトを取得・解析し、
 * data/games.json を生成する。GitHub Actions 上で実行する想定（外部ネット必須）。
 *
 * ルール（詳細・分岐は src/lib/ingestCore.ts の mergeIngest を参照）:
 * - データ源はスクレイピングのみ（手編集・override なし）。
 * - 確定済み(win/lose/draw)は再取得しない。scheduled・cancelled・失敗分は再取得（自己修復）。
 * - 試合前の日は scheduled として保存（事前登録の受け皿）。
 * - --force で全件再取得。--year YYYY で対象年を限定。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { DatesData, Game, GamesData } from "#/types/game";
import { mergeIngest } from "#/lib/ingest/ingestCore";
import { sleep, SCRAPING_DELAY_MS } from "#/lib/ingest/sleepUtils";

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

async function fetchHtml(year: string, mmdd: string): Promise<string> {
  const res = await fetch(gameUrl(year, mmdd), {
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

  const { games, failures, fetched } = await mergeIngest(dates, existing, {
    fetchHtml,
    force: args.force,
    yearFilter: args.year,
    sleep: () => sleep(SCRAPING_DELAY_MS),
  });

  const output: GamesData = { generatedAt: new Date().toISOString(), games };
  writeFileSync(GAMES_PATH, `${JSON.stringify(output, null, 2)}\n`);
  writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({ generatedAt: output.generatedAt, failures }, null, 2)}\n`,
  );

  for (const f of failures) console.error(`  ✗ ${f.id}: ${f.error}`);
  const scheduled = games.filter((g) => g.result === "scheduled").length;
  console.log(
    `Done. total=${games.length} fetched=${fetched} scheduled=${scheduled} failures=${failures.length}`,
  );
  if (failures.length > 0) console.log(`  failures recorded in ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
