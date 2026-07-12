# `src/features/` — 画面部品（presentational）

## 役割

観戦ノートの機能ごとに **1 フォルダ = 1 feature area** で、画面部品（表示中心のコンポーネント群）を集める場所。
`filters/` / `stats/` / `games/` / `scheduled/` のように、意味あるまとまり単位で分割する。

「domain に依存はしていいが、composition と routing は知らない」薄い表示層。
props で受け、`onNavigate` などのコールバックで返す。

## 属するもの

- ドメイン依存のコンポーネント（`GameTable`, `StatsSummary`, `Filters` 等）
- そのフィーチャ内で完結する hooks・小物（相対 import で参照）
- コロケーションされたテスト（`*.test.tsx`）

## 属さないもの

- **兄弟 feature への import**（`#/features/**` からの相対 or エイリアス import は禁止）
- ルーターの直接呼び出し（`useNavigate`, `useLocation` 等）—— screen の `search` / `onNavigate` seam を経由する
- `src/data/` の直接 import（データは routes → screens から props で受ける）
- 画面横断の合成（→ `src/screens/`）

## 依存の許可

- 依存できるのは `#/domain/**` と `#/ui/**` のみ。
- 兄弟 feature（`#/features/**`）は import 不可。共有ロジックは domain へ、画面横断の合成は screens へ。

## 追加時の手順

- 新しい feature area を作る: [`/add-feature`](../../.claude/commands/add-feature.md)
  （feature ディレクトリ雛形の作成 → 必要な screen 側での組み込み提示）

`.oxlintrc.json` の編集は **原則不要**。feature 兄弟一律禁止 `#/features/**` はワイルドカードなので、
`src/features/新feature/` を作れば自動適用される。

## 現状のフォルダ

- `filters/` — `Filters` / `YearFilter`（絞り込み UI）
- `stats/` — `StatsSummary` / `CrossStats`（集計サマリ / 軸別テーブル）
- `games/` — `GameTable` / `ResultBadge`（試合一覧・勝敗バッジ）
- `scheduled/` — `ScheduledList`（観戦予定の別枠表示）
