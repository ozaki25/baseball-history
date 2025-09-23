export interface GameResult {
  date: string; // MMDD形式
  opponent: string;
  result: 'win' | 'lose' | 'draw';
  score?: {
    fighters: number;
    opponent: number;
  };
  location?: string;
  notes?: string;
}

export interface YearData {
  [year: string]: GameResult[];
}

export interface GameHistory {
  data: YearData;
  lastUpdated: string;
}

export type GameResultType = 'win' | 'lose' | 'draw';

export interface GameStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}