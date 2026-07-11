import { describe, it, expect } from "vitest";
import { detectIsHome } from "#/lib/ingest/parsers/homeDetector";
import { loadTestDoc, htmlToDoc, TEST_PATTERNS } from "#/tests/helpers/testHtmlLoader";

describe("homeDetector", () => {
  describe("detectIsHome with real HTML patterns", () => {
    it("ホームゲームの場合はtrueを返す（パターン1: ホーム勝利）", () => {
      expect(detectIsHome(loadTestDoc(TEST_PATTERNS.HOME_WIN))).toBe(true);
    });

    it("ホームゲームの場合はtrueを返す（パターン2: ホーム敗戦）", () => {
      expect(detectIsHome(loadTestDoc(TEST_PATTERNS.HOME_LOSE))).toBe(true);
    });

    it("ビジターゲームの場合はfalseを返す（パターン3: ビジター勝利）", () => {
      expect(detectIsHome(loadTestDoc(TEST_PATTERNS.VISITOR_WIN))).toBe(false);
    });

    it("ビジターゲームの場合はfalseを返す（パターン4: ビジター敗戦）", () => {
      expect(detectIsHome(loadTestDoc(TEST_PATTERNS.VISITOR_LOSE))).toBe(false);
    });

    it("引き分けゲーム（ホーム）の場合はtrueを返す", () => {
      expect(detectIsHome(loadTestDoc(TEST_PATTERNS.DRAW))).toBe(true);
    });

    it("サヨナラ勝ち（ホーム）の場合はtrueを返す", () => {
      expect(detectIsHome(loadTestDoc(TEST_PATTERNS.SAYONARA_WIN))).toBe(true);
    });
  });

  describe("edge cases and error handling", () => {
    it("logo_2004001が見つからない場合はエラーを投げる", () => {
      const doc = htmlToDoc(`
        <div class="game-vs-teams__team">
          <img data-src="/images/other_team1.png" alt="チーム1">
        </div>
        <div class="game-vs-teams__team">
          <img data-src="/images/other_team2.png" alt="チーム2">
        </div>
      `);

      expect(() => detectIsHome(doc)).toThrow("自チームのロゴが見つかりません");
    });

    it("チーム要素が2つ未満の場合はエラーを投げる", () => {
      const doc = htmlToDoc(`
        <div class="game-vs-teams__team">
          <img data-src="/images/logo_2004001.png" alt="自チーム">
        </div>
      `);

      expect(() => detectIsHome(doc)).toThrow("チーム要素が2つ見つかりません");
    });
  });
});
