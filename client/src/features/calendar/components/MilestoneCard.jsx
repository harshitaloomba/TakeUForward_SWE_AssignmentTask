import React from 'react';

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
];

const MilestoneCard = React.memo(function MilestoneCard({ milestone, onDelete, index = 0 }) {
  const { id, title, date, rangeEnd, description, tags } = milestone;
  const grad = GRADIENTS[index % GRADIENTS.length];

  const fmt = (iso) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const dateLabel = rangeEnd && rangeEnd !== date
    ? `${fmt(date)} — ${fmt(rangeEnd)}`
    : fmt(date);

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.95)' }}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${grad}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-gray-800 leading-snug flex-1">{title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${grad}`}>
              {dateLabel}
            </span>
            <button
              type="button"
              onClick={() => onDelete(id)}
              aria-label={`Delete ${title}`}
              className="text-gray-300 hover:text-red-400 transition-colors hover:scale-110 active:scale-90"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {description && <p className="text-xs text-gray-500 leading-relaxed mb-2">{description}</p>}

        {tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <span key={tag} className="inline-block rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default MilestoneCard;
