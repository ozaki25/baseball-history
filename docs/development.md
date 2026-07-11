# 開発フロー — 観戦履歴アプリ（再構築）

> ステータス: **ドラフト（レビュー中）** / 最終更新: 2026-07-10
> 要件は `requirements.md`、設計は `design.md` を参照。

## 1. 開発環境

| 項目 | 内容 |
|---|---|
| ランタイム | Node.js（oxlint 要件に合わせ `^20.19` または `>=22.12`） |
| パッケージ管理 | **pnpm**（`pnpm-lock.yaml`。`packageManager` フィールドで版固定） |
| Lint / Format | **oxlint / oxfmt**（ESLint・Prettier は使わない） |

> **バージョン方針**: 依存は実装着手時に `npm view <pkg> version` 等で最新を確認して採用する。
> 知識ベースで古い版を選ばない。TypeScript 7 など新しい世代は互換を実地確認してから固定する。

### pnpm scripts（目標）

```jsonc
{
  "dev": "vite dev",              // TanStack Start（Vite 基盤）
  "build": "vite build",
  "start": "node .output/server/index.mjs",
  "lint": "oxlint",
  "lint:fix": "oxlint --fix",
  "format": "oxfmt --write .",
  "format:check": "oxfmt --check .",
  "typecheck": "tsc --noEmit",
  "test": "vitest --run",
  "test:watch": "vitest",
  "ingest": "node scripts/ingest.mjs",
  "add-date": "node scripts/add-date.mjs",
  "prepare": "husky"
}
```

## 2. コード品質

- **TypeScript strict** を有効化。`any` を避け、`Game` 等の型を単一定義。
- **oxlint**（Lint）＋ **oxfmt**（Format）で oxc に統一。dev 連携は `vite-plugin-oxlint`。
  - oxfmt は 0.x のため整形挙動が更新で変わりうる。CI で `format:check` を回し差分を検知。
- **Husky + lint-staged**: コミット前に対象ファイルへ `oxlint --fix` / `oxfmt --write`。
- 純関数（`stats.ts` / `filters.ts` / `parsers/*`）に単体テストを付ける。

## 3. テスト戦略

| 種別 | 対象 | 手段 |
|---|---|---|
| 単体 | パーサ（team/score/location/home/gameParser） | 既存 6 フィクスチャ（勝/負×H/V・引分・サヨナラ）を流用 |
| 単体 | 集計 `stats.ts`（勝率・軸別集計） | 代表データで期待値検証 |
| 単体 | 絞り込み `filters.ts`・URL スキーマ | 条件→抽出結果、URL 相互変換 |
| コンポーネント | Filters↔Table↔Stats の連動（任意） | Testing Library（必要に応じ） |

- CI で `lint`(oxlint) → `format:check`(oxfmt) → `typecheck`(tsc) → `test` → `build` を実行（後述）。

## 4. ブランチ / コミット

- 作業ブランチ: `claude/repository-overview-77ggn9`（本案件の指定ブランチ）。
- コミットは意味単位で分割し、明確なメッセージを付ける（例: `feat: TanStack Router で絞り込みURL状態を実装`）。
- `main` へは PR 経由（ユーザーの明示指示があれば作成）。

## 5. GitHub Actions（新規・2 本立て）

### 5.1 CI（`ci.yml`）— 品質チェック
`push` / `pull_request` で実行。外部サイトへはアクセスしない。

```yaml
# .github/workflows/ci.yml（案）
jobs:
  build:
    steps:
      - checkout / setup-node / setup-pnpm / pnpm install --frozen-lockfile
      - pnpm lint            # oxlint
      - pnpm format:check    # oxfmt
      - pnpm typecheck       # tsc --noEmit
      - pnpm test
      - pnpm build
```

### 5.2 Ingest（`ingest.yml`）— データ取り込み
公式サイトから取得し、`games.json` を**リポジトリへ自動コミット**する（→ Vercel が自動デプロイ）。

```yaml
# .github/workflows/ingest.yml（案）
on:
  push:
    paths: ["data/dates.json"]     # 観戦日を足したら起動
  workflow_dispatch:                # 手動実行（force / 年指定）
permissions:
  contents: write                   # games.json を push するため
jobs:
  ingest:
    steps:
      - checkout / setup-node / setup-pnpm / pnpm install --frozen-lockfile
      - pnpm ingest                 # 未確定分だけ取得（scheduled/失敗も対象・--force で全件）
      - 差分があれば data/games.json をコミット & push（[skip ci]）
```

> GitHub ランナーは外部ネットに出られるため公式サイトへ到達可能。
> 開発環境や Vercel ビルドからは到達不可でも、取り込みは Actions 側で完結するので影響しない。

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

| # | フェーズ | 完了条件（受け入れ基準） |
|---|---|---|
| 0 | 本ドキュメント確定 | 要件/設計/開発フローに合意（完了） |
| 1 | 足場（scaffold） | pnpm 化、TanStack Start 起動、TanStack Table・Tailwind・oxlint/oxfmt・PWA 導入、ダミーデータ表示 |
| 2 | データ層 | 型定義（`scheduled` 含む）・`games.json` スキーマ確定、ingest（既存パーサ流用・scheduled 対応）で生成できる |
| 3 | 一覧＋絞り込み | 5 軸の絞り込みが動作、条件が URL に保持。観戦予定を別枠表示 |
| 4 | 集計 | 絞り込み連動の基本統計＋軸別クロス集計（scheduled 除外） |
| 5 | PWA / 仕上げ | 新アイコン作成、インストール・オフライン確認、アクセシビリティ・レスポンシブ、AI生成感の排除確認 |
| 6 | 撤去・移行 | 旧 Next.js 資産・旧設計ドキュメント・npm 資産を削除、README 刷新、add-date スキル整備 |
| 7 | デプロイ | Vercel(TanStack Start ターゲット)設定、Actions(ci/ingest)稼働、本番確認 |

## 9. リスクと対応

| リスク | 影響 | 対応 |
|---|---|---|
| 開発環境/Vercel から `fighters.co.jp` に到達不可 | その場では取り込めない | 取り込みは GitHub Actions（外部ネット可）で実行。アプリのビルドは `games.json` のみに依存し影響なし |
| Actions の自動コミットが CI をループ起動 | 無駄実行 | ingest のコミットは CI 対象パスから除外／`[skip ci]` を付ける等で抑止 |
| 公式サイトの HTML 構造変更 | パーサ破損 | フィクスチャ＋テストで検知、パーサを修正して再取り込み |
| 20 年分の年代差による表記ゆれ | 絞り込み/集計が分裂 | 最小限の正規化。distinct 値を確認し、実際に割れた分だけ名寄せ対応表を追加（データ駆動） |
| データ欠損年（2017-2019, 2023 等） | 集計の空白 | 「データなし（0件）」として明示表示（隠さない） |
| oxfmt が 0.x で整形挙動が変わる | 差分ノイズ | CI で `format:check`。挙動が不安定なら一時的に Prettier へ退避可能 |
| TanStack Start + PWA の統合 | SW プリキャッシュが噛み合わない可能性 | Start(Vite 基盤)に vite-plugin-pwa を組み込み、フェーズ1で実地検証 |
| TypeScript 7 の周辺ツール互換 | ビルド/型チェック不具合 | スキャフォールド時に検証、詰まれば TS5 系へ退避 |

## 10. 次のアクション

- 論点はすべて確定済み（要件 §7）。**フェーズ 1（足場）着手待ち**。
- 実装着手時に各依存の最新版をレジストリで確認してから固定する。
