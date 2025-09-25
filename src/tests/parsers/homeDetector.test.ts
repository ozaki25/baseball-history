import { describe, it, expect } from 'vitest';
import { detectIsHome } from '@/lib/parsers/homeDetector';

describe('homeDetector', () => {
  describe('detectIsHome', () => {
    it('自チームがホーム（index 0）の場合はtrueを返す', () => {
      const html = `
        <div class="game-vs-teams__team">
          <img data-src="/images/logo_2004001.png" alt="自チーム">
        </div>
        <div class="game-vs-teams__team">
          <img data-src="/images/other_team.png" alt="相手チーム">
        </div>
      `;

      const result = detectIsHome(html);
      expect(result).toBe(true);
    });

    it('自チームがビジター（index 1）の場合はfalseを返す', () => {
      const html = `
        <div class="game-vs-teams__team">
          <img data-src="/images/other_team.png" alt="相手チーム">
        </div>
        <div class="game-vs-teams__team">
          <img data-src="/images/logo_2004001.png" alt="自チーム">
        </div>
      `;

      const result = detectIsHome(html);
      expect(result).toBe(false);
    });

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
