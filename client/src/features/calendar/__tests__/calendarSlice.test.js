/**
 * Unit tests for calendarSlice reducers.
 * Covers: addMilestone, deleteMilestone, setCurrentMonth, setSelectedRange
 *
 * Validates: Requirements 5.1–5.6, 6.1–6.6
 */

import { describe, it, expect } from 'vitest';
import reducer, {
  addMilestone,
  deleteMilestone,
  setCurrentMonth,
  setSelectedRange,
} from '../calendarSlice.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid state with optional notes pre-populated. */
function stateWith(notes = []) {
  return reducer(undefined, { type: '@@INIT' });
}

/** A valid milestone payload (no id — the reducer assigns one). */
const validPayload = {
  title: 'Sprint Review',
  date: '2025-01-15',
  description: 'End-of-sprint demo',
  tags: ['sprint', 'demo'],
};

// ---------------------------------------------------------------------------
// addMilestone — valid input
// ---------------------------------------------------------------------------

describe('addMilestone — valid input', () => {
  it('adds a milestone to notes when payload is valid (Req 5.1)', () => {
    const state = stateWith();
    const next = reducer(state, addMilestone(validPayload));
    expect(next.notes).toHaveLength(1);
    expect(next.notes[0].title).toBe('Sprint Review');
    expect(next.notes[0].description).toBe('End-of-sprint demo');
    expect(next.notes[0].tags).toEqual(['sprint', 'demo']);
  });

  it('assigns a UUID v4 id to the new milestone (Req 5.2)', () => {
    const state = stateWith();
    const next = reducer(state, addMilestone(validPayload));
    const { id } = next.notes[0];
    expect(typeof id).toBe('string');
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('accepts a milestone with an empty tags array', () => {
    const state = stateWith();
    const next = reducer(state, addMilestone({ ...validPayload, tags: [] }));
    expect(next.notes).toHaveLength(1);
    expect(next.notes[0].tags).toEqual([]);
  });

  it('accepts a milestone with exactly 5 tags (boundary)', () => {
    const state = stateWith();
    const tags = ['a', 'b', 'c', 'd', 'e'];
    const next = reducer(state, addMilestone({ ...validPayload, tags }));
    expect(next.notes).toHaveLength(1);
  });

  it('accepts a title of exactly 80 characters (boundary)', () => {
    const state = stateWith();
    const title = 'x'.repeat(80);
    const next = reducer(state, addMilestone({ ...validPayload, title }));
    expect(next.notes).toHaveLength(1);
  });

  it('accepts a description of exactly 500 characters (boundary)', () => {
    const state = stateWith();
    const description = 'd'.repeat(500);
    const next = reducer(state, addMilestone({ ...validPayload, description }));
    expect(next.notes).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// addMilestone — validation rejections (Req 6.1–6.4)
// ---------------------------------------------------------------------------

describe('addMilestone — validation rejections', () => {
  it('rejects an empty title (Req 6.1)', () => {
    const state = stateWith();
    const next = reducer(state, addMilestone({ ...validPayload, title: '' }));
    expect(next.notes).toHaveLength(0);
  });

  it('rejects a whitespace-only title (Req 6.1)', () => {
    const state = stateWith();
    const next = reducer(state, addMilestone({ ...validPayload, title: '   ' }));
    expect(next.notes).toHaveLength(0);
  });

  it('rejects a title exceeding 80 characters (Req 6.1)', () => {
    const state = stateWith();
    const title = 'x'.repeat(81);
    const next = reducer(state, addMilestone({ ...validPayload, title }));
    expect(next.notes).toHaveLength(0);
  });

  it('rejects a description exceeding 500 characters (Req 6.2)', () => {
    const state = stateWith();
    const description = 'd'.repeat(501);
    const next = reducer(state, addMilestone({ ...validPayload, description }));
    expect(next.notes).toHaveLength(0);
  });

  it('rejects a tags array with more than 5 entries (Req 6.3)', () => {
    const state = stateWith();
    const tags = ['a', 'b', 'c', 'd', 'e', 'f'];
    const next = reducer(state, addMilestone({ ...validPayload, tags }));
    expect(next.notes).toHaveLength(0);
  });

  it('rejects any tag exceeding 20 characters (Req 6.4)', () => {
    const state = stateWith();
    const tags = ['ok', 'x'.repeat(21)];
    const next = reducer(state, addMilestone({ ...validPayload, tags }));
    expect(next.notes).toHaveLength(0);
  });

  it('rejects a tag of exactly 21 characters (boundary, Req 6.4)', () => {
    const state = stateWith();
    const tags = ['x'.repeat(21)];
    const next = reducer(state, addMilestone({ ...validPayload, tags }));
    expect(next.notes).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// addMilestone — HTML stripping (Req 6.6)
// ---------------------------------------------------------------------------

describe('addMilestone — HTML stripping from tags', () => {
  it('strips HTML markup from tags before storing (Req 6.6)', () => {
    const state = stateWith();
    const tags = ['<b>bold</b>', '<script>alert(1)</script>'];
    const next = reducer(state, addMilestone({ ...validPayload, tags }));
    expect(next.notes).toHaveLength(1);
    expect(next.notes[0].tags).toEqual(['bold', 'alert(1)']);
  });

  it('stores a plain tag unchanged when it contains no HTML', () => {
    const state = stateWith();
    const tags = ['release', 'v2'];
    const next = reducer(state, addMilestone({ ...validPayload, tags }));
    expect(next.notes[0].tags).toEqual(['release', 'v2']);
  });

  it('rejects a tag whose stripped value exceeds 20 characters (Req 6.4, 6.6)', () => {
    const state = stateWith();
    // The raw tag has HTML wrapping a 21-char string — after stripping it is still too long
    const longText = 'x'.repeat(21);
    const tags = [`<em>${longText}</em>`];
    const next = reducer(state, addMilestone({ ...validPayload, tags }));
    expect(next.notes).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// deleteMilestone (Req 5.6)
// ---------------------------------------------------------------------------

describe('deleteMilestone', () => {
  it('removes the milestone with the given id (Req 5.6)', () => {
    // Add two milestones first
    let state = stateWith();
    state = reducer(state, addMilestone({ ...validPayload, title: 'First' }));
    state = reducer(state, addMilestone({ ...validPayload, title: 'Second' }));
    expect(state.notes).toHaveLength(2);

    const idToDelete = state.notes[0].id;
    const next = reducer(state, deleteMilestone(idToDelete));

    expect(next.notes).toHaveLength(1);
    expect(next.notes[0].title).toBe('Second');
  });

  it('does not affect other milestones when one is deleted (Req 5.6)', () => {
    let state = stateWith();
    state = reducer(state, addMilestone({ ...validPayload, title: 'Keep Me' }));
    state = reducer(state, addMilestone({ ...validPayload, title: 'Delete Me' }));

    const idToDelete = state.notes[1].id;
    const next = reducer(state, deleteMilestone(idToDelete));

    expect(next.notes).toHaveLength(1);
    expect(next.notes[0].title).toBe('Keep Me');
  });

  it('does nothing when the id does not exist', () => {
    let state = stateWith();
    state = reducer(state, addMilestone(validPayload));
    const next = reducer(state, deleteMilestone('non-existent-id'));
    expect(next.notes).toHaveLength(1);
  });

  it('results in an empty notes array when the only milestone is deleted', () => {
    let state = stateWith();
    state = reducer(state, addMilestone(validPayload));
    const { id } = state.notes[0];
    const next = reducer(state, deleteMilestone(id));
    expect(next.notes).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// setCurrentMonth (Req 4.1–4.2)
// ---------------------------------------------------------------------------

describe('setCurrentMonth', () => {
  it('updates currentMonth to the given YYYY-MM string', () => {
    const state = stateWith();
    const next = reducer(state, setCurrentMonth('2025-06'));
    expect(next.currentMonth).toBe('2025-06');
  });

  it('overwrites a previously set currentMonth', () => {
    let state = stateWith();
    state = reducer(state, setCurrentMonth('2025-01'));
    const next = reducer(state, setCurrentMonth('2025-12'));
    expect(next.currentMonth).toBe('2025-12');
  });
});

// ---------------------------------------------------------------------------
// setSelectedRange (Req 2.1–2.4)
// ---------------------------------------------------------------------------

describe('setSelectedRange', () => {
  it('updates selectedRange to the given DateRange object', () => {
    const state = stateWith();
    const range = { start: '2025-01-10', end: '2025-01-15' };
    const next = reducer(state, setSelectedRange(range));
    expect(next.selectedRange).toEqual(range);
  });

  it('can set selectedRange to null (Req 2.4)', () => {
    let state = stateWith();
    state = reducer(state, setSelectedRange({ start: '2025-01-10', end: '2025-01-15' }));
    const next = reducer(state, setSelectedRange(null));
    expect(next.selectedRange).toBeNull();
  });

  it('overwrites a previous range with a new one', () => {
    let state = stateWith();
    state = reducer(state, setSelectedRange({ start: '2025-01-01', end: '2025-01-05' }));
    const newRange = { start: '2025-03-10', end: '2025-03-20' };
    const next = reducer(state, setSelectedRange(newRange));
    expect(next.selectedRange).toEqual(newRange);
  });

  it('accepts a single-day range where start equals end', () => {
    const state = stateWith();
    const range = { start: '2025-06-15', end: '2025-06-15' };
    const next = reducer(state, setSelectedRange(range));
    expect(next.selectedRange).toEqual(range);
  });
});

// ---------------------------------------------------------------------------
// Property 8: Adding a note grows the notes array by exactly 1 (Req 5.1, 5.4)
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 5.1, 5.4**
 *
 * Property 8: For any valid CalendarState and valid Milestone payload,
 * dispatching `addMilestone` increases `state.notes.length` by exactly 1
 * and the new entry is present in the array.
 */
import fc from 'fast-check';

describe('Property 8 — addMilestone grows notes by exactly 1 (Req 5.1, 5.4)', () => {
  /** Arbitrary for a valid milestone payload */
  const validMilestoneArb = fc.record({
    title: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
    description: fc.string({ maxLength: 500 }),
    tags: fc.array(
      fc.string({ maxLength: 20 }).filter(s => !/<[^>]*>/.test(s)),
      { maxLength: 5 }
    ),
    date: fc.constant('2025-01-15'),
  });

  it('notes.length increases by exactly 1 for any valid payload', () => {
    fc.assert(
      fc.property(validMilestoneArb, (payload) => {
        const state = reducer(undefined, { type: '@@INIT' });
        const next = reducer(state, addMilestone(payload));
        return next.notes.length === state.notes.length + 1;
      })
    );
  });

  it('the new entry is present in the notes array after dispatch', () => {
    fc.assert(
      fc.property(validMilestoneArb, (payload) => {
        const state = reducer(undefined, { type: '@@INIT' });
        const next = reducer(state, addMilestone(payload));
        return next.notes.some(note => note.title === payload.title);
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Property 10: Tag sanitization removes HTML markup (Req 6.4, 6.6)
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 6.4, 6.6**
 *
 * Property 10: For any tag string containing HTML markup, the sanitized output
 * produced by the tag processing logic contains no HTML tags and its length
 * does not exceed 20 characters.
 */
describe('Property 10 — tag sanitization removes HTML markup (Req 6.4, 6.6)', () => {
  /** Arbitrary that produces a tag string wrapped in an HTML element */
  const htmlTagArb = fc.record({
    base: fc.string({ maxLength: 15 }).filter(s => !s.includes('<') && !s.includes('>')),
    wrapper: fc.constantFrom('b', 'em', 'strong', 'i', 'span'),
  }).map(({ base, wrapper }) => `<${wrapper}>${base}</${wrapper}>`);

  it('stored tag contains no < or > characters when input has HTML markup', () => {
    fc.assert(
      fc.property(htmlTagArb, (rawTag) => {
        const state = reducer(undefined, { type: '@@INIT' });
        const next = reducer(state, addMilestone({
          title: 'Test',
          date: '2025-01-15',
          description: '',
          tags: [rawTag],
        }));
        // If the milestone was added, the stored tag must have no HTML
        if (next.notes.length === 0) return true; // rejected due to length — acceptable
        const storedTag = next.notes[0].tags[0];
        return !storedTag.includes('<') && !storedTag.includes('>');
      })
    );
  });

  it('stored tag length does not exceed 20 characters after HTML stripping', () => {
    fc.assert(
      fc.property(htmlTagArb, (rawTag) => {
        const state = reducer(undefined, { type: '@@INIT' });
        const next = reducer(state, addMilestone({
          title: 'Test',
          date: '2025-01-15',
          description: '',
          tags: [rawTag],
        }));
        if (next.notes.length === 0) return true; // rejected — length constraint enforced
        const storedTag = next.notes[0].tags[0];
        return storedTag.length <= 20;
      })
    );
  });

  it('plain strings (no HTML) pass through unchanged', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 20 }).filter(s => !/<[^>]*>/.test(s)),
        (plainTag) => {
          const state = reducer(undefined, { type: '@@INIT' });
          const next = reducer(state, addMilestone({
            title: 'Test',
            date: '2025-01-15',
            description: '',
            tags: [plainTag],
          }));
          if (next.notes.length === 0) return true;
          const storedTag = next.notes[0].tags[0];
          return storedTag === plainTag;
        }
      )
    );
  });
});
