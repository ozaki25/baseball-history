/**
 * 最小限の正規化。単一ソース（公式サイト）由来なので過剰なマスタは作らない。
 * - NFKC で全角/半角のゆれを統一（英数記号）
 * - 連続空白を 1 つに、前後の空白を除去
 * 名寄せ（別名 → 代表名）は実データの distinct 値を見てから必要分だけ追加する。
 */
export function normalizeText(input: string): string {
  return input.normalize("NFKC").replace(/\s+/g, " ").trim();
}
