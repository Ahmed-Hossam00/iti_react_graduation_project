import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const icons = {
    danger: <AlertCircle className="w-6 h-6 text-red-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    primary: <HelpCircle className="w-6 h-6 text-[#0F766E]" />,
  };

  const buttonVariants = {
    danger: 'danger',
    warning: 'secondary',
    primary: 'primary',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center sm:text-left sm:flex-row sm:items-start gap-4">
        <div className="shrink-0 p-2.5 bg-slate-100 border border-slate-300">
          {icons[variant] || icons.primary}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{title}</h4>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant={buttonVariants[variant] || 'primary'}
          onClick={onConfirm}
          loading={loading}
          className="w-full sm:w-auto"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
