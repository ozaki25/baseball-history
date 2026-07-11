import type { DatesData, Game, GameResult } from "#/types/game";
import { parseGameHTML, looksCancelled } from "./parsers/gameParser";
import { normalizeText } from "../normalize";
import { resolveTeam, resolveStadium } from "../masters";

/** ファイターズ視点のスコアから勝敗を判定 */
export function resultFromScores(fightersScore: number, opponentScore: number): GameResult {
  if (fightersScore > opponentScore) return "win";
  if (fightersScore < opponentScore) return "lose";
  return "draw";
}

/** "2025", "0401" → "2025-04-01" */
export function toIsoDate(year: string, mmdd: string): string {
  return `${year}-${mmdd.slice(0, 2)}-${mmdd.slice(2, 4)}`;
}

/** 観戦日が「今日(JST)」より後か（＝まだ試合前 → scheduled 候補） */
export function isFutureDate(isoDate: string, now: Date = new Date()): boolean {
  const todayJst = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return isoDate > todayJst;
}

/** 公式サイトの試合結果 HTML から Game を組み立てる（解析不能時は throw） */
export function buildGame(id: string, isoDate: string, html: string): Game {
  const info = parseGameHTML(html);
  const opponent = normalizeText(info.vsTeam);
  const stadium = normalizeText(info.location);
  return {
    id,
    date: isoDate,
    opponent,
    opponentId: resolveTeam(opponent).id,
    stadium,
    stadiumId: resolveStadium(stadium).id,
    homeAway: info.isHome ? "home" : "away",
    result: resultFromScores(info.myScore, info.vsScore),
    score: { fighters: info.myScore, opponent: info.vsScore },
  };
}

/**
 * 既存レコードの opponentId/stadiumId を現行 masters で再解決して返す。
 * 表示名(opponent/stadium)は保持。masters の更新を再フェッチなしで反映するため、
 * ingest で確定済みレコードを保持する際に通す。
 */
export function withResolvedIds(game: Game): Game {
  return {
    ...game,
    opponentId: game.opponent ? resolveTeam(game.opponent).id : "",
    stadiumId: game.stadium ? resolveStadium(game.stadium).id : "",
  };
}

/** 詳細を持たない受け皿レコード（相手/球場/スコア空）。result だけが異なる。 */
function placeholderGame(id: string, isoDate: string, result: GameResult): Game {
  return {
    id,
    date: isoDate,
    opponent: "",
    opponentId: "",
    stadium: "",
    stadiumId: "",
    homeAway: null,
    result,
    score: { fighters: null, opponent: null },
  };
}

/** 事前登録（試合前）の受け皿となる scheduled レコード */
export function scheduledGame(id: string, isoDate: string): Game {
  return placeholderGame(id, isoDate, "scheduled");
}

/** 解析不能だが中止と判断できたときの受け皿 */
export function cancelledGame(id: string, isoDate: string): Game {
  return placeholderGame(id, isoDate, "cancelled");
}

/** 詳細不明（記録は残すが試合詳細は信頼できない）。日付のみの受け皿。fetch しない。 */
export function unknownGame(id: string, isoDate: string): Game {
  return placeholderGame(id, isoDate, "unknown");
}

const DECIDED = new Set<GameResult>(["win", "lose", "draw"]);

export interface IngestDeps {
  /** year, mmdd を受け取り HTML を返す（失敗時は throw）。呼び出し側でレート制御・URL組み立て */
  fetchHtml: (year: string, mmdd: string) => Promise<string>;
  /** 「今日」の基準（scheduled 判定用） */
  now?: Date;
  /** 確定済みも含め全件再取得 */
  force?: boolean;
  /** 対象年（未指定=全年） */
  yearFilter?: string;
  /** 1件処理ごとの待機（レート制御。テストでは省略で即時） */
  sleep?: () => Promise<void>;
  /** 詳細不明として日付のみ残す日(ISO)。取得せず unknown レコードにする（誤データも上書き）。 */
  dateOnly?: Set<string>;
}

export interface IngestResult {
  games: Game[];
  failures: { id: string; error: string }[];
  fetched: number;
}

/**
 * 取り込みの中核（IO 非依存・fetch を注入）。
 * - dateOnly 指定日は最優先で unknown(詳細不明)にする（取得しない／誤った既存も上書き）。
 * - 確定(win/lose/draw)は再取得せず保持（ID は再解決）。scheduled/cancelled は再取得。
 * - 未来日は scheduled。過去日は取得→解析、解析不能かつ中止表記なら cancelled。
 * - 取得失敗時は既存レコードを保持（データ消失防止）、無ければ失敗記録のみ。
 */
export async function mergeIngest(
  dates: DatesData,
  existing: Map<string, Game>,
  deps: IngestDeps,
): Promise<IngestResult> {
  const { fetchHtml, now = new Date(), force = false, yearFilter } = deps;
  const sleep = deps.sleep ?? (async () => {});
  const dateOnly = deps.dateOnly ?? new Set<string>();
  const isConfirmed = (g: Game | undefined) => g !== undefined && DECIDED.has(g.result) && !force;

  const games: Game[] = [];
  const failures: { id: string; error: string }[] = [];
  let fetched = 0;

  for (const [year, list] of Object.entries(dates)) {
    if (yearFilter && year !== yearFilter) {
      for (const mmdd of list) {
        const isoDate = toIsoDate(year, mmdd);
        if (dateOnly.has(isoDate)) games.push(unknownGame(isoDate, isoDate));
        else {
          const prev = existing.get(isoDate);
          if (prev) games.push(withResolvedIds(prev));
        }
      }
      continue;
    }

    for (const mmdd of list) {
      const isoDate = toIsoDate(year, mmdd);
      const id = isoDate;
      const prev = existing.get(id);

      // 詳細不明指定は最優先（誤った既存データも日付のみで上書き）。取得しない。
      if (dateOnly.has(id)) {
        games.push(unknownGame(id, isoDate));
        continue;
      }
      if (isConfirmed(prev)) {
        games.push(withResolvedIds(prev!));
        continue;
      }
      if (isFutureDate(isoDate, now)) {
        games.push(scheduledGame(id, isoDate));
        continue;
      }

      try {
        const html = await fetchHtml(year, mmdd);
        fetched += 1;
        try {
          games.push(buildGame(id, isoDate, html));
        } catch (parseErr) {
          if (looksCancelled(html)) games.push(cancelledGame(id, isoDate));
          else throw parseErr;
        }
      } catch (err) {
        failures.push({ id, error: err instanceof Error ? err.message : String(err) });
        if (prev) games.push(withResolvedIds(prev));
      } finally {
        await sleep();
      }
    }
  }

  games.sort((a, b) => a.date.localeCompare(b.date));
  return { games, failures, fetched };
}
