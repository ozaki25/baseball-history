import { describe, it, expect } from 'vitest';
import { extractGameScore } from '@/lib/parsers/scoreExtractor';

describe('scoreExtractor', () => {
  describe('extractGameScore', () => {
    it('ホーム時のスコア抽出（ファイターズ勝利）', () => {
      const html = `
        <div class="game-vs-teams__team-score">
          <em>6x</em><span>5</span>
        </div>
      `;

      const result = extractGameScore(html, true);
      expect(result.myScore).toBe(6); // ホーム（ファイターズ）= em = 6
      expect(result.vsScore).toBe(5); // ビジター（相手） = span = 5
    });

    it('ビジター時のスコア抽出（ファイターズ勝利）', () => {
      const html = `
        <div class="game-vs-teams__team-score">
          <em>6</em><span>5x</span>
        </div>
      `;

      const result = extractGameScore(html, false);
      expect(result.myScore).toBe(5); // ビジター（ファイターズ） = span = 5x
      expect(result.vsScore).toBe(6); // ホーム（相手） = em = 6
    });

    it('ホーム時のスコア抽出（ファイターズ敗戦）', () => {
      const html = `
        <div class="game-vs-teams__team-score">
          <em>2</em><span>7</span>
        </div>
      `;

      const result = extractGameScore(html, true);
      expect(result.myScore).toBe(2); // ホーム（ファイターズ） = em = 2
      expect(result.vsScore).toBe(7); // ビジター（相手） = span = 7
    });

    it('ビジター時のスコア抽出（ファイターズ敗戦）', () => {
      const html = `
        <div class="game-vs-teams__team-score">
          <em>7</em><span>2</span>
        </div>
      `;

      const result = extractGameScore(html, false);
      expect(result.myScore).toBe(2); // ビジター（ファイターズ） = span = 2
      expect(result.vsScore).toBe(7); // ホーム（相手） = em = 7
    });

    it('引き分けの場合（ホーム）', () => {
      const html = `
        <div class="game-vs-teams__team-score">
          <span>3</span><i></i><span>3</span>
        </div>
      `;

      const result = extractGameScore(html, true);
      expect(result.myScore).toBe(3); // ホーム（ファイターズ） = 左のspan = 3
      expect(result.vsScore).toBe(3); // ビジター（相手） = 右のspan = 3
    });

    it('引き分けの場合（ビジター）', () => {
      const html = `
        <div class="game-vs-teams__team-score">
          <span>2</span><i></i><span>2</span>
        </div>
      `;

      const result = extractGameScore(html, false);
      expect(result.myScore).toBe(2); // ビジター（ファイターズ） = 右のspan = 2
      expect(result.vsScore).toBe(2); // ホーム（相手） = 左のspan = 2
    });

    it('スコア要素が見つからない場合はエラーを投げる', () => {
      const html = '<div>No score elements</div>';
      expect(() => extractGameScore(html, true)).toThrow('スコア要素が見つかりません');
    });
  });
});
