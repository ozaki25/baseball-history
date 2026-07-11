import type { Game, GameResult, HomeAway } from "#/types/game";

export const RESULT_LABEL: Record<GameResult, string> = {
  win: "勝",
  lose: "負",
  draw: "分",
  cancelled: "中止",
  scheduled: "予定",
};

export const HOME_AWAY_LABEL: Record<HomeAway, string> = {
  home: "主催",
  away: "ビジター",
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** "2025-04-01" → "2025.4.1(火)" */
export function formatDateJa(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(y!, m! - 1, d!).getDay()];
  return `${y}.${m}.${d}(${weekday})`;
}

/** スコア表示。中止・予定は "—" */
export function formatScore(game: Game): string {
  if (game.score.fighters === null || game.score.opponent === null) return "—";
  return `${game.score.fighters} - ${game.score.opponent}`;
}
