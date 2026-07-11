import { useState } from "react";
import type { Game } from "#/types/game";
import { groupBy, formatWinRate, type GroupKey, type GroupRow } from "#/lib/stats";
import { teamLabel, stadiumLabel } from "#/lib/masters";
import { HOME_AWAY_LABEL } from "#/lib/labels";

const TABS: { key: GroupKey; label: string }[] = [
  { key: "stadium", label: "球場別" },
  { key: "opponent", label: "相手別" },
  { key: "year", label: "年度別" },
  { key: "homeAway", label: "主催/ビジター" },
];

function rowLabel(tab: GroupKey, key: string): string {
  if (tab === "homeAway") return HOME_AWAY_LABEL[key as keyof typeof HOME_AWAY_LABEL] ?? key;
  if (tab === "stadium") return stadiumLabel(key);
  if (tab === "opponent") return teamLabel(key);
  return key;
}

const EMPTY_ROW = { attended: 0, win: 0, lose: 0, draw: 0, cancelled: 0, winRate: null };

/**
 * 表示行を作る。年度別のときは記録の無い年度も「データなし(0件)」として明示する
 * （要件: 空白年を隠さない）。空年度は末尾に年降順で並べる。
 */
function buildRows(games: Game[], tab: GroupKey, years: string[]): GroupRow[] {
  const rows = groupBy(games, tab, (k) => rowLabel(tab, k));
  if (tab !== "year" || years.length === 0) return rows;
  const present = new Set(rows.map((r) => r.key));
  const empties = years
    .filter((y) => !present.has(y))
    .sort((a, b) => b.localeCompare(a))
    .map((y) => ({ key: y, ...EMPTY_ROW }));
  return [...rows, ...empties];
}

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

      <div id="crossstats-panel" role="tabpanel" aria-labelledby={`crossstats-tab-${tab}`}>
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
