import React from 'react';

export function Skeleton({ className = '', variant = 'text', count = 1 }) {
  const baseClasses = 'animate-pulse bg-slate-200/80 rounded-none';

  const variantClasses = {
    text: 'h-4 w-full rounded-none',
    title: 'h-6 w-3/4 rounded-none',
    avatar: 'w-10 h-10 rounded-none',
    button: 'h-10 w-28 rounded-none',
    card: 'h-36 w-full rounded-none',
  };

  if (count > 1) {
    return (
      <div className="space-y-2.5 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full divide-y divide-slate-200">
      <div className="py-3 px-4 flex gap-4 bg-slate-50">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded-none w-1/4 animate-pulse" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="py-4 px-4 flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 bg-slate-100 rounded-none w-1/4 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
