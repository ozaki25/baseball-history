import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { GameResult, HomeAway } from "#/types/game";
import type { GameFilter, FilterOptions } from "./model/filters";
import { emptyFilter, isFilterActive, countActiveFilters } from "./model/filters";
import { RESULT_LABEL } from "#/lib/labels";
import { Chip } from "#/ui/Chip";

// 予定(scheduled)は「勝敗」ではなく別枠(観戦予定)で扱うため、絞り込み選択肢には含めない
const RESULT_ORDER: GameResult[] = ["win", "lose", "draw", "cancelled"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function Filters({
  filter,
  options,
  onChange,
}: {
  filter: GameFilter;
  options: FilterOptions;
  onChange: (next: GameFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      // フォーカストラップ: ダイアログ内で Tab を循環させる
      const items = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const activeEl = document.activeElement;
      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const active = isFilterActive(filter);
  const activeCount = countActiveFilters(filter);

  const homeAwayOptions: { value: HomeAway | "all"; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "home", label: "主催" },
    { value: "away", label: "ビジター" },
  ];

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm font-medium"
          style={{ borderColor: "var(--line-strong)", background: "var(--panel)" }}
        >
          <SlidersHorizontal size={14} aria-hidden />
          絞り込み
          {activeCount > 0 && (
            <span
              className="tnum ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-white"
              style={{ background: "var(--brand)" }}
            >
              {activeCount}
            </span>
          )}
        </button>
        {active && (
          <button
            type="button"
            onClick={() => onChange(emptyFilter)}
            className="text-sm text-[var(--muted)] underline underline-offset-2"
          >
            条件をクリア
          </button>
        )}
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="閉じる（背景）"
            onClick={close}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="絞り込み条件"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-auto border-t p-4 md:absolute md:inset-x-auto md:right-0 md:top-full md:bottom-auto md:mt-1 md:w-[40rem] md:max-h-[70vh] md:border"
            style={{ borderColor: "var(--line)", background: "var(--panel)" }}
          >
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-base font-bold">絞り込み</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="閉じる"
                className="p-1"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="divide-y" style={{ borderColor: "var(--line)" }}>
              <Section title="年度">
                <Chip
                  variant="tint"
                  label="すべて"
                  active={filter.year === "all"}
                  onClick={() => onChange({ ...filter, year: "all" })}
                />
                {options.years.map((y) => (
                  <Chip
                    key={y}
                    variant="tint"
                    label={y}
                    active={filter.year === y}
                    onClick={() => onChange({ ...filter, year: y })}
                  />
                ))}
              </Section>

              <Section title="主催 / ビジター">
                {homeAwayOptions.map((o) => (
                  <Chip
                    key={o.value}
                    variant="tint"
                    label={o.label}
                    active={filter.homeAway === o.value}
                    onClick={() => onChange({ ...filter, homeAway: o.value })}
                  />
                ))}
              </Section>

              <Section title="勝敗">
                {RESULT_ORDER.map((r) => (
                  <Chip
                    key={r}
                    variant="tint"
                    label={RESULT_LABEL[r]}
                    active={filter.results.includes(r)}
                    onClick={() => onChange({ ...filter, results: toggle(filter.results, r) })}
                  />
                ))}
              </Section>

              <Section title="球場">
                {options.stadiums.map((s) => (
                  <Chip
                    key={s.id}
                    variant="tint"
                    label={s.label}
                    active={filter.stadiums.includes(s.id)}
                    onClick={() => onChange({ ...filter, stadiums: toggle(filter.stadiums, s.id) })}
                  />
                ))}
              </Section>

              <Section title="対戦相手">
                {options.opponents.map((o) => (
                  <Chip
                    key={o.id}
                    variant="tint"
                    label={o.label}
                    active={filter.opponents.includes(o.id)}
                    onClick={() =>
                      onChange({ ...filter, opponents: toggle(filter.opponents, o.id) })
                    }
                  />
                ))}
              </Section>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onChange(emptyFilter)}
                className="px-2 py-1.5 text-sm text-[var(--muted)]"
              >
                リセット
              </button>
              <button
                type="button"
                onClick={close}
                className="px-4 py-1.5 text-sm font-bold text-white"
                style={{ background: "var(--brand)" }}
              >
                この条件で見る
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
