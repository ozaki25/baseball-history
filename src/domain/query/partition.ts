import type { Game } from "#/domain/game";
import { isAttended, isScheduled, yearOf } from "#/domain/game";
import { applyFilters, type GameFilter } from "#/domain/query/filter";

/**
 * ホーム画面の表示用に試合を「観戦済み(attended)」と「観戦予定(scheduled)」に分ける。
 * - attended: フィルタ適用後から scheduled を除いたもの。
 * - scheduled: 結果未確定で相手/球場/主催が不定なため、**年度フィルタのみ**で抽出する
 *   （球場・相手・主催・勝敗の各条件は無視。予定は別枠で表示するため）。
 */
export function partitionGames(
  games: Game[],
  filter: GameFilter,
): { attended: Game[]; scheduled: Game[] } {
  const filtered = applyFilters(games, filter);
  const scheduled = games.filter(
    (g) => isScheduled(g) && (filter.year === "all" || yearOf(g) === filter.year),
  );
  return {
    attended: filtered.filter(isAttended),
    scheduled,
  };
}
