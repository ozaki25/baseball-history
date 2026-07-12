`src/features/` に新しい feature area（画面部品のまとまり）を追加してください。

引数: $ARGUMENTS
（feature 名を含めるのが望ましい。例: `search`, `venues`, `opponents-detail` など）

## 前提

`src/features/README.md` を先に読み、追加が features 層の役割に合致することを確認する。
兄弟 feature への依存が必要になる場合は「共有ロジックは `src/domain/` へ、画面横断合成は `src/screens/` へ」の原則に立ち戻る。

## 手順

1. 引数から feature 名を決める（既存の `filters` / `stats` / `games` / `scheduled` と重ならない・kebab-case）
2. `src/features/<feature名>/` ディレクトリを作り、以下を配置:
   - `<コンポーネント名>.tsx` — 表示部品（props で受け、必要なら `onNavigate` コールバックで返す）
   - `<コンポーネント名>.test.tsx` — コロケーションされたテスト（Testing Library + `getByRole` 基本）
   - 必要ならフィーチャ内で完結する小物（相対 import で参照）
3. **依存規則を守る**:
   - `#/domain/**` と `#/ui/**` のみ import 可
   - 兄弟 feature (`#/features/**`) の import は禁止
   - `useNavigate` などルーター API は使わない（screen から `onNavigate` を props で受ける）
   - `#/data/**` の直接 import は禁止（data は routes → screens から props で降ってくる）
4. 該当 screen（例: `src/screens/home/HomeView.tsx`）で新 feature を組み込む:
   - `import { <コンポーネント> } from "#/features/<feature名>/<コンポーネント名>"`
   - props で必要なデータと `onNavigate` を渡す
5. `.oxlintrc.json` の**編集は原則不要**（`src/features/**` override が自動適用される）
6. ゲートを通す:
   ```
   pnpm format && pnpm lint && pnpm typecheck && pnpm test
   ```
7. **境界セルフチェック**（任意・強く推奨）: 兄弟 feature import を一時的に挿入して `pnpm lint` が確実に落ちることを確認 → 撤回
8. コミット（例: `feat(<feature名>): 〇〇を追加`）

## 参考

- ディレクトリ Charter: [`src/features/README.md`](../../src/features/README.md)
- 合成の受け皿: [`src/screens/README.md`](../../src/screens/README.md)
