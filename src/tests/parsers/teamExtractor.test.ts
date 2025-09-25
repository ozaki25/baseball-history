import { describe, it, expect } from 'vitest';
import { extractVsTeam, extractMyTeam } from '@/lib/parsers/teamExtractor';

describe('teamExtractor', () => {
  describe('extractMyTeam', () => {
    it('ホーム時に自チーム名を正しく抽出', () => {
      const html = `
        <div class="c-game-detail__header-text">北海道日本ハム</div>
        <div class="c-game-detail__header-text">オリックス</div>
      `;

      const result = extractMyTeam(html, true);
      expect(result).toBe('北海道日本ハム');
    });

    it('ビジター時に自チーム名を正しく抽出', () => {
      const html = `
        <div class="c-game-detail__header-text">オリックス</div>
        <div class="c-game-detail__header-text">北海道日本ハム</div>
      `;

      const result = extractMyTeam(html, false);
      expect(result).toBe('北海道日本ハム');
    });

    it('チーム名要素が不足している場合にエラー', () => {
      const html = '<div>No team elements</div>';
      expect(() => extractMyTeam(html, true)).toThrow('チーム名要素が2つ見つかりません');
    });
  });

  describe('extractVsTeam', () => {
    it('ホーム時に対戦相手を正しく抽出', () => {
      const html = `
        <div class="c-game-detail__header-text">北海道日本ハム</div>
        <div class="c-game-detail__header-text">オリックス</div>
      `;

      const result = extractVsTeam(html, true);
      expect(result).toBe('オリックス');
    });

    it('ビジター時に対戦相手を正しく抽出', () => {
      const html = `
        <div class="c-game-detail__header-text">オリックス</div>
        <div class="c-game-detail__header-text">北海道日本ハム</div>
      `;

      const result = extractVsTeam(html, false);
      expect(result).toBe('オリックス');
    });

    it('チーム名要素が不足している場合にエラー', () => {
      const html = '<div>No team elements</div>';
      expect(() => extractVsTeam(html, true)).toThrow('チーム名要素が2つ見つかりません');
    });
  });
});
