import { describe, it, expect } from 'vitest';
import { extractGameLocation } from '@/lib/parsers/locationExtractor';

describe('locationExtractor', () => {
  describe('extractGameLocation', () => {
    it('正常なHTMLから球場名を抽出', () => {
      const html = `
        <div class="game-vs__text">札幌ドーム</div>
      `;

      const result = extractGameLocation(html);
      expect(result).toBe('札幌ドーム');
    });

    it('球場要素が見つからない場合はエラーを投げる', () => {
      const html = '<div>No location elements</div>';

      expect(() => extractGameLocation(html)).toThrow('球場要素が見つかりません');
    });

    it('球場名が空の場合はエラーを投げる', () => {
      const html = `
        <div class="game-vs__text"></div>
      `;

      expect(() => extractGameLocation(html)).toThrow('球場名が空です');
    });
  });
});
