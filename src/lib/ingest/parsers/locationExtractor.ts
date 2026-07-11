import { ParseError } from "#/types/parsing";

/**
 * 試合開催地を抽出
 * 構造: <div class="game-vs__text">エスコンフィールド</div>
 */
export function extractGameLocation(document: Document): string {
  const locationElement = document.querySelector(".game-vs__text");
  if (!locationElement) {
    throw new ParseError("球場要素が見つかりません", "extractGameLocation");
  }

  const locationName = locationElement.textContent?.trim();
  if (!locationName) {
    throw new ParseError("球場名が空です", "extractGameLocation");
  }

  return locationName;
}
