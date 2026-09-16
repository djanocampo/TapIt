import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle = true,
      id,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const resolvedPlaceholder = placeholder !== undefined ? placeholder : label;

    const isPassword = type === 'password';
    const computedType = isPassword ? (isPasswordVisible ? 'text' : 'password') : type;

    const renderedRightIcon =
      rightIcon ||
      (isPassword && showPasswordToggle ? (
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className="text-slate-400 hover:text-cyan-400 focus:outline-none transition p-1 rounded-lg hover:bg-white/[0.05]"
          tabIndex={-1}
          title={isPasswordVisible ? 'Hide password' : 'Show password'}
          aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
        >
          {isPasswordVisible ? (
            <Eye className="w-4 h-4 text-cyan-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-slate-400 hover:text-cyan-300" />
          )}
        </button>
      ) : null);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={computedType}
            ref={ref}
            placeholder={resolvedPlaceholder}
            className={cn(
              'w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition duration-150',
              'focus:border-cyan-500/80 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20',
              leftIcon && 'pl-10',
              renderedRightIcon && 'pr-10',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
          {renderedRightIcon && (
            <div className="absolute right-3.5 text-slate-400 flex items-center">
              {renderedRightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
