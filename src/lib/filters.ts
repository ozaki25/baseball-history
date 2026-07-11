import type { Game, GameResult, HomeAway } from "#/types/game";

/** 絞り込み状態。URL(search params) と 1:1 対応させる。 */
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
    if (filter.stadiums.length > 0 && !filter.stadiums.includes(game.stadium)) return false;
    if (filter.opponents.length > 0 && !filter.opponents.includes(game.opponent)) return false;
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

export interface FilterOptions {
  years: string[];
  stadiums: string[];
  opponents: string[];
}

/** 絞り込み選択肢を実データから生成（値が存在するものだけ）。 */
export function deriveOptions(games: Game[]): FilterOptions {
  const years = new Set<string>();
  const stadiums = new Set<string>();
  const opponents = new Set<string>();
  for (const game of games) {
    years.add(game.date.slice(0, 4));
    if (game.stadium) stadiums.add(game.stadium);
    if (game.opponent) opponents.add(game.opponent);
  }
  return {
    years: [...years].sort((a, b) => b.localeCompare(a)),
    stadiums: [...stadiums].sort((a, b) => a.localeCompare(b, "ja")),
    opponents: [...opponents].sort((a, b) => a.localeCompare(b, "ja")),
  };
}
