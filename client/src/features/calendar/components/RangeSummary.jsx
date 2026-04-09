import { formatDateRange } from '../calendarUtils.js';

/**
 * RangeSummary — displays the active date range label and an expand/collapse toggle.
 *
 * @param {{ range: {start: string, end: string}|null, expanded: boolean, onToggle: () => void }} props
 */
export default function RangeSummary({ range, expanded, onToggle }) {
  const label = range ? formatDateRange(range) : null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
      <span className={`text-sm font-medium ${range ? 'text-gray-900' : 'text-gray-400'}`}>
        {label ?? 'Select a date range'}
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse notes panel' : 'Expand notes panel'}
        className="ml-3 p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span aria-hidden="true">{expanded ? '▲' : '▼'}</span>
      </button>
    </div>
  );
}
