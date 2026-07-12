# `src/routes/` — URL エントリポイント

## 役割

TanStack Router のファイルベースルーティング。ファイル名がそのまま URL パスになる。
**役割は「URL 結線と data 取得だけ」**。View の合成は screens に完全に委譲する。

## 属するもの

- `__root.tsx` — ルートレイアウト（テーマ初期化スクリプト・SW 登録・アイコン head 挿入等）
- `index.tsx`, その他各パスのルートファイル
- `validateSearch`（URL パラメータの検証）
- `data/` ゲートウェイからの `ALL_GAMES` などの取得
- `navigate` の結線（`onNavigate` として screen に渡す）

## 属さないもの

- View の描画・合成（→ `src/screens/`）
- `#/features/**` / `#/ui/**` / `#/app/**` への直接 import（screen 経由でしか触らない）
- ドメインロジック（→ `src/domain/`）

## 依存の許可

- 依存できるのは `#/data/**`, `#/domain/**`, `#/screens/**` のみ。
- **features・ui・app への直接 import は oxlint で禁止**（すべて screen 経由）。

## 追加時の手順

新しい URL / 画面を追加する場合は、screen とセットで作る:

- [`/add-screen`](../../.claude/commands/add-screen.md)（screen 雛形 + route wire）

route を単独で追加することは基本的にない（route は screen への薄い橋渡しなので）。
