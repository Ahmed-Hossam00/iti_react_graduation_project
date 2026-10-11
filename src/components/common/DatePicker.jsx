import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export function DatePicker({
  label = 'Select Date',
  value = '',
  onChange,
  minDate = '',
  maxDate = '',
  required = false,
  error = null,
  helperText = null,
  showQuickPicks = true,
  className = '',
}) {
  const getTodayStr = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const todayStr = getTodayStr();
  const effectiveMin = minDate || todayStr;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-none">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <CalendarIcon className="w-4 h-4" />
        </div>

        <input
          type="date"
          value={value}
          min={effectiveMin}
          max={maxDate || undefined}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full rounded-none border text-sm transition-colors pl-9 pr-3.5 py-2.5
            bg-white text-slate-900
            focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]
            ${error ? 'border-red-300 text-red-900 focus:ring-red-500' : 'border-slate-300'}
          `}
        />
      </div>

      {showQuickPicks && (
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => onChange(todayStr)}
            className={`text-xs px-2.5 py-1 rounded-none border font-medium transition-colors cursor-pointer ${
              value === todayStr
                ? 'bg-[#0F766E] text-white border-[#0F766E]'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onChange(getTomorrowStr())}
            className={`text-xs px-2.5 py-1 rounded-none border font-medium transition-colors cursor-pointer ${
              value === getTomorrowStr()
                ? 'bg-[#0F766E] text-white border-[#0F766E]'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            Tomorrow
          </button>
        </div>
      )}

      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export default DatePicker;
