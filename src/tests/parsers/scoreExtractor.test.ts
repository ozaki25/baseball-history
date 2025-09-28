import { describe, it, expect } from 'vitest';
import { extractGameScore } from '@/lib/parsers/scoreExtractor';
import { loadTestHTML, TEST_PATTERNS } from '@/tests/helpers/testHtmlLoader';

describe('scoreExtractor', () => {
  describe('extractGameScore with real HTML patterns', () => {
    it('ホーム勝利時のスコア抽出（パターン1）', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_WIN);
      const result = extractGameScore(html, true);
      expect(result.myScore).toBe(5); // ホーム（ファイターズ）勝利
      expect(result.vsScore).toBe(1); // ビジター（千葉ロッテ）敗戦
    });

    it('ホーム敗戦時のスコア抽出（パターン2）', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_LOSE);
      const result = extractGameScore(html, true);
      expect(result.myScore).toBe(1); // ホーム（ファイターズ）敗戦
      expect(result.vsScore).toBe(5); // ビジター（千葉ロッテ）勝利
    });

    it('ビジター勝利時のスコア抽出（パターン3）', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_WIN);
      const result = extractGameScore(html, false);
      expect(result.myScore).toBe(1); // ビジター（ファイターズ）勝利
      expect(result.vsScore).toBe(0); // ホーム（オリックス）敗戦
    });

    it('ビジター敗戦時のスコア抽出（パターン4）', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_LOSE);
      const result = extractGameScore(html, false);
      expect(result.myScore).toBe(1); // ビジター（ファイターズ）敗戦
      expect(result.vsScore).toBe(5); // ホーム（オリックス）勝利
    });

    it('引き分け時のスコア抽出（パターン5）', () => {
      const html = loadTestHTML(TEST_PATTERNS.DRAW);
      const result = extractGameScore(html, true);
      expect(result.myScore).toBe(4); // ホーム（ファイターズ）引き分け
      expect(result.vsScore).toBe(4); // ビジター（福岡ソフトバンク）引き分け
    });

    it('サヨナラ勝利時のスコア抽出（パターン6）', () => {
      const html = loadTestHTML(TEST_PATTERNS.SAYONARA_WIN);
      const result = extractGameScore(html, true); // ホーム戦での勝利
      expect(result.myScore).toBe(4); // ホーム（ファイターズ）サヨナラ勝ち
      expect(result.vsScore).toBe(3); // ビジター（千葉ロッテ）敗戦
    });
  });

  describe('edge cases and error handling', () => {
    it('スコア要素が見つからない場合はエラーを投げる', () => {
      const html = '<div>No score elements</div>';
      expect(() => extractGameScore(html, true)).toThrow('スコア要素が見つかりません');
    });
  });
});
