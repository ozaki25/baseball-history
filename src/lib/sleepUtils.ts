/**
 * 指定された時間だけ処理を停止する
 * @param ms 停止時間（ミリ秒）
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * サーバー負荷軽減のための標準待機時間
 */
export const SCRAPING_DELAY_MS = 100;
