import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * テスト用HTMLファイルを読み込むヘルパー関数
 */
export function loadTestHTML(filename: string): string {
  const filePath = join(process.cwd(), filename);
  return readFileSync(filePath, 'utf-8');
}

/**
 * テストパターンの定義
 */
export const TEST_PATTERNS = {
  HOME_WIN: 'test-pattern1-home-win.html',
  HOME_LOSE: 'test-pattern2-home-lose.html', 
  VISITOR_WIN: 'test-pattern3-visitor-win.html',
  VISITOR_LOSE: 'test-pattern4-visitor-lose.html',
  DRAW: 'test-pattern5-draw.html',
  SAYONARA_WIN: 'test-pattern6-sayonara-win.html',
} as const;