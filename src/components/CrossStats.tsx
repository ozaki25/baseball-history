import { useState } from "react";
import type { Game } from "#/types/game";
import { groupBy, formatWinRate, type GroupKey } from "#/lib/stats";
import { teamLabel, stadiumLabel } from "#/lib/masters";

const TABS: { key: GroupKey; label: string }[] = [
  { key: "stadium", label: "球場別" },
  { key: "opponent", label: "相手別" },
  { key: "year", label: "年度別" },
  { key: "homeAway", label: "主催/ビジター" },
];

const HOME_AWAY_JA: Record<string, string> = { home: "主催", away: "ビジター" };

function rowLabel(tab: GroupKey, key: string): string {
  if (tab === "homeAway") return HOME_AWAY_JA[key] ?? key;
  if (tab === "stadium") return stadiumLabel(key);
  if (tab === "opponent") return teamLabel(key);
  return key;
}

export function CrossStats({ games }: { games: Game[] }) {
  const [tab, setTab] = useState<GroupKey>("stadium");
  // 観戦数の多い順。同数は表示名（代表名）順で安定させる。
  const rows = [...groupBy(games, tab)].sort(
    (a, b) =>
      b.attended - a.attended || rowLabel(tab, a.key).localeCompare(rowLabel(tab, b.key), "ja"),
  );

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

      <table
        id="crossstats-panel"
        role="tabpanel"
        aria-labelledby={`crossstats-tab-${tab}`}
        className="w-full text-sm"
      >
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
              <td className="tnum px-3 py-1.5 text-right font-bold">{formatWinRate(r.winRate)}</td>
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
    </section>
  );
}
