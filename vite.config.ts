import { defineConfig } from "vite";
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
});
