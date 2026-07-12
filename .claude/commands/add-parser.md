`src/ingest/parsers/` に新しい HTML 抽出器を追加してください。

引数: $ARGUMENTS
（何を抽出するか。例: `attendance 観客数`, `startingPitcher 先発投手`）

## 前提

- `src/ingest/README.md` を先に読み、ingest 層の境界を把握する。
- 出番は稀（対象サイトが 1 つ・HTML 構造の変更や新項目追加のときのみ）。
- **クライアントバンドルに絶対入らない**モジュール群であることを意識する（jsdom 依存）。

## 手順

1. **フィクスチャを先に用意**する（テスト駆動）:
   - 対象 HTML の代表的なパターンを `src/tests/fixtures/` に配置（既存フィクスチャ命名に合わせる）
   - 稀なパターン・欠損・崩れも含める（回帰の網目）
2. **抽出器を実装**する:
   - `src/ingest/parsers/新抽出器.ts` に、`Document` を受け取って値を返す純関数として書く
   - jsdom は関数の外で構築される前提（`parsers/` の関数は `Document` を受けるだけ・パーサ側で JSDOM を構築しない）
   - **失敗時は `ParseError` を throw する**（既存パターン。`#/ingest/parsing` の `ParseError` を投げると
     `gameParser.ts` が `try/catch` で束ねて失敗記録に回す）
3. **テストを隣に**（コロケーション）:
   - `新抽出器.test.ts` にフィクスチャベースのテストを書く
   - 正常系 + 欠損系 + 崩れ系を最低 3 ケース
4. **`gameParser` への結線**:
   - `src/ingest/parsers/gameParser.ts`（他の抽出器を統合しているファイル）で新抽出器を呼ぶ
   - 結果を `GameInfo`（`src/ingest/parsing.ts`）に反映（型を拡張する必要があれば `Game` 型と整合させる）
5. **domain 側との整合**:
   - もし `Game` 型に新項目を足す場合は `src/domain/game.ts` を更新
   - この場合は関連する箇所（表示・絞り込み・集計）も影響を受けるので、
     まず [`/add-domain`](add-domain.md) 手順で型を追加してから ingest 側を実装する順が安全
6. ゲートを通す:
   ```
   pnpm format && pnpm lint && pnpm typecheck && pnpm test
   ```
7. **境界確認**: 新パーサから `#/data/**` / `#/features/**` などへ import が漏れていないこと（oxlint が捕捉）
8. コミット（例: `feat(ingest): 〇〇の抽出器を追加`）

## 手動確認（外部ネットが使える環境で）

- ローカル: `pnpm ingest -- --year YYYY` で 1 年分だけ回して失敗なくパースできるか確認
- 通常は GitHub Actions で動くのでローカル実行はフォールバック

## 参考

- 既存抽出器: `src/ingest/parsers/teamExtractor.ts` / `scoreExtractor.ts` / `locationExtractor.ts` / `homeDetector.ts` / `gameParser.ts`
- パーサ型: `src/ingest/parsing.ts`
- Charter: [`src/ingest/README.md`](../../src/ingest/README.md)
