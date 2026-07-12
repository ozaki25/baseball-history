import type { Game } from "#/domain/game";
import { isScheduled } from "#/domain/game";
import { AXES, type GroupKey } from "./axes";

/**
 * 集計の定義（野球の通例）:
 * - 観戦数(attended): scheduled を除く（中止・詳細不明は現地に行ったため含める）
 * - 勝率(winRate): 勝 / (勝 + 敗)。引分・中止・予定・詳細不明は分母から除外。該当なしは null。
 * - scheduled（観戦予定）はすべての集計から除外する。
 * - unknown（詳細不明）は観戦数に含めるが、勝敗・軸別集計には数えない
 *   （opponentId/stadiumId/homeAway が空のため軸別からは自然に除外される）。
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
    if (isScheduled(game)) continue;
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

export interface GroupRow extends Summary {
  key: string;
}

/**
 * 軸別のクロス集計。観戦数の多い順→表示ラベル順で並べる。値が不明(null)の試合は除外。
 * 軸の値抽出は AXES[key].valueOf に一元化されている。表示順の同数時タイブレークは
 * 呼び出し側が渡すラベル解決関数（既定は AXES[key].labelOf）に従う。
 */
export function groupBy(
  games: Game[],
  key: GroupKey,
  labelOf: (k: string) => string = AXES[key].labelOf,
): GroupRow[] {
  const valueOf = AXES[key].valueOf;
  const buckets = new Map<string, Game[]>();
  for (const game of games) {
    const value = valueOf(game);
    if (value === null) continue;
    const bucket = buckets.get(value);
    if (bucket) bucket.push(game);
    else buckets.set(value, [game]);
  }

  return [...buckets.entries()]
    .map(([groupKey, groupGames]) => ({ key: groupKey, ...summarize(groupGames) }))
    .sort((a, b) => b.attended - a.attended || labelOf(a.key).localeCompare(labelOf(b.key), "ja"));
}
