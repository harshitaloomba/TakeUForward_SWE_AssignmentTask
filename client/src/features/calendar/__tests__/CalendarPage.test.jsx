/**
 * Integration tests for CalendarPage.
 * Validates: Requirements 1.1–1.5, 2.1–2.8, 4.1–4.4, 5.1–5.4, 7.1–7.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import CalendarPage from '../CalendarPage.jsx';
import calendarReducer from '../calendarSlice.js';
import { persistToLocalStorage } from '../calendarUtils.js';
import { STORAGE_KEY } from '../calendarTypes.js';

// ---------------------------------------------------------------------------
// Helper: create a fresh store with the listener middleware for persistence
// ---------------------------------------------------------------------------

function makeStore() {
  let debounceTimer = null;
  const listenerMiddleware = createListenerMiddleware();

  listenerMiddleware.startListening({
    predicate: (action) => action.type.startsWith('calendar/'),
    effect: (_action, listenerApi) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          persistToLocalStorage(listenerApi.getState().calendar);
        } catch {
          // silently ignore
        }
      }, 300);
    },
  });

  return configureStore({
    reducer: { calendar: calendarReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(listenerMiddleware.middleware),
  });
}

// Clear localStorage before each test so CalendarPage's useEffect doesn't
// restore stale persisted state that would override the fresh store.
beforeEach(() => {
  localStorage.clear();
});

function renderCalendarPage(store) {
  return render(
    <Provider store={store}>
      <CalendarPage />
    </Provider>
  );
}

// ---------------------------------------------------------------------------
// Derive expected month label from the current date (matches slice initialState)
// ---------------------------------------------------------------------------

function currentMonthLabel() {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long' });
}

function nextMonthLabel() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Test 1: CalendarPage renders both CalendarPanel and DurationNotesPanel
// ---------------------------------------------------------------------------

describe('CalendarPage — renders both panels', () => {
  it('renders month navigation buttons and the placeholder text', () => {
    const store = makeStore();
    renderCalendarPage(store);

    // Navigation buttons (← and →)
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();

    // DurationNotesPanel placeholder when no range is selected
    expect(screen.getByText('Select a date range on the calendar')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Test 2: Two day clicks update selectedRange in the store
// ---------------------------------------------------------------------------

describe('CalendarPage — two day clicks update selectedRange', () => {
  it('updates store selectedRange after clicking two day cells', () => {
    const store = makeStore();
    renderCalendarPage(store);

    // Find day buttons by their aria-label (date.toDateString())
    // We need two days that exist in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const day10 = new Date(year, month, 10);
    const day15 = new Date(year, month, 15);

    const btn10 = screen.getByRole('button', { name: day10.toDateString() });
    const btn15 = screen.getByRole('button', { name: day15.toDateString() });

    fireEvent.click(btn10);
    fireEvent.click(btn15);

    const { selectedRange } = store.getState().calendar;
    expect(selectedRange).not.toBeNull();
    expect(selectedRange.start).toBe(day10.toISOString().slice(0, 10));
    expect(selectedRange.end).toBe(day15.toISOString().slice(0, 10));
  });
});

// ---------------------------------------------------------------------------
// Test 3: Month navigation re-renders grid with new month header
// ---------------------------------------------------------------------------

describe('CalendarPage — month navigation', () => {
  it('changes the month header when the next month button is clicked', () => {
    const store = makeStore();
    renderCalendarPage(store);

    // Verify current month is shown
    expect(screen.getByText(currentMonthLabel())).toBeInTheDocument();

    // Click next month
    fireEvent.click(screen.getByRole('button', { name: /next month/i }));

    // The store should now reflect the next month
    const { currentMonth } = store.getState().calendar;
    const [yearStr, monthStr] = currentMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const expectedLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
      month: 'long',
    });

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Test 4: AddNoteForm submission adds milestone to the rendered list
// ---------------------------------------------------------------------------

describe('CalendarPage — AddNoteForm submission adds milestone', () => {
  it('shows the milestone title in the rendered output after form submission', async () => {
    const store = makeStore();
    renderCalendarPage(store);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Click a day to set a range (single-day range is enough to enable the form)
    const day5 = new Date(year, month, 5);
    fireEvent.click(screen.getByRole('button', { name: day5.toDateString() }));

    // Click "Add Note to Duration" to show the form
    const addBtn = screen.getByRole('button', { name: /add note to duration/i });
    fireEvent.click(addBtn);

    // Fill in the title field
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'My Integration Milestone' } });

    // Submit the form
    const submitBtn = screen.getByRole('button', { name: /save note/i });
    fireEvent.click(submitBtn);

    // Assert the milestone title appears in the rendered output
    await waitFor(() => {
      expect(screen.getAllByText('My Integration Milestone').length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// Test 5: localStorage is written after state changes (debounced)
// ---------------------------------------------------------------------------

describe('CalendarPage — localStorage persistence', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls localStorage.setItem with the correct key after a day click', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const store = makeStore();
    renderCalendarPage(store);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day3 = new Date(year, month, 3);

    fireEvent.click(screen.getByRole('button', { name: day3.toDateString() }));

    // Advance timers past the 300ms debounce
    vi.advanceTimersByTime(300);

    expect(setItemSpy).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.any(String)
    );

    setItemSpy.mockRestore();
  });
});
