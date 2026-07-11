import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "system" | "light" | "dark";

const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
const LABEL: Record<Theme, string> = { system: "システム", light: "ライト", dark: "ダーク" };

function applyTheme(theme: Theme) {
  const el = document.documentElement;
  if (theme === "system") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  // 初期状態を localStorage から同期（SSR/初回描画は "system" で一致させる）
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch {
      /* noop */
    }
  }, []);

  const cycle = () => {
    const next = NEXT[theme];
    setTheme(next);
    applyTheme(next);
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {
      /* noop */
    }
  };

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
