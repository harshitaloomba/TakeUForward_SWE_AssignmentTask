import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  useCurrentMonth,
  useSelectedRange,
  useNotes,
  setCurrentMonth,
  setSelectedRange,
} from '../calendarSlice.js';
import { handleDayClick } from '../calendarUtils.js';
import CalendarGrid from './CalendarGrid.jsx';

const MONTHS = [
  { image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1400&q=90', subtitle: 'New Beginnings',  gradient: 'from-slate-900/85 via-blue-900/55 to-transparent',   kenX: '-2%', kenY: '-1%' },
  { image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1400&q=90', subtitle: 'Love & Light',     gradient: 'from-rose-900/85 via-pink-800/55 to-transparent',     kenX: '1%',  kenY: '-2%' },
  { image: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=1400&q=90', subtitle: 'Spring Awakening', gradient: 'from-emerald-900/75 via-green-800/45 to-transparent',  kenX: '-1%', kenY: '-2%' },
  { image: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1400&q=90', subtitle: 'April Showers',    gradient: 'from-teal-900/85 via-cyan-800/55 to-transparent',      kenX: '2%',  kenY: '-1%' },
  { image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=1400&q=90', subtitle: 'In Full Bloom',    gradient: 'from-yellow-900/75 via-amber-800/45 to-transparent',   kenX: '-2%', kenY: '-2%' },
  { image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=90', subtitle: 'Endless Summer',   gradient: 'from-sky-900/85 via-blue-800/55 to-transparent',        kenX: '1%',  kenY: '-1%' },
  { image: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1400&q=90', subtitle: 'Midsummer Nights', gradient: 'from-indigo-900/90 via-purple-900/65 to-transparent',   kenX: '-1%', kenY: '-2%' },
  { image: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1400&q=90', subtitle: 'Golden Days',      gradient: 'from-orange-900/85 via-amber-800/55 to-transparent',   kenX: '2%',  kenY: '-1%' },
  { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&q=90', subtitle: 'Turning Leaves',   gradient: 'from-orange-900/90 via-red-800/65 to-transparent',     kenX: '-2%', kenY: '-2%' },
  { image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1400&q=90', subtitle: 'Harvest Moon',     gradient: 'from-stone-900/90 via-orange-900/65 to-transparent',   kenX: '1%',  kenY: '-1%' },
  { image: 'https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=1400&q=90', subtitle: 'Still & Grateful', gradient: 'from-gray-900/90 via-slate-800/65 to-transparent',     kenX: '-1%', kenY: '-2%' },
  { image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1400&q=90', subtitle: 'Winter Magic',     gradient: 'from-blue-900/90 via-indigo-900/65 to-transparent',    kenX: '2%',  kenY: '-2%' },
];

const SLIDE_DURATION = 480;

function toMonthStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function parseMonth(str) {
  const [y, m] = str.split('-').map(Number);
  return { year: y, month: m - 1 };
}

function CalendarCard({ monthStr, selectedRange, onDayClick, milestones }) {
  const { year, month } = parseMonth(monthStr);
  const cfg = MONTHS[month] ?? MONTHS[0];
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' });
  const today = new Date();

  return (
    <div
      className="w-full flex flex-col"
      style={{ background: 'rgba(255,255,255,0.93)', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.95)' }}
    >
      <div className="relative h-80 shrink-0 overflow-hidden">
        <img
          key={cfg.image}
          src={cfg.image}
          alt={monthName}
          loading="lazy"
          className="ken-burns w-full h-full object-cover"
          style={{ '--ken-x': cfg.kenX, '--ken-y': cfg.kenY }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${cfg.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        <div className="absolute top-0 left-0 right-0 flex justify-around px-5 pointer-events-none z-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <svg key={i} width="18" height="32" viewBox="0 0 18 32" fill="none">
              <ellipse cx="9" cy="9" rx="7" ry="4.5" fill="url(#greyGrad)" stroke="#c8c8c8" strokeWidth="1" />
              <path d="M2 9 Q2 20 9 22 Q16 24 16 9" fill="none" stroke="#d8d8d8" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="9" cy="9" rx="4" ry="2" fill="none" stroke="#f2f2f2" strokeWidth="0.8" opacity="0.9" />
              <ellipse cx="9" cy="22" rx="5" ry="2.5" fill="#aaa" opacity="0.18" />
              <defs>
                <radialGradient id="greyGrad" cx="38%" cy="32%" r="65%">
                  <stop offset="0%" stopColor="#f7f7f7" />
                  <stop offset="50%" stopColor="#dedede" />
                  <stop offset="100%" stopColor="#b8b8b8" />
                </radialGradient>
              </defs>
            </svg>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 p-7">
          <p className="text-[10px] font-bold tracking-[0.25em] text-white/60 uppercase mb-2">{cfg.subtitle}</p>
          <h2 className="text-6xl font-black leading-none tracking-tight drop-shadow-lg text-white">
            {monthName}
          </h2>
          <p className="text-white/70 text-xl font-light mt-1 tracking-widest">{year}</p>
        </div>
      </div>

      <div className="px-6 pt-5 pb-3 flex items-center gap-3 border-b border-gray-100/80 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center shadow-md shadow-indigo-200 shrink-0">
          <span className="text-[8px] font-black tracking-widest text-white/80 uppercase leading-none">
            {today.toLocaleDateString('en-US', { month: 'short' })}
          </span>
          <span className="text-base font-black text-white leading-none">{today.getDate()}</span>
        </div>
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase">Today</p>
          <p className="text-sm font-bold text-gray-800">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="px-6 pb-8 pt-2">
        <CalendarGrid
          year={year}
          month={month}
          selectedRange={selectedRange}
          onDayClick={onDayClick}
          milestones={milestones}
        />
      </div>
    </div>
  );
}

const CalendarPanel = () => {
  const dispatch = useDispatch();
  const currentMonth = useCurrentMonth();
  const selectedRange = useSelectedRange();
  const notes = useNotes();

  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [nextMonthStr, setNextMonthStr] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('next');
  const timer = useRef(null);

  if (!animating && displayMonth !== currentMonth) {
    setDisplayMonth(currentMonth);
  }

  function slide(newMonth, dir) {
    if (animating) return;
    clearTimeout(timer.current);
    setDirection(dir);
    setNextMonthStr(newMonth);
    setAnimating(true);
    timer.current = setTimeout(() => {
      dispatch(setCurrentMonth(newMonth));
      setDisplayMonth(newMonth);
      setNextMonthStr(null);
      setAnimating(false);
    }, SLIDE_DURATION);
  }

  const { year, month } = parseMonth(displayMonth);

  const onDayClick = (date) => dispatch(setSelectedRange(handleDayClick(date, selectedRange)));

  return (
    <>
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1.0) translate(0, 0); }
          100% { transform: scale(1.35) translate(var(--ken-x, -2%), var(--ken-y, -2%)); }
        }
        .ken-burns {
          animation: kenBurns 20s ease-in-out infinite alternate;
          transform-origin: center center;
        }

        @keyframes slideOutLeft  { from { transform: translateX(0); }     to { transform: translateX(-100%); } }
        @keyframes slideOutRight { from { transform: translateX(0); }     to { transform: translateX(100%); } }
        @keyframes slideInRight  { from { transform: translateX(100%); }  to { transform: translateX(0); } }
        @keyframes slideInLeft   { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        .card-out-next { animation: slideOutLeft  ${SLIDE_DURATION}ms cubic-bezier(0.76,0,0.24,1) forwards; }
        .card-out-prev { animation: slideOutRight ${SLIDE_DURATION}ms cubic-bezier(0.76,0,0.24,1) forwards; }
        .card-in-next  { animation: slideInRight  ${SLIDE_DURATION}ms cubic-bezier(0.76,0,0.24,1) forwards; }
        .card-in-prev  { animation: slideInLeft   ${SLIDE_DURATION}ms cubic-bezier(0.76,0,0.24,1) forwards; }

        @keyframes navPulse {
          0%   { box-shadow: 0 0 0 0    rgba(255,255,255,0.55); }
          70%  { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0    rgba(255,255,255,0); }
        }
        .nav-btn:not(:disabled):hover { animation: navPulse 0.65s ease-out; }
      `}</style>

      <div className="relative rounded-3xl shadow-2xl" style={{ overflow: 'hidden' }}>
        <div
          className={animating ? (direction === 'next' ? 'card-out-next' : 'card-out-prev') : ''}
          style={{ position: animating ? 'absolute' : 'relative', inset: 0, zIndex: 1, willChange: 'transform' }}
        >
          <CalendarCard monthStr={displayMonth} selectedRange={selectedRange} onDayClick={onDayClick} milestones={notes} />
        </div>

        {animating && nextMonthStr && (
          <div
            className={direction === 'next' ? 'card-in-next' : 'card-in-prev'}
            style={{ position: 'relative', zIndex: 2, willChange: 'transform' }}
          >
            <CalendarCard monthStr={nextMonthStr} selectedRange={selectedRange} onDayClick={onDayClick} milestones={notes} />
          </div>
        )}

        <div className="absolute z-30 flex gap-2" style={{ top: 'calc(20rem - 3.5rem)', right: '1.5rem' }}>
          <button
            onClick={() => slide(toMonthStr(new Date(year, month - 1, 1)), 'prev')}
            disabled={animating}
            aria-label="Previous month"
            className="nav-btn w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all duration-150 hover:scale-110 active:scale-90 disabled:opacity-30 select-none"
            style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            ‹
          </button>
          <button
            onClick={() => slide(toMonthStr(new Date(year, month + 1, 1)), 'next')}
            disabled={animating}
            aria-label="Next month"
            className="nav-btn w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all duration-150 hover:scale-110 active:scale-90 disabled:opacity-30 select-none"
            style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
};

export default CalendarPanel;
