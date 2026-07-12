import type { ReactNode } from "react";
import { ThemeToggle } from "#/ui/ThemeToggle";

/**
 * アプリ全体の外殻（画面横断のヘッダ・レイアウト枠）。
 * 現状は screens/home の HomeView が自身を <AppShell>{...}</AppShell> で包む形。
 * 画面追加時にヘッダ・タイトル・ThemeToggle・幅制約を各 screen が複製せずに済む。
 * 2 画面目が来た時点で __root.tsx への昇格（screens は AppShell を包まず children のみ返す）を
 * 検討する。今 __root へ移すと VRT baseline を更新せねばならないため、必要時まで延期する。
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
