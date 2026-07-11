import type { GameResult } from "#/types/game";
import { RESULT_LABEL, RESULT_VAR } from "#/lib/labels";

export function ResultBadge({ result }: { result: GameResult }) {
  const outlined = result === "cancelled" || result === "scheduled";
  return (
    <span
      className="inline-flex min-w-[2.75rem] items-center justify-center px-1.5 py-0.5 text-xs font-bold"
      style={
        outlined
          ? { color: RESULT_VAR[result], border: `1px solid ${RESULT_VAR[result]}` }
          : { color: "#fff", background: RESULT_VAR[result] }
      }
    >
      {RESULT_LABEL[result]}
    </span>
  );
}
