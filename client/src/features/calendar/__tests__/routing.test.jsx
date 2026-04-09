/**
 * Smoke tests for CalendarPage route wiring.
 * Validates: Requirements 1.1
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CalendarPage from '../CalendarPage.jsx';
import calendarReducer from '../calendarSlice.js';

function makeStore() {
  return configureStore({ reducer: { calendar: calendarReducer } });
}

// ---------------------------------------------------------------------------
// Test 1: CalendarPage mounts without crashing (direct render)
// ---------------------------------------------------------------------------

describe('CalendarPage — direct render smoke test', () => {
  it('mounts without crashing and shows basic content', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <CalendarPage />
      </Provider>
    );

    // Navigation buttons should be present
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();

    // Placeholder text when no range is selected
    expect(screen.getByText('Select a date range on the calendar')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Test 2: CalendarPage mounts via MemoryRouter at /calendar
// ---------------------------------------------------------------------------

describe('CalendarPage — MemoryRouter route wiring smoke test', () => {
  it('mounts without crashing when rendered at /calendar via MemoryRouter', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/calendar']}>
          <Routes>
            <Route path="/calendar" element={<CalendarPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // CalendarPage should render its content
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
  });
});
