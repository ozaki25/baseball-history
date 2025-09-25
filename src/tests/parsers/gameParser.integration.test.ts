import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseGameHTML } from '@/lib/parsers/gameParser';
import { getGameResult } from '@/lib/gameUtils';

// テスト用HTMLファイルを読み込むヘルパー関数
function loadTestHTML(filename: string): string {
  const filePath = join(process.cwd(), filename);
  return readFileSync(filePath, 'utf-8');
}

describe('gameParser integration tests', () => {
  describe('parseGameHTML with real HTML patterns', () => {
    it('ホームゲーム勝利（サヨナラ勝ち）を正しく解析', () => {
      const html = loadTestHTML('test-home-win.html');
      const result = parseGameHTML(html);

      expect(result.myTeam).toBe('北海道日本ハム');
      expect(result.vsTeam).toBe('千葉ロッテ');
      expect(result.myScore).toBe(6); // ファイターズ6点（ホーム、x付きサヨナラ勝ち）
      expect(result.vsScore).toBe(5); // 相手5点
      expect(result.location).toBe('エスコンフィールド');
      expect(result.isHome).toBe(true);
      expect(getGameResult(result.myScore, result.vsScore)).toBe('win');
    });

    it('ホームゲーム敗戦を正しく解析', () => {
      const html = loadTestHTML('test-home-lose.html');
      const result = parseGameHTML(html);

      expect(result.myTeam).toBe('北海道日本ハム');
      expect(result.vsTeam).toBe('千葉ロッテ');
      expect(result.myScore).toBe(4); // 実際の結果に基づく
      expect(result.vsScore).toBe(8); // 実際の結果に基づく
      expect(result.location).toBe('エスコンフィールド');
      expect(result.isHome).toBe(true);
      expect(getGameResult(result.myScore, result.vsScore)).toBe('lose');
    });

    it('ビジターゲーム勝利を正しく解析', () => {
      const html = loadTestHTML('test-visitor-win.html');
      const result = parseGameHTML(html);

      expect(result.myTeam).toBe('北海道日本ハム');
      expect(result.vsTeam).toBe('オリックス');
      expect(result.myScore).toBe(7); // 実際の結果に基づく
      expect(result.vsScore).toBe(3); // 実際の結果に基づく
      expect(result.location).toBe('京セラドーム大阪');
      expect(result.isHome).toBe(false);
      expect(getGameResult(result.myScore, result.vsScore)).toBe('win');
    });

    it('ビジターゲーム引き分けを正しく解析', () => {
      const html = loadTestHTML('test-visitor-draw.html');
      const result = parseGameHTML(html);

      expect(result.myTeam).toBe('北海道日本ハム');
      expect(result.vsTeam).toBe('千葉ロッテ');
      expect(result.myScore).toBe(2); // 実際の結果に基づく
      expect(result.vsScore).toBe(2); // 実際の結果に基づく
      expect(result.location).toBe('ZOZOマリンスタジアム');
      expect(result.isHome).toBe(false);
      expect(getGameResult(result.myScore, result.vsScore)).toBe('draw');
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
