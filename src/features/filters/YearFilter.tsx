import { Chip } from "#/ui/Chip";

type YearValue = string | "all";

// 上部のクイック年度フィルタは「すべて＋直近数年」に絞ってファーストビューを軽くする。
// 全年度（空白年を含む）は絞り込みシートの年度チップと年度別集計で選択・確認できる。
const RECENT_COUNT = 3;

/**
 * クイック表示する年度を導出する。直近 recentCount 年に加え、選択中の年が直近に無い
 * （＝絞り込みシートで古い年を選んだ）場合はその年も可視化して解除できるようにする。
 * years は新しい順の前提。
 */
export function visibleYears(years: string[], value: YearValue): string[] {
  const recent = years.slice(0, RECENT_COUNT);
  return value !== "all" && !recent.includes(value) ? [...recent, value] : recent;
}

export function YearFilter({
  years,
  value,
  onChange,
}: {
  years: string[];
  value: YearValue;
  onChange: (year: YearValue) => void;
}) {
  const items: YearValue[] = ["all", ...visibleYears(years, value)];

  return (
    <div role="group" aria-label="年度で絞り込み" className="flex flex-wrap gap-1.5">
      {items.map((y) => (
        <Chip
          key={y}
          variant="solid"
          label={y === "all" ? "すべて" : `${y}年`}
          active={value === y}
          onClick={() => onChange(y)}
        />
      ))}
    </div>
  );
}
