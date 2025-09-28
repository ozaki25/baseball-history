import { describe, it, expect } from 'vitest';
import { detectIsHome } from '@/lib/parsers/homeDetector';
import { loadTestHTML, TEST_PATTERNS } from '@/tests/helpers/testHtmlLoader';

describe('homeDetector', () => {
  describe('detectIsHome with real HTML patterns', () => {
    it('ホームゲームの場合はtrueを返す（パターン1: ホーム勝利）', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_WIN);
      const result = detectIsHome(html);
      expect(result).toBe(true);
    });

    it('ホームゲームの場合はtrueを返す（パターン2: ホーム敗戦）', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_LOSE);
      const result = detectIsHome(html);
      expect(result).toBe(true);
    });

    it('ビジターゲームの場合はfalseを返す（パターン3: ビジター勝利）', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_WIN);
      const result = detectIsHome(html);
      expect(result).toBe(false);
    });

    it('ビジターゲームの場合はfalseを返す（パターン4: ビジター敗戦）', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_LOSE);
      const result = detectIsHome(html);
      expect(result).toBe(false);
    });

    it('引き分けゲーム（ホーム）の場合はtrueを返す', () => {
      const html = loadTestHTML(TEST_PATTERNS.DRAW);
      const result = detectIsHome(html);
      expect(result).toBe(true);
    });

    it('サヨナラ勝ち（ホーム）の場合はtrueを返す', () => {
      const html = loadTestHTML(TEST_PATTERNS.SAYONARA_WIN);
      const result = detectIsHome(html);
      expect(result).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('logo_2004001が見つからない場合はエラーを投げる', () => {
      const html = `
        <div class="game-vs-teams__team">
          <img data-src="/images/other_team1.png" alt="チーム1">
        </div>
        <div class="game-vs-teams__team">
          <img data-src="/images/other_team2.png" alt="チーム2">
        </div>
      `;

      expect(() => detectIsHome(html)).toThrow('自チームのロゴが見つかりません');
    });

    it('チーム要素が2つ未満の場合はエラーを投げる', () => {
      const html = `
        <div class="game-vs-teams__team">
          <img data-src="/images/logo_2004001.png" alt="自チーム">
        </div>
      `;

      expect(() => detectIsHome(html)).toThrow('チーム要素が2つ見つかりません');
    });
  });
});
