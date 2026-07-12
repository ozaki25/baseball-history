# `src/domain/` — ドメイン中核

## 役割

**framework 非依存**のドメイン中核。React・ルーター・DOM・jsdom・ストレージ etc. に一切依存しない、
「試合とは何か・観戦とは何か・勝敗とは何か」を言葉と純関数で定義する層。

このプロジェクトの**すべての意味の源泉**。他のどの層も domain を経由して業務語彙を扱う。

## 属するもの

- 型定義（`Game`, `HomeAway`, `GameResult`, `GameFilter`, `GameSearch`, `Summary` 等）
- 列挙とその単一定義元（`GAME_RESULTS` / `ATTENDED_RESULTS` / `DECIDED_RESULTS`）
- 述語（`isScheduled`, `isAttended`）
- 整形関数（日付・スコア・勝率・URL のラベル化）
- 純ロジック（絞り込み `query/`、集計 `stats/`、正規化 `normalize.ts`、安定 ID `masters.ts`）

## 属さないもの

- React コンポーネント・カスタム hooks（副作用があるものは全て NG）
- ルーター API の呼び出し・DOM 操作
- localStorage・fetch・fs アクセス
- jsdom による HTML 解析（→ `src/ingest/`）
- 表示スタイル（Tailwind クラス・style props）

## 依存の許可

- **domain 以外へ依存してはいけない**（最下層）。
- 依存できるのは Node/TS 標準ライブラリと、他の `domain/` モジュールのみ。

## 追加時の手順

- 新しい**型・述語・純関数**を足す: [`/add-domain`](../../.claude/commands/add-domain.md)
- 新しい**集計軸**を足す（`AXES` / `AXIS_ORDER` に追加）: [`/add-axis`](../../.claude/commands/add-axis.md)
- 新しい**絞り込み軸**（URL パラメータ）を足す: [`/add-filter`](../../.claude/commands/add-filter.md)
