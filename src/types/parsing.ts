/**
 * HTML解析用の型定義
 */

export interface TeamInfo {
  name: string;
  isHome: boolean;
  logoPattern?: string;
}

export interface ScoreInfo {
  homeScore: number;
  visitorScore: number;
  total: number;
  result: 'win' | 'loss' | 'draw' | 'postponed' | 'cancelled';
}

export interface LocationInfo {
  name: string;
  element?: Element;
}

export interface GameDataExtraction {
  myScore: number;
  vsScore: number;
  location: string;
  isHomeGame: boolean;
}

export interface ParsedGameData {
  opponent: string;
  myScore: number;
  vsScore: number;
  location: string;
  isHomeGame: boolean;
  result: 'win' | 'lose' | 'draw';
}

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly step: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ParseError';
  }
}
