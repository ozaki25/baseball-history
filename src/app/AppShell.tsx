import type { ReactNode } from "react";
import { ThemeToggle } from "#/ui/ThemeToggle";

/**
 * アプリ全体の外殻（画面横断のヘッダ・レイアウト枠）。
 * 現状はホーム1画面だが、routes → AppShell → 各 screen という構造にすることで、
 * 画面追加時にヘッダ・タイトル・ThemeToggle・幅制約を各 screen が複製せずに済む。
 * DOM 出力は元の HomeView 外殻とバイト同一を維持する（VRT baseline を無更新で通す）。
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header
        className="border-b"
        style={{ borderColor: "var(--line)", background: "var(--panel)" }}
      >
        <div className="h-1 w-full" style={{ background: "var(--brand)" }} aria-hidden />
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-bold tracking-tight">観戦ノート</h1>
            <p className="hidden text-xs text-[var(--muted)] sm:block">
              北海道日本ハムファイターズ 観戦記録
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 pb-20">{children}</main>
    </div>
  );
}
