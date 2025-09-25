import { JSDOM } from 'jsdom';
import { ParseError } from '@/types/parsing';

/**
 * ファイターズ視点でスコアを抽出
 * @param html - 解析対象のHTML
 * @param isHome - ファイターズがホームかどうか
 * @returns ファイターズのスコアと相手のスコア
 */
export function extractGameScore(
  html: string,
  isHome: boolean
): {
  myScore: number;
  vsScore: number;
} {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const scoreElement = document.querySelector('.game-vs-teams__team-score');
  if (!scoreElement) {
    throw new ParseError('スコア要素が見つかりません', 'extractGameScore');
  }

  const spanElements = scoreElement.querySelectorAll('span');
  const emElement = scoreElement.querySelector('em');

  let homeScore: number;
  let visitorScore: number;

  if (spanElements.length === 2 && !emElement) {
    // 引き分けの場合：両方とも<span>
    const span1Text = spanElements[0].textContent?.trim();
    const span2Text = spanElements[1].textContent?.trim();

    if (!span1Text || !span2Text) {
      throw new ParseError('スコアテキストが空です', 'extractGameScore');
    }

    // 左のspan = ホーム、右のspan = ビジター
    homeScore = parseInt(span1Text.replace(/[^\d]/g, ''));
    visitorScore = parseInt(span2Text.replace(/[^\d]/g, ''));
  } else if (spanElements.length >= 1 && emElement) {
    // 勝敗が決している場合：<span>と<em>
    const spanElement = spanElements[0];
    const spanText = spanElement.textContent?.trim();
    const emText = emElement.textContent?.trim();

    if (!spanText || !emText) {
      throw new ParseError('スコアテキストが空です', 'extractGameScore');
    }

    const spanScore = parseInt(spanText.replace(/[^\d]/g, ''));
    const emScore = parseInt(emText.replace(/[^\d]/g, ''));

    // 文書順で判断
    const isSpanFirst =
      spanElement.compareDocumentPosition(emElement) & Node.DOCUMENT_POSITION_FOLLOWING;

    if (isSpanFirst) {
      homeScore = spanScore;
      visitorScore = emScore;
    } else {
      homeScore = emScore;
      visitorScore = spanScore;
    }
  } else {
    throw new ParseError('スコア要素の構造が不正です', 'extractGameScore');
  }

  if (isNaN(homeScore) || isNaN(visitorScore)) {
    throw new ParseError('スコアの数値変換に失敗しました', 'extractGameScore');
  }

  // ファイターズ視点でのスコアを返す
  const myScore = isHome ? homeScore : visitorScore;
  const vsScore = isHome ? visitorScore : homeScore;

  return { myScore, vsScore };
}
