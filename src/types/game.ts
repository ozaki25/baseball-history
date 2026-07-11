// 観戦ノートの中核データモデル（すべてスクレイピング由来・手入力項目は持たない）

export type HomeAway = "home" | "away";

// scheduled = 事前登録済みで結果未確定（試合前 / 未反映）。結果が出たら他の値に更新される。
export type GameResult = "win" | "lose" | "draw" | "cancelled" | "scheduled";

export interface Game {
  /** "YYYY-MM-DD"（第1試合のみ扱う） */
  id: string;
  /** ISO "YYYY-MM-DD" */
  date: string;
  /** 正規化済み対戦相手名（scheduled 時は空になりうる） */
  opponent: string;
  /** 正規化済み球場名 */
  stadium: string;
  homeAway: HomeAway;
  result: GameResult;
  score: {
    fighters: number | null;
    opponent: number | null;
  };
}

export interface GamesData {
  /** 取り込み実行時刻（ISO） */
  generatedAt: string;
  games: Game[];
}

/** data/dates.json の形: { "2025": ["0401", ...], ... } */
export interface DatesData {
  [year: string]: string[];
}
