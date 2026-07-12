import type { GameResult, HomeAway } from "#/domain/game";
import { ATTENDED_RESULTS } from "#/domain/game";
import type { GameFilter } from "./filters";
import { resolveStadium, resolveTeam } from "#/domain/masters";

/** URL search params と 1:1 の絞り込み表現（未指定はキーごと省略） */
export interface GameSearch {
  year?: string;
  stadium?: string[];
  opponent?: string[];
  home?: HomeAway;
  result?: GameResult[];
}

// 絞り込み可能な勝敗（＝観戦済み表示に載る値）。予定(scheduled)・詳細不明(unknown)は URL でも受理しない。
// 単一定義元は domain/game.ts の ATTENDED_RESULTS（型で保証された GameResult のサブセット）。

function toStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const arr = [...new Set(value.map(String).filter(Boolean))];
    return arr.length > 0 ? arr : undefined;
  }
  if (typeof value === "string" && value) return [value];
  return undefined;
}

/** TanStack Router の validateSearch 用。不正値をサニタイズ。 */
export function validateGameSearch(search: Record<string, unknown>): GameSearch {
  const out: GameSearch = {};

  if (typeof search.year === "string" && /^\d{4}$/.test(search.year)) out.year = search.year;

  const stadium = toStringArray(search.stadium);
  if (stadium) out.stadium = stadium;

  const opponent = toStringArray(search.opponent);
  if (opponent) out.opponent = opponent;

  if (search.home === "home" || search.home === "away") out.home = search.home;

  const result = toStringArray(search.result)?.filter((r): r is GameResult =>
    (ATTENDED_RESULTS as readonly string[]).includes(r),
  );
  if (result && result.length > 0) out.result = result;

  return out;
}

// URL値は安定ID想定だが、旧ブックマーク等の表示名も masters 経由でIDへ写像する
// （既にIDの値はフォールバックでそのまま返るため無害）。重複は除去。
function toIds(values: string[] | undefined, resolveId: (v: string) => string): string[] {
  return values ? [...new Set(values.map(resolveId))] : [];
}

export function searchToFilter(search: GameSearch): GameFilter {
  return {
    year: search.year ?? "all",
    stadiums: toIds(search.stadium, (v) => resolveStadium(v).id),
    opponents: toIds(search.opponent, (v) => resolveTeam(v).id),
    homeAway: search.home ?? "all",
    results: search.result ?? [],
  };
}

export function filterToSearch(filter: GameFilter): GameSearch {
  const search: GameSearch = {};
  if (filter.year !== "all") search.year = filter.year;
  if (filter.stadiums.length > 0) search.stadium = filter.stadiums;
  if (filter.opponents.length > 0) search.opponent = filter.opponents;
  if (filter.homeAway !== "all") search.home = filter.homeAway;
  if (filter.results.length > 0) search.result = filter.results;
  return search;
}
