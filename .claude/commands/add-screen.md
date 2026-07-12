新しい画面（screen）と、それに対応する URL ルートを追加してください。

引数: $ARGUMENTS
（screen 名と URL パスを含めるのが望ましい。例: `venue-detail /venues/$id`）

## 前提

- `src/screens/README.md` と `src/routes/README.md` を先に読む。
- URL の設計は既存の `search params` パターンに揃える（動的セグメントを使うなら TanStack Router の書き方に従う）。
- screen が 2 個以上になるので、**screen 兄弟の import 禁止**を検討するタイミング
  （backlog 項目・詳細は `docs/development.md` §9）。

## 手順

1. screen 名と URL パスを決める（既存の `home` と重ならない・URL は要件と整合）
2. `src/screens/<screen名>/View.tsx` の雛形を作る:
   - `import { AppShell } from "#/app/AppShell"` で外殻を包む
   - 必要な features を組み合わせて画面を描く
   - `search` / `onNavigate` などを props で受け、feature へ流す（container/presentational/composition の三層 seam を維持）
3. `src/screens/<screen名>/View.test.tsx` を隣に置く（Testing Library で描画確認）
4. `src/routes/<パス>.tsx` を作る:
   - `createFileRoute(...)` でルートを宣言
   - 必要なら `validateSearch: validate<パス名>Search` を宣言（バリデータは `#/domain/query/` に置く）
   - `#/data/**` から必要なデータを import
   - `<新View>` に data と `onNavigate` を渡すだけ（View を描かない）
5. `pnpm generate-routes`（`tsr generate`）でルートツリーを再生成
6. **境界規則を守る**:
   - screen は `#/routes/**` を import しない
   - route は `#/features/**` / `#/ui/**` / `#/app/**` を直接 import しない
   - route は URL 結線と data 取得のみ
7. ゲートを通す:
   ```
   pnpm format && pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```
8. VRT 対象を追加する場合、`src/tests/vrt/` にケースを追加し baseline は標準環境で生成する
   （`docs/development.md` §3 VRT 項参照）
9. コミット（例: `feat(<screen名>): 〇〇画面を追加`）

## 参考

- `src/screens/README.md` / `src/routes/README.md`
- URL 検証パターン: `src/domain/query/search.ts` の `validateGameSearch`
