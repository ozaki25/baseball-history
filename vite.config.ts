import { defineConfig } from "vitest/config";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

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
    // globals: true で Testing Library の自動クリーンアップ（afterEach）が有効になる
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // 生成物・フレームワークの結線（ロジックを持たない）は計測対象外。
      // 画面ロジックは HomeView に切り出してテスト済み（index.tsx は結線のみ）。
      exclude: [
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
