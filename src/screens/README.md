# `src/screens/` — 画面合成層

## 役割

**唯一の合成層**。feature を props で束ねて 1 画面（HomeView など）を構成する。
「routes からデータと URL を受け取り、features に描画を渡す」つなぎ役。

**feature 兄弟を横断できるのはここだけ**（features 内での兄弟 import は一律禁止）。

## 属するもの

- 画面 View（`HomeView.tsx` 等）
- 画面レベルの hooks（feature 横断で使う小物があれば）
- コロケーションされたテスト（`*.test.tsx`）
- **AppShell を包む位置**もここ（現状 `<AppShell>{...}</AppShell>` の外殻適用は screen 側）

## 属さないもの

- 個別の表示部品（→ `src/features/`）
- routing 判断（→ `src/routes/`）
- data 直読み（→ routes から props で受ける、props-down パターン）
- URL 検証・`navigate` の呼び出し（routes の役割）

## 依存の許可

- `#/app/**`, `#/features/**`, `#/ui/**`, `#/domain/**`, `#/data/**` を import できる。
- `#/routes/**` からは import できない（依存の向きは `routes → screens → features`）。

## 追加時の手順

- 新しい画面を作る: [`/add-screen`](../../.claude/commands/add-screen.md)
  （`src/screens/新/View.tsx` の雛形 + `src/routes/新.tsx` の結線 + テスト）

## 設計メモ

現状 screen は `home/` の 1 個だけ。screen が 2 つ以上になったら、
**screen 兄弟の import 禁止**（`#/screens/**` を screens 内から import 禁止）を feature と対称に導入する
（backlog 参照）。「合成層が合成層を合成する」構造を防ぐため。

## 現状のフォルダ

- `home/` — `HomeView`（トップ画面の合成）
