import { GameResult } from '@/types/game';
import { parseGameHTML, validateGameHTML } from './parsers';
import { ParsedGameData } from '@/types/parsing';

/**
 * 日本ハム公式サイトから試合情報を取得
 * @param year 年（YYYY形式）
 * @param date 日付（MMDD形式）
 * @returns 試合結果データ
 */
export async function fetchGameData(year: string, date: string): Promise<GameResult | null> {
  const url = `https://www.fighters.co.jp/gamelive/result/${year}${date}01/`;

  try {
    console.log(`🔍 スクレイピング実行: ${url}`);

    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000), // 5秒に短縮
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} for ${url}`);
    }

    const html = await response.text();
    console.log(`✅ HTML取得成功: ${url}`);

    // HTMLの基本的な妥当性をチェック
    const validation = validateGameHTML(html);
    if (!validation.isValid) {
      console.warn('HTML妥当性チェックで問題が検出されました:', validation.issues);
    }

    // HTMLパースして試合情報を抽出
    const parsedData = parseGameHTML(html);
    const gameData = convertToGameResult(parsedData, date);
    console.log(`🏟️ 試合データ解析成功: vs ${gameData.vsTeam} ${gameData.result}`);
    return gameData;
  } catch (error) {
    console.error(`❌ データ取得失敗: ${year}/${date}`, error);
    // 要件に従いビルドを異常終了
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Build failed: データ取得失敗 ${year}/${date} - ${errorMessage}`);
  }
}

/**
 * ParsedGameDataをGameResult形式に変換
 */
function convertToGameResult(parsedData: ParsedGameData, date: string): GameResult {
  let result: 'win' | 'lose' | 'draw';
  if (parsedData.myScore > parsedData.vsScore) {
    result = 'win';
  } else if (parsedData.myScore < parsedData.vsScore) {
    result = 'lose';
  } else {
    result = 'draw';
  }

  return {
    date,
    vsTeam: parsedData.opponent,
    result,
    score: {
      my: parsedData.myScore,
      vs: parsedData.vsScore,
    },
    location: parsedData.location,
  };
}

/**
 * 公式サイトのゲームページURLを生成
 */
export function generateOfficialGameUrl(year: string, date: string): string {
  return `https://www.fighters.co.jp/gamelive/result/${year}${date}01/`;
}
