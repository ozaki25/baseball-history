import { useState } from "react";
import type { Game } from "#/domain/game";
import { AXES, AXIS_ORDER, type GroupKey } from "#/domain/stats/axes";
import { buildRows, rowLabel } from "#/domain/stats/rows";
import { formatWinRate } from "#/domain/labels";

export function CrossStats({ games, years = [] }: { games: Game[]; years?: string[] }) {
  const [tab, setTab] = useState<GroupKey>("stadium");
  const rows = buildRows(games, tab, years);

  return (
    <section
      aria-label="軸別集計"
      className="border"
      style={{ borderColor: "var(--line)", background: "var(--panel)" }}
    >
      <div
        role="tablist"
        aria-label="集計の軸"
        className="flex overflow-x-auto border-b"
        style={{ borderColor: "var(--line)" }}
      >
        {AXIS_ORDER.map((k) => {
          const t = AXES[k];
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              id={`crossstats-tab-${t.key}`}
              aria-selected={active}
              aria-controls="crossstats-panel"
              onClick={() => setTab(t.key)}
              className="whitespace-nowrap px-3 py-2 text-sm font-medium"
              style={
                active
                  ? { color: "var(--brand)", borderBottom: "2px solid var(--brand)" }
                  : { color: "var(--muted)" }
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div id="crossstats-panel" role="tabpanel" aria-labelledby={`crossstats-tab-${tab}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-[var(--muted)]">
              <th scope="col" className="px-3 py-1.5 text-left font-medium">
                {AXES[tab].columnLabel}
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">
                観戦
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">
                勝
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">
                敗
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">
                分
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">
                中止
              </th>
              <th scope="col" className="px-3 py-1.5 text-right font-medium">
                勝率
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t" style={{ borderColor: "var(--line)" }}>
                <th scope="row" className="px-3 py-1.5 text-left font-normal">
                  {rowLabel(tab, r.key)}
                </th>
                <td className="tnum px-2 py-1.5 text-right">{r.attended}</td>
                <td className="tnum px-2 py-1.5 text-right">{r.win}</td>
                <td className="tnum px-2 py-1.5 text-right">{r.lose}</td>
                <td className="tnum px-2 py-1.5 text-right">{r.draw}</td>
                <td className="tnum px-2 py-1.5 text-right text-[var(--muted)]">{r.cancelled}</td>
                <td className="tnum px-3 py-1.5 text-right font-bold">
                  {formatWinRate(r.winRate)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-[var(--faint)]">
                  データなし
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
