import { defaultExclude, defineConfig } from "vitest/config";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";

// VRT（視覚回帰）テストは専用 project に分離する（環境差の影響を隔離し、更新も明示的に行う）
const vrtPattern = "**/*.vrt.test.{ts,tsx}";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      // 完全静的（SSG）: 全ルートをビルド時にプリレンダリング
      prerender: { enabled: true, crawlLinks: true },
    }),
    viteReact(),
  ],
  test: {
    projects: [
      {
        extends: true,
        test: {
          // 単体・コンポーネント（jsdom）。VRT は除外。
          name: "unit",
          globals: true,
          setupFiles: ["./src/tests/setup.ts"],
          exclude: [vrtPattern, ...defaultExclude],
        },
      },
      {
        extends: true,
        test: {
          // 視覚回帰（実ブラウザ・headless）。固定 viewport で描画を安定させる。
          name: "vrt",
          include: [vrtPattern],
          setupFiles: ["./src/tests/setup.browser.ts"],
          browser: {
            enabled: true,
            // CI(Playwright公式Docker)ではバンドル版を使う。ローカル等で別ビルドを使う場合のみ
            // VRT_CHROMIUM_PATH で実行ファイルを指す（環境差はDocker基準に合わせる前提）。
            provider: playwright({
              launchOptions: process.env.VRT_CHROMIUM_PATH
                ? { executablePath: process.env.VRT_CHROMIUM_PATH }
                : {},
            }),
            headless: true,
            // 既定 viewport（各テストは page.viewport で明示上書きする）
            instances: [{ browser: "chromium", viewport: { width: 1280, height: 720 } }],
            expect: {
              toMatchScreenshot: {
                comparatorName: "pixelmatch",
                // 環境を固定(Docker+Noto CJK)しているため run 間の揺れはほぼ無い。
                // per-pixel の AA だけ threshold で吸収し、許容差分は小さな絶対値に抑える。
                comparatorOptions: { threshold: 0.1, allowedMismatchedPixels: 100 },
              },
            },
          },
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // 生成物・フレームワークの結線（ロジックを持たない）は計測対象外。
      // 画面ロジックは HomeView に切り出してテスト済み（index.tsx は結線のみ）。
      exclude: [
        // テストは実装の隣にコロケーション。テスト本体とヘルパ/フィクスチャ/setup/VRTは計測対象外。
        "src/**/*.test.{ts,tsx}",
        "src/tests/**",
        "src/routeTree.gen.ts",
        "src/router.tsx",
        "src/routes/__root.tsx",
        "src/routes/index.tsx",
        "src/**/*.d.ts",
      ],
      reporter: ["text", "html"],
      // 中核ロジックの回帰を防ぐ下限（現状 stmts96/branch92/func96/line96 に余裕を持たせて設定）
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
