import { describe, it, expect } from 'vitest';
import { loadAndValidateDates, loadAndValidateDatesAsDayjs } from './datesLoader';

describe('datesLoader', () => {
  it('should load and validate existing dates.json without throwing', () => {
    expect(() => loadAndValidateDates()).not.toThrow();
  });

  it('should return dayjs objects with loadAndValidateDatesAsDayjs', () => {
    const data = loadAndValidateDatesAsDayjs();
    const years = Object.keys(data);
    expect(years.length).toBeGreaterThan(0);
    // check first entry is a dayjs object
    const firstYear = years[0];
    const arr = data[firstYear];
    expect(Array.isArray(arr)).toBe(true);
    expect(arr[0]).toHaveProperty('isValid');
  });
});
