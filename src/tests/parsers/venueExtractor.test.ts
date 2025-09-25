import { describe, it, expect } from 'vitest';
import { extractGameVenue, extractVenueLocationInfo } from '@/lib/parsers/venueExtractor';

describe('venueExtractor', () => {
  describe('extractGameVenue', () => {
    it('正常なHTMLから会場名を抽出', () => {
      const html = `
        <div class="game-vs__text">札幌ドーム</div>
      `;

      const result = extractGameVenue(html);
      expect(result.name).toBe('札幌ドーム');
    });

    it('エスコンフィールドの場合', () => {
      const html = `
        <div class="game-vs__text">エスコンフィールド</div>
      `;

      const result = extractGameVenue(html);
      expect(result.name).toBe('エスコンフィールド');
    });

    it('ビジター球場の場合', () => {
      const html = `
        <div class="game-vs__text">東京ドーム</div>
      `;

      const result = extractGameVenue(html);
      expect(result.name).toBe('東京ドーム');
    });

    it('会場要素が見つからない場合はエラーを投げる', () => {
      const html = '<div>No venue elements</div>';

      expect(() => extractGameVenue(html)).toThrow('game-vs__text要素が見つかりませんでした');
    });
  });

  describe('extractVenueLocationInfo', () => {
    it('札幌ドームはホーム球場として検出', () => {
      const html = `
        <div class="game-vs__text">札幌ドーム</div>
      `;

      const result = extractVenueLocationInfo(html);
      expect(result.venue).toBe('札幌ドーム');
      expect(result.isHomeVenue).toBe(true);
      expect(result.confidenceLevel).toBe('high');
    });

    it('エスコンフィールドはホーム球場として検出', () => {
      const html = `
        <div class="game-vs__text">エスコンフィールド</div>
      `;

      const result = extractVenueLocationInfo(html);
      expect(result.venue).toBe('エスコンフィールド');
      expect(result.isHomeVenue).toBe(true);
      expect(result.confidenceLevel).toBe('medium');
    });

    it('他の球場はビジター球場として検出', () => {
      const html = `
        <div class="game-vs__text">東京ドーム</div>
      `;

      const result = extractVenueLocationInfo(html);
      expect(result.venue).toBe('東京ドーム');
      expect(result.isHomeVenue).toBe(false);
      expect(result.confidenceLevel).toBe('low');
    });
  });
});
