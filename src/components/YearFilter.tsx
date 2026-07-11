type YearValue = string | "all";

export function YearFilter({
  years,
  value,
  onChange,
}: {
  years: string[];
  value: YearValue;
  onChange: (year: YearValue) => void;
}) {
  const items: YearValue[] = ["all", ...years];
  return (
    <div
      role="group"
      aria-label="年度で絞り込み"
      className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1"
    >
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
