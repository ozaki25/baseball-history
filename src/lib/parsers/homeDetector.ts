import { JSDOM } from 'jsdom';
import { ParseError } from '@/types/parsing';

/**
 * HTMLから自チームがホームかビジターかを判定する
 * @param html - 解析対象のHTML
 * @returns ホームの場合true、ビジターの場合false
 */
export function detectIsHome(html: string): boolean {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // 自チームのロゴ要素を検索
  const myTeamLogo = document.querySelector('img[src*="logo_2004001"]');
  if (!myTeamLogo) {
    throw new ParseError('自チームのロゴが見つかりません', 'detectIsHome');
  }

  // 全てのチーム要素を取得
  const allTeamElements = document.querySelectorAll('.game-vs-teams__team');
  if (allTeamElements.length < 2) {
    throw new ParseError('チーム要素が2つ見つかりません', 'detectIsHome');
  }

  // ロゴの親要素のインデックスを取得
  const teamElement = myTeamLogo.closest('.game-vs-teams__team');
  const myTeamIndex = Array.from(allTeamElements).indexOf(teamElement as Element);

  // index 0 = ホーム, index 1 = ビジター
  return myTeamIndex === 0;
}
