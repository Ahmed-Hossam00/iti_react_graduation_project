import React, { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    id,
    rows = 3,
    required = false,
    className = '',
    textareaClassName = '',
    ...props
  },
  ref
) {
  const textareaId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        className={`block w-full rounded-none border text-sm transition-colors py-2 px-3
          bg-white text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]
          disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
          ${
            error
              ? 'border-red-500 text-red-900 focus:border-red-600 focus:ring-red-600'
              : 'border-slate-300'
          }
          ${textareaClassName}`}
        {...props}
      />

      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Textarea;
