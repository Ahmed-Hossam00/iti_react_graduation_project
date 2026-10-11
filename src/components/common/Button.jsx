import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer rounded-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#0F766E] hover:bg-[#115E59] text-white border border-[#0F766E] focus:ring-[#0F766E]',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 focus:ring-slate-400',
    outline:
      'border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 focus:ring-[#0F766E]',
    danger:
      'bg-red-600 hover:bg-red-700 text-white border border-red-600 focus:ring-red-500',
    dangerOutline:
      'border border-red-300 bg-white hover:bg-red-50 text-red-700 focus:ring-red-500',
    ghost:
      'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent focus:ring-slate-300',
    white:
      'bg-white text-[#0F766E] hover:bg-slate-50 font-semibold border border-slate-200 focus:ring-white',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
    </button>
  );
}

export default Button;
