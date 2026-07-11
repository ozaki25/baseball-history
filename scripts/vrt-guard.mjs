#!/usr/bin/env node
/*
 * VRT ベースライン更新のガード。
 * baseline は「標準環境（CI: Playwright 公式 Docker + Noto CJK）」でのみ生成する方針のため、
 * 素のローカル実行での更新を防ぐ（環境差による baseline の劣化＝creep を機構的に抑止）。
 * ローカルでも公式 Docker イメージ内で更新する正規手順なら VRT_UPDATE_OK=1 を明示的に付ける。
 */
if (!process.env.CI && !process.env.VRT_UPDATE_OK) {
  console.error(
    [
      "VRT ベースラインの更新はブロックされました。",
      "baseline は標準環境（CI の Visual Regression ワークフロー / Playwright 公式 Docker）で生成してください。",
      "  - 通常: PR で `Visual Regression` ワークフローを update=true で手動実行",
      "  - どうしてもローカルの Docker 内で更新する場合のみ VRT_UPDATE_OK=1 を付与",
    ].join("\n"),
  );
  process.exit(1);
}
