# CLAUDE.md — Claude Code 向け一次案内

このリポジトリ（観戦ノート）で Claude Code セッションを始めるときに、まず読むべき短い案内。
詳細は `docs/` 配下の各文書と、リポジトリルートの設定ファイルを参照する。

## リポジトリの目的

北海道日本ハムファイターズの**個人観戦記録**を、多条件で絞り込み・集計して振り返る PWA。
「取り込み(ingest)」と「表示(app)」を完全に分離し、確定データ (`data/games.json`) を永続化する。

## まず開くもの

| 目的                             | 一次情報                                       |
| -------------------------------- | ---------------------------------------------- |
| プロダクトが何を作るのか         | [`docs/requirements.md`](docs/requirements.md) |
| どう構造化されているか           | [`docs/design.md`](docs/design.md)             |
| どう開発・テスト・デプロイするか | [`docs/development.md`](docs/development.md)   |
| 各フォルダの役割・追加の手引き   | 各 `src/<folder>/README.md`（Charter）         |
| 使える依存とスクリプト           | [`package.json`](package.json)                 |
| 層の禁止ルール                   | [`.oxlintrc.json`](.oxlintrc.json)             |

### フォルダの一次案内（Charter）

コードを触るときは、対象フォルダの `README.md` を最初に読むこと。役割・属するもの・属さないもの・依存の許可・追加手順がまとまっている。

- [`src/domain/README.md`](src/domain/README.md) — ドメイン中核（型・純ロジック）
- [`src/data/README.md`](src/data/README.md) — JSON 境界のゲートウェイ
- [`src/ingest/README.md`](src/ingest/README.md) — 取り込み専用
- [`src/ui/README.md`](src/ui/README.md) — ドメイン非依存の再利用 UI
- [`src/app/README.md`](src/app/README.md) — アプリ全体の外殻
- [`src/features/README.md`](src/features/README.md) — 画面部品
- [`src/screens/README.md`](src/screens/README.md) — 画面合成層
- [`src/routes/README.md`](src/routes/README.md) — URL エントリポイント

## アーキテクチャの要点（1 分で）

**上→下の一方向依存のみ**。詳細は [`docs/design.md` §3](docs/design.md#3-ディレクトリ構成と層の依存)。

```
routes → screens → { app, features, ui, domain }
   │                     │           │
   ▼                     ▼           ▼
 data → domain         ui        domain
```

不変条件:

- **routes は URL 結線と data 取得のみ**（features/ui/app へ直接 import しない）
- **screens が唯一の合成層**（feature 横断はここのみ）
- **feature 兄弟の依存は一律禁止**（共有ロジックは `domain/` へ）
- **JSON 直読みは `src/data/` ゲートウェイのみ**（他層は `ALL_GAMES` / `ALL_YEARS` を import）
- **domain / ui は最下層**（上位のいかなる層にも依存しない）
- **ingest はクライアントに import しない**（jsdom 混入防止）

新しい層を追加するときは、`.oxlintrc.json` の下層 override 全てに「新層を禁止する」パターンを追記する
（追記漏れが lint 素通りにつながる。詳細は `docs/development.md` §2 チェックリスト）。

## 開発ゲート（コミット前に通す）

```bash
pnpm lint           # oxlint
pnpm format:check   # oxfmt
pnpm typecheck      # tsc --noEmit
pnpm test           # 単体（--project unit）
pnpm build          # SSG プリレンダー含む
```

- VRT は原則 CI（`Visual Regression` ワークフロー）で回す。ローカルは挙動確認のみ。
- baseline 更新は標準環境（Playwright Docker + Noto CJK）でのみ行う（`scripts/vrt-guard.mjs` がブロック）。

## データフロー（触ってはいけない境界）

```
data/dates.json  ──(push)──▶  GitHub Actions(ingest)  ──▶  data/games.json  ──▶  アプリ
     ↑                                                            ↑
     Claude が /add-date で更新                     ingest だけが書き込む（手編集しない）
```

- `data/games.json` は **ingest の生成物**。手編集しない。
- 詳細取得できない古い試合は `data/date-only.json` に日付を挙げる（値の上書きではなく「詳細を持たないことの宣言」）。
- ingest は外部ネット必須。開発環境や Vercel ビルドから公式サイトへ到達できなくてよい設計
  （実行は GitHub Actions が正）。
- **中止試合は取り扱わない**。現地観戦していないため `data/dates.json` に載せない前提
  （`GameResult` に `cancelled` は存在しない）。

## 絞り込み年度のデフォルト

初期表示は「今シーズン（現在年）」。今年のデータが無ければ観戦データ上の最新年にフォールバックする。

| URL         | 意味                                                            |
| ----------- | --------------------------------------------------------------- |
| （未指定）  | デフォルト年（`domain/query/defaults.ts` の `pickDefaultYear`） |
| `year=all`  | 明示的にすべての年                                              |
| `year=YYYY` | その年に絞り込み                                                |

「条件をクリア」「リセット」は `Filters` の `onReset` → 上位の `onNavigate({})` で URL を空にし、
デフォルト状態へ戻す（`onChange(emptyFilter)` は使わない）。詳細は `docs/design.md` §5。

## Claude コマンド

コードを追加するときは対応するスキルから入る。各スキルの実体は `.claude/commands/*.md`。

| スキル         | 用途                                               |
| -------------- | -------------------------------------------------- |
| `/add-date`    | 観戦日を `data/dates.json` に追加して push         |
| `/add-domain`  | `src/domain/` に型・述語・純関数を追加             |
| `/add-feature` | `src/features/` に新しい feature area を追加       |
| `/add-screen`  | 新しい screen + route wire を追加                  |
| `/add-axis`    | クロス集計の軸を 1 本追加（`AXES` + `AXIS_ORDER`） |
| `/add-filter`  | URL 絞り込み軸を 1 本追加                          |
| `/add-parser`  | ingest の HTML 抽出器を追加                        |

## ブランチと commit

- 作業ブランチは `claude/repository-overview-77ggn9`（本案件の指定）。
- `main` へは PR 経由でマージ。
- コミットは意味単位で分割。メッセージは主眼を短く（例: `refactor(structure): ...`）。

## 触る前に確認する薄い規約

- **バージョン番号を docs に書かない**（`package.json` が単一定義元）。
- **層の禁止ルールを docs に書かない**（`.oxlintrc.json` が単一定義元。docs は不変条件を語る）。
- **ホーム/ビジター → 主催/ビジター**（ドメイン語彙。`domain/game.ts` / `domain/labels.ts`）。
- **「override」の語は避ける**（`date-only.json` は値の上書きではない）。

## 依存関係を破ろうとするときの手順

構造上の invariant を変えるとき（新しい層、依存の向きの見直し等）は次の手順で行う:

1. `docs/design.md` §3 の依存グラフを先に更新
2. `.oxlintrc.json` の overrides を更新（**下層の override 全てに新規制約を追記**）
3. 違反 import を注入して oxlint が確実に落ちることを両方向で確認
4. コード修正
5. `docs/development.md` §2 のチェックリストを踏み、フルゲートを通す
