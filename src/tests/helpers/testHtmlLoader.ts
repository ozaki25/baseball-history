import { readFileSync } from "fs";
import { join } from "path";
import { JSDOM } from "jsdom";

/**
 * テスト用HTMLファイルを読み込むヘルパー関数
 */
export function loadTestHTML(filename: string): string {
  const filePath = join(process.cwd(), "src/tests/fixtures", filename);
  return readFileSync(filePath, "utf-8");
}

/** HTML 文字列を Document 化（抽出器は Document を受け取るため） */
export function htmlToDoc(html: string): Document {
  return new JSDOM(html).window.document;
}

/** フィクスチャを読み込んで Document 化 */
export function loadTestDoc(filename: string): Document {
  return htmlToDoc(loadTestHTML(filename));
}

/**
 * テストパターンの定義
 */
export const TEST_PATTERNS = {
  HOME_WIN: "test-pattern1-home-win.html",
  HOME_LOSE: "test-pattern2-home-lose.html",
  VISITOR_WIN: "test-pattern3-visitor-win.html",
  VISITOR_LOSE: "test-pattern4-visitor-lose.html",
  DRAW: "test-pattern5-draw.html",
  SAYONARA_WIN: "test-pattern6-sayonara-win.html",
} as const;
