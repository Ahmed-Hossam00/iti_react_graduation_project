import React from 'react';
import { CalendarX } from 'lucide-react';

export function EmptyState({
  icon: Icon = CalendarX,
  title = 'No items found',
  description = 'There are currently no records to display.',
  action = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-none border border-dashed border-slate-300 bg-slate-50/50 my-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-none bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
