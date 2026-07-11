import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      // 完全静的（SSG）: 全ルートをビルド時にプリレンダリング
      prerender: { enabled: true, crawlLinks: true },
    }),
    viteReact(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "観戦ノート",
        short_name: "観戦ノート",
        description: "北海道日本ハムファイターズの観戦記録",
        lang: "ja",
        theme_color: "#016298",
        background_color: "#02324e",
        display: "standalone",
        start_url: "/",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
      },
    }),
  ],
});
