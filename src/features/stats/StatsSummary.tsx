import type { Game } from "#/domain/game";
import { summarize } from "#/domain/stats/summary";
import { formatWinRate } from "#/domain/labels";

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-3.5">
      <span className="text-xs tracking-wide text-[var(--muted)]">{label}</span>
      <span
        className="tnum text-3xl font-bold leading-tight sm:text-4xl"
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
      className="grid grid-cols-5 divide-x divide-[var(--line)] border"
      style={{ borderColor: "var(--line)", background: "var(--panel)" }}
    >
      <Cell label="観戦" value={String(s.attended)} />
      <Cell label="勝" value={String(s.win)} />
      <Cell label="敗" value={String(s.lose)} />
      <Cell label="分" value={String(s.draw)} />
      <Cell label="勝率" value={formatWinRate(s.winRate)} accent />
    </section>
  );
}
