# `src/ui/` — ドメイン非依存の再利用 UI

## 役割

観戦ノートの業務語彙（Game・勝敗・観戦日 etc.）を**知らない**、汎用の UI 部品を置く場所。
理屈上、他のアプリに移植しても意味を保ったまま使えるコンポーネント・hooks が対象。

## 属するもの

- 汎用コンポーネント（`Chip`, `ThemeToggle` など）
- 汎用 hooks（`useTheme`, `useDialogA11y` など）
- **副作用は部品内で完結**（`localStorage` 読み書きなどは親に漏らさない）

## 属さないもの

- `Game` 等のドメイン型を props で受ける部品（→ `src/features/`）
- ドメイン関数（`summarize` 等）を呼ぶロジック（→ `src/features/` か `src/screens/`）
- 画面固有のレイアウト（→ `src/app/` の AppShell、または `src/screens/`）

## 依存の許可

- **依存不可**（domain も含めて、上位のいかなる層にも依存しない・最下層）。
- React・Tailwind・アイコンライブラリなどの一般依存のみ。

## 追加時の手順

新しい汎用部品を作りたいときは直接ファイルを追加してよい（専用スキルなし）:

1. `src/ui/新部品.tsx` を作成（もしくは `src/ui/use新hook.ts`）
2. 隣に `新部品.test.tsx` / `use新hook.test.tsx` を置く（コロケーション）
3. `pnpm test` で緑を確認

ただし、**ドメインを触りたくなった時点で `src/features/` へ移す**こと。「便利だから ui に置く」で domain 依存が入り込むと ui の役割が崩れる。
