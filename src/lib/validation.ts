import { GameHistory, YearData, GameResult } from '@/types/game';

export function validateGameResult(data: any): data is GameResult {
  return (
    typeof data === 'object' &&
    typeof data.date === 'string' &&
    data.date.length === 4 &&
    /^\d{4}$/.test(data.date) &&
    typeof data.opponent === 'string' &&
    data.opponent.length > 0 &&
    ['win', 'lose', 'draw'].includes(data.result) &&
    (data.score === undefined || (
      typeof data.score === 'object' &&
      typeof data.score.fighters === 'number' &&
      typeof data.score.opponent === 'number'
    )) &&
    (data.location === undefined || typeof data.location === 'string') &&
    (data.notes === undefined || typeof data.notes === 'string')
  );
}

export function validateYearData(data: any): data is YearData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  for (const [year, games] of Object.entries(data)) {
    if (!/^\d{4}$/.test(year)) {
      return false;
    }
    
    if (!Array.isArray(games)) {
      return false;
    }

    for (const game of games) {
      if (!validateGameResult(game)) {
        return false;
      }
    }
  }

  return true;
}

export function validateGameHistory(data: any): data is GameHistory {
  return (
    typeof data === 'object' &&
    data !== null &&
    validateYearData(data.data) &&
    typeof data.lastUpdated === 'string'
  );
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}