import { GameInfo, ParseError } from '@/types/parsing';
import { extractVsTeam, extractMyTeam } from './teamExtractor';
import { extractGameScore } from './scoreExtractor';
import { extractGameLocation } from './locationExtractor';
import { detectIsHome } from './homeDetector';

/**
 * HTMLから試合データを抽出するメインパーサー
 */
export function parseGameHTML(html: string): GameInfo {
  try {
    console.log('試合HTML解析を開始...');

    const isHome = detectIsHome(html);
    const myTeam = extractMyTeam(html, isHome);
    const vsTeam = extractVsTeam(html, isHome);
    const location = extractGameLocation(html);
    const { myScore, vsScore } = extractGameScore(html, isHome);

    const gameInfo: GameInfo = {
      myTeam,
      vsTeam,
      myScore,
      vsScore,
      location,
      isHome,
    };

    console.log('試合HTML解析完了:', gameInfo);

    return gameInfo;
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }
    throw new ParseError('HTML解析中にエラーが発生しました', 'parseGameHTML', {
      originalError: error,
    });
  }
}
