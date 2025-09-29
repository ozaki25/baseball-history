import { GameResult, GameStats, YearData, DatesData } from '@/types/game';
import { fetchGameData, generateOfficialGameUrl } from './gameDataFetcher';
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

export function calculateStats(games: GameResult[]): GameStats {
  const total = games.length;
  const wins = games.filter((game) => game.result === 'win').length;
  const losses = games.filter((game) => game.result === 'lose').length;
  const draws = games.filter((game) => game.result === 'draw').length;
  const winRate = total > 0 ? Math.round((wins / total) * 100 * 10) / 10 : 0;

  return {
    total,
    wins,
    losses,
    draws,
    winRate,
  };
}

export function formatDate(dateString: string): string {
  let month: string, day: string;

  if (dateString.includes('/')) {
    [month, day] = dateString.split('/');
  } else {
    month = dateString.substring(0, 2);
    day = dateString.substring(2, 4);
  }

  const date = dayjs(`2024-${month}-${day}`);
  return date.format('M/D');
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

export function getResultColor(result: 'win' | 'lose' | 'draw'): string {
  switch (result) {
    case 'win':
      return 'text-green-600';
    case 'lose':
      return 'text-red-600';
    case 'draw':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

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

export function getAvailableYears(yearData: YearData): string[] {
  return Object.keys(yearData).sort((a, b) => parseInt(b) - parseInt(a));
}

export function sortGamesByDate(games: GameResult[]): GameResult[] {
  return [...games].sort((a, b) => {
    const dateA = parseInt(a.date);
    const dateB = parseInt(b.date);
    return dateB - dateA; // 降順（最新が上）
  });
}

/**
 * 公式サイトのゲームページURLを生成
 */
export function getOfficialGameUrl(year: string, date: string): string {
  return generateOfficialGameUrl(year, date);
}
