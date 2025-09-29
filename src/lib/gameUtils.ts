import { YearData, DatesData } from '@/types/game';
import { fetchGameData } from './gameDataFetcher';
import dayjs from 'dayjs';

/**
 * 観戦日データから試合データを生成（ビルド時）
 */
export async function generateGameDataFromDates(datesData: DatesData): Promise<YearData> {
  const result: YearData = {};

  for (const [year, dates] of Object.entries(datesData)) {
    result[year] = [];

    for (const date of dates) {
      try {
        const gameData = await fetchGameData(year, date);
        if (gameData) {
          result[year].push(gameData);
        } else {
          // 要件：データ取得失敗時はビルドを異常終了
          throw new Error(`Build failed: 試合データが取得できませんでした ${year}/${date}`);
        }
      } catch (error) {
        console.error(`Failed to fetch game data for ${year}/${date}:`, error);
        // 要件：データ取得失敗時はビルドを異常終了
        throw error;
      }
    }
  }

  return result;
}

/**
 * MMDD形式をM/D形式に変換
 * @param mmddDate MMDD形式の日付（例: "0401" → "4/1"）
 */
export function formatDate(mmddDate: string | dayjs.Dayjs): string {
  if (typeof mmddDate === 'string') {
    if (mmddDate.length !== 4 || !/^\d{4}$/.test(mmddDate)) {
      throw new Error(`Invalid MMDD format: expected 4 digits, got "${mmddDate}"`);
    }

    const month = mmddDate.substring(0, 2);
    const day = mmddDate.substring(2, 4);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);

    if (monthNum < 1 || monthNum > 12) {
      throw new Error(`Invalid month: ${monthNum}`);
    }
    if (dayNum < 1 || dayNum > 31) {
      throw new Error(`Invalid day: ${dayNum}`);
    }

    return `${monthNum}/${dayNum}`;
  } else {
    // dayjs input
    if (!mmddDate.isValid()) {
      throw new Error('Invalid dayjs date passed to formatDate');
    }
    return `${mmddDate.month() + 1}/${mmddDate.date()}`;
  }
}

export function formatScore(fighters: number, opponent: number): string {
  return `${fighters} - ${opponent}`;
}

/**
 * スコアから試合結果を算出
 */
export function getGameResult(myScore: number, vsScore: number): 'win' | 'lose' | 'draw' {
  if (myScore > vsScore) {
    return 'win';
  } else if (myScore < vsScore) {
    return 'lose';
  } else {
    return 'draw';
  }
}

// getResultColor removed: UI no longer applies result-specific colors

export function getResultText(result: 'win' | 'lose' | 'draw'): string {
  switch (result) {
    case 'win':
      return '勝利';
    case 'lose':
      return '敗戦';
    case 'draw':
      return '引分';
    default:
      return '未定';
  }
}

// end of utilities
