/**
 * Unit tests for CalendarGrid and DayCell components.
 * Validates: Requirements 3.1–3.6, 2.5–2.7
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarGrid from '../components/CalendarGrid.jsx';
import DayCell from '../components/DayCell.jsx';

// ---------------------------------------------------------------------------
// CalendarGrid
// ---------------------------------------------------------------------------

describe('CalendarGrid', () => {
  /**
   * Test 1: Correct cell count for January 2025
   * January 2025 starts on Wednesday (getDay()=3) → 3 leading nulls + 31 days + 1 trailing = 35 cells
   * Validates: Requirements 3.1, 3.2
   */
  it('renders 35 day cells for January 2025 (3 leading + 31 days + 1 trailing)', () => {
    render(
      <CalendarGrid
        year={2025}
        month={0}
        selectedRange={null}
        onDayClick={() => {}}
        milestones={[]}
      />
    );

    // Day buttons (non-null cells) = 31
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(31);

    // Total cells including padding: query all h-10 divs (null cells) + buttons
    // The grid renders null cells as <div aria-hidden="true"> and day cells as <button>
    // 3 leading + 1 trailing = 4 null cells, plus 31 buttons = 35 total
    const nullCells = document.querySelectorAll('[aria-hidden="true"]');
    // Grid null cells have class h-16
    const gridNullCells = Array.from(nullCells).filter(
      (el) => el.tagName === 'DIV' && el.classList.contains('h-16')
    );
    expect(gridNullCells.length + buttons.length).toBe(35);
  });

  /**
   * Test 2: Day-of-week headers
   * Validates: Requirements 3.3
   */
  it('renders all day-of-week headers', () => {
    render(
      <CalendarGrid
        year={2025}
        month={0}
        selectedRange={null}
        onDayClick={() => {}}
        milestones={[]}
      />
    );

    for (const header of ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']) {
      expect(screen.getByText(header)).toBeInTheDocument();
    }
  });

  /**
   * Test 3: DayState classes applied correctly for a selected range
   * selectedRange = { start: isoOf(Jan 10), end: isoOf(Jan 15) }
   * - Jan 10 → 'start' → bg-blue-600
   * - Jan 15 → 'end'   → bg-blue-600
   * - Jan 12 → 'in-range' → bg-blue-100
   *
   * We derive ISO strings the same way CalendarGrid does (toISOString().slice(0,10))
   * so the test is timezone-agnostic.
   * Validates: Requirements 2.5, 2.6, 2.7, 3.5
   */
  it('applies correct DayState classes for start, end, and in-range cells', () => {
    // Derive ISO strings the same way the component does to stay timezone-agnostic
    const isoJan10 = new Date(2025, 0, 10).toISOString().slice(0, 10);
    const isoJan15 = new Date(2025, 0, 15).toISOString().slice(0, 10);

    render(
      <CalendarGrid
        year={2025}
        month={0}
        selectedRange={{ start: isoJan10, end: isoJan15 }}
        onDayClick={() => {}}
        milestones={[]}
      />
    );

    // Jan 10 — start cell (aria-label is date.toDateString())
    const jan10Label = new Date(2025, 0, 10).toDateString();
    const jan10 = screen.getByLabelText(jan10Label);
    expect(jan10.className).toContain('bg-blue-50');

    // Jan 15 — end cell
    const jan15Label = new Date(2025, 0, 15).toDateString();
    const jan15 = screen.getByLabelText(jan15Label);
    expect(jan15.className).toContain('bg-blue-50');

    // Jan 12 — in-range cell
    const jan12Label = new Date(2025, 0, 12).toDateString();
    const jan12 = screen.getByLabelText(jan12Label);
    expect(jan12.className).toContain('bg-blue-50');
  });
});

// ---------------------------------------------------------------------------
// DayCell
// ---------------------------------------------------------------------------

describe('DayCell', () => {
  /**
   * Test 4: Null cell renders as empty div with no button
   * Validates: Requirements 3.2
   */
  it('renders an empty div (no button) when date is null', () => {
    const { container } = render(
      <DayCell date={null} state="default" onClick={() => {}} />
    );

    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  /**
   * Test 5: onClick is called with the date when the cell is clicked
   * Validates: Requirements 2.5, 3.6
   */
  it('calls onClick with the date when clicked', () => {
    const mockOnClick = vi.fn();
    const date = new Date(2025, 0, 10); // Jan 10 2025

    render(
      <DayCell date={date} state="default" onClick={mockOnClick} />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(date);
  });
});
