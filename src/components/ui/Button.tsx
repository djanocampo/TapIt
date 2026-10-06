import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow' | 'accent';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#070a13] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';
    
    const variants = {
      primary: 'bg-gradient-to-r from-[#2563EB] to-[#1B55C6] hover:from-[#38BDF8] hover:to-[#2563EB] text-white font-bold shadow-lg shadow-[#124294]/40 border border-[#38BDF8]/30 focus:ring-[#38BDF8] cursor-pointer',
      secondary: 'bg-[#0a142c] hover:bg-[#0f1f42] text-white border border-[#1B55C6]/40 hover:border-[#38BDF8]/50 shadow-md focus:ring-[#38BDF8] cursor-pointer',
      outline: 'border border-[#38BDF8]/50 text-[#38BDF8] hover:bg-[#38BDF8]/10 hover:border-[#38BDF8] focus:ring-[#38BDF8] cursor-pointer',
      ghost: 'text-slate-300 hover:text-white hover:bg-[#124294]/20 focus:ring-[#38BDF8] cursor-pointer',
      danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 focus:ring-rose-400 cursor-pointer',
      glow: 'bg-gradient-to-r from-[#38BDF8] via-[#2563EB] to-[#124294] hover:brightness-110 text-white font-extrabold shadow-glow-blue border border-[#E0F2FE]/40 focus:ring-[#38BDF8] cursor-pointer',
      accent: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#F59E0B] text-slate-950 font-bold shadow-lg shadow-amber-500/30 border border-amber-300/50 focus:ring-amber-400 cursor-pointer',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1 rounded-lg gap-1.5',
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-sm px-4 py-2 rounded-xl gap-2',
      lg: 'text-base px-6 py-3 rounded-xl gap-2.5',
      icon: 'p-2 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
