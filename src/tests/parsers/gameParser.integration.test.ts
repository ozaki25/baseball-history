import { describe, it, expect } from 'vitest';
import { parseGameHTML } from '@/lib/parsers/gameParser';
import { getGameResult } from '@/lib/gameUtils';
import { loadTestHTML, TEST_PATTERNS } from '@/tests/helpers/testHtmlLoader';

describe('gameParser integration tests', () => {
  describe('parseGameHTML with real HTML patterns', () => {
    it('パターン1: ホームゲーム勝利を正しく解析', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_WIN);
      const result = parseGameHTML(html);

      expect(result.myTeam).toBe('北海道日本ハム');
      expect(result.vsTeam).toBe('千葉ロッテ');
      expect(result.myScore).toBe(5); // ファイターズ5点（ホーム勝ち）
      expect(result.vsScore).toBe(1); // 相手1点
      expect(result.location).toBe('エスコンフィールド');
      expect(result.isHome).toBe(true);
      expect(getGameResult(result.myScore, result.vsScore)).toBe('win');
    });

    it('パターン2: ホームゲーム敗戦を正しく解析', () => {
      const html = loadTestHTML(TEST_PATTERNS.HOME_LOSE);
      const result = parseGameHTML(html);

      expect(result.myTeam).toBe('北海道日本ハム');
      expect(result.vsTeam).toBe('千葉ロッテ');
      expect(result.myScore).toBe(1); // ファイターズ1点（ホーム負け）
      expect(result.vsScore).toBe(5); // 相手5点
      expect(result.location).toBe('エスコンフィールド');
      expect(result.isHome).toBe(true);
      expect(getGameResult(result.myScore, result.vsScore)).toBe('lose');
    });

    it('パターン3: ビジターゲーム勝利を正しく解析', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_WIN);
      const result = parseGameHTML(html);

      expect(result.myTeam).toBe('北海道日本ハム');
      expect(result.vsTeam).toBe('オリックス');
      expect(result.myScore).toBe(1); // ファイターズ1点（ビジター勝ち）
      expect(result.vsScore).toBe(0); // 相手0点
      expect(result.location).toBe('京セラD大阪');
      expect(result.isHome).toBe(false);
      expect(getGameResult(result.myScore, result.vsScore)).toBe('win');
    });

    it('パターン4: ビジターゲーム敗戦を正しく解析', () => {
      const html = loadTestHTML(TEST_PATTERNS.VISITOR_LOSE);
      const result = parseGameHTML(html);

      expect(result.myTeam).toBe('北海道日本ハム');
      expect(result.vsTeam).toBe('オリックス');
      expect(result.myScore).toBe(1); // ファイターズ1点（ビジター負け）
      expect(result.vsScore).toBe(5); // 相手5点
      expect(result.location).toBe('京セラD大阪');
      expect(result.isHome).toBe(false);
      expect(getGameResult(result.myScore, result.vsScore)).toBe('lose');
    });

    it('パターン5: 引き分けを正しく解析', () => {
      const html = loadTestHTML(TEST_PATTERNS.DRAW);
      const result = parseGameHTML(html);

      expect(result.myTeam).toBe('北海道日本ハム');
      expect(result.vsTeam).toBe('福岡ソフトバンク');
      expect(result.myScore).toBe(4); // ファイターズ4点（引き分け）
      expect(result.vsScore).toBe(4); // 相手4点
      expect(result.location).toBe('エスコンフィールド');
      expect(result.isHome).toBe(true);
      expect(getGameResult(result.myScore, result.vsScore)).toBe('draw');
    });

    it('パターン6: サヨナラ勝ちを正しく解析', () => {
      const html = loadTestHTML(TEST_PATTERNS.SAYONARA_WIN);
      const result = parseGameHTML(html);

      expect(result.myTeam).toBe('北海道日本ハム');
      expect(result.vsTeam).toBe('千葉ロッテ');
      expect(result.myScore).toBe(4); // ファイターズ4点（サヨナラ勝ち、xマーク付き）
      expect(result.vsScore).toBe(3); // 相手3点
      expect(result.location).toBe('エスコンフィールド');
      expect(result.isHome).toBe(true);
      expect(getGameResult(result.myScore, result.vsScore)).toBe('win');
    });
  });

  describe('edge cases and error handling', () => {
    it('不完全なHTMLでエラーを適切に投げる', () => {
      const incompleteHTML = '<div>incomplete html</div>';

      expect(() => parseGameHTML(incompleteHTML)).toThrow();
    });

    it('チーム名が見つからない場合エラーを投げる', () => {
      const htmlWithoutTeams = `
        <div class="game-vs-teams">
          <div class="game-vs-teams__team-score">
            <em>5</em><span>3</span>
          </div>
        </div>
        <div class="game-vs__text">球場名</div>
      `;

      expect(() => parseGameHTML(htmlWithoutTeams)).toThrow();
    });
  });
});
