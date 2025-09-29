import { GameResult } from '@/types/game';
import { parseGameHTML } from './parsers';
import { GameInfo } from '@/types/parsing';
import { getGameResult, formatDate } from './gameUtils';
import { sleep, SCRAPING_DELAY_MS } from './sleepUtils';

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

    const gameInfo = parseGameHTML(html);
    const gameData = convertToGameResult(gameInfo, date, year);
    console.log(`🏟️ 試合データ解析成功: vs ${gameData.vsTeam} ${gameData.result}`);

    // サーバー負荷軽減のため100msスリープ
    console.log(`⏱️ サーバー負荷軽減のため${SCRAPING_DELAY_MS}ms待機...`);
    await sleep(SCRAPING_DELAY_MS);

    return gameData;
  } catch (error) {
    console.error(`❌ データ取得失敗: ${year}/${date}`, error);
    // 要件に従いビルドを異常終了
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Build failed: データ取得失敗 ${year}/${date} - ${errorMessage}`);
  }
}

/**
 * GameInfoをGameResult形式に変換
 */
function convertToGameResult(gameInfo: GameInfo, date: string, year: string): GameResult {
  const result = getGameResult(gameInfo.myScore, gameInfo.vsScore);

  return {
    date: formatDate(date),
    myTeam: gameInfo.myTeam,
    vsTeam: gameInfo.vsTeam,
    result,
    score: {
      my: gameInfo.myScore,
      vs: gameInfo.vsScore,
    },
    location: gameInfo.location,
    gameUrl: generateOfficialGameUrl(year, date),
  };
}

/**
 * 公式サイトのゲームページURLを生成
 */
export function generateOfficialGameUrl(year: string, date: string): string {
  return `https://www.fighters.co.jp/gamelive/result/${year}${date}01/`;
}
