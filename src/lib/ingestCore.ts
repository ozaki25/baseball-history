import type { Game, GameResult } from "#/types/game";
import { parseGameHTML } from "./parsers/gameParser";
import { normalizeText } from "./normalize";

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
  return {
    id,
    date: isoDate,
    opponent: normalizeText(info.vsTeam),
    stadium: normalizeText(info.location),
    homeAway: info.isHome ? "home" : "away",
    result: resultFromScores(info.myScore, info.vsScore),
    score: { fighters: info.myScore, opponent: info.vsScore },
  };
}

/** 事前登録（試合前）の受け皿となる scheduled レコード */
export function scheduledGame(id: string, isoDate: string): Game {
  return {
    id,
    date: isoDate,
    opponent: "",
    stadium: "",
    homeAway: "home",
    result: "scheduled",
    score: { fighters: null, opponent: null },
  };
}
