新しい集計軸（クロス集計の軸）を追加してください。

引数: $ARGUMENTS
（軸のキーとラベルを含めるのが望ましい。例: `dayOfWeek 曜日`）

## 前提

- `src/domain/README.md` を先に読み、集計軸レジストリのパターン（`AXES` / `AXIS_ORDER`）を把握する。
- 集計軸は「`Game` から値を抽出して行を作り、それに対して `summarize` を回す」もの。
  例: 相手別・球場別・年度別・主催-ビジター別。

## 手順

1. `src/domain/stats/axes.ts` を開き、既存 `AXES` の実装例を確認する:
   - `key`（`GroupKey` に足す文字列）
   - `label`（クロス集計のタブ表示語。例:「球場別」「相手別」）
   - `columnLabel`（クロス集計テーブルの列見出し）
   - `valueOf(g)`（`Game` から軸の値を取り出す関数。空文字は「該当なし」扱い）
   - `labelOf(value)`（値を表示ラベルへ変換）
2. `GroupKey` 型に新しいキー（引数の 1 つ目）を追加する
3. `AXES: Record<GroupKey, Axis>` に新エントリを足す
   （`Record<GroupKey, Axis>` の網羅性で、追加漏れがコンパイルエラーになる）
4. `AXIS_ORDER` に新しいキーを追加する
   （既存の `AXIS_ORDER` 網羅性の型アサーションで、追加漏れがコンパイルエラーになる）
5. 必要なら `src/domain/labels.ts` に表示ラベルを足す
6. `src/domain/stats/axes.test.ts` に新軸のテストケースを追加:
   - `valueOf` の抽出が期待通り
   - `labelOf` の変換が期待通り
   - `groupBy(games, "新キー")` の集計が期待通り
7. UI 側（`src/features/stats/CrossStats.tsx` など）は `AXES` / `AXIS_ORDER` を回すだけなので原則触らない
   （軸のタブや順序が自動で追加される。UI 側で軸ごとの分岐がある場合のみ調整）
8. ゲートを通す:
   ```
   pnpm format && pnpm lint && pnpm typecheck && pnpm test
   ```
9. コミット（例: `feat(stats): 〇〇軸を追加`）

## なぜコンパイル強制なのか

`AXES: Record<GroupKey, Axis>` と `AXIS_ORDER` の網羅性アサーション（`Exclude<GroupKey, (typeof AXIS_ORDER)[number]> extends never ? true : false = true`）で、
軸を足したのに `AXIS_ORDER` に追加し忘れる・逆パターンをコンパイル時に検出する。
この安全網を壊さないよう、`AXES` と `AXIS_ORDER` は必ずセットで更新する。

## 参考

- 実装場所: `src/domain/stats/axes.ts`
- 表示側の使い方: `src/features/stats/CrossStats.tsx`
- Charter: [`src/domain/README.md`](../../src/domain/README.md)
