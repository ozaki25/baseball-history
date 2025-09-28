import { describe, it, expect } from 'vitest';
import { extractGameLocation } from '@/lib/parsers/locationExtractor';
import { loadTestHTML, TEST_PATTERNS } from '@/tests/helpers/testHtmlLoader';

describe('locationExtractor', () => {
  describe('extractGameLocation with real HTML patterns', () => {
    it('ホーム勝利時の球場名を抽出（エスコンフィールド）', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_WIN);
      const result = extractGameLocation(html);
      expect(result).toBe('エスコンフィールド');
    });

    it('ホーム敗戦時の球場名を抽出（エスコンフィールド）', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_LOSE);
      const result = extractGameLocation(html);
      expect(result).toBe('エスコンフィールド');
    });

    it('ビジター勝利時の球場名を抽出（京セラD大阪）', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_WIN);
      const result = extractGameLocation(html);
      expect(result).toBe('京セラD大阪');
    });

    it('ビジター敗戦時の球場名を抽出（京セラD大阪）', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_LOSE);
      const result = extractGameLocation(html);
      expect(result).toBe('京セラD大阪');
    });

    it('引き分け時の球場名を抽出（エスコンフィールド）', () => {
      const html = loadTestHTML(TEST_PATTERNS.DRAW);
      const result = extractGameLocation(html);
      expect(result).toBe('エスコンフィールド');
    });

    it('サヨナラ勝利時の球場名を抽出（エスコンフィールド）', () => {
      const html = loadTestHTML(TEST_PATTERNS.SAYONARA_WIN);
      const result = extractGameLocation(html);
      expect(result).toBe('エスコンフィールド');
    });
  });

  describe('edge cases and error handling', () => {
    it('球場要素が見つからない場合はエラーを投げる', () => {
      const html = '<div>No location elements</div>';
      expect(() => extractGameLocation(html)).toThrow('球場要素が見つかりません');
    });

    it('球場名が空の場合はエラーを投げる', () => {
      const html = `<div class="game-vs__text"></div>`;
      expect(() => extractGameLocation(html)).toThrow('球場名が空です');
    });
  });
});
