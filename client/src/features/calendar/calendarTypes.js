export const DAY_STATES = ['default', 'start', 'end', 'in-range', 'today', 'has-milestone'];

export const DEFAULT_DATE_RANGE = { start: '', end: '' };

export const DEFAULT_MILESTONE = {
  id: '',
  title: '',
  date: '',
  description: '',
  tags: [],
};

export const DEFAULT_THEME_CONFIG = {
  heroImage: '',
  accentColor: '#4f46e5',
  name: 'default',
};

export const DEFAULT_CALENDAR_STATE = {
  currentMonth: '',
  selectedRange: null,
  notes: [],
  theme: DEFAULT_THEME_CONFIG,
  rangeExpanded: false,
};

export const MILESTONE_TITLE_MAX_LENGTH = 80;
export const MILESTONE_DESCRIPTION_MAX_LENGTH = 500;
export const MILESTONE_TAGS_MAX_COUNT = 5;
export const MILESTONE_TAG_MAX_LENGTH = 20;
export const STORAGE_KEY = 'kiro_calendar_state';
