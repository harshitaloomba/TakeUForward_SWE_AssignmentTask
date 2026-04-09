/**
 * Unit tests for AddNoteForm component.
 * Validates: Requirements 5.5, 6.1–6.4, 9.2
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddNoteForm from '../components/AddNoteForm.jsx';

const VALID_RANGE = { start: '2025-01-10', end: '2025-01-15' };

// ---------------------------------------------------------------------------
// Test 1: Submit button disabled when range is null (Req 5.5, 9.2)
// ---------------------------------------------------------------------------
describe('AddNoteForm — disabled state', () => {
  it('disables the submit button when range is null', () => {
    render(<AddNoteForm range={null} onSubmit={() => {}} />);
    const btn = screen.getByRole('button', { name: /save note/i });
    expect(btn).toBeDisabled();
  });

  it('enables the submit button when a valid range is provided', () => {
    render(<AddNoteForm range={VALID_RANGE} onSubmit={() => {}} />);
    const btn = screen.getByRole('button', { name: /save note/i });
    expect(btn).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Test 3: Validation prevents empty title (Req 6.1)
// ---------------------------------------------------------------------------
describe('AddNoteForm — validation', () => {
  it('does not call onSubmit when title is empty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<AddNoteForm range={VALID_RANGE} onSubmit={onSubmit} />);

    // Fill description but leave title empty
    await user.type(screen.getByLabelText(/description/i), 'Some description');
    await user.click(screen.getByRole('button', { name: /save note/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Test 4: onSubmit called with correct data on valid submission (Req 6.1–6.4)
// ---------------------------------------------------------------------------
describe('AddNoteForm — valid submission', () => {
  it('calls onSubmit with title, description, tags, and date on valid submit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<AddNoteForm range={VALID_RANGE} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'My Note');
    await user.type(screen.getByLabelText(/description/i), 'A description');
    await user.type(screen.getByLabelText(/tags/i), 'alpha, beta');
    await user.click(screen.getByRole('button', { name: /save note/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'My Note',
      description: 'A description',
      tags: ['alpha', 'beta'],
      date: VALID_RANGE.start,
    });
  });

  // ---------------------------------------------------------------------------
  // Test 5: Form clears after successful submission
  // ---------------------------------------------------------------------------
  it('clears the title input after a successful submission', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<AddNoteForm range={VALID_RANGE} onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Temporary Title');
    await user.click(screen.getByRole('button', { name: /save note/i }));

    expect(titleInput).toHaveValue('');
  });
});
