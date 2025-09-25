import { describe, it, expect } from 'vitest';
import { extractGameScore, detectGameStatus } from '@/lib/parsers/scoreExtractor';

describe('scoreExtractor', () => {
  describe('extractGameScore', () => {
    it('正常なスコア要素から抽出（サヨナラ勝ちのx付き）', () => {
      const html = `
        <div class="game-vs-teams__team-score">
          <em>6x</em><span>5</span>
        </div>
      `;

      const result = extractGameScore(html);
      expect(result.homeScore).toBe(6); // x付きは除去される
      expect(result.visitorScore).toBe(5);
      expect(result.total).toBe(11);
      expect(result.result).toBe('win');
    });

    it('引き分けの場合', () => {
      const html = `
        <div class="game-vs-teams__team-score">
          <em>2</em><span>2</span>
        </div>
      `;

      const result = extractGameScore(html);
      expect(result.homeScore).toBe(2);
      expect(result.visitorScore).toBe(2);
      expect(result.result).toBe('draw');
    });

    it('負けの場合', () => {
      const html = `
        <div class="game-vs-teams__team-score">
          <em>1</em><span>4</span>
        </div>
      `;

      const result = extractGameScore(html);
      expect(result.homeScore).toBe(1);
      expect(result.visitorScore).toBe(4);
      expect(result.result).toBe('loss');
    });
  });

  describe('detectGameStatus', () => {
    it('通常の試合（開催済み）の場合', () => {
      const html = `
        <div class="game-result">
          <p>試合結果: ファイターズ 5-3 オリックス</p>
        </div>
      `;

      const result = detectGameStatus(html);
      expect(result).toBe('completed');
    });

    it('中止の場合', () => {
      const html = `
        <div class="content">
          <p>今日の試合は雨天のため中止となりました。</p>
        </div>
      `;

      const result = detectGameStatus(html);
      expect(result).toBe('cancelled');
    });

    it('延期の場合', () => {
      const html = `
        <div class="content">
          <p>試合延期のお知らせ</p>
        </div>
      `;

      const result = detectGameStatus(html);
      expect(result).toBe('postponed');
    });
  });
});
