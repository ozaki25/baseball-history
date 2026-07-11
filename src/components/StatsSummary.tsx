import type { Game } from "#/types/game";
import { summarize, formatWinRate } from "#/lib/stats";

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-2.5">
      <span className="text-[11px] tracking-wide text-[var(--muted)]">{label}</span>
      <span
        className="tnum text-xl font-bold leading-tight sm:text-2xl"
        style={accent ? { color: "var(--brand)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

export function StatsSummary({ games }: { games: Game[] }) {
  const s = summarize(games);
  return (
    <section
      aria-label="集計サマリ"
      className="grid grid-cols-3 divide-x divide-y divide-[var(--line)] border sm:grid-cols-6 sm:divide-y-0"
      style={{ borderColor: "var(--line)", background: "var(--panel)" }}
    >
      <Cell label="観戦" value={String(s.attended)} />
      <Cell label="勝" value={String(s.win)} />
      <Cell label="敗" value={String(s.lose)} />
      <Cell label="分" value={String(s.draw)} />
      <Cell label="中止" value={String(s.cancelled)} />
      <Cell label="勝率" value={formatWinRate(s.winRate)} accent />
    </section>
  );
}
