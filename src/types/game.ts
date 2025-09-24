export interface GameResult {
  date: string; // MMDD形式
  vsTeam: string;
  result: 'win' | 'lose' | 'draw';
  score: {
    my: number;
    vs: number;
  };
  location: string;
}

// 要件通りの観戦日データ構造（年単位 + MMDD形式）
export interface DatesData {
  [year: string]: string[]; // ["0405", "0412", "0503"] 形式
}

// 処理済みの年別ゲームデータ
export interface YearData {
  [year: string]: GameResult[];
}

export interface GameStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}
