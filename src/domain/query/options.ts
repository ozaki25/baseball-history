import type { Game } from "#/domain/game";
import { yearOf } from "#/domain/game";
import { teamLabel, stadiumLabel } from "#/domain/masters";

export interface Option {
  id: string;
  label: string;
}

export interface FilterOptions {
  years: string[];
  stadiums: Option[];
  opponents: Option[];
}

function collect(
  games: Game[],
  idOf: (g: Game) => string,
  labelOf: (id: string) => string,
): Option[] {
  const ids = new Set<string>();
  for (const g of games) if (idOf(g)) ids.add(idOf(g));
  return [...ids]
    .map((id) => ({ id, label: labelOf(id) }))
    .sort((a, b) => a.label.localeCompare(b.label, "ja"));
}

/**
 * 絞り込み選択肢を実データから生成（安定IDで束ね、代表名を表示）。
 * years は allYears（例: 観戦日マスタ dates.json の全年度）と実データの年を統合する。
 * これにより記録の無い年度も選択肢に残り「データなし」として表示できる（要件: 空白年を隠さない）。
 */
export function deriveOptions(games: Game[], allYears: string[] = []): FilterOptions {
  const years = new Set<string>(allYears);
  for (const g of games) years.add(yearOf(g));
  return {
    years: [...years].sort((a, b) => b.localeCompare(a)),
    stadiums: collect(games, (g) => g.stadiumId, stadiumLabel),
    opponents: collect(games, (g) => g.opponentId, teamLabel),
  };
}
