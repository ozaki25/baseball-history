import dayjs from 'dayjs';
import { DatesData } from '@/types/game';
import rawDates from '../../data/dates.json';

/**
 * サーバー側の取り込み時に `data/dates.json` を読み込み、検証を行います。
 * 各 MMDD 文字列は年（YYYY）と結合して dayjs オブジェクトに変換（厳密パース）します。
 * 不正な日付が見つかった場合は詳細を含む Error を投げます。
 */
export function loadAndValidateDates(): DatesData {
  const dates = rawDates as DatesData;

  for (const [year, dateArray] of Object.entries(dates)) {
    if (!/^[0-9]{4}$/.test(year)) {
      throw new Error(`Invalid year key in dates.json: ${year}`);
    }

    for (const mmdd of dateArray) {
      if (!/^[0-9]{4}$/.test(mmdd)) {
        throw new Error(`Invalid MMDD entry for ${year}: ${mmdd} (must be 4 digits)`);
      }

      const yyyyMMdd = `${year}${mmdd}`; // YYYYMMDD（年+月日）
      const parsed = dayjs(yyyyMMdd, 'YYYYMMDD', true);
      if (!parsed.isValid()) {
        throw new Error(
          `Invalid date for ${year}/${mmdd}: parsed as ${yyyyMMdd} is not a valid date`
        );
      }
    }
  }

  return dates;
}

/**
 * 検証済みの日付を年ごとに dayjs オブジェクトの配列として返します。
 * サーバー側で日付を dayjs 型として扱いたい場合に便利です。
 */
export function loadAndValidateDatesAsDayjs(): Record<string, dayjs.Dayjs[]> {
  const dates = loadAndValidateDates();
  const result: Record<string, dayjs.Dayjs[]> = {};

  for (const [year, dateArray] of Object.entries(dates)) {
    result[year] = dateArray.map((mmdd) => {
      const parsed = dayjs(`${year}${mmdd}`, 'YYYYMMDD', true);
      // loadAndValidateDates ですでに検証済みですが、念のため再チェックします。
      if (!parsed.isValid()) {
        throw new Error(`Unexpected parse failure for ${year}/${mmdd}`);
      }
      return parsed;
    });
  }

  return result;
}
