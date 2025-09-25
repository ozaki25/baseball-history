import { JSDOM } from 'jsdom';
import { ScoreInfo, ParseError } from '@/types/parsing';

/**
 * 試合スコアを抽出
 * 構造: <div class="game-vs-teams__team-score"><em>6x</em><i></i><span>5</span></div>
 * または: <div class="game-vs-teams__team-score"><span>3</span><i></i><em>7</em></div>
 *
 * ルール:
 * - 最初の数値がホームスコア、2番目の数値がビジタースコア
 * - emとspanの順序は関係なし、文書順で判断
 */
export function extractGameScore(html: string): ScoreInfo {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const scoreElement = document.querySelector('.game-vs-teams__team-score');
  if (!scoreElement) {
    throw new ParseError('スコア要素が見つかりません', 'extractGameScore');
  }

  const spanElement = scoreElement.querySelector('span');
  const emElement = scoreElement.querySelector('em');

  if (!spanElement || !emElement) {
    throw new ParseError('スコア要素（span, em）が見つかりません', 'extractGameScore');
  }

  const spanText = spanElement.textContent?.trim();
  const emText = emElement.textContent?.trim();

  if (!spanText || !emText) {
    throw new ParseError('スコアテキストが空です', 'extractGameScore');
  }

  // 数値変換（"6x" -> 6）
  const spanScore = parseInt(spanText.replace(/[^\d]/g, ''));
  const emScore = parseInt(emText.replace(/[^\d]/g, ''));

  if (isNaN(spanScore) || isNaN(emScore)) {
    throw new ParseError('スコアの数値変換に失敗しました', 'extractGameScore');
  }

  // 文書順で判断: 先に現れる方がホームスコア
  const isSpanFirst =
    spanElement.compareDocumentPosition(emElement) & Node.DOCUMENT_POSITION_FOLLOWING;
  const homeScore = isSpanFirst ? spanScore : emScore;
  const visitorScore = isSpanFirst ? emScore : spanScore;

  // 勝敗判定
  let gameResult: 'win' | 'loss' | 'draw';
  if (homeScore > visitorScore) {
    gameResult = 'win';
  } else if (homeScore < visitorScore) {
    gameResult = 'loss';
  } else {
    gameResult = 'draw';
  }

  return {
    homeScore,
    visitorScore,
    total: homeScore + visitorScore,
    result: gameResult,
  };
}

/**
 * 試合結果のステータスを検出
 */
export function detectGameStatus(html: string): 'completed' | 'postponed' | 'cancelled' {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const bodyText = document.body?.textContent || '';

  if (bodyText.includes('中止')) {
    return 'cancelled';
  }

  if (bodyText.includes('延期')) {
    return 'postponed';
  }

  return 'completed';
}
