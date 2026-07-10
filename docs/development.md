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

## 5. CI（GitHub Actions・新規）

`push` / `pull_request` で以下を実行する想定。

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

> ingest は外部サイトへアクセスするため CI では実行しない（`games.json` はコミット済みを使用）。

## 6. デプロイ（Vercel）

- フレームワークプリセット: **Vite**。
- ビルドコマンド: `npm run build` / 出力: `dist`。
- スクレイピングはビルドに含めない（`games.json` 同梱）。
- プレビュー: PR ごとの Vercel Preview を活用。

## 7. データ更新の運用フロー

観戦記録を増やすときの手順。

```
1. npm run add-date 2026 0705 0706   # 観戦日を dates.json に追加
2. npm run ingest                    # 公式サイトから差分取得 → games.json 更新
3. （必要なら）overrides.json を編集   # 取れない/誤る分を手動補完
4. npm run ingest                    # 再実行（overrides がマージされる・冪等）
5. 変更をコミット & プッシュ           # Vercel が自動デプロイ
```

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
| 実行環境から `fighters.co.jp` に到達不可 | 初回 `games.json` 生成ができない | ingest はローカル実行に切り出し可能。アプリのビルドは `games.json` のみに依存し影響なし。まず疎通確認する |
| 公式サイトの HTML 構造変更 | パーサ破損 | フィクスチャ＋テストで検知、手動補完で当座しのぐ |
| 表記ゆれ（球場・相手名） | 絞り込み/集計が分裂 | 正規化マスタで統一 |
| ダブルヘッダー | 2 試合目が取れない | データモデル・URL 規則を未決事項で確定 |
| データ欠損年（2017-2019, 2023 等） | 集計の空白 | 空は空として扱う（記録なし）。方針を要確認 |

## 10. 次のアクション

1. `requirements.md` / `design.md` の **未決事項**（追加項目・統計範囲・正規化・ダブルヘッダー・欠損年）を確定。
2. 実行環境から公式サイトへの**疎通確認**。
3. フェーズ 1（足場）着手の可否を判断。
