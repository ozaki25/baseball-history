import type { Game, GameResult } from "#/types/game";
import { parseGameHTML } from "./parsers/gameParser";
import { normalizeText } from "./normalize";
import { resolveTeam, resolveStadium } from "./masters";

/** ファイターズ視点のスコアから勝敗を判定 */
export function resultFromScores(fightersScore: number, opponentScore: number): GameResult {
  if (fightersScore > opponentScore) return "win";
  if (fightersScore < opponentScore) return "lose";
  return "draw";
}

const CANCELLED_RE = /中止|延期|ノーゲーム|順延/;

/** 中止・延期っぽいページかの簡易判定（実データで要調整） */
export function looksCancelled(html: string): boolean {
  return CANCELLED_RE.test(html);
}

/** "2025", "0401" → "2025-04-01" */
export function toIsoDate(year: string, mmdd: string): string {
  return `${year}-${mmdd.slice(0, 2)}-${mmdd.slice(2, 4)}`;
}

/** 観戦日が「今日(JST)」より後か（＝まだ試合前 → scheduled 候補） */
export function isFutureDate(isoDate: string, now: Date = new Date()): boolean {
  const todayJst = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return isoDate > todayJst;
}

/** 公式サイトの試合結果 HTML から Game を組み立てる（解析不能時は throw） */
export function buildGame(id: string, isoDate: string, html: string): Game {
  const info = parseGameHTML(html);
  const opponent = normalizeText(info.vsTeam);
  const stadium = normalizeText(info.location);
  return {
    id,
    date: isoDate,
    opponent,
    opponentId: resolveTeam(opponent).id,
    stadium,
    stadiumId: resolveStadium(stadium).id,
    homeAway: info.isHome ? "home" : "away",
    result: resultFromScores(info.myScore, info.vsScore),
    score: { fighters: info.myScore, opponent: info.vsScore },
  };
}

/**
 * 既存レコードの opponentId/stadiumId を現行 masters で再解決して返す。
 * 表示名(opponent/stadium)は保持。masters の更新を再フェッチなしで反映するため、
 * ingest で確定済みレコードを保持する際に通す。
 */
export function withResolvedIds(game: Game): Game {
  return {
    ...game,
    opponentId: game.opponent ? resolveTeam(game.opponent).id : "",
    stadiumId: game.stadium ? resolveStadium(game.stadium).id : "",
  };
}

/** 事前登録（試合前）の受け皿となる scheduled レコード */
export function scheduledGame(id: string, isoDate: string): Game {
  return {
    id,
    date: isoDate,
    opponent: "",
    opponentId: "",
    stadium: "",
    stadiumId: "",
    homeAway: null,
    result: "scheduled",
    score: { fighters: null, opponent: null },
  };
}
