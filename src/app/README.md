# `src/app/` — アプリ全体の外殻

## 役割

「画面を跨いで共通する外殻」の部品を置く場所。ヘッダー・タイトル・テーマトグル・幅制約など、
どの画面でも同じように現れるアプリ全体の shell を担う。

現状は `AppShell.tsx` の 1 ファイル。画面が増えても外殻の実装が複製されない土台。

## 属するもの

- `AppShell.tsx`（ヘッダ・タイトル・ThemeToggle・幅制約）
- 将来的に画面横断で共通する shell 部品（GlobalNav・Footer 等が出てきた場合）

## 属さないもの

- 特定 feature に依存する部品（→ `src/features/`）
- 特定画面のレイアウト合成（→ `src/screens/`）
- URL 結線・データ取得（→ `src/routes/`）

## 依存の許可

- 依存できるのは `#/ui/**` と `#/domain/**` のみ。
- feature・screen・routes・data・ingest には依存しない。

## 追加時の手順

新しい shell 部品は稀。既存 `AppShell.tsx` の編集で足りることが多い。
別ファイルにする価値がある場合のみ `src/app/新shell.tsx` として追加する（専用スキルなし）。

## 設計メモ

画面が 2 つ以上になったとき、AppShell を `routes/__root.tsx` レベルまで昇格させる案がある
（現状は `screens/*/View` の内側で `<AppShell>` を包む）。
昇格すると VRT baseline を更新する必要があるため、必要になった時点で判断する。
