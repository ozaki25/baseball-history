import type { GameResult, HomeAway } from "#/types/game";
import type { GameFilter } from "./filters";

/** URL search params と 1:1 の絞り込み表現（未指定はキーごと省略） */
export interface GameSearch {
  year?: string;
  stadium?: string[];
  opponent?: string[];
  home?: HomeAway;
  result?: GameResult[];
}

const RESULTS: readonly string[] = ["win", "lose", "draw", "cancelled", "scheduled"];

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

  const result = toStringArray(search.result)?.filter((r): r is GameResult => RESULTS.includes(r));
  if (result && result.length > 0) out.result = result;

  return out;
}

export function searchToFilter(search: GameSearch): GameFilter {
  return {
    year: search.year ?? "all",
    stadiums: search.stadium ?? [],
    opponents: search.opponent ?? [],
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
