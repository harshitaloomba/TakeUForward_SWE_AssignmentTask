import { useState } from 'react';
import {
  MILESTONE_TITLE_MAX_LENGTH,
  MILESTONE_DESCRIPTION_MAX_LENGTH,
  MILESTONE_TAGS_MAX_COUNT,
  MILESTONE_TAG_MAX_LENGTH,
} from '../calendarTypes';

export default function AddNoteForm({ range, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState({});

  const isDisabled = range === null;

  function parseTags(raw) {
    return raw
      .split(',')
      .map(t => t.trim().replace(/<[^>]*>/g, ''))
      .filter(Boolean)
      .slice(0, MILESTONE_TAGS_MAX_COUNT)
      .map(t => t.slice(0, MILESTONE_TAG_MAX_LENGTH));
  }

  function validate() {
    const e = {};
    if (!title.trim()) e.title = 'Title is required.';
    else if (title.length > MILESTONE_TITLE_MAX_LENGTH) e.title = `Max ${MILESTONE_TITLE_MAX_LENGTH} chars.`;
    if (description.length > MILESTONE_DESCRIPTION_MAX_LENGTH) e.description = `Max ${MILESTONE_DESCRIPTION_MAX_LENGTH} chars.`;
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isDisabled) return;
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ title: title.trim(), description, tags: parseTags(tagsInput), date: range.start, rangeEnd: range.end });
    setTitle(''); setDescription(''); setTagsInput(''); setErrors({});
  }

  const inputCls = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all placeholder:text-gray-300';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 24px rgba(99,102,241,0.1)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
        <h3 className="text-sm font-bold text-gray-700">New Note</h3>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="note-title" className="text-xs font-semibold text-gray-500">Title *</label>
        <input
          id="note-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={MILESTONE_TITLE_MAX_LENGTH}
          placeholder="Note title"
          className={inputCls}
        />
        {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="note-description" className="text-xs font-semibold text-gray-500">Description</label>
        <textarea
          id="note-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={MILESTONE_DESCRIPTION_MAX_LENGTH}
          placeholder="Optional description"
          rows={2}
          className={`${inputCls} resize-none`}
        />
        {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="note-tags" className="text-xs font-semibold text-gray-500">Tags</label>
        <input
          id="note-tags"
          type="text"
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="priority, design, sprint"
          className={inputCls}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isDisabled}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
        >
          Save Note
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
