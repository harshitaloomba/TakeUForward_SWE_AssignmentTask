import { STORAGE_KEY } from './calendarTypes.js';

// local time ISO string to avoid UTC offset issues
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return toISO(a) === toISO(b);
}

export function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const cells = [];

  for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);
  for (let day = 1; day <= lastDay.getDate(); day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export function computeDayState(date, range, today) {
  if (range === null) return isSameDay(date, today) ? 'today' : 'default';

  const d = toISO(date);
  if (d === range.start && d === range.end) return 'start';
  if (d === range.start) return 'start';
  if (d === range.end) return 'end';
  if (d > range.start && d < range.end) return 'in-range';
  if (isSameDay(date, today)) return 'today';
  return 'default';
}

export function handleDayClick(clickedDate, currentRange) {
  if (clickedDate === null) return currentRange;

  const d = toISO(clickedDate);

  if (currentRange === null) return { start: d, end: d };

  if (currentRange.start === currentRange.end) {
    if (d < currentRange.start) return { start: d, end: currentRange.start };
    return { start: currentRange.start, end: d };
  }

  return { start: d, end: d };
}

export function isInRange(date, range) {
  const d = toISO(date);
  return d >= range.start && d <= range.end;
}

export function formatDateRange(range) {
  const fmt = (iso) => {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  if (range.start === range.end) return fmt(range.start);
  return `${fmt(range.start)} — ${fmt(range.end)}`;
}

export function generateId() {
  return crypto.randomUUID();
}

export function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistToLocalStorage(state) {
  const serialized = JSON.stringify({
    currentMonth: state.currentMonth,
    selectedRange: state.selectedRange,
    notes: state.notes,
    theme: state.theme,
  });
  localStorage.setItem(STORAGE_KEY, serialized);
}
