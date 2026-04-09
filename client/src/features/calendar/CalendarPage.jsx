import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadStateFromStorage } from './calendarUtils.js';
import { setCurrentMonth, setSelectedRange, setTheme } from './calendarSlice.js';
import CalendarPanel from './components/CalendarPanel.jsx';
import DurationNotesPanel from './components/DurationNotesPanel.jsx';

export default function CalendarPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    const now = new Date();
    dispatch(setCurrentMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`));

    const saved = loadStateFromStorage();
    if (!saved) return;
    if (saved.selectedRange) dispatch(setSelectedRange(saved.selectedRange));
    if (saved.theme) dispatch(setTheme(saved.theme));
  }, [dispatch]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)' }}>
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-enter { animation: fadeSlideDown 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .panel-enter { animation: fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .panel-enter-delay { animation: fadeSlideUp 0.6s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="page-enter border-b border-white/60 bg-white/70 backdrop-blur-md px-8 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Calendar
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8 max-w-7xl mx-auto">
        <div className="panel-enter flex-1 min-w-0">
          <CalendarPanel />
        </div>
        <div className="panel-enter-delay w-full md:w-96 shrink-0">
          <DurationNotesPanel />
        </div>
      </div>
    </div>
  );
}
