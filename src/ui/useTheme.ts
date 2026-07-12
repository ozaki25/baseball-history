import { useEffect, useState } from "react";

export type Theme = "system" | "light" | "dark";

const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };

function applyTheme(theme: Theme) {
  const el = document.documentElement;
  if (theme === "system") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", theme);
}

/**
 * テーマ状態（system→light→dark→system の循環）と、localStorage / `data-theme` 属性の同期を担うフック。
 * `__root.tsx` のインラインスクリプトと同じ契約（キー `"theme"`、値 `"light"|"dark"`、system は未保存）。
 * localStorage が使えない環境でも例外を握りつぶして動作を継続する。
 */
export function useTheme(): { theme: Theme; cycle: () => void } {
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

  return { theme, cycle };
}
