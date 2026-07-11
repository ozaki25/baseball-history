import type { Game, GameResult, HomeAway } from "#/types/game";
import { teamLabel, stadiumLabel } from "./masters";

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

export function isFilterActive(filter: GameFilter): boolean {
  return (
    filter.year !== "all" ||
    filter.stadiums.length > 0 ||
    filter.opponents.length > 0 ||
    filter.homeAway !== "all" ||
    filter.results.length > 0
  );
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

/** 絞り込み選択肢を実データから生成（安定IDで束ね、代表名を表示）。 */
export function deriveOptions(games: Game[]): FilterOptions {
  const years = new Set<string>();
  for (const g of games) years.add(g.date.slice(0, 4));
  return {
    years: [...years].sort((a, b) => b.localeCompare(a)),
    stadiums: collect(games, (g) => g.stadiumId, stadiumLabel),
    opponents: collect(games, (g) => g.opponentId, teamLabel),
  };
}
