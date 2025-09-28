import { describe, it, expect } from 'vitest';
import { extractVsTeam, extractMyTeam } from '@/lib/parsers/teamExtractor';
import { loadTestHTML, TEST_PATTERNS } from '@/tests/helpers/testHtmlLoader';

describe('teamExtractor', () => {
  describe('extractMyTeam with real HTML patterns', () => {
    it('ホーム勝利時に自チーム名を正しく抽出', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_WIN);
      const result = extractMyTeam(html, true);
      expect(result).toBe('北海道日本ハム');
    });

    it('ホーム敗戦時に自チーム名を正しく抽出', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_LOSE);
      const result = extractMyTeam(html, true);
      expect(result).toBe('北海道日本ハム');
    });

    it('ビジター勝利時に自チーム名を正しく抽出', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_WIN);
      const result = extractMyTeam(html, false);
      expect(result).toBe('北海道日本ハム');
    });

    it('ビジター敗戦時に自チーム名を正しく抽出', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_LOSE);
      const result = extractMyTeam(html, false);
      expect(result).toBe('北海道日本ハム');
    });

    it('引き分け時に自チーム名を正しく抽出', () => {
      const html = loadTestHTML(TEST_PATTERNS.DRAW);
      const result = extractMyTeam(html, true);
      expect(result).toBe('北海道日本ハム');
    });
  });

  describe('extractVsTeam with real HTML patterns', () => {
    it('ホーム勝利時に対戦相手を正しく抽出', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_WIN);
      const result = extractVsTeam(html, true);
      expect(result).toBe('千葉ロッテ');
    });

    it('ホーム敗戦時に対戦相手を正しく抽出', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_LOSE);
      const result = extractVsTeam(html, true);
      expect(result).toBe('千葉ロッテ');
    });

    it('ビジター勝利時に対戦相手を正しく抽出', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_WIN);
      const result = extractVsTeam(html, false);
      expect(result).toBe('オリックス');
    });

    it('ビジター敗戦時に対戦相手を正しく抽出', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_LOSE);
      const result = extractVsTeam(html, false);
      expect(result).toBe('オリックス');
    });

    it('引き分け時に対戦相手を正しく抽出', () => {
      const html = loadTestHTML(TEST_PATTERNS.DRAW);
      const result = extractVsTeam(html, true);
      expect(result).toBe('福岡ソフトバンク');
    });
  });

  describe('edge cases and error handling', () => {
    it('チーム名要素が不足している場合にエラー（extractMyTeam）', () => {
      const html = '<div>No team elements</div>';
      expect(() => extractMyTeam(html, true)).toThrow('チーム名要素が2つ見つかりません');
    });

    it('チーム名要素が不足している場合にエラー（extractVsTeam）', () => {
      const html = '<div>No team elements</div>';
      expect(() => extractVsTeam(html, true)).toThrow('チーム名要素が2つ見つかりません');
    });
  });
});
