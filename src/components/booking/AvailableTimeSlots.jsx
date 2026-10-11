import React from 'react';
import { Clock, Sun, Moon, Check, AlertCircle } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

export function AvailableTimeSlots({
  slots = [],
  selectedSlot = null,
  onSelectSlot,
  loading = false,
  timezone = 'Africa/Cairo',
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-32 bg-slate-200 rounded-none animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-none animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="p-6 text-center rounded-none border border-dashed border-slate-300 bg-slate-50">
        <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-800">
          No Available Slots for this Date
        </h4>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          The clinic may be closed, fully booked, or outside the allowed booking window.
          Please choose a different date.
        </p>
      </div>
    );
  }

  // Format UTC ISO to local time string (e.g. 09:20 AM)
  const formatSlotTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  // Group slots into Morning and Afternoon
  const morningSlots = [];
  const afternoonSlots = [];

  slots.forEach((slot) => {
    const date = new Date(slot.startsAt);
    const hour = date.getHours();
    if (hour < 12) {
      morningSlots.push(slot);
    } else {
      afternoonSlots.push(slot);
    }
  });

  const renderSlotButton = (slot) => {
    const isSelected = selectedSlot?.startsAt === slot.startsAt;
    const timeFormatted = formatSlotTime(slot.startsAt);

    return (
      <button
        key={slot.startsAt}
        type="button"
        disabled={!slot.available}
        onClick={() => onSelectSlot(slot)}
        className={`group relative flex items-center justify-between p-3 rounded-none border text-sm font-medium transition-colors text-left cursor-pointer ${
          isSelected
            ? 'bg-[#0F766E] text-white border-[#0F766E] font-bold'
            : slot.available
            ? 'bg-white text-slate-800 border-slate-300 hover:border-[#0F766E] hover:bg-teal-50/40'
            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
        }`}
      >
        <span className="font-semibold">{timeFormatted}</span>
        {isSelected ? (
          <Check className="w-4 h-4 text-white shrink-0" />
        ) : (
          <span className="text-[10px] text-slate-400 group-hover:text-[#0F766E]">
            Select
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
        <span className="font-medium text-slate-700">
          {slots.filter((s) => s.available).length} slots open
        </span>
        <span>Times shown in clinic timezone ({timezone})</span>
      </div>

      {morningSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-3">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Morning</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {morningSlots.map(renderSlotButton)}
          </div>
        </div>
      )}

      {afternoonSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-3">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span>Afternoon & Evening</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {afternoonSlots.map(renderSlotButton)}
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailableTimeSlots;
