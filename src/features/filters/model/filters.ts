import type { Game, GameResult, HomeAway } from "#/domain/game";
import { teamLabel, stadiumLabel } from "#/domain/masters";

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
    if (filter.year !== "all" && game.date.slice(0, 4) !== filter.year) return false;
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
 */
export function countActiveFilters(filter: GameFilter): number {
  return (
    (filter.year !== "all" ? 1 : 0) +
    filter.stadiums.length +
    filter.opponents.length +
    (filter.homeAway !== "all" ? 1 : 0) +
    filter.results.length
  );
}

export function isFilterActive(filter: GameFilter): boolean {
  return countActiveFilters(filter) > 0;
}

export interface Option {
  id: string;
  label: string;
}

export interface FilterOptions {
  years: string[];
  stadiums: Option[];
  opponents: Option[];
}

function collect(
  games: Game[],
  idOf: (g: Game) => string,
  labelOf: (id: string) => string,
): Option[] {
  const ids = new Set<string>();
  for (const g of games) if (idOf(g)) ids.add(idOf(g));
  return [...ids]
    .map((id) => ({ id, label: labelOf(id) }))
    .sort((a, b) => a.label.localeCompare(b.label, "ja"));
}

/**
 * 絞り込み選択肢を実データから生成（安定IDで束ね、代表名を表示）。
 * years は allYears（例: 観戦日マスタ dates.json の全年度）と実データの年を統合する。
 * これにより記録の無い年度も選択肢に残り「データなし」として表示できる（要件: 空白年を隠さない）。
 */
export function deriveOptions(games: Game[], allYears: string[] = []): FilterOptions {
  const years = new Set<string>(allYears);
  for (const g of games) years.add(g.date.slice(0, 4));
  return {
    years: [...years].sort((a, b) => b.localeCompare(a)),
    stadiums: collect(games, (g) => g.stadiumId, stadiumLabel),
    opponents: collect(games, (g) => g.opponentId, teamLabel),
  };
}
