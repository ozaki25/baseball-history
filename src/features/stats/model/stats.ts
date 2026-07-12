import type { Game } from "#/domain/game";
import { isScheduled, yearOf } from "#/domain/game";
import { teamLabel, stadiumLabel } from "#/domain/masters";
import { HOME_AWAY_LABEL } from "#/domain/labels";

// 勝率整形は表示語彙として domain/labels に集約（stats.ts では re-export のみ維持）。
export { formatWinRate } from "#/domain/labels";

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

export type GroupKey = "stadium" | "opponent" | "year" | "homeAway";

export interface GroupRow extends Summary {
  key: string;
}

function groupValue(game: Game, key: GroupKey): string | null {
  switch (key) {
    case "year":
      return yearOf(game);
    case "homeAway":
      return game.homeAway; // null（中止/予定など）は集計から除外
    case "stadium":
      return game.stadiumId || null; // 安定IDで束ねる。不明(空)は除外
    case "opponent":
      return game.opponentId || null;
  }
}

/**
 * 軸別のクロス集計。観戦数の多い順→表示ラベル順で並べる。値が不明(null)の試合は除外。
 * 表示順はここ（集計層）に集約する。同数時の並びは labelOf（表示名）で決めるため、
 * 呼び出し側は key→表示名の解決関数を渡す（既定はキー文字列そのもの）。
 */
export function groupBy(
  games: Game[],
  key: GroupKey,
  labelOf: (key: string) => string = (k) => k,
): GroupRow[] {
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
    .sort((a, b) => b.attended - a.attended || labelOf(a.key).localeCompare(labelOf(b.key), "ja"));
}

/** 軸別集計の行ラベルを解決する（球場/相手は安定ID→代表名、主催/ビジターは日本語、年度はそのまま）。 */
export function rowLabel(tab: GroupKey, key: string): string {
  if (tab === "homeAway") return HOME_AWAY_LABEL[key as keyof typeof HOME_AWAY_LABEL] ?? key;
  if (tab === "stadium") return stadiumLabel(key);
  if (tab === "opponent") return teamLabel(key);
  return key;
}

const EMPTY_ROW = { attended: 0, win: 0, lose: 0, draw: 0, cancelled: 0, winRate: null };

/**
 * 表示行を作る。年度別のときは記録の無い年度も「データなし(0件)」として明示する
 * （要件: 空白年を隠さない）。空年度は末尾に年降順で並べる。
 */
export function buildRows(games: Game[], tab: GroupKey, years: string[] = []): GroupRow[] {
  const rows = groupBy(games, tab, (k) => rowLabel(tab, k));
  if (tab !== "year" || years.length === 0) return rows;
  const present = new Set(rows.map((r) => r.key));
  const empties = years
    .filter((y) => !present.has(y))
    .sort((a, b) => b.localeCompare(a))
    .map((y) => ({ key: y, ...EMPTY_ROW }));
  return [...rows, ...empties];
}
