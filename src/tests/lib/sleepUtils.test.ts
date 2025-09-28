import { describe, it, expect, vi } from 'vitest';
import { sleep, SCRAPING_DELAY_MS } from '@/lib/sleepUtils';

describe('sleepUtils', () => {
  describe('sleep', () => {
    it('指定した時間だけ待機する', async () => {
      const startTime = Date.now();
      const delayMs = 50; // 50ms待機

      await sleep(delayMs);

      const elapsed = Date.now() - startTime;
      // 多少の誤差を考慮して45-60ms範囲をOKとする
      expect(elapsed).toBeGreaterThanOrEqual(delayMs - 5);
      expect(elapsed).toBeLessThan(delayMs + 20);
    });

    it('0msでも正常に動作する', async () => {
      const startTime = Date.now();

      await sleep(0);

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(10); // 10ms以内に完了
    });
  });

  describe('SCRAPING_DELAY_MS', () => {
    it('100msの定数値が設定されている', () => {
      expect(SCRAPING_DELAY_MS).toBe(100);
    });
  });
});