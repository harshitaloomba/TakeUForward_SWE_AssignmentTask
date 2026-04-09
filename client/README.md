# Interactive Calendar Component

A wall-calendar-inspired React feature I built as part of the SWE assignment. It lets you pick date ranges, attach notes/milestones to them, and see everything in a side panel — all client-side, no backend needed.

---

## Why I made these choices

### React 19 + Vite
The project already had this set up, so I kept it. Vite's dev server is fast and the HMR makes iterating on UI stuff painless.

### Redux Toolkit for state
The calendar has a few moving parts — current month, selected range, notes list, theme — and they all need to talk to each other across components that aren't directly related. Redux Toolkit keeps that clean without a ton of boilerplate. I put everything in a single `calendarSlice` so the state shape is easy to reason about.

### Tailwind CSS v4
Already in the project. I used it for the responsive two-panel layout (side-by-side on desktop, stacked on mobile) and all the day cell visual states. No custom CSS files needed.

### localStorage persistence
No backend, so I needed somewhere to save state between page refreshes. I debounce the writes by 300ms so rapid clicks don't hammer it. If storage is unavailable (private browsing, quota exceeded), the app just keeps running in memory and shows a toast — it doesn't crash.

### Two-panel layout
Left panel = calendar grid + month navigation. Right panel = range summary + milestone list + note form. This mirrors how a physical wall calendar + sticky notes would work. On mobile they stack vertically.

### Property-based testing with fast-check
The date logic (grid building, range selection, day state computation) has a lot of edge cases — leap years, month boundaries, click order, etc. I used `fast-check` to throw random inputs at the pure utility functions rather than hand-writing every edge case. It caught a few things I wouldn't have thought to test manually.

### Component breakdown
I kept components small and focused. `CalendarGrid` just renders cells. `DayCell` just handles one tile's visual state. `AddNoteForm` just handles the form. This made them easy to test in isolation and easy to reason about when something broke.

---

## Project structure

```
swe_assignment/client/
├── src/
│   ├── features/calendar/
│   │   ├── components/         # CalendarGrid, DayCell, DurationNotesPanel, etc.
│   │   ├── __tests__/          # Unit + integration + PBT tests
│   │   ├── calendarSlice.js    # Redux state
│   │   ├── calendarUtils.js    # Pure utility functions
│   │   └── CalendarPage.jsx    # Top-level route component
│   ├── app/                    # Redux store setup
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## Running locally

**Prerequisites**: Node.js 18+ and npm

```bash
# from the repo root
cd swe_assignment/client

# install dependencies
npm install

# start the dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) and navigate to `/calendar`.

### Running tests

```bash
npm test
```

This runs Vitest in single-pass mode (no watch). Tests cover unit functions, component integration, and property-based tests via fast-check.

### Building for production

```bash
npm run build
```

Output goes to `dist/`. You can preview it with `npm run preview`.

---

## Notes

- State is saved to `localStorage` automatically — your notes and range selection persist across refreshes.
- The `/calendar` route is where the component lives. The home page (`/`) is separate.
- No environment variables are needed to run the calendar feature locally.
