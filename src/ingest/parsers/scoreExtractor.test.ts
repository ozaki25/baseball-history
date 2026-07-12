import { describe, it, expect } from "vitest";
import { extractGameScore } from "#/ingest/parsers/scoreExtractor";
import { loadTestDoc, htmlToDoc, TEST_PATTERNS } from "#/tests/helpers/testHtmlLoader";

describe("scoreExtractor", () => {
  describe("extractGameScore with real HTML patterns", () => {
    it("ホーム勝利時のスコア抽出（パターン1）", () => {
      const result = extractGameScore(loadTestDoc(TEST_PATTERNS.HOME_WIN), true);
      expect(result.myScore).toBe(5); // ホーム（ファイターズ）勝利
      expect(result.vsScore).toBe(1); // ビジター（千葉ロッテ）敗戦
    });

    it("ホーム敗戦時のスコア抽出（パターン2）", () => {
      const result = extractGameScore(loadTestDoc(TEST_PATTERNS.HOME_LOSE), true);
      expect(result.myScore).toBe(1); // ホーム（ファイターズ）敗戦
      expect(result.vsScore).toBe(5); // ビジター（千葉ロッテ）勝利
    });

    it("ビジター勝利時のスコア抽出（パターン3）", () => {
      const result = extractGameScore(loadTestDoc(TEST_PATTERNS.VISITOR_WIN), false);
      expect(result.myScore).toBe(1); // ビジター（ファイターズ）勝利
      expect(result.vsScore).toBe(0); // ホーム（オリックス）敗戦
    });

    it("ビジター敗戦時のスコア抽出（パターン4）", () => {
      const result = extractGameScore(loadTestDoc(TEST_PATTERNS.VISITOR_LOSE), false);
      expect(result.myScore).toBe(1); // ビジター（ファイターズ）敗戦
      expect(result.vsScore).toBe(5); // ホーム（オリックス）勝利
    });

    it("引き分け時のスコア抽出（パターン5）", () => {
      const result = extractGameScore(loadTestDoc(TEST_PATTERNS.DRAW), true);
      expect(result.myScore).toBe(4); // ホーム（ファイターズ）引き分け
      expect(result.vsScore).toBe(4); // ビジター（福岡ソフトバンク）引き分け
    });

    it("サヨナラ勝利時のスコア抽出（パターン6）", () => {
      const result = extractGameScore(loadTestDoc(TEST_PATTERNS.SAYONARA_WIN), true); // ホーム戦での勝利
      expect(result.myScore).toBe(4); // ホーム（ファイターズ）サヨナラ勝ち
      expect(result.vsScore).toBe(3); // ビジター（千葉ロッテ）敗戦
    });
  });

  describe("edge cases and error handling", () => {
    it("スコア要素が見つからない場合はエラーを投げる", () => {
      const doc = htmlToDoc("<div>No score elements</div>");
      expect(() => extractGameScore(doc, true)).toThrow("スコア要素が見つかりません");
    });
  });
});
