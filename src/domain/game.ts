// 観戦ノートの中核データモデル（すべてスクレイピング由来・手入力項目は持たない）
//
// 欠損（不明）の表現方針:
//   - 安定ID（opponentId/stadiumId）… 空文字 "" が「不明」を表す。
//   - homeAway … null が「不定」（予定・詳細不明）を表す。
//   - score … fighters/opponent が null（予定・詳細不明）。
// 集計側は空文字IDや null を集計対象外として扱う（`domain/stats/` と `domain/query/filter` を参照）。
//
// 中止は概念として扱わない: 観戦ノートは「現地で観戦した記録」のみを対象にするため、
// 中止試合は dates.json に載せない前提。万一 ingest が中止試合に当たった場合は取り込み失敗
// として ingest-report.json に記録し、games.json には入れない（scripts/ingest.ts 参照）。

export type HomeAway = "home" | "away";

// scheduled = 事前登録済みで結果未確定（試合前 / 未反映）。結果が出たら他の値に更新される。
// unknown  = 詳細不明。観戦した記録は残すが、試合詳細が信頼できず日付のみ残す
//            （例: 現行サイトでは正しく取得できない古い試合）。data/date-only.json で指定。
//
// 列挙は const 配列を単一定義元にする（Game.result 型・URL 受理・UI 順序を全て導出）。
// as const satisfies で「値追加漏れがコンパイルエラー」になる保証を得る。
export const GAME_RESULTS = ["win", "lose", "draw", "scheduled", "unknown"] as const;
export type GameResult = (typeof GAME_RESULTS)[number];

/**
 * 絞り込み・URL で受理する勝敗値の列（＝UI 表示順）。
 * scheduled は別枠（観戦予定）表示、unknown は詳細不明表示のため、勝敗軸に載せない。
 */
export const ATTENDED_RESULTS = ["win", "lose", "draw"] as const satisfies readonly GameResult[];

/**
 * スコアから決まる「勝敗確定」値。ingest が「取り込み済みで再取得しない」判定に使う
 * （予定・詳細不明は確定でない）。単一定義元。
 */
export const DECIDED_RESULTS = ["win", "lose", "draw"] as const satisfies readonly GameResult[];

/** その試合が「観戦予定（結果未確定）」か。 */
export function isScheduled(g: Pick<Game, "result">): boolean {
  return g.result === "scheduled";
}
/** その試合が「観戦済み」か（＝scheduled 以外。unknown も含む）。 */
export function isAttended(g: Pick<Game, "result">): boolean {
  return !isScheduled(g);
}

/** ISO 日付("YYYY-MM-DD") または Game から年度文字列("YYYY")を取り出す。 */
export function yearOf(dateOrGame: string | Pick<Game, "date">): string {
  const iso = typeof dateOrGame === "string" ? dateOrGame : dateOrGame.date;
  return iso.slice(0, 4);
}

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
