import { useState } from "react";
import type { Game } from "#/types/game";
import { groupBy, formatWinRate, type GroupKey } from "#/lib/stats";

const TABS: { key: GroupKey; label: string }[] = [
  { key: "stadium", label: "球場別" },
  { key: "opponent", label: "相手別" },
  { key: "year", label: "年度別" },
  { key: "homeAway", label: "主催/ビジター" },
];

const HOME_AWAY_JA: Record<string, string> = { home: "主催", away: "ビジター" };

export function CrossStats({ games }: { games: Game[] }) {
  const [tab, setTab] = useState<GroupKey>("stadium");
  const rows = groupBy(games, tab);

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
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
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

      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] text-[var(--muted)]">
            <th scope="col" className="px-3 py-1.5 text-left font-medium">
              {TABS.find((t) => t.key === tab)!.label.replace("別", "")}
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
            <th scope="col" className="px-3 py-1.5 text-right font-medium">
              勝率
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t" style={{ borderColor: "var(--line)" }}>
              <th scope="row" className="px-3 py-1.5 text-left font-normal">
                {tab === "homeAway" ? (HOME_AWAY_JA[r.key] ?? r.key) : r.key}
              </th>
              <td className="tnum px-2 py-1.5 text-right">{r.attended}</td>
              <td className="tnum px-2 py-1.5 text-right">{r.win}</td>
              <td className="tnum px-2 py-1.5 text-right">{r.lose}</td>
              <td className="tnum px-2 py-1.5 text-right">{r.draw}</td>
              <td className="tnum px-3 py-1.5 text-right font-bold">{formatWinRate(r.winRate)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-[var(--faint)]">
                データなし
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
