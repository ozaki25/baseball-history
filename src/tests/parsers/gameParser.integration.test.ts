import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseGameHTML } from '@/lib/parsers/gameParser';

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

      expect(result.opponent).toBe('千葉ロッテ');
      expect(result.myScore).toBe(6); // ファイターズ6点（ホーム、x付きサヨナラ勝ち）
      expect(result.vsScore).toBe(5); // 相手5点
      expect(result.location).toBe('エスコンフィールド');
      expect(result.isHomeGame).toBe(true);
      expect(result.result).toBe('win');
    });

    it('ホームゲーム敗戦を正しく解析', () => {
      const html = loadTestHTML('test-home-lose.html');
      const result = parseGameHTML(html);

      expect(result.opponent).toBe('楽天イーグルス');
      expect(result.myScore).toBe(2); // ファイターズ2点
      expect(result.vsScore).toBe(7); // 相手7点
      expect(result.location).toBe('エスコンフィールド');
      expect(result.isHomeGame).toBe(true);
      expect(result.result).toBe('lose');
    });

    it('ビジターゲーム勝利を正しく解析', () => {
      const html = loadTestHTML('test-visitor-win.html');
      const result = parseGameHTML(html);

      expect(result.opponent).toBe('オリックス');
      expect(result.myScore).toBe(8); // ファイターズ8点（ビジター）
      expect(result.vsScore).toBe(3); // 相手3点
      expect(result.location).toBe('京セラドーム大阪');
      expect(result.isHomeGame).toBe(false);
      expect(result.result).toBe('win');
    });

    it('ビジターゲーム引き分けを正しく解析', () => {
      const html = loadTestHTML('test-visitor-draw.html');
      const result = parseGameHTML(html);

      expect(result.opponent).toBe('ソフトバンク');
      expect(result.myScore).toBe(4); // ファイターズ4点（ビジター）
      expect(result.vsScore).toBe(4); // 相手4点
      expect(result.location).toBe('PayPayドーム');
      expect(result.isHomeGame).toBe(false);
      expect(result.result).toBe('draw');
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
