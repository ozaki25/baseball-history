import { GameHistory, YearData, GameResult } from '@/types/game';

export function validateGameResult(data: unknown): data is GameResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.date === 'string' &&
    obj.date.length === 4 &&
    /^\d{4}$/.test(obj.date) &&
    typeof obj.opponent === 'string' &&
    obj.opponent.length > 0 &&
    ['win', 'lose', 'draw'].includes(obj.result as string) &&
    (obj.score === undefined || (
      typeof obj.score === 'object' &&
      obj.score !== null &&
      typeof (obj.score as Record<string, unknown>).fighters === 'number' &&
      typeof (obj.score as Record<string, unknown>).opponent === 'number'
    )) &&
    (obj.location === undefined || typeof obj.location === 'string') &&
    (obj.notes === undefined || typeof obj.notes === 'string')
  );
}

export function validateYearData(data: unknown): data is YearData {
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

export function validateGameHistory(data: unknown): data is GameHistory {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  
  return (
    validateYearData(obj.data) &&
    typeof obj.lastUpdated === 'string'
  );
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}