import type { Game } from "#/types/game";

/**
 * 集計の定義（野球の通例）:
 * - 観戦数(attended): scheduled を除く（中止は現地に行ったため含める）
 * - 勝率(winRate): 勝 / (勝 + 敗)。引分・中止・予定は分母から除外。該当なしは null。
 * - scheduled（観戦予定）はすべての集計から除外する。
 */
export interface Summary {
  attended: number;
  win: number;
  lose: number;
  draw: number;
  cancelled: number;
  winRate: number | null;
}

export function summarize(games: Game[]): Summary {
  let win = 0;
  let lose = 0;
  let draw = 0;
  let cancelled = 0;
  let attended = 0;

  for (const game of games) {
    if (game.result === "scheduled") continue;
    attended += 1;
    switch (game.result) {
      case "win":
        win += 1;
        break;
      case "lose":
        lose += 1;
        break;
      case "draw":
        draw += 1;
        break;
      case "cancelled":
        cancelled += 1;
        break;
    }
  }

  const decided = win + lose;
  return { attended, win, lose, draw, cancelled, winRate: decided > 0 ? win / decided : null };
}

export type GroupKey = "stadium" | "opponent" | "year" | "homeAway";

export interface GroupRow extends Summary {
  key: string;
}

function groupValue(game: Game, key: GroupKey): string | null {
  switch (key) {
    case "year":
      return game.date.slice(0, 4);
    case "homeAway":
      return game.homeAway; // null（中止/予定など）は集計から除外
    case "stadium":
      return game.stadiumId || null; // 安定IDで束ねる。不明(空)は除外
    case "opponent":
      return game.opponentId || null;
  }
}

/** 軸別のクロス集計。観戦数の多い順→キー順で並べる。値が不明(null)の試合は除外。 */
export function groupBy(games: Game[], key: GroupKey): GroupRow[] {
  const buckets = new Map<string, Game[]>();
  for (const game of games) {
    const value = groupValue(game, key);
    if (value === null) continue;
    const bucket = buckets.get(value);
    if (bucket) bucket.push(game);
    else buckets.set(value, [game]);
  }

  return [...buckets.entries()]
    .map(([groupKey, groupGames]) => ({ key: groupKey, ...summarize(groupGames) }))
    .sort((a, b) => b.attended - a.attended || a.key.localeCompare(b.key, "ja"));
}

/** 勝率を ".xxx" 形式に整形（null は "-"）。 */
export function formatWinRate(rate: number | null): string {
  if (rate === null) return "-";
  return rate.toFixed(3).replace(/^0/, "");
}
