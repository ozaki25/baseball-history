import { JSDOM } from 'jsdom';
import { ParseError } from '@/types/parsing';

/**
 * 自チーム名を取得
 */
export function extractMyTeam(html: string, isHome: boolean): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const headerElements = document.querySelectorAll('.c-game-detail__header-text');
  if (headerElements.length < 2) {
    throw new ParseError('チーム名要素が2つ見つかりません', 'extractMyTeam');
  }

  const myTeamIndex = isHome ? 1 : 0;
  const myTeamName = headerElements[myTeamIndex].textContent?.trim();

  if (!myTeamName) {
    throw new ParseError('自チーム名が取得できません', 'extractMyTeam');
  }

  return myTeamName;
}

/**
 * 対戦相手チーム名を取得
 */
export function extractVsTeam(html: string, isHome: boolean): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const headerElements = document.querySelectorAll('.c-game-detail__header-text');
  if (headerElements.length < 2) {
    throw new ParseError('チーム名要素が2つ見つかりません', 'extractVsTeam');
  }

  const vsTeamIndex = isHome ? 0 : 1;
  const vsTeamName = headerElements[vsTeamIndex].textContent?.trim();

  if (!vsTeamName) {
    throw new ParseError('対戦相手チーム名が取得できません', 'extractVsTeam');
  }

  return vsTeamName;
}
