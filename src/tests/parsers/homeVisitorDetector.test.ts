import { describe, it, expect } from 'vitest';
import { detectHomeVisitor, isHomeGame } from '@/lib/parsers/homeVisitorDetector';

describe('homeVisitorDetector', () => {
  describe('detectHomeVisitor', () => {
    it('ホーム球場でファイターズが0番目の場合', () => {
      const html = `
        <div class="game-vs-teams__team">
          <img src="/images/logo_2004001.png" alt="ファイターズ">
          <div class="game-vs-teams__team-stadium">札幌ドーム</div>
        </div>
        <div class="game-vs-teams__team">
          <img src="/images/other_team.png" alt="相手チーム">
          <div class="game-vs-teams__team-stadium">札幌ドーム</div>
        </div>
        <div class="game-vs__text">札幌ドーム</div>
      `;

      const result = detectHomeVisitor(html);
      expect(result.isHome).toBe(true);
      expect(result.method).toBe('team-position');
      expect(result.confidence).toBe('high');
    });

    it('ビジター球場でファイターズが1番目の場合', () => {
      const html = `
        <div class="game-vs-teams__team">
          <img src="/images/other_team.png" alt="相手チーム">
          <div class="game-vs-teams__team-stadium">東京ドーム</div>
        </div>
        <div class="game-vs-teams__team">
          <img src="/images/logo_2004.png" alt="ファイターズ">
          <div class="game-vs-teams__team-stadium">東京ドーム</div>
        </div>
        <div class="game-vs__text">東京ドーム</div>
      `;

      const result = detectHomeVisitor(html);
      expect(result.isHome).toBe(false);
      expect(result.method).toBe('team-position');
      expect(result.confidence).toBe('high');
    });
  });

  describe('isHomeGame', () => {
    it('シンプルなホーム判定を返す', () => {
      const html = `
        <div class="game-vs-teams__team">
          <img src="/images/logo_2004001.png" alt="ファイターズ">
        </div>
        <div class="game-vs-teams__team">
          <img src="/images/other_team.png" alt="相手チーム">
        </div>
        <div class="game-vs__text">札幌ドーム</div>
      `;

      const result = isHomeGame(html);
      expect(result).toBe(true);
    });

    it('シンプルなビジター判定を返す', () => {
      const html = `
        <div class="game-vs-teams__team">
          <img src="/images/other_team.png" alt="相手チーム">
        </div>
        <div class="game-vs-teams__team">
          <img src="/images/logo_2004.png" alt="ファイターズ">
        </div>
        <div class="game-vs__text">東京ドーム</div>
      `;

      const result = isHomeGame(html);
      expect(result).toBe(false);
    });
  });
});
