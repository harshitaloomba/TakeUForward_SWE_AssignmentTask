import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  useSelectedRange,
  useNotes,
  useCurrentMonth,
  addMilestone,
  deleteMilestone,
  setSelectedRange,
} from '../calendarSlice.js';
import { formatDateRange } from '../calendarUtils.js';
import MilestoneCard from './MilestoneCard.jsx';
import AddNoteForm from './AddNoteForm.jsx';

const CalIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function DurationNotesPanel() {
  const dispatch = useDispatch();
  const selectedRange = useSelectedRange();
  const notes = useNotes();
  const currentMonth = useCurrentMonth();

  const visibleNotes = notes.filter(n => n.date?.startsWith(currentMonth));

  const [showForm, setShowForm] = useState(false);
  const [dateError, setDateError] = useState('');

  const startValue = selectedRange?.start ?? '';
  const endValue = selectedRange?.end ?? '';

  function handleStartChange(e) {
    const v = e.target.value;
    if (!v) { dispatch(setSelectedRange(null)); return; }
    const end = endValue && endValue >= v ? endValue : v;
    dispatch(setSelectedRange({ start: v, end }));
    setDateError('');
  }

  function handleEndChange(e) {
    const v = e.target.value;
    if (!v) { dispatch(setSelectedRange(null)); return; }
    if (startValue && v < startValue) { setDateError('End must be on or after start.'); return; }
    dispatch(setSelectedRange({ start: startValue || v, end: v }));
    setDateError('');
  }

  function clearRange() {
    dispatch(setSelectedRange(null));
    setDateError('');
  }

  function handleAddNote(note) {
    dispatch(addMilestone(note));
    setShowForm(false);
  }

  const rangeLabel = selectedRange ? formatDateRange(selectedRange) : null;

  return (
    <>
      <style>{`
        @keyframes noteSlideIn {
          from { opacity: 0; transform: translateX(16px) scale(0.97); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .note-enter { animation: noteSlideIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes formDrop {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .form-enter { animation: formDrop 0.28s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes badgePop {
          0% { transform: scale(0.7); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .badge-pop { animation: badgePop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <CalIcon className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Duration Notes</h2>
        </div>

        <div
          className="rounded-2xl p-4 flex flex-col gap-3"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(99,102,241,0.08)' }}
        >
          <p className="text-[9px] font-black tracking-[0.2em] text-gray-400 uppercase">Select Date Range</p>

          <div className="flex flex-col gap-2">
            <label htmlFor="range-start" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <CalIcon className="w-3.5 h-3.5 text-indigo-400" /> Start Date
            </label>
            <input
              id="range-start"
              type="date"
              value={startValue}
              onChange={handleStartChange}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="range-end" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <CalIcon className="w-3.5 h-3.5 text-indigo-400" /> End Date
            </label>
            <input
              id="range-end"
              type="date"
              value={endValue}
              min={startValue || undefined}
              onChange={handleEndChange}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
            />
          </div>

          {dateError && <p className="text-xs text-red-500 font-medium">{dateError}</p>}

          {selectedRange && (
            <div className="badge-pop flex items-center justify-between pt-2 border-t border-gray-100">
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-md shadow-indigo-200"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {rangeLabel}
              </span>
              <button
                onClick={clearRange}
                className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {visibleNotes.length > 0 && (
          <div>
            <p className="text-[9px] font-black tracking-[0.2em] text-gray-400 uppercase mb-3 px-1">Notes</p>
            <div className="flex flex-col gap-2.5">
              {visibleNotes.map((note, i) => (
                <div key={note.id} className="note-enter" style={{ animationDelay: `${i * 0.05}s` }}>
                  <MilestoneCard milestone={note} onDelete={id => dispatch(deleteMilestone(id))} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}

        {showForm ? (
          <div className="form-enter">
            <AddNoteForm range={selectedRange} onSubmit={handleAddNote} onCancel={() => setShowForm(false)} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            disabled={!selectedRange}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: selectedRange ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#9ca3af',
              boxShadow: selectedRange ? '0 4px 20px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add Note to Duration
          </button>
        )}
      </div>
    </>
  );
}
