観戦日を data/dates.json に追加してください。

引数: $ARGUMENTS

手順:

1. 引数から年(YYYY)と日付(MMDD)を読み取る。「2025年4月5日」「20250405」「2025 0405」などの形式に対応する（複数日まとめて可。まだ試合前の「事前登録」も可）
2. `pnpm add-date <year> <MMDD> [MMDD ...]` を実行する
3. `data/dates.json` の変更をコミットして push する
   （push をトリガーに GitHub Actions の ingest が走り、公式サイトから結果を取得して
   `data/games.json` を更新 → Vercel が自動デプロイ。事前登録分は `scheduled` として保存され、
   後日結果が出た実行で自動的に確定へ更新される）
4. 結果を報告する（追加した日付、push 後は ingest が自動で走る旨）
