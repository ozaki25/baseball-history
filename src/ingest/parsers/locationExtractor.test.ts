import { describe, it, expect } from "vitest";
import { extractGameLocation } from "#/ingest/parsers/locationExtractor";
import { loadTestDoc, htmlToDoc, TEST_PATTERNS } from "#/tests/helpers/testHtmlLoader";

describe("locationExtractor", () => {
  describe("extractGameLocation with real HTML patterns", () => {
    it("ホーム勝利時の球場名を抽出（エスコンフィールド）", () => {
      expect(extractGameLocation(loadTestDoc(TEST_PATTERNS.HOME_WIN))).toBe("エスコンフィールド");
    });

    it("ホーム敗戦時の球場名を抽出（エスコンフィールド）", () => {
      expect(extractGameLocation(loadTestDoc(TEST_PATTERNS.HOME_LOSE))).toBe("エスコンフィールド");
    });

    it("ビジター勝利時の球場名を抽出（京セラD大阪）", () => {
      expect(extractGameLocation(loadTestDoc(TEST_PATTERNS.VISITOR_WIN))).toBe("京セラD大阪");
    });

    it("ビジター敗戦時の球場名を抽出（京セラD大阪）", () => {
      expect(extractGameLocation(loadTestDoc(TEST_PATTERNS.VISITOR_LOSE))).toBe("京セラD大阪");
    });

    it("引き分け時の球場名を抽出（エスコンフィールド）", () => {
      expect(extractGameLocation(loadTestDoc(TEST_PATTERNS.DRAW))).toBe("エスコンフィールド");
    });

    it("サヨナラ勝利時の球場名を抽出（エスコンフィールド）", () => {
      expect(extractGameLocation(loadTestDoc(TEST_PATTERNS.SAYONARA_WIN))).toBe(
        "エスコンフィールド",
      );
    });
  });

  describe("edge cases and error handling", () => {
    it("球場要素が見つからない場合はエラーを投げる", () => {
      const doc = htmlToDoc("<div>No location elements</div>");
      expect(() => extractGameLocation(doc)).toThrow("球場要素が見つかりません");
    });

    it("球場名が空の場合はエラーを投げる", () => {
      const doc = htmlToDoc(`<div class="game-vs__text"></div>`);
      expect(() => extractGameLocation(doc)).toThrow("球場名が空です");
    });
  });
});
