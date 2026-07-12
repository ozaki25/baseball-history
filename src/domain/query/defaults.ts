/**
 * URL に year が指定されなかったときのデフォルト年を決める。
 *
 * ルール:
 * - 「今年」の観戦データが存在する場合はそれを採用（＝オンシーズン中は今シーズンを見せる）
 * - 存在しなければ観戦データ上の最新年にフォールバック（＝オフシーズン・年初でも直近を見せる）
 * - allYears が空なら undefined（＝呼び出し側で "all" にフォールバックする合図）
 *
 * `now` は主にテスト差し込み用。既定は実行時の `new Date()`。
 */
export function pickDefaultYear(allYears: string[], now: Date = new Date()): string | undefined {
  if (allYears.length === 0) return undefined;
  const currentYear = String(now.getFullYear());
  if (allYears.includes(currentYear)) return currentYear;
  // allYears の並びは呼び出し側依存（挿入順など）。文字列 "YYYY" は昇順ソートで時系列と一致するので、
  // ソート後の末尾＝最新年を採る。
  return [...allYears].sort().at(-1);
}
