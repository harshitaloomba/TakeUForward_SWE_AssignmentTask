import { createSlice } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import {
  DEFAULT_THEME_CONFIG,
  MILESTONE_TITLE_MAX_LENGTH,
  MILESTONE_DESCRIPTION_MAX_LENGTH,
  MILESTONE_TAGS_MAX_COUNT,
  MILESTONE_TAG_MAX_LENGTH,
} from './calendarTypes.js';
import { generateId } from './calendarUtils.js';

const now = new Date();

const initialState = {
  currentMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  selectedRange: null,
  notes: [],
  theme: DEFAULT_THEME_CONFIG,
  rangeExpanded: false,
};

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '');
}

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setCurrentMonth(state, action) {
      state.currentMonth = action.payload;
    },

    setSelectedRange(state, action) {
      state.selectedRange = action.payload;
    },

    addMilestone(state, action) {
      const { title = '', description = '', tags = [], ...rest } = action.payload;

      if (!title || title.trim().length === 0 || title.length > MILESTONE_TITLE_MAX_LENGTH) return;
      if (description.length > MILESTONE_DESCRIPTION_MAX_LENGTH) return;
      if (tags.length > MILESTONE_TAGS_MAX_COUNT) return;

      const sanitizedTags = [];
      for (const tag of tags) {
        const stripped = stripHtml(String(tag));
        if (stripped.length > MILESTONE_TAG_MAX_LENGTH) return;
        sanitizedTags.push(stripped);
      }

      state.notes.push({ ...rest, title, description, tags: sanitizedTags, id: generateId() });
    },

    deleteMilestone(state, action) {
      state.notes = state.notes.filter((note) => note.id !== action.payload);
    },

    setRangeExpanded(state, action) {
      state.rangeExpanded = action.payload;
    },

    setTheme(state, action) {
      state.theme = action.payload;
    },
  },
});

export const {
  setCurrentMonth,
  setSelectedRange,
  addMilestone,
  deleteMilestone,
  setRangeExpanded,
  setTheme,
} = calendarSlice.actions;

export default calendarSlice.reducer;

export const useCalendarState = () => useSelector((state) => state.calendar);
export const useSelectedRange = () => useSelector((state) => state.calendar.selectedRange);
export const useNotes = () => useSelector((state) => state.calendar.notes);
export const useCurrentMonth = () => useSelector((state) => state.calendar.currentMonth);
export const useTheme = () => useSelector((state) => state.calendar.theme);
export const useRangeExpanded = () => useSelector((state) => state.calendar.rangeExpanded);
