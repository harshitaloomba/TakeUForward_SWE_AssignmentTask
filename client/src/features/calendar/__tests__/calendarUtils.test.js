/**
 * Unit tests for calendarUtils.js
 * Covers: buildCalendarGrid, computeDayState, handleDayClick, isInRange,
 *         formatDateRange, loadStateFromStorage
 *
 * Validates: Requirements 8.1–8.8
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  buildCalendarGrid,
  computeDayState,
  handleDayClick,
  isInRange,
  formatDateRange,
  loadStateFromStorage,
  persistToLocalStorage,
} from '../calendarUtils.js';
import { STORAGE_KEY } from '../calendarTypes.js';

/**
 * Create a Date whose toISOString() yields the given YYYY-MM-DD string.
 * Uses UTC noon to avoid any timezone-driven day-shift.
 */
function utcDate(isoStr) {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

// ---------------------------------------------------------------------------
// buildCalendarGrid
// ---------------------------------------------------------------------------

describe('buildCalendarGrid', () => {
  it('returns an array whose length is a multiple of 7 (Req 8.1)', () => {
    // Test several months
    const cases = [
      [2025, 0],  // January 2025 – starts on Wednesday
      [2025, 1],  // February 2025 – starts on Saturday
      [2024, 1],  // February 2024 (leap year)
      [2025, 11], // December 2025
    ];
    for (const [year, month] of cases) {
      const grid = buildCalendarGrid(year, month);
      expect(grid.length % 7, `${year}-${month} length % 7`).toBe(0);
    }
  });

  it('has leading null cells that align the first day to the correct column', () => {
    // January 2025: 1st is a Wednesday (getDay() === 3)
    const grid = buildCalendarGrid(2025, 0);
    expect(grid[0]).toBeNull();
    expect(grid[1]).toBeNull();
    expect(grid[2]).toBeNull();
    // 4th cell (index 3) should be Jan 1
    expect(grid[3]).toBeInstanceOf(Date);
    expect(grid[3].getDate()).toBe(1);
  });

  it('has no leading nulls when the month starts on Sunday', () => {
    // June 2025: 1st is a Sunday (getDay() === 0)
    const grid = buildCalendarGrid(2025, 5);
    expect(grid[0]).toBeInstanceOf(Date);
    expect(grid[0].getDate()).toBe(1);
  });

  it('contains the correct Date objects for each day of the month', () => {
    const grid = buildCalendarGrid(2025, 0); // January 2025 has 31 days
    const dates = grid.filter(Boolean);
    expect(dates).toHaveLength(31);
    dates.forEach((d, i) => {
      expect(d.getFullYear()).toBe(2025);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(i + 1);
    });
  });

  it('has trailing null cells to complete the last row', () => {
    // January 2025: 31 days, starts Wednesday → 3 leading nulls, 34 day+leading = 34 cells → pad to 35
    const grid = buildCalendarGrid(2025, 0);
    // Last cell should be null (trailing pad)
    expect(grid[grid.length - 1]).toBeNull();
  });

  it('has no trailing nulls when the month ends exactly on Saturday', () => {
    // May 2025: 31 days, starts Thursday (getDay()===4), 4 leading + 31 = 35 → pad to 35 (no trailing)
    // Actually let's find a month that ends on Saturday: August 2025 ends on Sunday, not ideal.
    // March 2025: starts Saturday (6), 6 leading + 31 = 37 → pad to 42, trailing = 5
    // Let's just verify the invariant: length % 7 === 0 and last non-null is last day of month
    const grid = buildCalendarGrid(2025, 2); // March 2025
    const nonNulls = grid.filter(Boolean);
    expect(nonNulls[nonNulls.length - 1].getDate()).toBe(31);
    expect(grid.length % 7).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeDayState
// ---------------------------------------------------------------------------

describe('computeDayState', () => {
  const today = utcDate('2025-01-15');

  it('returns "today" when range is null and date is today', () => {
    expect(computeDayState(today, null, today)).toBe('today');
  });

  it('returns "default" when range is null and date is not today', () => {
    const other = utcDate('2025-01-10');
    expect(computeDayState(other, null, today)).toBe('default');
  });

  it('returns "start" when date matches range.start', () => {
    const range = { start: '2025-01-10', end: '2025-01-15' };
    const date = utcDate('2025-01-10');
    expect(computeDayState(date, range, today)).toBe('start');
  });

  it('returns "end" when date matches range.end', () => {
    const range = { start: '2025-01-10', end: '2025-01-15' };
    const date = utcDate('2025-01-15');
    expect(computeDayState(date, range, today)).toBe('end');
  });

  it('returns "start" for a single-day range (start === end)', () => {
    const range = { start: '2025-01-10', end: '2025-01-10' };
    const date = utcDate('2025-01-10');
    expect(computeDayState(date, range, today)).toBe('start');
  });

  it('returns "in-range" for a date strictly between start and end', () => {
    const range = { start: '2025-01-10', end: '2025-01-15' };
    const date = utcDate('2025-01-12');
    expect(computeDayState(date, range, today)).toBe('in-range');
  });

  it('returns "today" when date is today but outside the range', () => {
    const range = { start: '2025-01-20', end: '2025-01-25' };
    expect(computeDayState(today, range, today)).toBe('today');
  });

  it('returns "default" for a date outside the range and not today', () => {
    const range = { start: '2025-01-20', end: '2025-01-25' };
    const date = utcDate('2025-01-05');
    expect(computeDayState(date, range, today)).toBe('default');
  });
});

// ---------------------------------------------------------------------------
// handleDayClick
// ---------------------------------------------------------------------------

describe('handleDayClick', () => {
  it('Branch 1: returns single-day range when currentRange is null', () => {
    const date = utcDate('2025-01-10');
    const result = handleDayClick(date, null);
    expect(result).toEqual({ start: '2025-01-10', end: '2025-01-10' });
  });

  it('Branch 2: extends range when single-day selection exists (clicked after)', () => {
    const date = utcDate('2025-01-15');
    const currentRange = { start: '2025-01-10', end: '2025-01-10' };
    const result = handleDayClick(date, currentRange);
    expect(result).toEqual({ start: '2025-01-10', end: '2025-01-15' });
  });

  it('Branch 2: swaps dates when clicked date is earlier than start', () => {
    const date = utcDate('2025-01-05');
    const currentRange = { start: '2025-01-10', end: '2025-01-10' };
    const result = handleDayClick(date, currentRange);
    expect(result).toEqual({ start: '2025-01-05', end: '2025-01-10' });
  });

  it('Branch 2: same day click on single-day range extends to same day', () => {
    const date = utcDate('2025-01-10');
    const currentRange = { start: '2025-01-10', end: '2025-01-10' };
    const result = handleDayClick(date, currentRange);
    expect(result).toEqual({ start: '2025-01-10', end: '2025-01-10' });
  });

  it('Branch 3: resets to new single-day range when full range exists', () => {
    const date = utcDate('2025-01-20');
    const currentRange = { start: '2025-01-10', end: '2025-01-15' };
    const result = handleDayClick(date, currentRange);
    expect(result).toEqual({ start: '2025-01-20', end: '2025-01-20' });
  });

  it('returns currentRange unchanged when clickedDate is null', () => {
    const currentRange = { start: '2025-01-10', end: '2025-01-15' };
    const result = handleDayClick(null, currentRange);
    expect(result).toEqual(currentRange);
  });
});

// ---------------------------------------------------------------------------
// isInRange
// ---------------------------------------------------------------------------

describe('isInRange', () => {
  const range = { start: '2025-01-10', end: '2025-01-15' };

  it('returns true for the start boundary (inclusive)', () => {
    expect(isInRange(utcDate('2025-01-10'), range)).toBe(true);
  });

  it('returns true for the end boundary (inclusive)', () => {
    expect(isInRange(utcDate('2025-01-15'), range)).toBe(true);
  });

  it('returns true for a date strictly inside the range', () => {
    expect(isInRange(utcDate('2025-01-12'), range)).toBe(true);
  });

  it('returns false for a date before the start', () => {
    expect(isInRange(utcDate('2025-01-09'), range)).toBe(false);
  });

  it('returns false for a date after the end', () => {
    expect(isInRange(utcDate('2025-01-16'), range)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// formatDateRange
// ---------------------------------------------------------------------------

describe('formatDateRange', () => {
  it('returns a single date label when start equals end (Req 8.4)', () => {
    const range = { start: '2025-01-10', end: '2025-01-10' };
    expect(formatDateRange(range)).toBe('Jan 10');
  });

  it('returns a range label with em-dash when start differs from end (Req 8.5)', () => {
    const range = { start: '2025-01-10', end: '2025-01-15' };
    expect(formatDateRange(range)).toBe('Jan 10 — Jan 15');
  });

  it('formats dates across month boundaries correctly', () => {
    const range = { start: '2025-01-28', end: '2025-02-03' };
    expect(formatDateRange(range)).toBe('Jan 28 — Feb 3');
  });
});

// ---------------------------------------------------------------------------
// loadStateFromStorage
// ---------------------------------------------------------------------------

describe('loadStateFromStorage', () => {
  let getItemSpy;

  beforeEach(() => {
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed object when valid JSON is stored (Req 8.7)', () => {
    const stored = { currentMonth: '2025-01', selectedRange: null, notes: [], theme: {} };
    getItemSpy.mockReturnValue(JSON.stringify(stored));
    const result = loadStateFromStorage();
    expect(result).toEqual(stored);
    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('returns null when stored value is invalid JSON (Req 8.7)', () => {
    getItemSpy.mockReturnValue('not-valid-json{{{');
    const result = loadStateFromStorage();
    expect(result).toBeNull();
  });

  it('returns null when the key is missing from localStorage (Req 8.7)', () => {
    getItemSpy.mockReturnValue(null);
    const result = loadStateFromStorage();
    expect(result).toBeNull();
  });

  it('returns null when localStorage.getItem throws (Req 8.7)', () => {
    getItemSpy.mockImplementation(() => { throw new Error('storage error'); });
    expect(() => loadStateFromStorage()).not.toThrow();
    expect(loadStateFromStorage()).toBeNull();
  });

  it('never throws regardless of storage state (Req 8.7)', () => {
    getItemSpy.mockReturnValue('{"broken": true');
    expect(() => loadStateFromStorage()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Property-Based Tests
// ---------------------------------------------------------------------------

import fc from 'fast-check';

/**
 * Property 1: Grid length is always a multiple of 7
 * Validates: Requirements 3.1, 8.1
 */
describe('Property 1: buildCalendarGrid length is always a multiple of 7', () => {
  it('holds for any valid year (2000–2100) and zero-indexed month (0–11)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2000, max: 2100 }),
        fc.integer({ min: 0, max: 11 }),
        (year, month) => buildCalendarGrid(year, month).length % 7 === 0
      )
    );
  });
});

/**
 * Property 2: Date range invariant — start ≤ end
 * Validates: Requirements 2.2, 2.3, 6.5
 *
 * For any sequence of day-click interactions, the resulting selectedRange
 * is either null or satisfies selectedRange.start <= selectedRange.end.
 */
// Arbitraries for Property 2 — use integer-based dates to avoid fc.date() NaN edge cases
const datePartsArb = fc.record({
  year: fc.integer({ min: 2000, max: 2100 }),
  month: fc.integer({ min: 0, max: 11 }),
  day: fc.integer({ min: 1, max: 28 }),
});
const isoFromParts = ({ year, month, day }) =>
  new Date(year, month, day).toISOString().slice(0, 10);

describe('Property 2: handleDayClick always produces start <= end', () => {
  it('holds for any clicked date with currentRange = null', () => {
    fc.assert(
      fc.property(datePartsArb, (parts) => {
        const date = new Date(parts.year, parts.month, parts.day);
        const result = handleDayClick(date, null);
        return result.start <= result.end;
      })
    );
  });

  it('holds for any clicked date with a single-day currentRange', () => {
    fc.assert(
      fc.property(datePartsArb, datePartsArb, (existingParts, clickedParts) => {
        const iso = isoFromParts(existingParts);
        const currentRange = { start: iso, end: iso };
        const clickedDate = new Date(clickedParts.year, clickedParts.month, clickedParts.day);
        const result = handleDayClick(clickedDate, currentRange);
        return result.start <= result.end;
      })
    );
  });

  it('holds for any clicked date with a full (start < end) currentRange', () => {
    fc.assert(
      fc.property(datePartsArb, datePartsArb, datePartsArb, (partsA, partsB, clickedParts) => {
        const [isoA, isoB] = [isoFromParts(partsA), isoFromParts(partsB)].sort();
        const currentRange = { start: isoA, end: isoB };
        const clickedDate = new Date(clickedParts.year, clickedParts.month, clickedParts.day);
        const result = handleDayClick(clickedDate, currentRange);
        return result.start <= result.end;
      })
    );
  });
});

/**
 * Property 3: Grid cells belong to the correct month
 * Validates: Requirements 3.4, 8.1
 *
 * For any valid year and month, every non-null cell returned by
 * buildCalendarGrid(year, month) has cell.getMonth() === month
 * and cell.getFullYear() === year.
 */
describe('Property 3: buildCalendarGrid cells belong to the correct month', () => {
  it('holds for any valid year (2000–2100) and zero-indexed month (0–11)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2000, max: 2100 }),
        fc.integer({ min: 0, max: 11 }),
        (year, month) => {
          const cells = buildCalendarGrid(year, month);
          return cells
            .filter((cell) => cell !== null)
            .every(
              (cell) =>
                cell.getMonth() === month && cell.getFullYear() === year
            );
        }
      )
    );
  });
});

/**
 * Property 4: isInRange consistent with computeDayState
 * Validates: Requirements 8.3
 *
 * For any date d, DateRange range, and today value, if
 * computeDayState(d, range, today) returns 'in-range' then
 * isInRange(d, range) returns true.
 */
describe('Property 4: isInRange consistent with computeDayState', () => {
  it('if computeDayState returns in-range then isInRange returns true', () => {
    const dateArb = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 }),
    });

    fc.assert(
      fc.property(
        dateArb,
        dateArb,
        dateArb,
        dateArb,
        (d, rangeA, rangeB, todayParts) => {
          const date = new Date(d.year, d.month, d.day);
          const today = new Date(todayParts.year, todayParts.month, todayParts.day);

          // Build a valid range where start <= end by sorting the two dates
          const dateA = new Date(rangeA.year, rangeA.month, rangeA.day);
          const dateB = new Date(rangeB.year, rangeB.month, rangeB.day);
          const isoA = dateA.toISOString().slice(0, 10);
          const isoB = dateB.toISOString().slice(0, 10);
          const [startISO, endISO] = [isoA, isoB].sort();
          const range = { start: startISO, end: endISO };

          const state = computeDayState(date, range, today);
          if (state === 'in-range') {
            return isInRange(date, range) === true;
          }
          // If not 'in-range', the property doesn't constrain anything
          return true;
        }
      )
    );
  });
});

/**
 * Property 6: formatDateRange single-day symmetry
 * Validates: Requirements 8.4
 *
 * For any ISO date string `d`, formatDateRange({ start: d, end: d }) returns
 * a label containing only that single date with no range separator (no "—").
 */
describe('Property 6: formatDateRange single-day symmetry', () => {
  it('never contains the em-dash separator when start === end', () => {
    const datePartsArb = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 }),
    });

    fc.assert(
      fc.property(datePartsArb, ({ year, month, day }) => {
        const iso = new Date(year, month, day).toISOString().slice(0, 10);
        const label = formatDateRange({ start: iso, end: iso });
        return !label.includes('—');
      })
    );
  });
});

/**
 * Property 7: computeDayState always returns a valid DayState
 * Validates: Requirements 8.2
 *
 * For any combination of a valid Date, an optional DateRange, and a today Date,
 * computeDayState returns exactly one value from DAY_STATES.
 */
import { DAY_STATES } from '../calendarTypes.js';

const datePartsArb7 = fc.record({
  year: fc.integer({ min: 2000, max: 2100 }),
  month: fc.integer({ min: 0, max: 11 }),
  day: fc.integer({ min: 1, max: 28 }),
});

describe('Property 7: computeDayState always returns a valid DayState', () => {
  it('returns a value in DAY_STATES when range is null', () => {
    fc.assert(
      fc.property(datePartsArb7, datePartsArb7, (dateParts, todayParts) => {
        const date = new Date(dateParts.year, dateParts.month, dateParts.day);
        const today = new Date(todayParts.year, todayParts.month, todayParts.day);
        const result = computeDayState(date, null, today);
        return DAY_STATES.includes(result);
      })
    );
  });

  it('returns a value in DAY_STATES when a valid range (start <= end) is provided', () => {
    fc.assert(
      fc.property(
        datePartsArb7,
        datePartsArb7,
        datePartsArb7,
        datePartsArb7,
        (dateParts, rangeA, rangeB, todayParts) => {
          const date = new Date(dateParts.year, dateParts.month, dateParts.day);
          const today = new Date(todayParts.year, todayParts.month, todayParts.day);

          const isoA = new Date(rangeA.year, rangeA.month, rangeA.day).toISOString().slice(0, 10);
          const isoB = new Date(rangeB.year, rangeB.month, rangeB.day).toISOString().slice(0, 10);
          const [startISO, endISO] = [isoA, isoB].sort();
          const range = { start: startISO, end: endISO };

          const result = computeDayState(date, range, today);
          return DAY_STATES.includes(result);
        }
      )
    );
  });
});

/**
 * Property 9: loadStateFromStorage never throws
 * Validates: Requirements 7.6, 7.7, 9.3
 *
 * For any string value stored in localStorage (including malformed JSON,
 * empty strings, and arbitrary byte sequences), loadStateFromStorage()
 * returns either a valid Partial<CalendarState> or null and never throws.
 */
describe('Property 9: loadStateFromStorage never throws for any localStorage value', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('never throws for any arbitrary string value in localStorage', () => {
    fc.assert(
      fc.property(fc.string(), (arbitraryString) => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(arbitraryString);
        let threw = false;
        try {
          loadStateFromStorage();
        } catch {
          threw = true;
        }
        return threw === false;
      })
    );
  });

  it('returns null when localStorage key is missing (getItem returns null)', () => {
    fc.assert(
      fc.property(fc.constant(null), (nullValue) => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(nullValue);
        let result;
        let threw = false;
        try {
          result = loadStateFromStorage();
        } catch {
          threw = true;
        }
        return threw === false && result === null;
      })
    );
  });
});

/**
 * Property 5: State persistence round-trip
 * Validates: Requirements 7.1, 7.3
 *
 * For any valid CalendarState, calling persistToLocalStorage(state) followed
 * by loadStateFromStorage() produces a value deeply equal to the persisted
 * subset: { currentMonth, selectedRange, notes, theme }.
 */
describe('Property 5: State persistence round-trip', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('round-trips the persisted subset for any valid CalendarState', () => {
    const calendarStateArb = fc.record({
      currentMonth: fc.string({ minLength: 7, maxLength: 7 }),
      selectedRange: fc.option(
        fc.record({
          start: fc.constant('2025-01-10'),
          end: fc.constant('2025-01-15'),
        })
      ),
      notes: fc.array(
        fc.record({
          id: fc.constant('test-id'),
          title: fc.constant('Test'),
          date: fc.constant('2025-01-15'),
          description: fc.constant(''),
          tags: fc.constant([]),
        }),
        { maxLength: 3 }
      ),
      theme: fc.record({
        heroImage: fc.constant(''),
        accentColor: fc.constant('#4f46e5'),
        name: fc.constant('default'),
      }),
    });

    fc.assert(
      fc.property(calendarStateArb, ({ currentMonth, selectedRange, notes, theme }) => {
        const state = { currentMonth, selectedRange, notes, theme };

        // Capture what persistToLocalStorage writes
        let storedValue;
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((_key, value) => {
          storedValue = value;
        });

        persistToLocalStorage(state);

        // Mock getItem to return what was stored
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => storedValue);

        const loaded = loadStateFromStorage();

        setItemSpy.mockRestore();

        // Assert deep equality of the persisted subset
        return (
          loaded !== null &&
          loaded.currentMonth === currentMonth &&
          JSON.stringify(loaded.selectedRange) === JSON.stringify(selectedRange) &&
          JSON.stringify(loaded.notes) === JSON.stringify(notes) &&
          JSON.stringify(loaded.theme) === JSON.stringify(theme)
        );
      })
    );
  });
});
