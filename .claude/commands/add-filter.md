新しい絞り込み軸（URL パラメータで持つ filter）を追加してください。

引数: $ARGUMENTS
（絞り込みキーとタイプを含めるのが望ましい。例: `pitcher single`, `weather multi`）

## 前提

- `src/domain/README.md` と `src/domain/query/` の構造を把握する。
- 絞り込みは URL の search params に保持され、`GameFilter` にデコードされて `applyFilters` で適用される流れ。
- 既存軸（`year` / `stadium` / `opponent` / `home` / `result`）を参考にする。

## 手順（絞り込みは 4 ファイルに触る）

1. **`src/domain/query/search.ts`** — URL スキーマの追加:
   - `GameSearch` 型に新キーを追加（URL 上の型・単一/複数の設計を決める）
   - `validateGameSearch` にサニタイズを追加（不正値の除去・正規化）
   - `searchToFilter` / `filterToSearch` に相互変換を追加
2. **`src/domain/query/filter.ts`** — フィルタ適用:
   - `GameFilter` 型に新キーを追加
   - `applyFilters` に新軸の絞り込みロジックを追加
   - `emptyFilter` を更新（初期値）
   - `countActiveFilters` を更新（アクティブ判定）
3. **`src/domain/query/options.ts`** — 選択肢の派生（該当する場合）:
   - 実データ（`Game[]`）から新軸の選択肢を派生させる場合、`deriveOptions` に追加
   - 実装は `Set` で distinct 値を取ってラベル付ける既存パターンに揃える
4. **`src/features/filters/`** — 表示 UI:
   - `Filters.tsx` に新軸の入力コンポーネント（Chip 群・トグル・セレクトなど）を追加
   - 兄弟 feature を触らない・`onNavigate` で URL 変更を伝える既存パターンに揃える
   - 単純な軸なら `Filters.tsx` 内で完結。複雑なら `新Filter.tsx` を feature 内に追加
5. **テスト**（コロケーション）:
   - `search.test.ts` に URL 相互変換のテスト
   - `filter.test.ts` に適用テスト（該当ゲームだけ残ることを確認）
   - `options.test.ts` に選択肢派生のテスト（該当する場合）
   - `Filters.test.tsx` に UI 操作テスト
6. ゲートを通す:
   ```
   pnpm format && pnpm lint && pnpm typecheck && pnpm test
   ```
7. **URL 動作確認**:
   `pnpm dev` を立ち上げ、URL に新パラメータを直接入れて絞り込みが効くこと・
   絞り込み変更で URL が反映されること・戻る/進むで復元されることを確認する
8. コミット（例: `feat(query): 〇〇の絞り込みを追加`）

## 設計原則

- **URL がソース**（アプリ内 state を二重に持たない）
- Zod 等の外部依存を増やさず、手書きサニタイズで済ませる
- 絞り込み変更は `navigate({ search, replace: true })` で履歴を積まない（既存の `onNavigate` パターン）

## 参考

- URL 検証: `src/domain/query/search.ts`
- フィルタ適用: `src/domain/query/filter.ts`
- Charter: [`src/domain/README.md`](../../src/domain/README.md)
