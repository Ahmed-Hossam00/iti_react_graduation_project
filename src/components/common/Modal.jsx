import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-none bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidth} p-6 border-2 border-slate-800`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-200">
            <div>
              {title && (
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-xs text-slate-500">{description}</p>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-none p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
