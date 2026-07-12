import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "./useTheme";

const LABEL: Record<Theme, string> = { system: "システム", light: "ライト", dark: "ダーク" };

export function ThemeToggle() {
  const { theme, cycle } = useTheme();

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`テーマ切り替え（現在: ${LABEL[theme]}）`}
      title={`テーマ: ${LABEL[theme]}`}
      className="inline-flex h-8 w-8 items-center justify-center border"
      style={{ borderColor: "var(--line-strong)", color: "var(--muted)" }}
    >
      <Icon size={16} aria-hidden />
    </button>
  );
}
