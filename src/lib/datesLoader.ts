import dayjs from 'dayjs';
import { DatesData } from '@/types/game';
import rawDates from '../../data/dates.json';

/**
 * Load and validate dates.json at server-side ingestion.
 * Converts each MMDD string into a dayjs instance (validated) by combining with the year.
 * If any date is invalid, this function throws an Error with details.
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

      const yyyyMMdd = `${year}${mmdd}`; // YYYYMMDD
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
 * Load and validate dates, returning dayjs objects grouped by year.
 * Useful for server-side ingestion where we want a typed date object.
 */
export function loadAndValidateDatesAsDayjs(): Record<string, dayjs.Dayjs[]> {
  const dates = loadAndValidateDates();
  const result: Record<string, dayjs.Dayjs[]> = {};

  for (const [year, dateArray] of Object.entries(dates)) {
    result[year] = dateArray.map((mmdd) => {
      const parsed = dayjs(`${year}${mmdd}`, 'YYYYMMDD', true);
      // parse was already validated in loadAndValidateDates, but extra safety:
      if (!parsed.isValid()) {
        throw new Error(`Unexpected parse failure for ${year}/${mmdd}`);
      }
      return parsed;
    });
  }

  return result;
}
