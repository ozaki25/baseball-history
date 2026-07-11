import type { GameResult } from "#/types/game";
import { RESULT_LABEL } from "#/lib/labels";

// 白文字でも WCAG AA を満たす濃色ソリッド（ライト/ダーク共通の固定色）。
const SOLID: Record<GameResult, string> = {
  win: "#1a7a46",
  lose: "#b0433b",
  draw: "#5b656f",
  cancelled: "#5f6b76",
  scheduled: "#016298",
  unknown: "#54606b",
};

export function ResultBadge({ result }: { result: GameResult }) {
  return (
    <span
      className="inline-flex min-w-[2.75rem] items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white"
      style={{ background: SOLID[result] }}
    >
      {RESULT_LABEL[result]}
    </span>
  );
}
