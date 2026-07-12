# 設計 — 観戦ノート

- 対応する要件は [`requirements.md`](requirements.md)、開発運用は [`development.md`](development.md)。
- 依存バージョンは [`package.json`](../package.json) が単一定義元（本書では版番を持たない）。
- 層の禁止ルールは [`.oxlintrc.json`](../.oxlintrc.json) が単一定義元（本書は**不変条件**を語る）。

## 1. アーキテクチャ方針

**取り込み(ingest) と 表示(app) を完全に分離**するのが本設計の核。

```
┌──── オフライン処理（GitHub Actions で実行）────────────────────┐
│  data/dates.json ──▶ scripts/ingest.ts ──▶ 公式サイト取得・解析 │
│                             │                                   │
│                             └──────────────▶ data/games.json    │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌────────── アプリ（静的 / Vercel）──────────────────────────────┐
│  data/games.json ──▶ ビルド時に読み込み ──▶ 絞り込み/集計       │
│  （スクレイピングは一切しない）                                 │
└────────────────────────────────────────────────────────────────┘
```

- データ源はスクレイピングのみ。手編集・値の上書きは行わない（`games.json` は取り込みの生成物）。
- `games.json` は**コミット対象**（ビルドをサイトから切り離すためのキャッシュ）。
- 完全静的（SSG / prerender）。アプリはビルド時に `games.json` を読み込むだけ。

## 2. 技術スタック

| レイヤ            | 採用                                    | 選定理由                                                                     |
| ----------------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| フレームワーク    | TanStack Start                          | Router 内蔵、Vercel 公式サポート、完全静的（SSG / prerender）で運用          |
| ルーティング/状態 | TanStack Router（Start 内蔵）           | 絞り込み条件を型安全に URL(search params) へ保持。ファイルベースルーティング |
| テーブル/集計     | TanStack Table                          | 並べ替え・絞り込み・グルーピング・集計の中核                                 |
| 言語              | TypeScript strict                       | 型は単一定義                                                                 |
| スタイル          | Tailwind CSS                            | ファイターズカラーをトークン化                                               |
| PWA               | 自前 (`manifest.webmanifest` + `sw.js`) | 静的サイト向けに手書き（`public/`）                                          |
| テスト            | Vitest（unit / vrt の 2 project）       | 単体・コンポーネント・視覚回帰                                               |
| 解析              | jsdom + 既存パーサ                      | ingest 側で HTML を解析                                                      |
| Lint / Format     | oxlint / oxfmt                          | oxc で高速統一（ESLint / Prettier は使わない）                               |
| パッケージ管理    | pnpm                                    | 高速・省ディスク                                                             |
| デプロイ          | Vercel                                  | TanStack Start の Vercel ターゲットを使用                                    |

- 個別バージョンは `package.json` を参照（本書では追わない）。
- 依存は着手時にレジストリで最新を確認して採用する（`development.md` §1 バージョン方針）。

## 3. ディレクトリ構成と層の依存

### 3.1 ツリー

```
baseball-history/
├─ data/
│  ├─ dates.json           # 観戦日（取り込み入力・事前登録もここ）
│  ├─ date-only.json       # 「詳細不明(unknown)」として日付のみ残す試合
│  └─ games.json           # 取り込みの生成物（アプリのソース・コミット対象）
├─ scripts/
│  ├─ ingest.ts            # dates + 公式サイト → games.json 生成（tsx 実行）
│  ├─ add-date.mjs         # 観戦日追加（バリデーション・ソート。/add-date コマンドから呼ぶ）
│  └─ vrt-guard.mjs        # baseline 更新を標準環境以外でブロック
├─ src/
│  ├─ routes/              # TanStack Start ファイルベースルーティング
│  │  ├─ __root.tsx        # ルートレイアウト（テーマ初期化 / SW 登録）
│  │  └─ index.tsx         # データ取得・URL 検証・navigate 結線 → screen へ委譲
│  ├─ app/                 # アプリ全体の外殻。AppShell（ヘッダ・タイトル・ThemeToggle・幅制約）
│  ├─ screens/             # 画面合成層。routes → screens → features
│  │  └─ home/             # HomeView
│  ├─ features/            # 画面部品（薄い表示層）
│  │  ├─ filters/          # Filters / YearFilter
│  │  ├─ stats/            # StatsSummary / CrossStats
│  │  ├─ games/            # GameTable / ResultBadge
│  │  └─ scheduled/        # ScheduledList
│  ├─ ui/                  # ドメイン非依存の再利用UI（Chip / ThemeToggle / hooks）
│  ├─ domain/              # framework 非依存のドメイン中核（最下層）
│  │  ├─ game.ts           # Game 型・列挙・述語・yearOf（単一定義元）
│  │  ├─ masters.ts        # チーム/球場の安定ID・別名解決
│  │  ├─ labels.ts         # 表示ラベル・日付/スコア/勝率整形・取得元URL
│  │  ├─ normalize.ts      # 最小限の正規化（NFKC・空白畳み込み）
│  │  ├─ query/            # 絞り込み・URL・観戦/予定分割
│  │  │  ├─ filter.ts      # GameFilter・applyFilters・countActiveFilters・emptyFilter
│  │  │  ├─ search.ts      # GameSearch(URL)・validateGameSearch・searchToFilter/filterToSearch
│  │  │  ├─ options.ts     # deriveOptions（絞り込み選択肢を実データから生成）
│  │  │  └─ partition.ts   # partitionGames（attended/scheduled 分割）
│  │  └─ stats/            # 集計
│  │     ├─ summary.ts     # Summary 型・summarize・groupBy
│  │     ├─ axes.ts        # 軸レジストリ AXES / AXIS_ORDER（単一定義元）
│  │     └─ rows.ts        # buildRows / rowLabel（表示行の空白年パディング）
│  ├─ data/                # ビルド時データゲートウェイ（JSON 境界の形状ガード）
│  │  └─ games.ts          # ALL_GAMES / ALL_YEARS / GAMES_GENERATED_AT
│                          # JSON 直読みはここのみの特権（oxlint で強制）。
│                          # SSG につき不正データはビルド時 fail-fast。
│  ├─ ingest/              # 取り込み専用（jsdom 依存・scripts のみが呼ぶ）
│  │  ├─ ingestCore.ts     # 取り込み中核（IO 注入の純関数 mergeIngest ほか）
│  │  ├─ parsing.ts        # パーサ用の型（GameInfo / ParseError）
│  │  ├─ parsers/          # 公式サイト HTML パーサ（Document を受け取る抽出器群）
│  │  └─ sleepUtils.ts     # レート制御
│  └─ styles.css           # Tailwind エントリ・デザイントークン
├─ src/tests/              # 共有アセット（helpers/fixtures/setup*.ts/vrt）
│                          # unit/component テストは実装隣にコロケーション
├─ public/                 # PWA アイコン・manifest・sw.js
├─ .claude/commands/       # Claude コマンド（/add-date）
├─ .github/workflows/      # ci.yml / ingest.yml / vrt.yml
├─ vite.config.ts          # TanStack Start / Vite / Vitest 設定
├─ .oxlintrc.json          # 層の禁止ルール（単一定義元）
├─ CLAUDE.md               # Claude Code セッション用の一次案内
└─ docs/                   # requirements.md / design.md / development.md
```

### 3.2 層の依存（不変条件）

**上→下の一方向依存のみ許可。循環は構造的に発生しない。**

```
routes ─▶ screens ─▶ { app, features, ui, domain }
   │                     │           │
   ▼                     ▼           ▼
 data ─▶ domain         ui        domain
   │
   ▼
 domain
```

- `routes → { data, domain, screens }` — URL 結線と data 取得のみ。View 合成は screens へ委譲
- `screens → { app, features, ui, domain, data }` — 画面合成層。**feature 横断はここのみ**
- `app → { ui, domain }` — アプリ外殻（AppShell）
- `features → { domain, ui }` — 画面部品。**兄弟 feature 依存禁止・data 直依存禁止**
- `data → { domain }` — JSON 境界の形状ガード（JSON 直読みはここのみの特権・不正データはビルド時 fail-fast）
- `ui → ∅` — ドメイン非依存の再利用 UI。**最下層**
- `domain → ∅` — framework 非依存のドメイン中核。**最下層**
- `ingest → { domain }` — 取り込み専用（クライアントに import されない）
- `scripts → { ingest, domain }` — ビルド/取り込みスクリプト

**規則の機械強制は `.oxlintrc.json` の `no-restricted-imports` overrides**。相対パス回避（`../ingest/...`）
は文字列マッチで捕捉できないため、ディレクトリ跨ぎの import は必ず `#/` エイリアスを用いる規約で補完する
（境界の限界。`development.md` §2 参照）。

### 3.3 層追加時の運用

新しい層（例: `analytics/`）を追加するときは、以下を**同時に**行う（過去に PR-5/PR-6 で連続して踏んだ落とし穴の再発防止）。

1. `.oxlintrc.json` に新層の override を追加
2. **既存の下層 override 全て**（`ui/domain/data/ingest/scripts`）に「新層を禁止する」パターンを追記
3. 違反 import を注入して oxlint が確実に落ちることを確認（両方向）

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
  opponent: string; // 当時の表示名（scheduled/cancelled/unknown 時は空になりうる）
  opponentId: string; // 安定ID（表記ゆれを束ねる。不明時は空文字）
  stadium: string; // 当時の表示名
  stadiumId: string; // 安定ID（命名権変更を束ねる。不明時は空文字）
  homeAway: HomeAway | null; // 中止/予定/詳細不明など不定時は null
  result: GameResult;
  score: { fighters: number | null; opponent: number | null }; // 中止/予定/詳細不明時は null
}

interface GamesData {
  generatedAt: string; // ISO 取り込み実行時刻
  games: Game[]; // date 昇順
}
```

**列挙の単一定義元は `domain/game.ts`**:

- `GAME_RESULTS`（`as const`）から `GameResult` 型を導出
- `ATTENDED_RESULTS`（勝敗軸に載る 4 値）と `DECIDED_RESULTS`（勝敗確定 3 値）は
  `as const satisfies readonly GameResult[]` で定義し、値追加漏れをコンパイルエラー化

集計軸も `domain/stats/axes.ts` の `AXES: Record<GroupKey, Axis>` + `AXIS_ORDER` に単一定義元化する
（`AXIS_ORDER` 網羅性はコンパイル時 exhaustiveness assertion で強制）。

### 4.2 date-only.json

現行サイトで詳細取得できない古い試合を「詳細不明(unknown)」として日付のみ残すための入力。

```jsonc
// data/date-only.json
{
  "2005": ["0430", "0501"],
  "2006": ["0812"],
}
```

- ingest は該当日を fetch せず `result: "unknown"` として保存する。
- **値の上書き(override)ではなく「詳細を持たないことの宣言」**として位置づける（`requirements.md` §2）。
- 集計は観戦数に含めるが勝敗軸には数えない（§8）。

### 4.3 安定 ID（`masters.ts`）

チーム・球場は年代で表示名が変わりうる（球団改称・球場命名権）。各試合には**当時の表示名**を残しつつ、
集計・絞り込み・URL は**安定 ID** で束ねる。ID は別名表（`aliases`）で解決し、代表名で表示する。
未知の名称は正規化名をそのまま ID/表示にフォールバック（＝名前単位で束ねる）。

### 4.4 正規化（`normalize.ts`）

- 標準は最小限の正規化のみ（前後空白 trim、全角/半角統一、余分な装飾文字の除去）。
- チーム/球場の名寄せマッピングは**データ駆動で後追い**: 一度 ingest して distinct 値を確認し、
  実際に割れていた場合のみ `masters.ts` の `aliases` を追加。
- 絞り込みの選択肢は**実データに存在する値**から動的生成する（`domain/query/options.ts`）。

## 5. URL・状態管理

- 絞り込み状態は **TanStack Router の search params** に一元化（アプリ内 state を二重に持たない）。
- URL スキーマ例:

```
/?year=2025&stadium=escon&stadium=tokyo-dome&opponent=orix&home=home&result=win&result=lose
```

（`stadium`/`opponent` は安定 ID。配列は Router のシリアライズに従い同名キーを繰り返す。）

- URL 検証は `domain/query/search.ts` の手書きサニタイズ（Zod 等の依存を増やさない）。
- 「URL が状態のソース」→ ブックマーク・共有・戻る/進むが自然に機能。

## 6. 画面設計（モバイルファースト）

**スマホがメイン端末**。モバイル 1 カラムで設計し、PC は広い画面を活かす拡張として上乗せする。

### 6.1 モバイル（基準レイアウト）

```
┌──────────────────────┐
│ Header（タイトル）      │  ← コンパクトな固定ヘッダー
├──────────────────────┤
│ 観戦予定（あれば）       │  ← scheduled を上部に小さく
├──────────────────────┤
│ StatsSummary          │  ← 観戦N / 勝W 敗L 分D / 勝率
├──────────────────────┤
│ [ 絞り込み (n) ]        │  ← タップで下からシートを開く
├──────────────────────┤
│ GameCard              │  ← 試合一覧はカード（縦積み）
│ GameCard              │
│ …                     │
└──────────────────────┘
```

- 絞り込みはボトムシート/ドロワーに格納し、一覧の縦スクロールを邪魔しない。
- StatsSummary は常時見える位置に置き、絞り込み変更が即反映されるのが分かるようにする。
- 観戦予定（scheduled）は上部に控えめに表示し、統計からは除外する。
- クロス集計（球場別/相手別/年度別/主催-ビジター別）は折りたたみ or タブで必要時に展開。
- タップ領域は十分に確保（最小 44px 目安）。片手操作を意識し主要操作は画面下部寄り。
- アイコンはインライン SVG（絵文字は使わない・§6.4）。

### 6.2 PC（拡張レイアウト）

```
┌─────────────────────────────────────────────────────┐
│ Header                                                │
├─────────────────────────────────────────────────────┤
│ Filters（横並び常時表示） [リセット]                    │
├─────────────────────────────────────────────────────┤
│ StatsSummary（横並びカード）                           │
├─────────────────────────────────────────────────────┤
│ CrossStats（タブ）: 球場別 / 相手別 / 年度別 / 主催-ビジター別 │
├─────────────────────────────────────────────────────┤
│ GameTable（テーブル・列並べ替え可）                     │
└─────────────────────────────────────────────────────┘
```

- 同じデータ・同じ絞り込み状態（URL）を、画面幅で表示形態だけ切り替える。
- モバイル=カード、PC=テーブル。TanStack Table のモデルは両者で共有。

### 6.3 共通

- Filters・Stats・Table/Card はすべて同じ絞り込み状態（URL）に連動。
- アクセシビリティ: 適切なラベル/role、テーブルは `scope` 指定、ボトムシートはフォーカストラップ / `Esc` クローズ。

### 6.4 デザイン原則（AI 生成感を出さない）

**鉄則: いわゆる「AI が作った風」の見た目にしない**。具体的に避ける項目:

- ❌ クリーム(#F4F1EA) + セリフ見出し + テラコッタのアクセント
- ❌ 黒に近い背景 + アシッドグリーン/朱色のワンポイント
- ❌ Inter / Space Grotesk を「無難だから」で採用
- ❌ 絵文字を見出し・セクションマーカーに使う
- ❌ 何でも中央寄せ、何でも `rounded-lg`、角丸カード + 左端アクセントバー
- ❌ 紫→青のグラデーション hero

代わりに **題材（野球のスコアブック／球場の掲示・電光掲示板）に根ざした独自の世界観**で作る。

- 数字が主役 → 等幅・タブラー数字を効かせた「記録簿」的タイポグラフィ。
- ファイターズブルーは**土台の 1 色**として使い、多用しない（勝敗などの意味色は別系統）。
- 罫線・グリッド・整然としたテーブルで「スコアブック感」を出す。装飾より情報設計。
- フォントは目的を持って選定（本文=可読性の高い日本語ゴシック、数字=等幅系）。CDN 直リンクせず自己ホスト。
- ライト/ダーク両対応。色はトークン化し、意味色（good/warning/critical）はアクセントと分離。

## 7. 取り込み（ingest）設計

### 7.1 フロー

1. `dates.json` を読み、`{year, MMDD}` を列挙。
2. `date-only.json` に該当する日は fetch せず `result: "unknown"` として保存。
3. 既存 `games.json` があれば読み、**未確定の試合のみ**対象にする
   （確定済み = 再取得しない。`scheduled` / `cancelled` / 失敗分は対象。`--force` で全再取得）。
4. 未来日 or 当日で結果未確定なら、取得を試みず（または結果なしを検知して）`result: "scheduled"` として記録。
5. 過去日は URL `https://www.fighters.co.jp/gamelive/result/{year}{MMDD}01/` を取得。
6. 既存パーサ（team / score / location / home / gameParser）で解析。
7. 最小限の正規化（trim・全半角）を適用。末尾 `01`（第 1 試合）のみ対象。
8. `date` 昇順で `games.json` を書き出し（`generatedAt` 更新）。

### 7.2 状態遷移とエラー処理

- **事前登録**: 試合前の日は `scheduled` として保存。結果が出た後の実行で自動確定
  （`scheduled` は毎回再取得対象なので放置でも次回実行で更新）。
- 取得/解析失敗はレコードを捏造せず、`ingest-report.json`（失敗一覧）に記録し標準出力にサマリを出す。
  失敗分は次回実行で自動リトライ。
- レート制御: リクエスト間 sleep（`SCRAPING_DELAY_MS`）。

### 7.3 実行方式

取り込みは **GitHub Actions（`.github/workflows/ingest.yml`）** で実行する。ランナーは外部ネットに出られる。

| トリガー                        | 動作                                       |
| ------------------------------- | ------------------------------------------ |
| `data/dates.json` への push     | 追加された観戦日を含む**未取得分だけ**取得 |
| 手動実行（`workflow_dispatch`） | 任意実行（`--force` や年指定も可能）       |

- **定期実行（cron）はしない**。年に十数日の観戦のためにルーティンで回す必要はない。
- ワークフローは取得後、`games.json`（と `ingest-report.json`）をリポジトリへ自動コミットする。
  → その push を Vercel が検知して自動デプロイ。
- コミット権限は `permissions: contents: write`（`GITHUB_TOKEN`）。
- ローカル手動実行もフォールバック可能: `pnpm ingest` / `pnpm ingest -- --force` / `pnpm ingest -- --year 2026`。

## 8. 集計ロジック（`domain/stats/`）

- 純関数として実装（入力: `Game[]` → 出力: 集計オブジェクト）。テスト容易。
- **`scheduled`（観戦予定）は集計対象から除外**（実績ではない）。
- **`unknown`（詳細不明）** は観戦数（`attended`）に含めるが、勝率の分母および相手/球場/主催の
  軸別集計には数えない（値が空のため自然に除外。年度別軸には観戦数として現れる）。

構成:

- `summary.ts`:
  - `summarize(games): Summary` → `{ attended, win, lose, draw, cancelled, winRate }`
    （勝率は中止・予定・詳細不明を除いた分母で算出。該当なしは `null`）
  - `groupBy(games, key)` → 軸別集計配列（値抽出は `AXES[key].valueOf` 経由）
- `axes.ts`: **軸レジストリ** `AXES` と `AXIS_ORDER`
  （軸追加時の同期漏れをコンパイルエラー化。追加は 1 エントリで完結）
- `rows.ts`: `buildRows` / `rowLabel`（表示行の空白年パディング等）

表示側は集計結果と AXES メタデータを受け取るだけ（ロジックと描画を分離）。

## 9. PWA 設計

- **自前実装**（`public/manifest.webmanifest` + `public/sw.js`）。
- Manifest: 名称「観戦ノート」・新アイコン・テーマカラー `#016298`・`display: standalone`。
- Service Worker: same-origin GET を stale-while-revalidate、ナビゲーションはオフライン時トップへフォールバック。
- `__root.tsx` でアイコン/マニフェスト/テーマカラーを head に、SW 登録をインラインスクリプトで実施。

## 10. 観戦日の登録（Claude コマンド）

観戦日の追加はすべて Claude 経由（[`add-date`](../.claude/commands/add-date.md)）で行う。

- 引数（年・`MMDD` 複数可）を検証し、`data/dates.json` へ追記・重複スキップ・ソート → commit & push。
- 実体は `scripts/add-date.mjs`。
- push を GitHub Actions(ingest) が拾い、結果取得〜デプロイまで自動で流れる。
- 事前登録に対応（まだ試合前の日も登録可）。ingest は `scheduled` として保存し、後日結果が出たら自動確定。

## 11. パフォーマンス設計

- データは数百件想定 → 全件をクライアントに載せてメモリ内で絞り込み/集計。
- 重い計算は `useMemo` でメモ化。仮想スクロールは件数増加時の将来対応。
