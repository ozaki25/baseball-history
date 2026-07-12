# 観戦ノート

北海道日本ハムファイターズの**個人観戦記録**を、多条件で絞り込み・集計して振り返る PWA。

観戦した日付を登録すると、公式サイトから試合結果を取得して `games.json` に永続化し、
アプリはそれを読むだけ（表示はスクレイピングに依存しない）。

## 技術スタック

- **TanStack Start**（完全静的 / SSG・prerender）＋ **TanStack Router / Table**
- **TypeScript 7** / **Vite 8** / **Tailwind CSS 4**
- **pnpm** / **oxlint** + **oxfmt**（oxc）
- **Vitest**
- PWA（手書き `manifest.webmanifest` + `sw.js`）
- デプロイ: **Vercel**

## 開発

```bash
pnpm install
pnpm dev            # 開発サーバー (http://localhost:3000)
pnpm build          # 本番ビルド（SSG プリレンダリング）
pnpm preview        # ビルド結果をプレビュー

pnpm lint           # oxlint
pnpm format         # oxfmt（--check で確認）
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest
```

## データの仕組み

```
data/dates.json ──(push)──▶ GitHub Actions(ingest) ──▶ 公式サイト取得・解析
                                     │
                                     ▼
                              data/games.json（コミット対象）
                                     │
                                     ▼
                        アプリはビルド時に読み込むだけ → Vercel 自動デプロイ
```

- **データ源はスクレイピングのみ**。手編集は行わない（`games.json` は取り込みの生成物）。
- **事前登録**に対応: 試合前の日は `scheduled`（観戦予定）として保存し、結果確定後の実行で自動更新。
- 集計は野球の通例: 勝率 = 勝 /(勝+敗)。予定・詳細不明は勝敗の分母から除外。中止試合は取り扱わない。

### 観戦日の追加

Claude 経由で「〇月〇日の観戦を登録して」と依頼すると、`add-date` が `data/dates.json` へ追記して
push し、GitHub Actions が取り込み〜デプロイまで自動で流す。手動 CLI でも可能:

```bash
pnpm add-date 2026 0705 0706   # 年 と MMDD（複数可）
pnpm ingest                    # 公式サイトから未確定分を取得（--force で全件 / --year YYYY）
```

> ingest は外部ネットワークが必要なため GitHub Actions 上で実行する。
> アプリのビルド自体は `games.json` のみに依存する。

## ドキュメント

- 要件: [`docs/requirements.md`](docs/requirements.md)
- 設計: [`docs/design.md`](docs/design.md)
- 開発フロー: [`docs/development.md`](docs/development.md)

## ライセンス

MIT
