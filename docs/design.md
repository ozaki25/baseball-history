# 設計書 — 観戦履歴アプリ（再構築）

> ステータス: **ドラフト（レビュー中）** / 最終更新: 2026-07-10
> 対応する要件は `requirements.md` を参照。

## 1. アーキテクチャ方針

**「取得（ingest）」と「表示（app）」を完全に分離する**のが本設計の核。

```
┌────────────── オフライン処理（手動/オンデマンド実行）──────────────┐
│  data/dates.json ──▶ scripts/ingest.mjs ──▶ 公式サイト取得・解析     │
│                             │                                        │
│                             └──────────────▶  data/games.json        │
└─────────────────────────────┬────────────────────────────────────────┘
                              ▼
┌──────────────────── アプリ（静的・Vercel）───────────────────────────┐
│  data/games.json ──▶ Vite ビルドで取り込み ──▶ TanStack で絞り込み/集計 │
│  （スクレイピングは一切しない）                                        │
└──────────────────────────────────────────────────────────────────────┘
```

- **データ源はスクレイピングのみ**。手編集・override は行わない（`games.json` は取り込みの生成物）。
- アプリはビルド時に `games.json` を読み込むだけ。外部サイトに非依存。
- `games.json` は**コミット対象**（ビルドをサイトから切り離すためのキャッシュ）。

## 2. 技術スタック

| レイヤ | 採用 | 選定理由 |
|---|---|---|
| ビルド/開発 | **Vite + React + TypeScript** | 軽量・高速・シンプル。個人用静的アプリに最適 |
| ルーティング/状態 | **TanStack Router** | 絞り込み条件を**型安全に URL（search params）へ保持**。フィルタ中心アプリと好相性 |
| テーブル/集計 | **TanStack Table** | 並べ替え・絞り込み・グルーピング・集計の中核。多条件クロス集計を宣言的に実装 |
| スタイル | **Tailwind CSS** | 既存を踏襲。ファイターズカラーをトークン化 |
| PWA | **vite-plugin-pwa** | Manifest + Service Worker を簡潔に。オフライン対応 |
| テスト | **Vitest** | 既存を踏襲。パーサ/集計の単体テスト |
| 解析 | **jsdom + 既存パーサ** | ingest 側で再利用（後述） |
| デプロイ | **Vercel（静的）** | 既存を踏襲。ビルド出力 `dist` を配信 |

> TanStack を中核に据える方針。将来的に `@tanstack/react-query` や `@tanstack/react-form`
> を導入する余地はあるが、初期スコープ（静的データ・編集UIなし）では必須ではない。

## 3. ディレクトリ構成（目標）

```
baseball-history/
├─ data/
│  ├─ dates.json          # 観戦日（取り込み入力・維持）
│  └─ games.json          # 取り込みの生成物（アプリのソース・コミット対象）
├─ scripts/
│  ├─ ingest.mjs          # dates + 公式サイト → games.json 生成
│  └─ add-date.mjs        # 観戦日追加（既存を維持）
├─ src/
│  ├─ main.tsx            # エントリ
│  ├─ router.tsx          # TanStack Router 定義
│  ├─ routes/
│  │  └─ index.tsx        # 一覧＋絞り込み＋集計（メイン画面）
│  ├─ components/
│  │  ├─ GameTable.tsx    # TanStack Table（PC テーブル / モバイルカード）
│  │  ├─ Filters.tsx      # 5 軸の絞り込み UI
│  │  ├─ StatsSummary.tsx # 絞り込み連動の集計サマリ
│  │  ├─ CrossStats.tsx   # 軸別クロス集計テーブル
│  │  └─ layout/          # Header / Footer
│  ├─ lib/
│  │  ├─ parsers/         # 既存パーサを移設・再利用（ingest から利用）
│  │  ├─ stats.ts         # 集計ロジック（純関数・テスト対象）
│  │  ├─ filters.ts       # 絞り込みロジック・URL スキーマ
│  │  └─ masters.ts       # 球場/チーム 正規化マスタ
│  ├─ types/
│  │  └─ game.ts          # Game 型ほか
│  └─ styles/             # Tailwind エントリ・テーマ
├─ src/tests/             # Vitest（既存フィクスチャ流用）
├─ public/                # PWA アイコン・静的ファイル
├─ vite.config.ts
├─ tailwind.config / postcss.config
└─ docs/                  # 本ドキュメント群
```

## 4. データモデル

### 4.1 Game（`games.json`）

```ts
type HomeAway = 'home' | 'away';
type GameResult = 'win' | 'lose' | 'draw' | 'cancelled';

interface Game {
  id: string;            // "2025-04-01"（ダブルヘッダーは §未決で確定）
  date: string;          // ISO "YYYY-MM-DD"
  opponent: string;      // 正規化済みチーム名
  stadium: string;       // 正規化済み球場名
  homeAway: HomeAway;
  result: GameResult;
  score: { fighters: number | null; opponent: number | null }; // 中止時は null
}
```

> 全項目がスクレイピング由来。手入力項目（メモ等）は持たない。

```jsonc
// games.json
{
  "generatedAt": "2026-07-10T00:00:00Z",
  "games": [ /* Game[] を date 昇順で格納 */ ]
}
```

### 4.2 正規化マスタ（`masters.ts`）

- 対戦相手: NPB 12 球団の正式名・略称・表記ゆれ → 正規化キーへ。
- 球場: 主要球場の表記ゆれ（例: 「札幌ドーム」「エスコンフィールド HOKKAIDO」）を統一。
- 絞り込みの選択肢は**実データに存在する値**から動的生成しつつ、表示名はマスタで整える。

## 5. 状態管理・URL 設計

- 絞り込み状態は **TanStack Router の search params** に一元化（アプリ内 state を二重に持たない）。
- URL スキーマ例:

```
/?year=2025&stadium=escon,tokyo-dome&opponent=orix&homeAway=home&result=win,sayonara
```

- 型安全な search バリデーション（Zod など）で不正値をサニタイズ。
- 「URL が状態のソース」→ ブックマーク・共有・戻る/進むが自然に機能。

## 6. 画面設計（モバイルファースト）

**スマホがメイン端末**。まずモバイル 1 カラムで設計し、PC は広い画面を活かす拡張として上乗せする。

### 6.1 モバイル（基準レイアウト）

```
┌──────────────────────┐
│ Header（タイトル）      │  ← コンパクトな固定ヘッダー
├──────────────────────┤
│ StatsSummary          │  ← 観戦N / 勝W 敗L 分D / 勝率
│  （常に見える要約）     │
├──────────────────────┤
│ [ 🔎 絞り込み (n) ]     │  ← タップで下から絞り込みシートを開く
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
- クロス集計（球場別/相手別/年度別/H・V別）は**折りたたみ or タブ**で必要時に展開。
- タップ領域は十分に確保（最小 44px 目安）。片手操作を意識し主要操作は画面下部寄り。

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

## 7. 取り込み（ingest）設計

### 7.1 フロー
1. `dates.json` を読み、`{year, MMDD}` を列挙。
2. 既存 `games.json` があれば読み、**未取得（未成功）の試合のみ**対象にする（`--force` で全再取得）。
3. 各試合の URL `https://www.fighters.co.jp/gamelive/result/{year}{MMDD}01/` を取得。
4. 既存パーサ（teamExtractor / scoreExtractor / locationExtractor / homeDetector / gameParser）で解析。
5. 正規化マスタで球場・相手名を整える。
6. `date` 昇順で `games.json` を書き出し（`generatedAt` 更新）。

### 7.2 エラー処理
- 取得/解析失敗はレコードを捏造せず、**別途 `ingest-report.json`**（失敗一覧）に記録し、標準出力にサマリを出す。
- 失敗分は次回実行時に自動でリトライ対象になる（手動補完は行わない）。
- レート制御: リクエスト間 sleep（既存 `SCRAPING_DELAY_MS` 踏襲）。

### 7.3 実行
```bash
npm run ingest            # 差分取得
npm run ingest -- --force # 全再取得
npm run ingest -- --year 2026
```

> ⚠️ 実行環境から `fighters.co.jp` に到達できない場合は、生成をローカル実行に切り出す。
> アプリのビルド自体は `games.json`（コミット済み）だけで完結するため影響しない。

## 8. 集計ロジック（`stats.ts`）

- 純関数として実装（入力: `Game[]` → 出力: 集計オブジェクト）。テスト容易。
- 提供:
  - `summarize(games)` → `{ total, win, lose, draw, cancelled, winRate }`
    （勝率は中止を除いた分母で算出）
  - `groupBy(games, key)` → 軸別（球場/相手/年度/HV）の集計配列
- 表示側は集計結果を受け取るだけ（ロジックと描画を分離）。

## 9. PWA 設計

- `vite-plugin-pwa`（`registerType: 'autoUpdate'`）。
- キャッシュ対象: アプリシェル一式 + `games.json`。
- Manifest: 名称・アイコン（既存流用可）・テーマカラー `#016298`・`display: standalone`。

## 10. パフォーマンス設計

- データは数百件想定 → 全件をクライアントに載せてメモリ内で絞り込み/集計。
- 重い計算は `useMemo` でメモ化。仮想スクロールは件数増加時の将来対応。

## 11. 旧資産の撤去方針

- 削除: `next.config.ts`・Next 関連依存・`src/app/*`・旧 `HomeClient` 等・旧設計ドキュメント
  （`PROJECT_REQUIREMENTS.md` / `FUNCTIONAL_DESIGN.md` / `DETAILED_DESIGN.md`）。
- 流用: `src/lib/parsers/*`・`src/tests/fixtures/*`・`scripts/add-date.mjs`・`COLOR_PALETTE.md`。
- 置換: ルーティング/エントリ（Next App Router → Vite + TanStack Router）。
