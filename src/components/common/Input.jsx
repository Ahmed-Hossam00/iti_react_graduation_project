import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    id,
    type = 'text',
    leftIcon: LeftIcon = null,
    rightIcon: RightIcon = null,
    required = false,
    className = '',
    inputClassName = '',
    ...props
  },
  ref
) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`block w-full rounded-none border text-sm transition-colors
            bg-white text-slate-900 placeholder:text-slate-400
            focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${LeftIcon ? 'pl-9' : 'pl-3'}
            ${RightIcon ? 'pr-9' : 'pr-3'}
            py-2
            ${
              error
                ? 'border-red-500 text-red-900 focus:border-red-600 focus:ring-red-600'
                : 'border-slate-300'
            }
            ${inputClassName}`}
          {...props}
        />

        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
