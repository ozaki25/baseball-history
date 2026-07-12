import type { Game } from "#/domain/game";
import { AXES, type GroupKey } from "./axes";
import { groupBy, type GroupRow } from "./summary";

/** 集計行の 0 件雛形（表示行の空白年パディング等で使う）。 */
const EMPTY_ROW = { attended: 0, win: 0, lose: 0, draw: 0, cancelled: 0, winRate: null };

/**
 * 表示行を作る。年度別のときは記録の無い年度も「データなし(0件)」として明示する
 * （要件: 空白年を隠さない）。空年度は末尾に年降順で並べる。
 * ラベル解決は AXES[tab].labelOf に一元化されている。
 */
export function buildRows(games: Game[], tab: GroupKey, years: string[] = []): GroupRow[] {
  const rows = groupBy(games, tab, AXES[tab].labelOf);
  if (tab !== "year" || years.length === 0) return rows;
  const present = new Set(rows.map((r) => r.key));
  const empties = years
    .filter((y) => !present.has(y))
    .sort((a, b) => b.localeCompare(a))
    .map((y) => ({ key: y, ...EMPTY_ROW }));
  return [...rows, ...empties];
}

/**
 * 軸別集計の行ラベルを解決する（AXES レジストリの薄いラッパ）。
 * 呼び出し側の可読性のために残しているが、AXES[tab].labelOf(key) と等価。
 */
export function rowLabel(tab: GroupKey, key: string): string {
  return AXES[tab].labelOf(key);
}
