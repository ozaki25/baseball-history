import { ParseError } from "#/types/parsing";

/**
 * Document から自チームがホームかビジターかを判定する
 * @param document - 解析対象の Document
 * @returns ホームの場合true、ビジターの場合false
 */
export function detectIsHome(document: Document): boolean {
  // 自チームのロゴ要素を検索（src と data-src 両方をサポート）
  const myTeamLogo = document.querySelector(
    'img[src*="logo_2004001"], img[data-src*="logo_2004001"]',
  );
  if (!myTeamLogo) {
    throw new ParseError("自チームのロゴが見つかりません", "detectIsHome");
  }

  // 全てのチーム要素を取得
  const allTeamElements = document.querySelectorAll(".game-vs-teams__team");
  if (allTeamElements.length < 2) {
    throw new ParseError("チーム要素が2つ見つかりません", "detectIsHome");
  }

  // ロゴの親要素のインデックスを取得
  const teamElement = myTeamLogo.closest(".game-vs-teams__team");
  const myTeamIndex = Array.from(allTeamElements).indexOf(teamElement as Element);

  // index 0 = ホーム, index 1 = ビジター
  return myTeamIndex === 0;
}
