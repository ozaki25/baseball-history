import { JSDOM } from "jsdom";
import type { GameInfo } from "#/ingest/parsing";
import { ParseError } from "#/ingest/parsing";
import { extractVsTeam, extractMyTeam } from "./teamExtractor";
import { extractGameScore } from "./scoreExtractor";
import { extractGameLocation } from "./locationExtractor";
import { detectIsHome } from "./homeDetector";

/**
 * HTMLから試合データを抽出するメインパーサー。
 * HTML のパースは一度だけ行い、同じ Document を各抽出器で共有する。
 * 中止試合は取り込み対象外（そもそも観戦していないので dates.json に載らない前提）。
 * 万一 fetch した HTML が試合詳細を持たなければ抽出器が ParseError を throw し、
 * ingest-report.json に失敗として記録される。
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
