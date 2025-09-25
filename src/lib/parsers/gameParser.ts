import { JSDOM } from 'jsdom';
import { ParsedGameData, ParseError } from '@/types/parsing';
import { extractVsTeam } from './teamExtractor';
import { extractGameScore, detectGameStatus } from './scoreExtractor';
import { extractGameVenue } from './venueExtractor';
import { detectHomeVisitor } from './homeVisitorDetector';

/**
 * HTMLから試合データを抽出するメインパーサー
 */
export function parseGameHTML(html: string): ParsedGameData {
  try {
    console.log('試合HTML解析を開始...');

    // 各種情報を並列で抽出
    const opponent = extractVsTeam(html);
    const scoreInfo = extractGameScore(html);
    const venueInfo = extractGameVenue(html);
    const homeVisitorInfo = detectHomeVisitor(html);
    const gameStatus = detectGameStatus(html);

    // ファイターズの視点でのスコア計算
    let myScore: number;
    let vsScore: number;

    if (homeVisitorInfo.isHome) {
      // ホームゲームの場合
      myScore = scoreInfo.homeScore;
      vsScore = scoreInfo.visitorScore;
    } else {
      // ビジターゲームの場合
      myScore = scoreInfo.visitorScore;
      vsScore = scoreInfo.homeScore;
    }

    // 勝敗判定
    let result: 'win' | 'lose' | 'draw' = 'draw';
    if (gameStatus === 'completed') {
      if (myScore > vsScore) {
        result = 'win';
      } else if (myScore < vsScore) {
        result = 'lose';
      }
    } else {
      // 中止・延期の場合は引き分け扱い
      result = 'draw';
    }

    const parsedData: ParsedGameData = {
      opponent,
      myScore,
      vsScore,
      location: venueInfo.name,
      isHomeGame: homeVisitorInfo.isHome,
      result,
    };

    console.log('試合HTML解析完了:', parsedData);
    console.log(`  判定詳細: 方法=${homeVisitorInfo.method}, 信頼度=${homeVisitorInfo.confidence}`);
    console.log(`  試合状況: ${gameStatus}`);

    return parsedData;
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }
    throw new ParseError('HTML解析中にエラーが発生しました', 'parseGameHTML', {
      originalError: error,
    });
  }
}

/**
 * HTMLの基本的な妥当性をチェック
 */
export function validateGameHTML(html: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // 基本的な要素の存在チェック
    const requiredSelectors = [
      { selector: '.c-game-detail__header-text', name: 'チーム名' },
      { selector: '.game-vs-teams__team', name: 'チーム要素' },
      { selector: '.game-vs-teams__team-run', name: 'スコア要素' },
      { selector: '.game-vs-teams__team-stadium', name: '会場要素' },
    ];

    for (const { selector, name } of requiredSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        issues.push(`${name}が見つかりません (${selector})`);
      }
    }

    // チーム要素とスコア要素の数が一致しているかチェック
    const teamElements = document.querySelectorAll('.game-vs-teams__team');
    const scoreElements = document.querySelectorAll('.game-vs-teams__team-run');

    if (teamElements.length !== scoreElements.length) {
      issues.push(
        `チーム要素(${teamElements.length})とスコア要素(${scoreElements.length})の数が不一致`
      );
    }

    if (teamElements.length !== 2) {
      issues.push(`チーム要素の数が期待値と異なります (期待: 2, 実際: ${teamElements.length})`);
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  } catch (error) {
    issues.push(`HTML解析エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      isValid: false,
      issues,
    };
  }
}
