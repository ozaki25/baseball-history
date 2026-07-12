import { JSDOM } from "jsdom";
import type { GameInfo } from "#/ingest/parsing";
import { ParseError } from "#/ingest/parsing";
import { extractVsTeam, extractMyTeam } from "./teamExtractor";
import { extractGameScore } from "./scoreExtractor";
import { extractGameLocation } from "./locationExtractor";
import { detectIsHome } from "./homeDetector";

const CANCELLED_RE = /中止|延期|ノーゲーム|順延/;

/**
 * HTMLから試合データを抽出するメインパーサー。
 * HTML のパースは一度だけ行い、同じ Document を各抽出器で共有する。
 */
export function parseGameHTML(html: string): GameInfo {
  try {
    const document = new JSDOM(html).window.document;
    const isHome = detectIsHome(document);
    const myTeam = extractMyTeam(document, isHome);
    const vsTeam = extractVsTeam(document, isHome);
    const location = extractGameLocation(document);
    const { myScore, vsScore } = extractGameScore(document, isHome);

    return { myTeam, vsTeam, myScore, vsScore, location, isHome };
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }
    throw new ParseError("HTML解析中にエラーが発生しました", "parseGameHTML", {
      originalError: error,
    });
  }
}

/**
 * 中止・延期っぽいページかの簡易判定（実データで要調整）。
 * ページ全体ではなく試合詳細の領域に限定し、ナビ・ニュース見出し等の
 * 無関係な「延期/中止」語での誤検知を避ける。該当領域が無ければ false。
 */
export function looksCancelled(html: string): boolean {
  const document = new JSDOM(html).window.document;
  const scope = document.querySelector(".c-game-detail, .game-vs, main");
  return CANCELLED_RE.test(scope?.textContent ?? "");
}
