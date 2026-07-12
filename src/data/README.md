# `src/data/` — ビルド時データゲートウェイ

## 役割

`data/*.json`（`games.json` / `dates.json` 等）を**唯一この層でだけ**読み込み、
形状ガードを通した**型付きの参照**（`ALL_GAMES`, `ALL_YEARS`, `GAMES_GENERATED_AT`）としてアプリに提供する。

「JSON 境界を超えるための関所」。SSG につき、不正なデータはビルド時 fail-fast させる。

## 属するもの

- `import gamesJson from "../../data/games.json"` などの JSON 直読み
- 形状ガード（`parseGamesData` 相当のバリデーション）
- 型付きの `export const` による安全な公開

## 属さないもの

- 絞り込み・集計などのビジネスロジック（→ `src/domain/`）
- 表示コンポーネント（→ `src/features/` / `src/screens/`）
- ingest（データの生成）は完全に別レイヤ（→ `src/ingest/`）

## 依存の許可

- 依存できるのは `#/domain/**` のみ。
- **JSON 直読みの特権はこの層のみ**（他層からの `import "*.json"` は oxlint で禁止済み）。

## 追加時の手順

新しい JSON ソースが増えるケースは稀。既存の `games.ts` を編集するか、
どうしても必要なら同じパターン（読み込み → ガード → typed export）で `.ts` を追加する。
専用スキルは用意していない。

## 現状のファイル

- `games.ts` — `ALL_GAMES` / `ALL_YEARS` / `GAMES_GENERATED_AT` を公開
