type YearValue = string | "all";

// 上部のクイック年度フィルタは「すべて＋直近数年」に絞ってファーストビューを軽くする。
// 全年度（空白年を含む）は絞り込みシートの年度チップと年度別集計で選択・確認できる。
const RECENT_COUNT = 3;

export function YearFilter({
  years,
  value,
  onChange,
}: {
  years: string[];
  value: YearValue;
  onChange: (year: YearValue) => void;
}) {
  // years は新しい順。直近数年だけをクイック表示する。
  const recent = years.slice(0, RECENT_COUNT);
  // 選択中の年が直近に無い（＝絞り込みシートで古い年を選んだ）場合も、その年は可視化して解除できるようにする。
  const shown = value !== "all" && !recent.includes(value) ? [...recent, value] : recent;
  const items: YearValue[] = ["all", ...shown];

  return (
    <div role="group" aria-label="年度で絞り込み" className="flex flex-wrap gap-1.5">
      {items.map((y) => {
        const active = value === y;
        return (
          <button
            key={y}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(y)}
            className="tnum whitespace-nowrap border px-3 py-1 text-sm font-medium"
            style={
              active
                ? { borderColor: "var(--brand)", background: "var(--brand)", color: "#fff" }
                : { borderColor: "var(--line-strong)", color: "var(--muted)" }
            }
          >
            {y === "all" ? "すべて" : `${y}年`}
          </button>
        );
      })}
    </div>
  );
}
