export interface GameResult {
  date: string; // MM/DD形式
  myTeam: string;
  vsTeam: string;
  result: 'win' | 'lose' | 'draw';
  score: {
    my: number;
    vs: number;
  };
  location: string;
  gameUrl: string; // 該当試合のURL
}

export interface DatesData {
  [year: string]: string[]; // ["0405", "0412", "0503"] 形式
}

export interface YearData {
  [year: string]: GameResult[];
}
