# `src/ingest/` — 取り込み専用モジュール

## 役割

公式サイトの HTML を jsdom で解析し、`Game` オブジェクトに変換するオフライン処理。
`scripts/ingest.ts` からのみ呼ばれ、**クライアントバンドルには一切入らない**。

「外の世界からドメインへの入口」。ここで型と正規化を通した Game だけが `games.json` に書き出される。

## 属するもの

- HTML パーサ（`parsers/*`）— `Document` を受け取って値を抽出する純関数
- `ingestCore.ts` の `mergeIngest`（IO を注入した純関数として書かれた取り込み中核）
- パース時の共通型（`GameInfo`, `ParseError`）— `parsing.ts`
- レート制御（`sleepUtils.ts`）

## 属さないもの

- 表示コンポーネント・ルーター
- `data/*.json` の読み書き（読み書きは `scripts/ingest.ts` の責務。ingest 層は変換ロジックのみ）
- 状態管理・localStorage

## 依存の許可

- 依存できるのは `#/domain/**` のみ。
- **他層は ingest を import できない**（jsdom 混入防止・oxlint で禁止済み・相対パス回避も `**/ingest/**` で機械捕捉）。

## 追加時の手順

- 公式サイトの HTML 構造に**新しい抽出項目**が増えた: [`/add-parser`](../../.claude/commands/add-parser.md)
  （フィクスチャ追加 → 抽出器 → テスト → `mergeIngest` へ結線）
