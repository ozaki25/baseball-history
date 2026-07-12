import type { Game } from "#/domain/game";
import { formatDateJa } from "#/domain/labels";
import { CalendarClock } from "lucide-react";

// 抽出（result==="scheduled" と年度絞り込み）は呼び出し側の責務。ここは受け取った予定を並べるだけ。
export function ScheduledList({ games }: { games: Game[] }) {
  const upcoming = [...games].sort((a, b) => a.date.localeCompare(b.date));
  if (upcoming.length === 0) return null;

  return (
    <section
      aria-label="観戦予定"
      className="border border-dashed p-3"
      style={{ borderColor: "var(--sched)" }}
    >
      <div
        className="mb-2 flex items-center gap-1.5 text-xs font-bold"
        style={{ color: "var(--sched)" }}
      >
        <CalendarClock size={14} aria-hidden />
        観戦予定
      </div>
      <ul className="flex flex-col gap-1">
        {upcoming.map((g) => (
          <li key={g.id} className="flex items-center gap-3 text-sm">
            <span className="tnum text-[var(--muted)]">{formatDateJa(g.date)}</span>
            {g.opponent ? (
              <span>vs {g.opponent}</span>
            ) : (
              <span className="text-[var(--faint)]">対戦相手未定</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
