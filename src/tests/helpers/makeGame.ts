import type { Game } from "#/types/game";
import { resolveTeam, resolveStadium } from "#/lib/masters";

/**
 * テスト用の Game を組み立てる。opponent/stadium から安定IDを解決するので、
 * 実データと同じ ID 束ね（集計・絞り込み）の挙動を再現できる。
 * 既定は「主催・勝ち」。overrides で必要な項目だけ差し替える。
 */
export function makeGame(overrides: Partial<Game> = {}): Game {
  const opponent = overrides.opponent ?? "千葉ロッテ";
  const stadium = overrides.stadium ?? "エスコンフィールド";
  const base: Game = {
    id: overrides.id ?? overrides.date ?? "2025-04-01",
    date: overrides.date ?? "2025-04-01",
    opponent,
    opponentId: resolveTeam(opponent).id,
    stadium,
    stadiumId: resolveStadium(stadium).id,
    homeAway: "home",
    result: "win",
    score: { fighters: 5, opponent: 1 },
  };
  return { ...base, ...overrides };
}
