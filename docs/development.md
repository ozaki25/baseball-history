# 開発フロー — 観戦履歴アプリ（再構築）

> ステータス: **ドラフト（レビュー中）** / 最終更新: 2026-07-10
> 要件は `requirements.md`、設計は `design.md` を参照。

## 1. 開発環境

| 項目           | 内容                                                              |
| -------------- | ----------------------------------------------------------------- |
| ランタイム     | Node.js（oxlint 要件に合わせ `^20.19` または `>=22.12`）          |
| パッケージ管理 | **pnpm**（`pnpm-lock.yaml`。`packageManager` フィールドで版固定） |
| Lint / Format  | **oxlint / oxfmt**（ESLint・Prettier は使わない）                 |

> **バージョン方針**: 依存は実装着手時に `npm view <pkg> version` 等で最新を確認して採用する。
> 知識ベースで古い版を選ばない。TypeScript 7 など新しい世代は互換を実地確認してから固定する。

### pnpm scripts（目標）

```jsonc
{
  "dev": "vite dev", // TanStack Start（Vite 基盤）
  "build": "vite build",
  "start": "node .output/server/index.mjs",
  "lint": "oxlint",
  "lint:fix": "oxlint --fix",
  "format": "oxfmt --write .",
  "format:check": "oxfmt --check .",
  "typecheck": "tsc --noEmit",
  "test": "vitest --run",
  "test:watch": "vitest",
  "ingest": "tsx scripts/ingest.ts",
  "add-date": "node scripts/add-date.mjs",
  "prepare": "husky",
}
```

## 2. コード品質

- **TypeScript strict** を有効化。`any` を避け、`Game` 等の型を単一定義。
- **oxlint**（Lint）＋ **oxfmt**（Format）で oxc に統一（`pnpm lint` / `pnpm format`）。
  - oxfmt は 0.x のため整形挙動が更新で変わりうる。CI で `format:check` を回し差分を検知。
- **Husky + lint-staged**: コミット前に対象ファイルへ `oxlint --fix` / `oxfmt --write`。
- 純関数（`stats.ts` / `filters.ts` / `parsers/*`）に単体テストを付ける。

### スタイリング規約

- 色はすべて `styles.css` のデザイントークン（CSS 変数）を単一の定義元とする。ライト/ダークは
  `@media (prefers-color-scheme)` と `:root[data-theme]` の両方で切り替える。
- **静的なトークン参照は Tailwind の arbitrary value**（例: `text-[var(--muted)]`）、
  **要素固有・動的な色は inline `style`**（例: `style={{ borderColor: "var(--line)" }}`）で書く。
  クラスと inline を混在させる場合はこの基準に従う（動的値のみ inline）。
- 勝敗バッジの色はライト/ダーク共通の固定色として `ResultBadge.tsx` に集約（`styles.css` には置かない）。
- 取り込み専用モジュールは `src/lib/ingest/`（jsdom 依存）に隔離し、`features`/`routes` からの
  import を oxlint（`no-restricted-imports`）で禁止する。クライアントバンドルへの jsdom 混入を防ぐため。

### ディレクトリ構成と依存規則

層構成（上 → 下の一方向依存のみ許可。循環は構造的に発生しない）。大規模化（画面・軸の追加）に向け、
framework 非依存の中核を `domain/` に集約している:

```
src/
  routes/        # ルーター結線（container）。file-based。data import / validateSearch / navigate のみ
  features/      # 画面単位。{home, filters, stats, games}。薄い表示層
    <feature>/
      *.tsx      # その画面固有のコンポーネント（presentational）
      model/     # その画面固有の純ロジック（例: home/model/derive）。※query/stats は PR7 で domain へ集約
  ui/            # ドメイン非依存の再利用UI（Chip, ThemeToggle, use*）。hooks も可
  domain/        # framework非依存のドメイン中核（React/router/jsdom ゼロ・最下層）。game, masters, normalize, labels
  lib/ingest/    # 取り込み専用（jsdom 依存・scripts 専用）。※PR6 で src/ingest/ へ独立予定
  types/         # 取り込みパーサ用の型（parsing）。※PR6 で ingest/ へ移動予定
```

- **依存方向**: `routes → features → { domain, ui }`、`ingest → domain`、`scripts → { ingest, domain }`。
  `domain`/`ui` は最下層で上位（features/routes/ingest）へ依存しない。`features/home` は画面合成層として他 feature の
  **View** を横断 import してよいが、**兄弟 feature 相互のロジック import は禁止**（共有ロジックは `domain/` へ）。
  これらは `.oxlintrc.json` の `no-restricted-imports` で機械的に強制する（違反 import を一時挿入して発火確認する運用）。
- **`src/domain/` の採録基準**: React/router/DOM に依存しない純粋なドメイン（型・参照データ・純ロジック）。全レイヤーの土台で、
  何にも依存しない。個人アプリで i18n しない前提のため、表示語彙（labels）もドメイン語彙としてここに置く。
- **`src/ui/` の採録基準**: ドメイン・`lib` に依存しない再利用可能なUI**部品（コンポーネントおよび hooks）**。
  副作用（localStorage 等）はその部品内で完結させる。domain に依存する部品は `features/` に置く。
- **container / presentational**: `routes/*` が container（データ取得・URL 検証・`navigate` 結線）、`HomeView` 以下の
  `features/*` は presentational（props で受け、`onNavigate` コールバックで返す）。新しい画面も route に結線だけ置き、
  View は feature に置くこと。ルーター依存を feature に持ち込まない（`HomeView` の `search`/`onNavigate` seam を維持）。
- ディレクトリ跨ぎの import は必ず `#/` エイリアスを用いる（`no-restricted-imports` は文字列マッチのため、相対パスでの
  境界回避を規約で防ぐ）。なお **ingest 禁止だけは安全規則**（jsdom のクライアント混入防止）なので、`**/lib/ingest/**` を
  併記して相対パス回避も機械的に捕捉する。feature 間の横断禁止は建築規約であり、相対パス（例 `../filters/...`）は
  import 文字列に `features` を含まず文字列マッチでは原理的に捕捉できないため、上記のエイリアス規約で補完する。
  境界は `domain/**`（最下層）・`scripts/**`（UI層非依存）・`types/**` にも適用する。テストファイル（`**/*.test.{ts,tsx}`）は
  末尾 override で `no-restricted-imports` を off にして対象外（テストは境界を跨いで検証するのが正当で、クライアント
  バンドルにも含まれないため）。
- **feature を追加するとき**（例: 5 つ目の feature）: `.oxlintrc.json` の兄弟 feature 禁止リストは negation が効かず
  明示列挙が必要なため、既存の各 feature override に新 feature を1行ずつ追記する（追記漏れは「違反 import を一時挿入して
  oxlint が落ちる」ことで検証する）。

## 3. テスト戦略

| 種別           | 対象                                                                                                  | 手段                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 単体           | パーサ（team/score/location/home/gameParser）                                                         | 既存 6 フィクスチャ（勝/負×H/V・引分・サヨナラ）を流用                            |
| 単体           | 集計 `stats.ts`（勝率・軸別集計）                                                                     | 代表データで期待値検証                                                            |
| 単体           | 絞り込み `filters.ts`・URL スキーマ                                                                   | 条件→抽出結果、URL 相互変換                                                       |
| 単体           | 取り込み中核 `ingestCore.ts`（IO 注入）                                                               | scheduled/確定/失敗保持/中止/self-heal を網羅                                     |
| 単体           | 安定ID `masters.ts`（表記ゆれ束ね・衝突検知）                                                         | alias 解決＋実データ ID 整合の回帰テスト                                          |
| コンポーネント | ThemeToggle / YearFilter / Filters / StatsSummary / GameTable / CrossStats / ScheduledList / HomeView | Testing Library（jsdom）。アクセシブルなロール/名前で照会し、実装詳細に依存しない |
| 視覚回帰(VRT)  | トップ画面（モバイル/デスクトップ）ほか主要ビュー                                                     | Vitest Browser Mode + `toMatchScreenshot`。標準環境(Docker)で baseline 比較       |

- **テストの配置（コロケーション）**: unit/コンポーネントのテストは実装の隣に置く（`src/features/filters/model/filters.test.ts`、
  `src/features/games/GameTable.test.tsx`、`src/lib/masters.test.ts`、`src/lib/ingest/parsers/teamExtractor.test.ts` など）。
  実装の移動時にテストが一緒に動き、対応関係が一目で分かる。一方、**共有アセットは `src/tests/` に集約**する:
  `helpers/`（`makeGame` 等）・`fixtures/`（パーサ用 HTML）・`setup.ts`/`setup.browser.ts`・`vrt/`（VRT は画面単位で
  実装の隣ではないため、`__screenshots__` ごと集約。CI ワークフローも `src/tests/vrt` を参照）。
- コンポーネントテストの方針: `getByRole` などアクセシブルなクエリを基本とし、`userEvent` で操作を再現。CSS クラスや DOM 構造ではなく「ユーザーに見える挙動」を検証する（堅牢・持続可能）。`vite.config.ts` の `test.globals: true` で Testing Library の自動クリーンアップを有効化、`src/tests/setup.ts` で jest-dom マッチャを読み込む。jsdom は対象ファイル先頭の `// @vitest-environment jsdom` で切り替える（既定は node）。
- **副作用ロジックはフックに切り出して単体テストする**: テーマ同期（`ui/useTheme`）やダイアログの a11y（初期フォーカス・Escape・フォーカストラップ、`ui/useDialogA11y`）は `renderHook` で状態遷移・副作用を直接検証する。コンポーネントは薄い表示に保ち、壊れやすい副作用はフック側のテストで固定する。
- **カバレッジ**: `pnpm test:coverage`（v8）。CI では下限（statements/functions/lines 90%・branches 85%）を
  課してロジックの回帰を防ぐ。生成物・ルーター結線（`routeTree.gen.ts`/`router.tsx`/`__root.tsx`/`routes/index.tsx`）は
  ロジックを持たないため計測対象外（画面ロジックは `HomeView` に切り出してテスト）。コロケーションしたテスト本体
  （`src/**/*.test.{ts,tsx}`）と `src/tests/**`（ヘルパ/フィクスチャ/setup/VRT）も計測対象外。現状 96%/92%/98%/97%。
- **VRT（視覚回帰）**: Vitest 4 の Browser Mode（`@vitest/browser-playwright`）＋ `toMatchScreenshot` を使用。
  単体とは別 project（`vrt`, `*.vrt.test.tsx`）に分離し、`pnpm test:visual`（比較）/ `pnpm test:visual:update`（更新）。
  対象は `src/tests/vrt/`（トップ画面のモバイル/デスクトップ等）で、固定フィクスチャで描画して baseline を安定させる。
  - **描画は環境差（フォント・OS・GPU）に敏感**なため、baseline は必ず**標準環境**で生成する。標準環境は
    GitHub Actions の `Visual Regression` ワークフロー（**Playwright 公式 Docker イメージ ＋ `fonts-noto-cjk`**）。
  - baseline は `src/tests/vrt/__screenshots__/` にコミットする（生成物はCI所有）。**ローカルで生成した baseline はコミットしない**
    （ローカルは `VRT_CHROMIUM_PATH=<chromium> pnpm test:visual` で挙動確認のみ・非正）。
  - baseline が無い初回はCIが自動生成してPRへコミット（ブートストラップ）。生成直後に同一ジョブ内で比較して
    自己検証する。**新規ケース（baseline 未生成の `toMatchScreenshot` キー）を追加した場合も、比較 fail を検知した
    CIがその新規 baseline だけを標準環境で生成してコミットし、push 前に再比較してから push する**
    （新規追加のたびの手動実行は不要）。このとき**既存 baseline は自動更新しない**（`git checkout` で復元）。
    よって既存ケースの差分は「視覚回帰（または flaky）」として fail し、意図的なUI変更は `Visual Regression` を
    `update=true` で手動実行して明示的に再生成する。差分はコミットされた画像としてPRでレビューする。
  - **限界と運用**: (a) テストキーの**改名**は net-new 扱いとなり旧 baseline が孤児化する。改名時は `update=true` を
    手動実行すること（CIは改名を検知せず孤児を自動承認もしない）。(b) **fork からのPR**は `GITHUB_TOKEN` が
    read-only で baseline を push できないため自動生成は行わない（メンテナが `update=true` を実行する）。
  - 比較 fail 時は `actual`/`diff` 画像が `vrt-diff` アーティファクトとして保存される（Actions からダウンロード可）。
  - ローカルの `pnpm test:visual` は Hiragino 等が無くフォント差で fail しやすい（挙動確認用）。`test:visual:update` は
    標準環境以外では既定でブロックする（`scripts/vrt-guard.mjs`。どうしてもローカルの Docker 内で更新する場合のみ
    `VRT_UPDATE_OK=1`）。閾値は `allowedMismatchedPixels`（絶対数）で管理し、環境固定前提で小さく保つ。
- CI で `lint`(oxlint) → `format:check`(oxfmt) → `typecheck`(tsc) → `test:coverage` → `build` を実行（後述）。

## 4. ブランチ / コミット

- 作業ブランチ: `claude/repository-overview-77ggn9`（本案件の指定ブランチ）。
- コミットは意味単位で分割し、明確なメッセージを付ける（例: `feat: TanStack Router で絞り込みURL状態を実装`）。
- `main` へは PR 経由（ユーザーの明示指示があれば作成）。

## 5. GitHub Actions（3 本立て）

### 5.1 CI（`ci.yml`）— 品質チェック

`push` / `pull_request` で実行。外部サイトへはアクセスしない。

```yaml
# .github/workflows/ci.yml（案）
jobs:
  build:
    steps:
      - checkout / setup-node / setup-pnpm / pnpm install --frozen-lockfile
      - pnpm lint # oxlint
      - pnpm format:check # oxfmt
      - pnpm typecheck # tsc --noEmit
      - pnpm test:coverage # 単体（--project unit）＋しきい値
      - pnpm build
```

### 5.2 Ingest（`ingest.yml`）— データ取り込み

公式サイトから取得し、`games.json` を**リポジトリへ自動コミット**する（→ Vercel が自動デプロイ）。

```yaml
# .github/workflows/ingest.yml（案）
on:
  push:
    paths: ["data/dates.json"] # 観戦日を足したら起動
  workflow_dispatch: # 手動実行（force / 年指定）
permissions:
  contents: write # games.json を push するため
jobs:
  ingest:
    steps:
      - checkout / setup-node / setup-pnpm / pnpm install --frozen-lockfile
      - pnpm ingest # 未確定分だけ取得（scheduled/失敗も対象・--force で全件）
      - 差分があれば data/games.json をコミット & push（[skip ci]）
```

> GitHub ランナーは外部ネットに出られるため公式サイトへ到達可能。
> 開発環境や Vercel ビルドからは到達不可でも、取り込みは Actions 側で完結するので影響しない。

### 5.3 Visual Regression（`vrt.yml`）— 視覚回帰

`pull_request` で比較、`workflow_dispatch(update=true)` で baseline 更新。描画の環境差を排除するため
**Playwright 公式 Docker イメージ ＋ `fonts-noto-cjk`** の固定環境で実行し、baseline はこの環境が生成して
コミットする（初回は自動ブートストラップ）。詳細は §3 のVRT項を参照。

## 6. デプロイ（Vercel）

- **完全静的（SSG/prerender）** で出力し、**TanStack Start の Vercel ターゲット**で配信。
- スクレイピングはビルドに含めない（`games.json` 同梱を読むだけ）。
- プレビュー: PR ごとの Vercel Preview を活用。

## 7. データ更新の運用フロー

観戦記録を増やすときは、**Claude に観戦日を伝えるだけ**（add-date スキル経由）。

```
1. Claude に「7/5・7/6 の観戦を登録して」と依頼
   → add-date スキルが dates.json に追記・ソート → commit & push
   ↓（以降は自動）
   GitHub Actions(ingest) が未確定分をスクレイピング
   → games.json を自動コミット → Vercel が自動デプロイ
```

- **事前登録可**: まだ試合前の日も登録できる。取り込みでは `scheduled`（観戦予定）として保存し、
  後日結果が出た後の実行で自動的に確定へ更新される。
- 観戦日を試合後に足せば、その push で結果まで取得できる。単独で予定を確定させたい時は
  Claude に「取り込みを回して」と頼む（または Actions の Run workflow）。
- ローカル `pnpm ingest` もフォールバックとして利用可能。

> データ源はスクレイピングのみ。手編集・override は行わない。取得できない試合は
> リトライで拾い直すか、`dates.json` から外す運用とする。

## 8. 実装フェーズ（ステップごとに確認）

各フェーズ末に一旦止めてレビューする。

| #   | フェーズ           | 完了条件（受け入れ基準）                                                                                    |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| 0   | 本ドキュメント確定 | 要件/設計/開発フローに合意（完了）                                                                          |
| 1   | 足場（scaffold）   | pnpm 化、TanStack Start 起動、TanStack Table・Tailwind・oxlint/oxfmt・PWA 導入、ダミーデータ表示            |
| 2   | データ層           | 型定義（`scheduled` 含む）・`games.json` スキーマ確定、ingest（既存パーサ流用・scheduled 対応）で生成できる |
| 3   | 一覧＋絞り込み     | 5 軸の絞り込みが動作、条件が URL に保持。観戦予定を別枠表示                                                 |
| 4   | 集計               | 絞り込み連動の基本統計＋軸別クロス集計（scheduled 除外）                                                    |
| 5   | PWA / 仕上げ       | 新アイコン作成、インストール・オフライン確認、アクセシビリティ・レスポンシブ、AI生成感の排除確認            |
| 6   | 撤去・移行         | 旧 Next.js 資産・旧設計ドキュメント・npm 資産を削除、README 刷新、add-date スキル整備                       |
| 7   | デプロイ           | Vercel(TanStack Start ターゲット)設定、Actions(ci/ingest)稼働、本番確認                                     |

## 9. リスクと対応

| リスク                                           | 影響                                  | 対応                                                                                                |
| ------------------------------------------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 開発環境/Vercel から `fighters.co.jp` に到達不可 | その場では取り込めない                | 取り込みは GitHub Actions（外部ネット可）で実行。アプリのビルドは `games.json` のみに依存し影響なし |
| Actions の自動コミットが CI をループ起動         | 無駄実行                              | ingest のコミットは CI 対象パスから除外／`[skip ci]` を付ける等で抑止                               |
| 公式サイトの HTML 構造変更                       | パーサ破損                            | フィクスチャ＋テストで検知、パーサを修正して再取り込み                                              |
| 20 年分の年代差による表記ゆれ                    | 絞り込み/集計が分裂                   | 最小限の正規化。distinct 値を確認し、実際に割れた分だけ名寄せ対応表を追加（データ駆動）             |
| データ欠損年（2017-2019, 2023 等）               | 集計の空白                            | 「データなし（0件）」として明示表示（隠さない）                                                     |
| oxfmt が 0.x で整形挙動が変わる                  | 差分ノイズ                            | CI で `format:check`。挙動が不安定なら一時的に Prettier へ退避可能                                  |
| TanStack Start + PWA の統合                      | SW プリキャッシュが噛み合わない可能性 | Start(Vite 基盤)に vite-plugin-pwa を組み込み、フェーズ1で実地検証                                  |
| TypeScript 7 の周辺ツール互換                    | ビルド/型チェック不具合               | スキャフォールド時に検証、詰まれば TS5 系へ退避                                                     |

## 10. 次のアクション

- 論点はすべて確定済み（要件 §7）。**フェーズ 1（足場）着手待ち**。
- 実装着手時に各依存の最新版をレジストリで確認してから固定する。
