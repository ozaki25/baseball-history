# 開発フロー — 観戦履歴アプリ（再構築）

> ステータス: **ドラフト（レビュー中）** / 最終更新: 2026-07-10
> 要件は `requirements.md`、設計は `design.md` を参照。

## 1. 開発環境

| 項目 | 内容 |
|---|---|
| ランタイム | Node.js LTS（20 以上） |
| パッケージ管理 | npm（既存踏襲） |
| エディタ | Prettier / ESLint 連携推奨 |

### npm scripts（目標）

```jsonc
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "test": "vitest --run",
  "test:watch": "vitest",
  "ingest": "node scripts/ingest.mjs",
  "add-date": "node scripts/add-date.mjs",
  "prepare": "husky"
}
```

## 2. コード品質

- **TypeScript strict** を有効化。`any` を避け、`Game` 等の型を単一定義。
- **ESLint（flat config）** + **Prettier**。既存の `.prettierrc` を踏襲。
- **Husky + lint-staged**（既存踏襲）: コミット前に対象ファイルへ `eslint --fix` / `prettier --write`。
- 純関数（`stats.ts` / `filters.ts` / `parsers/*`）に単体テストを付ける。

## 3. テスト戦略

| 種別 | 対象 | 手段 |
|---|---|---|
| 単体 | パーサ（team/score/location/home/gameParser） | 既存 6 フィクスチャ（勝/負×H/V・引分・サヨナラ）を流用 |
| 単体 | 集計 `stats.ts`（勝率・軸別集計） | 代表データで期待値検証 |
| 単体 | 絞り込み `filters.ts`・URL スキーマ | 条件→抽出結果、URL 相互変換 |
| コンポーネント | Filters↔Table↔Stats の連動（任意） | Testing Library（必要に応じ） |

- CI で `lint` → `typecheck` → `test` → `build` を実行（後述）。

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
      - checkout / setup-node(20) / npm ci
      - npm run lint
      - npm run build      # tsc 型チェック含む
      - npm run test
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
      - checkout / setup-node(20) / npm ci
      - npm run ingest              # 未取得分だけ取得（--force で全件）
      - 差分があれば data/games.json をコミット & push
```

> GitHub ランナーは外部ネットに出られるため公式サイトへ到達可能。
> 開発環境や Vercel ビルドからは到達不可でも、取り込みは Actions 側で完結するので影響しない。

## 6. デプロイ（Vercel）

- フレームワークプリセット: **Vite**。
- ビルドコマンド: `npm run build` / 出力: `dist`。
- スクレイピングはビルドに含めない（`games.json` 同梱）。
- プレビュー: PR ごとの Vercel Preview を活用。

## 7. データ更新の運用フロー

観戦記録を増やすときの手順。

**通常運用（自動）** — 利用者がやるのは観戦日の追加だけ。

```
1. npm run add-date 2026 0705 0706   # 観戦日を dates.json に追加
2. git commit && git push            # dates.json を push
   ↓（以降は自動）
   GitHub Actions(ingest) が未取得分をスクレイピング
   → games.json を自動コミット
   → Vercel が自動デプロイ
```

- 観戦日は試合終了後に足せば結果は確定済みで、push トリガーだけで取得できる。
- まだ結果が出ていない稀なケースは、Actions の「Run workflow」で 1 回押し直せばよい（定期実行はしない）。
- ローカル `npm run ingest` もフォールバックとして利用可能。

> データ源はスクレイピングのみ。手編集・override は行わない。取得できない試合は
> リトライで拾い直すか、`dates.json` から外す運用とする。

## 8. 実装フェーズ（ステップごとに確認）

各フェーズ末に一旦止めてレビューする。

| # | フェーズ | 完了条件（受け入れ基準） |
|---|---|---|
| 0 | 本ドキュメント確定 | 要件/設計/開発フローと未決事項に合意 |
| 1 | 足場（scaffold） | Vite+React+TS 起動、TanStack Router/Table・Tailwind・PWA 導入、ダミーデータで表示 |
| 2 | データ層 | 型定義・`games.json` スキーマ確定、ingest スクリプト（既存パーサ流用）で生成できる |
| 3 | 一覧＋絞り込み | 5 軸の絞り込みが動作、条件が URL に保持される |
| 4 | 集計 | 絞り込み連動の基本統計＋軸別クロス集計を表示 |
| 5 | PWA / 仕上げ | インストール・オフライン確認、アクセシビリティ・レスポンシブ確認 |
| 6 | 撤去・移行 | 旧 Next.js 資産と旧ドキュメントを削除、README 刷新 |
| 7 | デプロイ | Vercel 設定更新、本番確認 |

## 9. リスクと対応

| リスク | 影響 | 対応 |
|---|---|---|
| 開発環境/Vercel から `fighters.co.jp` に到達不可 | その場では取り込めない | 取り込みは GitHub Actions（外部ネット可）で実行。アプリのビルドは `games.json` のみに依存し影響なし |
| Actions の自動コミットが CI をループ起動 | 無駄実行 | ingest のコミットは CI 対象パスから除外／`[skip ci]` を付ける等で抑止 |
| 公式サイトの HTML 構造変更 | パーサ破損 | フィクスチャ＋テストで検知、パーサを修正して再取り込み |
| 20 年分の年代差による表記ゆれ | 絞り込み/集計が分裂 | 最小限の正規化。distinct 値を確認し、実際に割れた分だけ名寄せ対応表を追加（データ駆動） |
| データ欠損年（2017-2019, 2023 等） | 集計の空白 | 空は空として扱う（記録なし）。方針を要確認 |

## 10. 次のアクション

1. `requirements.md` / `design.md` の **未決事項**（追加項目・統計範囲・正規化・欠損年）を確定。
2. 実行環境から公式サイトへの**疎通確認**。
3. フェーズ 1（足場）着手の可否を判断。
