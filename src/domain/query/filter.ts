import type { Game, GameResult, HomeAway } from "#/domain/game";
import { yearOf } from "#/domain/game";

/** 絞り込み状態。URL(search params) と 1:1 対応。stadiums/opponents は安定ID。 */
export interface GameFilter {
  year: string | "all";
  stadiums: string[];
  opponents: string[];
  homeAway: HomeAway | "all";
  results: GameResult[];
}

export const emptyFilter: GameFilter = {
  year: "all",
  stadiums: [],
  opponents: [],
  homeAway: "all",
  results: [],
};

export function applyFilters(games: Game[], filter: GameFilter): Game[] {
  return games.filter((game) => {
    if (filter.year !== "all" && yearOf(game) !== filter.year) return false;
    if (filter.stadiums.length > 0 && !filter.stadiums.includes(game.stadiumId)) return false;
    if (filter.opponents.length > 0 && !filter.opponents.includes(game.opponentId)) return false;
    if (filter.homeAway !== "all" && game.homeAway !== filter.homeAway) return false;
    if (filter.results.length > 0 && !filter.results.includes(game.result)) return false;
    return true;
  });
}

/**
 * 有効な絞り込み条件の数（絞り込みバッジの数値と一致させるための単一の定義元）。
 * 年度・主催/ビジターは選択で 1、球場・相手・勝敗は選択数を数える。
 *
 * 「デフォルト状態と一致する年」は active としない（URL 未指定と semantic 同一のため）。
 *  - defaultYear 指定時: `filter.year === defaultYear` は non-active（URL 未指定と同じ）
 *  - defaultYear 未指定: `"all"` を non-active として扱う（従来仕様）
 */
export function countActiveFilters(filter: GameFilter, defaultYear?: string): number {
  const nonActiveYear = defaultYear ?? "all";
  return (
    (filter.year !== nonActiveYear ? 1 : 0) +
    filter.stadiums.length +
    filter.opponents.length +
    (filter.homeAway !== "all" ? 1 : 0) +
    filter.results.length
  );
}

export function isFilterActive(filter: GameFilter, defaultYear?: string): boolean {
  return countActiveFilters(filter, defaultYear) > 0;
}
