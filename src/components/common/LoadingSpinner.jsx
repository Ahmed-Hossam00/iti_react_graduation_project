import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({
  size = 'md',
  message = null,
  fullPage = false,
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Loader2
        className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-[#0F766E]`}
      />
      {message && (
        <p className="mt-3 text-sm font-medium text-slate-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-xs">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
