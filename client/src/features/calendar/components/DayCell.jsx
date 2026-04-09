import { useState } from 'react';

const DayCell = ({ date, state, onClick, milestones = [], isWeekend = false }) => {
  const [pressed, setPressed] = useState(false);

  if (date === null) return <div className="h-20" aria-hidden="true" />;

  const day = date.getDate();
  const isStart = state === 'start';
  const isEnd = state === 'end';
  const isInRange = state === 'in-range';
  const isToday = state === 'today';
  const isSelected = isStart || isEnd;

  let bg = '';
  if (isInRange) bg = 'bg-indigo-50';
  if (isStart) bg = 'bg-indigo-50 rounded-l-2xl';
  if (isEnd) bg = 'bg-indigo-50 rounded-r-2xl';

  let circle = 'w-10 h-10 flex items-center justify-center rounded-full text-base font-semibold transition-all duration-150';
  if (isSelected) circle += ' bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-200';
  else if (isToday) circle += ' ring-2 ring-indigo-400 ring-offset-1 text-indigo-600 font-bold';
  else if (isInRange) circle += ' text-indigo-700';
  else if (isWeekend) circle += ' text-rose-400';
  else circle += ' text-gray-700';

  const handleClick = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 200);
    onClick(date);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={date.toDateString()}
      aria-pressed={isSelected}
      className={`relative h-20 flex flex-col items-center justify-start pt-2.5 focus:outline-none group ${bg}`}
      style={{ transform: pressed ? 'scale(0.88)' : 'scale(1)', transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)' }}
    >
      {!isSelected && (
        <span className="absolute inset-1 rounded-xl bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      )}

      <span className={`${circle} relative z-10`}>{day}</span>

      {milestones.length > 0 && (
        <span className="relative z-10 mt-0.5 flex gap-0.5">
          {milestones.slice(0, 3).map((_, i) => (
            <span key={i} className="w-1 h-1 rounded-full bg-indigo-400" />
          ))}
        </span>
      )}

      {isStart && <span className="absolute bottom-0.5 text-[7px] font-black tracking-widest text-indigo-500 uppercase z-10">Start</span>}
      {isEnd && <span className="absolute bottom-0.5 text-[7px] font-black tracking-widest text-indigo-500 uppercase z-10">End</span>}
    </button>
  );
};

export default DayCell;
