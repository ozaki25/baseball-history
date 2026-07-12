/**
 * ビルド時データゲートウェイ。
 *
 * 役割:
 *  - data/games.json と data/dates.json を読み、型で担保された ALL_GAMES / ALL_YEARS を提供する。
 *  - JSON 境界の形状ガード（parseGamesData/parseDatesData）を担う。SSG なので不正データは
 *    ビルド時に fail-fast（実行時コストゼロ）。
 *  - 「年度候補は dates.json のキー」というポリシーの単一定義元（画面が増えても複製されない）。
 *
 * 依存規則: features / ui / routes からの JSON 直読みは oxlint で禁止。JSON を触るのはこの層のみ。
 */

import gamesData from "../../data/games.json";
import datesData from "../../data/dates.json";
import type { DatesData, Game, GameResult, GamesData, HomeAway } from "#/domain/game";
import { GAME_RESULTS } from "#/domain/game";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const RESULT_SET = new Set<string>(GAME_RESULTS);
const HOME_AWAY_VALUES = new Set<string>(["home", "away"]);

function fail(path: string, msg: string): never {
  throw new Error(`[data ゲートウェイ] ${path}: ${msg}`);
}

function assertScore(
  v: unknown,
  path: string,
): { fighters: number | null; opponent: number | null } {
  if (v === null || typeof v !== "object") fail(path, "object を期待");
  const rec = v as Record<string, unknown>;
  for (const k of ["fighters", "opponent"] as const) {
    const x = rec[k];
    if (x !== null && typeof x !== "number") fail(`${path}.${k}`, "number | null を期待");
  }
  return {
    fighters: (rec.fighters as number | null) ?? null,
    opponent: (rec.opponent as number | null) ?? null,
  };
}

function assertGame(v: unknown, path: string): Game {
  if (v === null || typeof v !== "object") fail(path, "object を期待");
  const r = v as Record<string, unknown>;
  for (const k of ["id", "date", "opponent", "opponentId", "stadium", "stadiumId"] as const) {
    if (typeof r[k] !== "string") fail(`${path}.${k}`, "string を期待");
  }
  if (!ISO_DATE.test(r.date as string)) fail(`${path}.date`, `ISO 日付を期待: ${r.date}`);
  if (r.homeAway !== null && !HOME_AWAY_VALUES.has(r.homeAway as string)) {
    fail(`${path}.homeAway`, `"home"|"away"|null を期待: ${r.homeAway}`);
  }
  if (typeof r.result !== "string" || !RESULT_SET.has(r.result)) {
    fail(`${path}.result`, `GameResult を期待: ${r.result}`);
  }
  return {
    id: r.id as string,
    date: r.date as string,
    opponent: r.opponent as string,
    opponentId: r.opponentId as string,
    stadium: r.stadium as string,
    stadiumId: r.stadiumId as string,
    homeAway: r.homeAway as HomeAway | null,
    result: r.result as GameResult,
    score: assertScore(r.score, `${path}.score`),
  };
}

/** games.json 全体の形状ガード。ビルド時に一度だけ走る（SSG）。テスト向けに export。 */
export function parseGamesData(raw: unknown): GamesData {
  if (raw === null || typeof raw !== "object") fail("games.json", "object を期待");
  const r = raw as Record<string, unknown>;
  if (typeof r.generatedAt !== "string") fail("games.json.generatedAt", "string を期待");
  if (!Array.isArray(r.games)) fail("games.json.games", "配列を期待");
  return {
    generatedAt: r.generatedAt,
    games: r.games.map((g, i) => assertGame(g, `games.json.games[${i}]`)),
  };
}

/** dates.json 全体の形状ガード（{ "YYYY": ["MMDD", ...] } の辞書）。テスト向けに export。 */
export function parseDatesData(raw: unknown): DatesData {
  if (raw === null || typeof raw !== "object") fail("dates.json", "object を期待");
  const r = raw as Record<string, unknown>;
  const out: DatesData = {};
  for (const [year, list] of Object.entries(r)) {
    if (!/^\d{4}$/.test(year)) fail(`dates.json[${year}]`, "キーは 4 桁の年度");
    if (!Array.isArray(list)) fail(`dates.json.${year}`, "配列を期待");
    for (const d of list) {
      if (typeof d !== "string" || !/^\d{4}$/.test(d)) {
        fail(`dates.json.${year}[]`, `"MMDD" を期待: ${String(d)}`);
      }
    }
    out[year] = list as string[];
  }
  return out;
}

const PARSED_GAMES: GamesData = parseGamesData(gamesData);
const PARSED_DATES: DatesData = parseDatesData(datesData);

/** アプリ全体で参照する試合の総体。 */
export const ALL_GAMES: Game[] = PARSED_GAMES.games;

/**
 * 年度候補の単一定義元（dates.json のキー順＝JSON 上の並び）。
 * 観戦日マスタ全キー（記録の無い年度＝空配列年も含む）を渡し、「空白年を隠さない」
 * 要件を成り立たせる根拠。表示上の並びは消費側 deriveOptions が降順に整える。
 */
export const ALL_YEARS: string[] = Object.keys(PARSED_DATES);

/** games.json の generatedAt（取り込み時刻）。将来の可視化用に公開しておく。 */
export const GAMES_GENERATED_AT: string = PARSED_GAMES.generatedAt;
