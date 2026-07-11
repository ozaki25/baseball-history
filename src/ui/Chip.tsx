import type { CSSProperties } from "react";

// 汎用のトグルチップ（aria-pressed 付きボタン）。
// variant で見た目を出し分ける: tint=絞り込みの複数選択（淡い塗り）/ solid=年度の単一選択（ブランド塗り）。
export type ChipVariant = "tint" | "solid";

const CLASS: Record<ChipVariant, string> = {
  tint: "border px-2.5 py-1 text-sm",
  solid: "tnum whitespace-nowrap border px-3 py-1 text-sm font-medium",
};

const ACTIVE_STYLE: Record<ChipVariant, CSSProperties> = {
  tint: {
    borderColor: "var(--brand)",
    color: "var(--brand)",
    background: "color-mix(in srgb, var(--brand) 10%, transparent)",
  },
  solid: { borderColor: "var(--brand)", background: "var(--brand)", color: "#fff" },
};

const INACTIVE_STYLE: CSSProperties = { borderColor: "var(--line-strong)", color: "var(--muted)" };

export function Chip({
  label,
  active,
  onClick,
  variant = "tint",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: ChipVariant;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={CLASS[variant]}
      style={active ? ACTIVE_STYLE[variant] : INACTIVE_STYLE}
    >
      {label}
    </button>
  );
}
