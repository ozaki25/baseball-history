# 設計書 — 観戦履歴アプリ（再構築）

> ステータス: **反映済み（構造化リファクタ PR1〜PR6 = 白紙PR-1〜PR-6 完了時点）** / 最終更新: 2026-07-12
> 対応する要件は `requirements.md` を参照。開発運用は `development.md` を参照。

## 1. アーキテクチャ方針

**「取得（ingest）」と「表示（app）」を完全に分離する**のが本設計の核。

```
┌────────────── オフライン処理（手動/オンデマンド実行）──────────────┐
│  data/dates.json ──▶ scripts/ingest.ts ──▶ 公式サイト取得・解析      │
│                             │                                        │
│                             └──────────────▶  data/games.json        │
└─────────────────────────────┬────────────────────────────────────────┘
                              ▼
┌──────────────────── アプリ（静的・Vercel）───────────────────────────┐
│  data/games.json ──▶ ビルド時に読み込み ──▶ TanStack で絞り込み/集計   │
│  （スクレイピングは一切しない）                                        │
└──────────────────────────────────────────────────────────────────────┘
```

- **データ源はスクレイピングのみ**。手編集・override は行わない（`games.json` は取り込みの生成物）。
- **取り込みは GitHub Actions 上で実行**（Vercel ビルド時でもアプリ実行時でもない）。
- アプリはビルド時に `games.json` を読み込むだけ。外部サイトに非依存。
- `games.json` は**コミット対象**（ビルドをサイトから切り離すためのキャッシュ）。

## 2. 技術スタック

> **バージョン方針**: 実装着手時に npm レジストリで最新を確認して採用する（知識ベースの古い選定をしない）。
> 下表の版は 2026-07 時点の確認値。TypeScript 7 はネイティブコンパイラ世代の大型更新のため、
> スキャフォールド時にツール互換を実地確認し、問題があれば 5 系へ退避可能とする。

| レイヤ            | 採用                              | 版(確認時) | 選定理由                                                                                         |
| ----------------- | --------------------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| フレームワーク    | **TanStack Start**                | 1.168      | TanStack 一式（Router 基盤）を中核に。Vercel を公式サポート。**完全静的（SSG/prerender）で運用** |
| ルーティング/状態 | **TanStack Router**（Start 内蔵） | 1.170      | 絞り込み条件を**型安全に URL（search params）へ保持**。ファイルベースルーティング                |
| テーブル/集計     | **TanStack Table**                | 8.21       | 並べ替え・絞り込み・グルーピング・集計の中核。多条件クロス集計を宣言的に実装                     |
| 言語              | **TypeScript**                    | 7.0        | strict。型は単一定義                                                                             |
| スタイル          | **Tailwind CSS**                  | 4.x        | ファイターズカラーをトークン化                                                                   |
| PWA               | **自前(manifest+sw.js)**          | —          | vite-plugin-pwa は Start のマルチ環境ビルドで SW 未生成のため撤去。静的サイト向けに手書き        |
| テスト            | **Vitest**                        | 4.x        | パーサ/集計の単体テスト                                                                          |
| 解析              | **jsdom + 既存パーサ**            | —          | ingest 側で再利用（後述）                                                                        |
| Lint              | **oxlint**                        | 1.x        | 高速。ESLint は使わない                                                                          |
| Format            | **oxfmt**（oxc）                  | 0.x        | oxc で統一（0.x のため整形挙動の変化に留意）                                                     |
| パッケージ管理    | **pnpm**                          | 11.x       | 高速・省ディスク。npm から移行                                                                   |
| デプロイ          | **Vercel**                        | —          | TanStack Start の Vercel ターゲットを使用                                                        |

> Router は Start に内蔵。将来的に `@tanstack/react-query` / `react-form` を足す余地はあるが、
> 初期スコープ（静的データ・編集 UI なし）では不要。

## 3. ディレクトリ構成（目標）

```
baseball-history/
├─ data/
│  ├─ dates.json          # 観戦日（取り込み入力・維持／事前登録もここ）
│  └─ games.json          # 取り込みの生成物（アプリのソース・コミット対象）
├─ scripts/
│  ├─ ingest.ts           # dates + 公式サイト → games.json 生成（tsx 実行。IO とCLI引数のみ）
│  └─ add-date.mjs        # 観戦日追加（バリデーション・ソート。コマンドから呼ぶ）
├─ src/
│  ├─ routes/             # TanStack Start ファイルベースルーティング（container）
│  │  ├─ __root.tsx       # ルートレイアウト（テーマ初期化スクリプト / SW 登録。Header は AppShell が担当）
│  │  └─ index.tsx        # データ取得・URL検証・navigate 結線 → HomeView へ委譲
│  ├─ app/                # アプリ全体の外殻。AppShell(ヘッダ・タイトル・ThemeToggle・幅制約)
│  ├─ screens/            # 画面合成層（feature 横断はここのみ）。routes → screens → features
│  │  └─ home/            # HomeView（ホーム画面の合成のみ）
│  ├─ features/           # 画面部品（薄い表示層・兄弟 feature 間の依存は禁止・共有は domain へ）
│  │  ├─ filters/         # Filters / YearFilter（表示部品のみ・ロジックは domain/query）
│  │  ├─ stats/           # StatsSummary / CrossStats（表示部品のみ・ロジックは domain/stats）
│  │  ├─ games/           # GameTable / ResultBadge
│  │  └─ scheduled/       # ScheduledList（観戦予定の別枠表示）
│  ├─ ui/                 # ドメイン非依存の再利用UI（Chip / ThemeToggle / use*。hooks も可）
│  ├─ domain/             # framework非依存のドメイン中核（React/router/jsdom ゼロ・最下層）
│  │  ├─ game.ts          # Game 型・GameResult/HomeAway・列挙(GAME_RESULTS/ATTENDED_RESULTS/DECIDED_RESULTS)・
│  │  │                   # 述語(isScheduled/isAttended)・yearOf。単一定義元。
│  │  ├─ masters.ts       # チーム/球場の安定ID・別名解決（表記ゆれの束ね）
│  │  ├─ labels.ts        # ドメイン語彙（表示ラベル・日付/スコア整形・勝率整形・取得元URL。全feature/scripts共有）
│  │  ├─ normalize.ts     # 最小限の正規化（NFKC・空白畳み込み）
│  │  ├─ query/           # 絞り込み・URL・観戦/予定分割（画面横断のドメインロジック）
│  │  │  ├─ filter.ts     # GameFilter 型・applyFilters・countActiveFilters・emptyFilter
│  │  │  ├─ search.ts     # GameSearch(URL) 型・validateGameSearch・searchToFilter/filterToSearch
│  │  │  ├─ options.ts    # deriveOptions（絞り込み選択肢を実データから生成）
│  │  │  └─ partition.ts  # partitionGames（フィルタ適用結果を attended/scheduled に分割）
│  │  └─ stats/           # 集計（画面横断のドメインロジック）
│  │     ├─ summary.ts    # Summary 型・summarize・groupBy（純集計）
│  │     ├─ axes.ts       # 軸レジストリ AXES（key/label/columnLabel/valueOf/labelOf）+ AXIS_ORDER。単一定義元
│  │     └─ rows.ts       # 表示行 buildRows（空白年パディング等）・rowLabel
│  ├─ data/               # ビルド時データゲートウェイ（JSON 境界の形状ガード）
│  │  └─ games.ts         # ALL_GAMES / ALL_YEARS / GAMES_GENERATED_AT。JSON 直読みはここのみ
                          # の特権(oxlint で強制)。SSG につき不正データはビルド時 fail-fast。
│  ├─ ingest/             # 取り込み専用（jsdom 依存・scripts のみが呼ぶ）
│  │  ├─ ingestCore.ts    # 取り込み中核（IO 注入の純関数 mergeIngest ほか）
│  │  ├─ parsing.ts       # 取り込みパーサ用の型（GameInfo / ParseError）
│  │  ├─ parsers/         # 公式サイト HTML パーサ（Document を受け取る抽出器群）
│  │  └─ sleepUtils.ts    # レート制御
│  └─ styles.css          # Tailwind エントリ・デザイントークン（ライト/ダーク）
├─ src/tests/             # Vitest（lib 単体・パーサ・コンポーネント[jsdom]）
├─ public/                # PWA アイコン・manifest・sw.js
├─ .claude/commands/add-date.md  # 観戦日追加コマンド（Claude 経由の登録口）
├─ .github/workflows/     # ci.yml / ingest.yml
├─ vite.config.ts         # TanStack Start / Vite / Vitest 設定
└─ docs/                  # 本ドキュメント群
```

## 4. データモデル

### 4.1 Game（`games.json`）

```ts
type HomeAway = "home" | "away";
// scheduled = 事前登録済みで結果未確定（試合前 / 未反映）。結果が出たら他の値に更新される
// unknown   = 詳細不明。観戦した記録は残すが、試合詳細が信頼できず日付のみ残す
//             （現行サイトで正しく取得できない古い試合。data/date-only.json で指定）
type GameResult = "win" | "lose" | "draw" | "cancelled" | "scheduled" | "unknown";

interface Game {
  id: string; // "2025-04-01"
  date: string; // ISO "YYYY-MM-DD"
  opponent: string; // 当時の表示名（正規化済み。scheduled/cancelled/unknown 時は空になりうる）
  opponentId: string; // 安定ID（表記ゆれを束ねる。不明時は空文字）
  stadium: string; // 当時の表示名（正規化済み）
  stadiumId: string; // 安定ID（球場の命名権変更を束ねる。不明時は空文字）
  homeAway: HomeAway | null; // 中止/予定/詳細不明など不定時は null
  result: GameResult;
  score: { fighters: number | null; opponent: number | null }; // 中止/予定/詳細不明時は null
}
```

> **列挙の単一定義元**: `GAME_RESULTS` / `ATTENDED_RESULTS`(勝敗軸に載る4値) / `DECIDED_RESULTS`(勝敗確定3値) を
> `domain/game.ts` で `as const satisfies readonly GameResult[]` として定義。値追加漏れはコンパイルエラー化される。
>
> **date-only.json**: 現行サイトで取得できない古い試合を「詳細不明(unknown)」として日付のみ残す。
> ingest は該当日を fetch せず `unknown` で保存。集計は観戦数に含めるが勝敗軸には数えない。
>
> 全項目がスクレイピング由来。手入力項目（メモ等）は持たない。
>
> **安定ID（`masters.ts`）**: チーム・球場は年代で表示名が変わりうる（球団改称・球場の命名権）。
> 各試合には**当時の表示名**（`opponent`/`stadium`）を残しつつ、集計・絞り込み・URL は
> **安定ID**（`opponentId`/`stadiumId`）で束ねる。ID は別名表（`aliases`）で解決し、代表名で表示する。
> 未知の名称は正規化名をそのまま ID/表示にフォールバック（＝名前単位で束ねる）。

```jsonc
// games.json
{
  "generatedAt": "2026-07-10T00:00:00Z",
  "games": [/* Game[] を date 昇順で格納 */],
}
```

### 4.2 正規化（`normalize.ts`）

単一ソース（公式サイト）由来なので基本は表記が揃っている前提。過剰なマスタは作らない。

- **標準は最小限の正規化のみ**: 前後空白の trim、全角/半角の統一、余分な装飾文字の除去。
- チーム/球場の**名寄せマッピングはデータ駆動で後追い**: 一度 ingest して distinct 値を確認し、
  20 年分の年代差などで実際に割れていた場合のみ、小さな対応表（`aliases`）を足す。
- 絞り込みの選択肢は**実データに存在する値**から動的生成する。

## 5. 状態管理・URL 設計

- 絞り込み状態は **TanStack Router の search params** に一元化（アプリ内 state を二重に持たない）。
- URL スキーマ例:

```
/?year=2025&stadium=escon&stadium=tokyo-dome&opponent=orix&home=home&result=win&result=lose
```

（stadium/opponent は安定ID。配列は TanStack Router のシリアライズに従い同名キーを繰り返す。）

- search バリデーション（`search.ts` の手書きサニタイズ）で不正値を除去し、値をキーごとに正規化。
  依存を増やさないため Zod 等は使わず、最小限のバリデータで済ませる。
- 「URL が状態のソース」→ ブックマーク・共有・戻る/進むが自然に機能。

## 6. 画面設計（モバイルファースト）

**スマホがメイン端末**。まずモバイル 1 カラムで設計し、PC は広い画面を活かす拡張として上乗せする。

### 6.1 モバイル（基準レイアウト）

```
┌──────────────────────┐
│ Header（タイトル）      │  ← コンパクトな固定ヘッダー
├──────────────────────┤
│ 観戦予定（あれば）       │  ← scheduled を上部に小さく（次に行く試合）
├──────────────────────┤
│ StatsSummary          │  ← 観戦N / 勝W 敗L 分D / 勝率
│  （常に見える要約）     │
├──────────────────────┤
│ [ 絞り込み (n) ]        │  ← タップで下から絞り込みシートを開く
├──────────────────────┤
│ GameCard              │  ← 試合一覧はカード（縦積み）
│ GameCard              │     日付・相手・H/V・結果・スコア・球場
│ GameCard              │
│ …                     │
└──────────────────────┘

絞り込みシート（ボトムシート / 全画面）:
  [年度・期間] [球場] [相手] [ホーム/ビジター] [勝敗]
  [ リセット ]           [ この条件で見る ]
```

- 絞り込みは**ボトムシート/ドロワー**に格納し、一覧の縦スクロールを邪魔しない。
- StatsSummary は常時見える位置に置き、絞り込み変更が即反映されるのが分かるようにする。
- **観戦予定（`scheduled`）** は履歴とは別の扱いで上部に控えめに表示し、勝敗・勝率などの統計からは除外する。
- クロス集計（球場別/相手別/年度別/H・V別）は**折りたたみ or タブ**で必要時に展開。
- タップ領域は十分に確保（最小 44px 目安）。片手操作を意識し主要操作は画面下部寄り。
- アイコンは**インライン SVG**（絵文字は使わない。§6.4）。

### 6.2 PC（拡張レイアウト）

```
┌───────────────────────────────────────────────┐
│ Header                                          │
├───────────────────────────────────────────────┤
│ Filters（横並びで常時表示） [リセット]            │
├───────────────────────────────────────────────┤
│ StatsSummary（横並びカード）                     │
├───────────────────────────────────────────────┤
│ CrossStats（タブ）: 球場別 / 相手別 / 年度別 / H・V別 │
├───────────────────────────────────────────────┤
│ GameTable（テーブル・列並べ替え可）               │
└───────────────────────────────────────────────┘
```

- 同じデータ・同じ絞り込み状態（URL）を、画面幅で表示形態だけ切り替える（Tailwind ブレークポイント）。
- モバイル=カード、PC=テーブル。TanStack Table のモデル（並べ替え/絞り込み/集計）は両者で共有。

### 6.3 共通

- Filters・Stats・Table/Card はすべて**同じ絞り込み状態（URL）に連動**。
- アクセシビリティ: フィルタは適切なラベル/role、テーブルは `scope` 指定、ボトムシートはフォーカストラップ/`Esc` クローズ、キーボード操作対応。

### 6.4 デザイン原則（AI 生成感を出さない）

**鉄則: いわゆる「AI が作った風」の見た目にしない。** 具体的に次を避ける。

- ❌ クリーム(#F4F1EA)＋セリフ見出し＋テラコッタのアクセント
- ❌ 黒に近い背景＋アシッドグリーン/朱色のワンポイント
- ❌ Inter / Space Grotesk を「無難だから」で採用
- ❌ 絵文字を見出し・セクションマーカーに使う
- ❌ 何でも中央寄せ、何でも `rounded-lg`、角丸カード＋左端アクセントバー
- ❌ 紫→青のグラデーション hero

代わりに、**題材（野球のスコアブック／球場の掲示・電光掲示板）に根ざした独自の世界観**で作る。

- 数字が主役なので、**等幅・タブラー数字**を効かせた「記録簿」的なタイポグラフィ。
- ファイターズブルーは**土台の1色**として使い、多用しない（勝敗などの意味色は別系統）。
- 罫線・グリッド・整然としたテーブルで「スコアブック感」を出す。装飾より情報設計。
- フォントは目的を持って選定（本文＝可読性の高い日本語ゴシック、数字＝等幅系）。CDN 直リンクはせず自己ホスト。
- ライト/ダーク両対応。色はトークン化し、意味色（good/warning/critical）はアクセントと分離。

## 7. 取り込み（ingest）設計

### 7.1 フロー

1. `dates.json` を読み、`{year, MMDD}` を列挙。
2. 既存 `games.json` があれば読み、**未確定の試合のみ**対象にする（確定済み＝再取得しない。`scheduled` と未取得は対象。`--force` で全再取得）。
3. **未来日 or 当日で結果未確定**なら、取得を試みず（または結果なしを検知して）`result: 'scheduled'` として記録（事前登録の受け皿）。
4. 過去日は URL `https://www.fighters.co.jp/gamelive/result/{year}{MMDD}01/` を取得。
5. 既存パーサ（teamExtractor / scoreExtractor / locationExtractor / homeDetector / gameParser）で解析。
6. 最小限の正規化（trim・全半角）を適用。※ 末尾 `01`（第1試合）のみ対象。ダブルヘッダー第2試合は扱わない。
7. `date` 昇順で `games.json` を書き出し（`generatedAt` 更新）。

### 7.2 状態遷移とエラー処理

- **事前登録**: 試合前の日は `scheduled` として保存。結果が出た後の実行で `win/lose/draw/cancelled` に**自動確定**（`scheduled` は毎回再取得対象なので放置でも次回実行で更新）。
- 取得/解析失敗はレコードを捏造せず、**別途 `ingest-report.json`**（失敗一覧）に記録し、標準出力にサマリを出す。失敗分は次回実行で自動リトライ。
- **再取得のトリガー**: 新しい観戦日を（スキル経由で）足して push すれば ingest が走り、その際に `scheduled`／失敗分も一緒に拾い直す。単独で確定させたい時は手動実行。
- レート制御: リクエスト間 sleep（既存 `SCRAPING_DELAY_MS` 踏襲）。

### 7.3 実行方式（GitHub Actions）

取り込みは **GitHub Actions のワークフロー（`.github/workflows/ingest.yml`）** で実行する。
GitHub のランナーは外部ネットに出られるため公式サイトへ到達可能（この開発環境や Vercel ビルドからは到達不可でも問題ない）。

| トリガー                        | 動作                                       |
| ------------------------------- | ------------------------------------------ |
| `dates.json` への push          | 追加された観戦日を含む**未取得分だけ**取得 |
| 手動実行（`workflow_dispatch`） | 任意実行。`--force` や年指定も可能         |

- **定期実行（cron）はしない**。年に十数日の観戦のためにルーティンで回す必要はない。
  観戦日は「試合が終わってから」足せば結果は確定済みで push トリガーだけで取得できる。
  万一まだ結果が出ていない稀なケースは、手動実行で 1 回押し直せばよい。
- ワークフローは取得後、`games.json`（と `ingest-report.json`）を**リポジトリへ自動コミット**する。
  → その push を Vercel が検知して自動デプロイ。
- コミット権限は `permissions: contents: write`（`GITHUB_TOKEN`）。
- ローカルからの手動実行もフォールバックとして可能（同じ CLI）:

```bash
npm run ingest            # 差分取得
npm run ingest -- --force # 全再取得
npm run ingest -- --year 2026
```

## 8. 集計ロジック（`stats.ts`）

- 純関数として実装（入力: `Game[]` → 出力: 集計オブジェクト）。テスト容易。
- **`scheduled`（観戦予定）は集計対象から除外**（実績ではないため）。
- 提供:
  - `summarize(games)` → `{ total, win, lose, draw, cancelled, winRate }`
    （勝率は中止・予定を除いた分母で算出）
  - `groupBy(games, key)` → 軸別（球場/相手/年度/HV）の集計配列
- 表示側は集計結果を受け取るだけ（ロジックと描画を分離）。

## 9. PWA 設計

- **自前実装**（vite-plugin-pwa は Start のマルチ環境ビルドで SW を生成しなかったため撤去）。
- `public/manifest.webmanifest`（名称「観戦ノート」・新アイコン・テーマカラー `#016298`・`standalone`）。
- `public/sw.js`（same-origin GET を stale-while-revalidate、ナビゲーションはオフライン時トップへフォールバック）。
- `__root.tsx` でアイコン/マニフェスト/テーマカラーを head に、SW 登録をインラインスクリプトで実施。

## 9b. 観戦日の登録（Claude 経由コマンド）

観戦日の追加は**すべて Claude 経由**で行う。`.claude/commands/add-date.md` にコマンドを置く。

- 役割: 引数（年・`MMDD` 複数可）を検証し、`data/dates.json` へ追記・ソート → commit & push。
  push をトリガーに GitHub Actions(ingest) が走り、結果取得〜デプロイまで自動で流れる。
- 実体は `scripts/add-date.mjs`（既存を流用・検証/重複スキップ/ソート済み）をスキルから呼ぶ形。
- **事前登録に対応**: まだ試合前の日も登録可。取り込みでは `scheduled` として扱い、後日結果が出たら確定に更新される（§7）。
- 利用イメージ: 「7/5 と 7/6 の観戦を登録して」→ スキルが dates.json 更新 & push → 自動取り込み。

## 10. パフォーマンス設計

- データは数百件想定 → 全件をクライアントに載せてメモリ内で絞り込み/集計。
- 重い計算は `useMemo` でメモ化。仮想スクロールは件数増加時の将来対応。

## 11. 旧資産の撤去方針

- 削除: `next.config.ts`・Next 関連依存・`src/app/*`・旧 `HomeClient` 等・旧設計ドキュメント
  （`PROJECT_REQUIREMENTS.md` / `FUNCTIONAL_DESIGN.md` / `DETAILED_DESIGN.md`）。
- 流用: `src/lib/parsers/*`（→ 現 `src/ingest/parsers/`）・`src/tests/fixtures/*`・`scripts/add-date.mjs`・`COLOR_PALETTE.md`。
- 置換: ルーティング/エントリ（Next App Router → TanStack Start）、パッケージ管理（npm → pnpm）、Lint/Format（ESLint/Prettier → oxlint/oxfmt）。
- アイコン: 旧アイコンは刷新（フェーズ5で新規作成）。
