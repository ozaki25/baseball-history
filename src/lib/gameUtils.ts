import dayjs from 'dayjs';

/**
 * MMDD形式をM/D形式に変換
 * @param mmddDate MMDD形式の日付（例: "0401" → "4/1"）
 */
export function formatDate(mmddDate: string | dayjs.Dayjs): string {
  if (typeof mmddDate === 'string') {
    if (mmddDate.length !== 4 || !/^\d{4}$/.test(mmddDate)) {
      throw new Error(`Invalid MMDD format: expected 4 digits, got "${mmddDate}"`);
    }

    const month = mmddDate.substring(0, 2);
    const day = mmddDate.substring(2, 4);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);

    if (monthNum < 1 || monthNum > 12) {
      throw new Error(`Invalid month: ${monthNum}`);
    }
    if (dayNum < 1 || dayNum > 31) {
      throw new Error(`Invalid day: ${dayNum}`);
    }

    return `${monthNum}/${dayNum}`;
  } else {
    // dayjs input
    if (!mmddDate.isValid()) {
      throw new Error('Invalid dayjs date passed to formatDate');
    }
    return `${mmddDate.month() + 1}/${mmddDate.date()}`;
  }
}

/**
 * スコアから試合結果を算出
 */
export function getGameResult(myScore: number, vsScore: number): 'win' | 'lose' | 'draw' {
  if (myScore > vsScore) {
    return 'win';
  } else if (myScore < vsScore) {
    return 'lose';
  } else {
    return 'draw';
  }
}
