import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from './Button';

export function ErrorMessage({
  title = 'Something went wrong',
  error,
  onRetry = null,
  onDismiss = null,
  className = '',
}) {
  if (!error) return null;

  const message =
    typeof error === 'string'
      ? error
      : error?.message || 'An unexpected error occurred. Please try again.';

  return (
    <div
      className={`rounded-none border border-red-300 bg-red-50 p-4 text-red-900 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <h4 className="text-sm font-semibold text-red-800">{title}</h4>}
          <p className="text-sm text-red-700 mt-0.5 leading-relaxed">{message}</p>

          {onRetry && (
            <div className="mt-3">
              <Button
                type="button"
                variant="dangerOutline"
                size="sm"
                icon={RefreshCw}
                onClick={onRetry}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-none"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
