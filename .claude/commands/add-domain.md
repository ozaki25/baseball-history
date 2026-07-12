`src/domain/` に新しいドメイン概念（型・述語・純関数・整形など）を追加してください。

引数: $ARGUMENTS

## 前提

`src/domain/README.md` を先に読み、追加物がドメイン中核に属することを確認する。
React/router/DOM/jsdom への依存が混じる場合は追加場所を再検討する。

## 手順

1. 追加物の性質から配置先を決める:
   - 型・列挙・述語・整形の一般物 → `src/domain/game.ts` か `src/domain/labels.ts` に追記
   - 集計軸の追加なら本コマンドではなく [`/add-axis`](add-axis.md)
   - 絞り込み軸の追加なら [`/add-filter`](add-filter.md)
   - まとまった別モジュールが欲しければ `src/domain/新モジュール.ts` を新設
2. **列挙を触る場合**は単一定義元を崩さない:
   - `GAME_RESULTS` / `ATTENDED_RESULTS` / `DECIDED_RESULTS` は `as const satisfies readonly GameResult[]` パターンを維持
   - 値追加漏れがコンパイルエラーになる仕組みを壊さない
3. 実装ファイルの隣に `*.test.ts` を作りコロケーションする（既存の `domain/*.test.ts` を参考に）
4. **境界確認**: 追加ファイルが `#/features/**` / `#/screens/**` / `#/app/**` / `#/ui/**` / `#/routes/**` / `#/data/**` / `#/ingest/**` を import していないことを確認（`pnpm lint` で機械的に検出される）
5. ゲートを通す:
   ```
   pnpm format && pnpm lint && pnpm typecheck && pnpm test
   ```
6. 意味単位でコミット（例: `feat(domain): 〇〇を追加`）

## 参考

- ディレクトリ Charter: [`src/domain/README.md`](../../src/domain/README.md)
- 依存規則: [`docs/design.md` §3.2](../../docs/design.md)
