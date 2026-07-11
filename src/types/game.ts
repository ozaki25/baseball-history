// 観戦ノートの中核データモデル（すべてスクレイピング由来・手入力項目は持たない）
//
// 欠損（不明）の表現方針:
//   - 安定ID（opponentId/stadiumId）… 空文字 "" が「不明」を表す。
//   - homeAway … null が「不定」（中止/予定）を表す。
//   - score … fighters/opponent が null（中止/予定）。
// 集計側は空文字IDやnullを集計対象外として扱う（stats.ts / filters.ts 参照）。

export type HomeAway = "home" | "away";

// scheduled = 事前登録済みで結果未確定（試合前 / 未反映）。結果が出たら他の値に更新される。
export type GameResult = "win" | "lose" | "draw" | "cancelled" | "scheduled";

export interface Game {
  /** "YYYY-MM-DD"（第1試合のみ扱う） */
  id: string;
  /** ISO "YYYY-MM-DD" */
  date: string;
  /** 対戦相手の表示名（その年の表記。scheduled 時は空になりうる） */
  opponent: string;
  /** 対戦相手の安定ID（表記ゆれを束ねて集計/絞り込みに使う） */
  opponentId: string;
  /** 球場の表示名（その年の表記） */
  stadium: string;
  /** 球場の安定ID */
  stadiumId: string;
  /** 主催/ビジター。中止・予定など不明な場合は null */
  homeAway: HomeAway | null;
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
