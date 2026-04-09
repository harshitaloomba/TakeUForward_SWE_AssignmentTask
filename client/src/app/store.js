import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import authSlice from './authslice';
import roleSlice from './roleslice';
import calendarReducer from '../features/calendar/calendarSlice.js';
import { persistToLocalStorage } from '../features/calendar/calendarUtils.js';

// Debounce timer for persistence
let debounceTimer = null;

// Listener middleware for persisting calendar state
const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  predicate: (action) => action.type.startsWith('calendar/'),
  effect: (_action, listenerApi) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try {
        persistToLocalStorage(listenerApi.getState().calendar);
      } catch {
        // silently handle errors (Req 7.4, 9.3)
      }
    }, 300);
  },
});

export const store = configureStore({
  reducer: {
    auth: authSlice,
    role: roleSlice,
    calendar: calendarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(listenerMiddleware.middleware),
});
