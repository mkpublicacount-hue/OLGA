import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { 
  persianMonths, 
  getJalaliMonthLength, 
  getJalaliFirstWeekDay,
  toEnglishDigits,
  formatNumber
} from '../utils';

interface DatePickerProps {
  day: number;
  month: number;
  year: number;
  onChange: (d: number, m: number, y: number) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ day, month, year, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);
  const [viewMonth, setViewMonth] = useState(month);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync view state if external props change dramatically (optional, mostly for init)
  useEffect(() => {
    if (!isOpen) {
      setViewYear(year);
      setViewMonth(month);
    }
  }, [isOpen, year, month]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleDayClick = (d: number) => {
    onChange(d, viewMonth, viewYear);
    setIsOpen(false);
  };

  const handleToday = () => {
    // We need to calculate today, but to keep it simple and stateless regarding "today" logic here,
    // we can rely on parent or utils. Since utils has it:
    // This button resets VIEW to selected date usually, or resets to today.
    // Let's make it "Go to Selected"
    setViewYear(year);
    setViewMonth(month);
  };

  const daysInMonth = getJalaliMonthLength(viewYear, viewMonth);
  const startDayOfWeek = getJalaliFirstWeekDay(viewYear, viewMonth); // 0=Sat, 6=Fri

  const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  // Grid generation
  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="text-sm font-medium text-gray-700 mb-1 block">تاریخ</label>
      
      {/* Input Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2.5 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-400 transition-colors"
      >
        <span className="text-gray-900 font-mono">
          {year}/{month < 10 ? '0' + month : month}/{day < 10 ? '0' + day : day}
        </span>
        <CalendarIcon size={18} className="text-gray-500" />
      </div>

      {/* Popup Calendar */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header */}
          <div className="bg-slate-800 text-white p-3 flex items-center justify-between">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-700 rounded-full transition-colors">
              <ChevronRight size={20} />
            </button>
            <div className="font-bold text-sm">
              {persianMonths[viewMonth - 1]} {formatNumber(viewYear)}
            </div>
            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-700 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-3">
            {/* Week Days */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(wd => (
                <div key={wd} className="text-center text-xs text-gray-400 font-bold">{wd}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {blanks.map(b => (
                <div key={`blank-${b}`} />
              ))}
              {days.map(d => {
                const isSelected = d === day && viewMonth === month && viewYear === year;
                return (
                  <button
                    key={d}
                    onClick={(e) => { e.preventDefault(); handleDayClick(d); }}
                    className={`
                      h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-all
                      ${isSelected 
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }
                    `}
                  >
                    {formatNumber(d)}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t p-2 flex justify-center bg-gray-50">
            <button 
              onClick={(e) => { e.preventDefault(); handleToday(); }}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              نمایش تاریخ انتخابی
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
