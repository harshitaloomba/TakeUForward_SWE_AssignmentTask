import { useMemo } from 'react';
import { buildCalendarGrid, computeDayState } from '../calendarUtils.js';
import DayCell from './DayCell.jsx';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarGrid = ({ year, month, selectedRange, onDayClick, milestones }) => {
  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month]);
  const today = new Date();

  return (
    <div>
      <div className="grid grid-cols-7 mb-3">
        {DAYS.map((d, i) => (
          <div key={d} className={`flex items-center justify-center text-[10px] font-bold tracking-widest py-3 ${i === 0 || i === 6 ? 'text-rose-400' : 'text-gray-400'}`}>
            {d.toUpperCase()}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          if (cell === null) return <div key={`pad-${idx}`} className="h-20" aria-hidden="true" />;

          const y = cell.getFullYear();
          const mo = cell.getMonth();
          const d = cell.getDate();
          const iso = `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

          return (
            <DayCell
              key={iso}
              date={cell}
              state={computeDayState(cell, selectedRange, today)}
              onClick={onDayClick}
              milestones={milestones.filter(m => m.date === iso)}
              isWeekend={cell.getDay() === 0 || cell.getDay() === 6}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
