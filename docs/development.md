# 開発フロー — 観戦ノート

- 要件は [`requirements.md`](requirements.md)、設計は [`design.md`](design.md)。
- ツール/依存/スクリプトの一次情報は [`package.json`](../package.json)。
- 層の禁止ルールは [`.oxlintrc.json`](../.oxlintrc.json)。
- Claude Code セッション向けの短い一次案内は [`CLAUDE.md`](../CLAUDE.md)。

## 1. 開発環境

| 項目           | 内容                                                     |
| -------------- | -------------------------------------------------------- |
| ランタイム     | Node.js（oxlint 要件に合わせ `^20.19` または `>=22.12`） |
| パッケージ管理 | **pnpm**（`packageManager` フィールドで版固定）          |
| Lint / Format  | **oxlint** / **oxfmt**（ESLint・Prettier は使わない）    |

**バージョン方針**: 依存は実装着手時に `npm view <pkg> version` 等で最新を確認して採用する
（知識ベースで古い版を選ばない）。採用済み版は `package.json` を単一定義元とする。

### スクリプト（主要ゲート）

| コマンド                  | 内容                                                |
| ------------------------- | --------------------------------------------------- |
| `pnpm dev`                | 開発サーバー（`http://localhost:3000`）             |
| `pnpm build`              | 本番ビルド（SSG プリレンダー含む）                  |
| `pnpm preview`            | ビルド結果のプレビュー                              |
| `pnpm lint`               | oxlint                                              |
| `pnpm format:check`       | oxfmt（差分検知）                                   |
| `pnpm typecheck`          | `tsr generate && tsc --noEmit`                      |
| `pnpm test`               | 単体（`--project unit`・jsdom）                     |
| `pnpm test:coverage`      | 単体 + カバレッジ（下限あり）                       |
| `pnpm test:visual`        | 視覚回帰（`--project vrt`）                         |
| `pnpm test:visual:update` | VRT baseline 更新（標準環境以外はガードでブロック） |
| `pnpm ingest`             | 取り込み（外部ネット必須。GitHub Actions が正）     |
| `pnpm add-date`           | 観戦日追加（`/add-date` コマンドから呼ばれる）      |

コミット前の主要ゲート順: **lint → format:check → typecheck → test → build**。
全スクリプトの実体は `package.json` を参照。

## 2. コード品質と層規則

- **TypeScript strict**（`any` を避け、`Game` 等の型を単一定義）。
- **oxlint** / **oxfmt** で oxc 統一。CI で `format:check` を回し差分検知。
- **Husky + lint-staged**: コミット前に対象ファイルへ `oxlint --fix` / `oxfmt`。
- 純関数（`domain/stats/*` / `domain/query/*` / `ingest/parsers/*`）に単体テストを付ける。

### 層と依存規則

ディレクトリ構成と依存グラフは [`design.md` §3](design.md#3-ディレクトリ構成と層の依存) が唯一の定義元。
機械強制は [`.oxlintrc.json`](../.oxlintrc.json) の `no-restricted-imports` overrides。

**不変条件**:

- **routes は URL 結線と data 取得のみ**。View 合成は screens に委譲する（features/ui/app へ直接 import しない）。
- **screens が唯一の合成層**。feature 横断はここのみ。
- **feature 兄弟の依存は一律禁止**（`#/features/**` を features 内から import しない）。
  共有ロジックは domain へ、画面横断の合成は screens へ。
- **data の JSON 直読みは data ゲートウェイのみの特権**（他層は `ALL_GAMES` / `ALL_YEARS` を import）。
- **domain / ui は最下層**（上位のいかなる層にも依存しない）。
- **ingest はクライアントに import しない**（jsdom 混入防止・安全規則。相対パス回避も `**/ingest/**` で機械捕捉）。

### container / composition / presentational（linter で強制されない規約）

- **routes（container）**: データ取得・URL 検証・`navigate` 結線のみ。View を描かない。
- **screens（composition）**: 画面合成層。feature 横断はここのみ。
- **features（presentational）**: 画面部品。**props で受け、`onNavigate` コールバックで返す**。
  ルーター依存を feature に持ち込まない（screen の `search` / `onNavigate` seam を維持）。
  新しい画面は route に結線だけ置き、View（合成）は screens、部品は features に置く。

### `src/ui/` の採録基準

- ドメインに依存しない再利用可能な UI 部品（コンポーネント / hooks）。
- **副作用（`localStorage` 等）は部品内で完結**させる（親に漏らさない）。
- **domain に依存する部品は `features/` に置く**（`ui/` ではない）。
- 表示語彙（`labels.ts`）は `domain/` に置く（個人アプリで i18n しない前提のため、
  表示ラベルもドメイン語彙として扱う）。

### 新しい feature を追加するとき

`.oxlintrc.json` の編集は**原則不要**。feature 兄弟一律禁止（`#/features/**`）は既にワイルドカードで
縮約されているため、`src/features/新feature/` ディレクトリを作れば `src/features/**` override が自動適用される。
（相対パス回避は文字列マッチでは原理的に捕捉できないため、ディレクトリ跨ぎの import は必ず `#/` エイリアスを用いる規約で補完する。）

### 層追加時のチェックリスト

新しい層を追加するとき、`.oxlintrc.json` に override を 1 つ足すだけでは不十分。
**下層の override 全て**（`ui / domain / data / ingest / scripts`）に「新層を禁止する」パターンを追記しないと、
下層 → 新層の import が lint 素通りになる（例: `ui → 新層` が許されると循環すら検出不能）。

過去に PR-5 / PR-6 で連続してこの穴を踏んだため、以下を毎回実施する:

1. 新層 override を追加
2. 下層 override 全て（ui/domain/data/ingest/scripts）に禁止パターンを追記
3. 違反 import を注入して oxlint が確実に落ちることを両方向で確認
4. `docs/design.md` §3.2 の依存グラフを更新

### スタイリング規約

- 色はすべて `styles.css` のデザイントークン（CSS 変数）を単一の定義元とする。
  ライト/ダークは `@media (prefers-color-scheme)` と `:root[data-theme]` の両方で切り替える。
- **静的なトークン参照は Tailwind の arbitrary value**（例: `text-[var(--muted)]`）、
  **要素固有・動的な色は inline `style`**（例: `style={{ borderColor: "var(--line)" }}`）で書く。
- 勝敗バッジの色はライト/ダーク共通の固定色として `ResultBadge.tsx` に集約
  （`styles.css` には置かない）。

## 3. テスト戦略

| 種別           | 対象                                                                                                  | 手段                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 単体           | パーサ（team/score/location/home/gameParser）                                                         | 既存フィクスチャ（勝/負×主催/ビジター・引分・サヨナラ）を流用         |
| 単体           | 集計 `domain/stats/*`（勝率・軸別集計・軸レジストリ）                                                 | 代表データで期待値検証                                                |
| 単体           | 絞り込み `domain/query/*`（filter/search/options/partition）・URL スキーマ                            | 条件 → 抽出結果、URL 相互変換                                         |
| 単体           | 取り込み中核 `ingestCore.ts`（IO 注入）                                                               | scheduled / 確定 / 失敗保持 / 中止 / self-heal を網羅                 |
| 単体           | 安定 ID `masters.ts`（表記ゆれ束ね・衝突検知）                                                        | alias 解決 + 実データ ID 整合の回帰                                   |
| コンポーネント | ThemeToggle / YearFilter / Filters / StatsSummary / GameTable / CrossStats / ScheduledList / HomeView | Testing Library（jsdom）。アクセシブルなロール/名前で照会             |
| 視覚回帰(VRT)  | トップ画面（モバイル/デスクトップ）ほか主要ビュー                                                     | Vitest Browser Mode + `toMatchScreenshot`（標準環境で baseline 比較） |

### 配置（コロケーション）

- unit / コンポーネントのテストは**実装の隣**に置く
  （例: `src/domain/query/filter.test.ts`, `src/features/games/GameTable.test.tsx`）。
- **共有アセットは `src/tests/` に集約**する:
  - `helpers/`（`makeGame` 等）
  - `fixtures/`（パーサ用 HTML）
  - `setup.ts` / `setup.browser.ts`
  - `vrt/`（VRT は画面単位で実装隣ではないため、`__screenshots__` ごと集約）
- CI ワークフローも `src/tests/vrt` を参照する。

### 方針

- コンポーネントテストは `getByRole` などアクセシブルなクエリを基本とし、`userEvent` で操作を再現。
  CSS クラスや DOM 構造ではなく「ユーザーに見える挙動」を検証する。
- 副作用ロジックはフックに切り出して `renderHook` で単体テストする
  （`ui/useTheme` / `ui/useDialogA11y`）。コンポーネントは薄い表示に保つ。
- jsdom は対象ファイル先頭の `// @vitest-environment jsdom` で切り替える（既定は node）。
- `test.globals: true` で Testing Library の自動クリーンアップを有効化、
  `src/tests/setup.ts` で jest-dom マッチャを読み込む。

### カバレッジ

- `pnpm test:coverage`（v8）。CI では下限を課す（statements/functions/lines 90%, branches 85%）。
- 生成物・ルーター結線（`routeTree.gen.ts` / `router.tsx` / `__root.tsx` / `routes/index.tsx`）は
  ロジックを持たないため計測対象外（画面ロジックは `HomeView` に切り出してテスト）。
- コロケーションしたテスト本体（`src/**/*.test.{ts,tsx}`）と `src/tests/**` も計測対象外。

### VRT（視覚回帰）

- Vitest の Browser Mode（`@vitest/browser-playwright`）+ `toMatchScreenshot`。
- 単体とは別 project（`vrt`, `*.vrt.test.tsx`）に分離。
- 対象は `src/tests/vrt/`（トップ画面のモバイル/デスクトップ等）。固定フィクスチャで描画して baseline を安定させる。

**環境**: 描画は環境差（フォント・OS・GPU）に敏感なため、baseline は必ず**標準環境**で生成する。
標準環境は GitHub Actions の Visual Regression ワークフロー
（**Playwright 公式 Docker イメージ + `fonts-noto-cjk`**）。

**baseline 運用**:

- `src/tests/vrt/__screenshots__/` にコミットする（生成物は CI 所有）。
- ローカルで生成した baseline はコミットしない（ローカルは `VRT_CHROMIUM_PATH=<chromium> pnpm test:visual` で挙動確認のみ・非正）。
- baseline が無い初回は CI が自動生成して PR へコミット（ブートストラップ）。生成直後に同一ジョブ内で比較して自己検証する。
- **新規ケース**（baseline 未生成の `toMatchScreenshot` キー）を追加した場合も、比較 fail を検知した CI が
  その新規 baseline だけを標準環境で生成してコミットし、push 前に再比較してから push する。
  このとき**既存 baseline は自動更新しない**（`git checkout` で復元）。
- よって既存ケースの差分は「視覚回帰（または flaky）」として fail し、意図的な UI 変更は
  Visual Regression を `update=true` で手動実行して明示的に再生成する。

**限界と運用**:

- テストキーの**改名**は net-new 扱いとなり旧 baseline が孤児化する。改名時は `update=true` を手動実行する。
- **fork からの PR** は `GITHUB_TOKEN` が read-only で baseline を push できない
  → メンテナが `update=true` を実行する。
- 比較 fail 時は `actual` / `diff` 画像が `vrt-diff` アーティファクトとして保存される。
- `pnpm test:visual:update` は標準環境以外では既定でブロックする（`scripts/vrt-guard.mjs`。
  どうしてもローカルの Docker 内で更新する場合のみ `VRT_UPDATE_OK=1`）。
- 閾値は `allowedMismatchedPixels`（絶対数）で管理し、環境固定前提で小さく保つ。

## 4. ブランチ / コミット

- 作業ブランチ: `claude/repository-overview-77ggn9`（本案件の指定ブランチ）。
- コミットは意味単位で分割し、明確なメッセージを付ける
  （例: `refactor(structure): screens/ + app/AppShell 骨格を新設`）。
- `main` へは PR 経由。

## 5. GitHub Actions

### 5.1 CI（`ci.yml`）— 品質チェック

`push` / `pull_request` で実行。外部サイトへはアクセスしない。

```yaml
jobs:
  build:
    steps:
      - checkout / setup-node / setup-pnpm / pnpm install --frozen-lockfile
      - pnpm lint # oxlint
      - pnpm format:check # oxfmt
      - pnpm typecheck # tsc --noEmit
      - pnpm test:coverage # unit + しきい値
      - pnpm build
```

### 5.2 Ingest（`ingest.yml`）— データ取り込み

公式サイトから取得し、`games.json` を**リポジトリへ自動コミット**する（→ Vercel が自動デプロイ）。

```yaml
on:
  push:
    branches: ["main"]
    paths:
      - "data/dates.json" # 観戦日を足したら起動
      - "data/date-only.json" # 詳細不明の宣言追加でも再走
      - ".github/workflows/ingest.yml"
  workflow_dispatch: # 手動実行（force / 年指定）
permissions:
  contents: write # games.json を push するため
jobs:
  ingest:
    steps:
      - checkout / setup-node / setup-pnpm / pnpm install --frozen-lockfile
      - pnpm ingest # 未確定分だけ取得（scheduled/失敗も対象・--force で全件）
      - 差分があれば data/games.json と data/ingest-report.json をコミット & push
```

CI ループ防止は `ci.yml` 側の `paths-ignore: [data/games.json, data/ingest-report.json]` で行う
（ingest 側で `[skip ci]` を付ける方式ではない）。

### 5.3 Visual Regression（`vrt.yml`）— 視覚回帰

`pull_request` で比較、`workflow_dispatch(update=true)` で baseline 更新。
描画の環境差を排除するため **Playwright 公式 Docker イメージ + `fonts-noto-cjk`** の固定環境で実行し、
baseline はこの環境が生成してコミットする（初回は自動ブートストラップ）。詳細は §3 の VRT 項。

## 6. デプロイ（Vercel）

- **完全静的（SSG / prerender）** で出力し、TanStack Start の Vercel ターゲットで配信。
- スクレイピングはビルドに含めない（`games.json` 同梱を読むだけ）。
- プレビュー: PR ごとの Vercel Preview を活用。

## 7. データ更新の運用フロー

観戦記録を増やすときは、**Claude に観戦日を伝えるだけ**（`/add-date` コマンド経由）。

```
1. Claude に「7/5・7/6 の観戦を登録して」と依頼
   → /add-date が dates.json に追記・ソート → commit & push
   ↓（以降は自動）
   GitHub Actions(ingest) が未確定分をスクレイピング
   → games.json を自動コミット → Vercel が自動デプロイ
```

- **事前登録可**: まだ試合前の日も登録できる。取り込みでは `scheduled`（観戦予定）として保存し、
  後日結果が出た後の実行で自動的に確定へ更新される。
- 観戦日を試合後に足せば、その push で結果まで取得できる。
  単独で予定を確定させたいときは Claude に「取り込みを回して」と頼む（または Actions の Run workflow）。
- ローカル `pnpm ingest` もフォールバックとして利用可能。

### date-only.json（詳細不明の宣言）

現行サイトで詳細取得できない古い試合は `data/date-only.json` に日付を挙げると、
ingest が該当日を fetch せず `result: "unknown"` として日付のみ保存する。

- 値の上書き(override)ではなく **「詳細を持たないことの宣言」**（`design.md` §4.2, `requirements.md` §2）。
- 集計は観戦数に含めるが勝敗軸には数えず、年度別軸では観戦数として現れる。

## 8. リスクと対応

| リスク                                       | 影響                   | 対応                                                                               |
| -------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| 開発環境 / Vercel が `fighters.co.jp` 不到達 | その場では取り込めない | 取り込みは GitHub Actions で実行。アプリのビルドは `games.json` のみに依存         |
| Actions の自動コミットが CI をループ起動     | 無駄実行               | `ci.yml` の `paths-ignore` で `data/games.json` / `data/ingest-report.json` を除外 |
| 公式サイトの HTML 構造変更                   | パーサ破損             | フィクスチャ + テストで検知、パーサを修正して再取り込み                            |
| 20 年分の年代差による表記ゆれ                | 絞り込み / 集計が分裂  | 最小限の正規化 + `masters.ts` の別名解決（データ駆動で追加）                       |
| データ欠損年（2017-2019, 2023 等）           | 集計の空白             | 「データなし（0件）」として明示表示（隠さない）                                    |
| oxfmt が 0.x で整形挙動が変わる              | 差分ノイズ             | CI で `format:check`                                                               |

## 9. 未対応の backlog

構造化リファクタで発見したが「後回し可」として本体に含めなかった項目。
次回関連箇所を触るときに一緒に片付ける。

- **`summarize` の switch 網羅性強制**: `domain/stats/summary.ts` の switch に `default: assertNever(...)` を追加すると、
  `GAME_RESULTS` 拡張時に集計側もコンパイルエラーで追従を強制できる（現状は `unknown` / `scheduled` が暗黙 pass）。
- **`useTheme` の `cycle` が stale closure の theme を参照**: 元実装の忠実移植で現状は正しいが、
  `setTheme(t => NEXT[t])` + effect 永続化に直すとより堅牢。
- **`useDialogA11y` テストの stale onClose ケース**: 現テストは onClose の identity 変化のみ検証。
  effect 再購読が起きない状況を突く「ref 方式であること」を一意に固定するテストを追加すると、実装差の検知度が上がる。
- **screens 兄弟の依存禁止**: 現状 screens 直下は home 1 画面。将来複数 screen になったら
  `#/screens/**` 一律禁止を features と対称に設定するか判断。
- **`git log --follow` の履歴断絶**: 大きな書き換えを伴う移動（HomeView 等）は git の rename 検出閾値を下回るので
  `--follow` が途切れる。関連 PR は「pure `git mv` コミット + 書き換えコミット」の 2 段に分けると `--follow` が生きる。
