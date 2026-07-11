import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { Game } from "#/types/game";
import { formatDateJa, formatScore, HOME_AWAY_LABEL } from "#/lib/labels";
import { ResultBadge } from "./ResultBadge";

const columnHelper = createColumnHelper<Game>();

const columns = [
  columnHelper.accessor("date", {
    header: "日付",
    cell: (c) => <span className="tnum whitespace-nowrap">{formatDateJa(c.getValue())}</span>,
  }),
  columnHelper.accessor("opponent", {
    header: "対戦相手",
    cell: (c) => c.getValue() || <span className="text-[var(--faint)]">—</span>,
  }),
  columnHelper.accessor("homeAway", {
    header: "主催/V",
    cell: (c) => <span className="text-[var(--muted)]">{HOME_AWAY_LABEL[c.getValue()]}</span>,
  }),
  columnHelper.accessor("stadium", {
    header: "球場",
    cell: (c) => <span className="text-[var(--muted)]">{c.getValue() || "—"}</span>,
  }),
  columnHelper.accessor("result", {
    header: "結果",
    cell: (c) => <ResultBadge result={c.getValue()} />,
  }),
  columnHelper.display({
    id: "score",
    header: "スコア",
    cell: (c) => <span className="tnum whitespace-nowrap">{formatScore(c.row.original)}</span>,
  }),
];

export function GameTable({ games }: { games: Game[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);

  const table = useReactTable({
    data: games,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  if (games.length === 0) {
    return (
      <div
        className="border p-10 text-center text-[var(--faint)]"
        style={{ borderColor: "var(--line)", background: "var(--panel)" }}
      >
        条件に合う観戦記録がありません
      </div>
    );
  }

  return (
    <div>
      {/* デスクトップ: 罫線テーブル */}
      <table
        className="hidden w-full border text-sm md:table"
        style={{ borderColor: "var(--line)", background: "var(--panel)" }}
      >
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr
              key={hg.id}
              className="border-b text-left text-xs"
              style={{ borderColor: "var(--line)" }}
            >
              {hg.headers.map((h) => {
                const sortable = h.column.getCanSort();
                const sorted = h.column.getIsSorted();
                return (
                  <th key={h.id} scope="col" className="px-3 py-2 font-medium text-[var(--muted)]">
                    {sortable ? (
                      <button
                        type="button"
                        onClick={h.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sorted === "asc" ? (
                          <ArrowUp size={12} aria-hidden />
                        ) : sorted === "desc" ? (
                          <ArrowDown size={12} aria-hidden />
                        ) : (
                          <ChevronsUpDown size={12} className="opacity-40" aria-hidden />
                        )}
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t" style={{ borderColor: "var(--line)" }}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* モバイル: 罫線カード（縦積み） */}
      <ul
        className="flex flex-col border md:hidden"
        style={{ borderColor: "var(--line)", background: "var(--panel)" }}
      >
        {rows.map((row, i) => {
          const g = row.original;
          return (
            <li
              key={row.id}
              className="flex items-center gap-3 px-3 py-2.5"
              style={i > 0 ? { borderTop: "1px solid var(--line)" } : undefined}
            >
              <div className="flex flex-col">
                <span className="tnum text-xs text-[var(--muted)]">{formatDateJa(g.date)}</span>
                <span className="font-medium">
                  {g.opponent || "—"}
                  <span className="ml-1.5 text-xs text-[var(--faint)]">
                    {HOME_AWAY_LABEL[g.homeAway]}
                  </span>
                </span>
                <span className="text-xs text-[var(--faint)]">{g.stadium || "—"}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="tnum text-sm">{formatScore(g)}</span>
                <ResultBadge result={g.result} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
