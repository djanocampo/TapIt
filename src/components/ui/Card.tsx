import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'subtle' | 'gradient' | 'interactive';
  glow?: 'cyan' | 'purple' | 'emerald' | 'none';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', glow = 'none', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[#0d1322] border border-slate-800/80 rounded-2xl shadow-xl',
      glass: 'glass-panel rounded-2xl shadow-2xl',
      subtle: 'bg-slate-900/40 border border-slate-800/50 rounded-2xl backdrop-blur-sm',
      gradient: 'bg-gradient-to-b from-slate-900/90 to-[#0d1322] border border-slate-800 rounded-2xl shadow-xl',
      interactive: 'bg-[#0d1322]/90 border border-slate-800/80 rounded-2xl shadow-xl hover:border-slate-700 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer',
    };

    const glows = {
      cyan: 'hover:shadow-glow-cyan hover:border-cyan-500/40',
      purple: 'hover:shadow-glow-purple hover:border-purple-500/40',
      emerald: 'hover:shadow-glow-emerald hover:border-emerald-500/40',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], glows[glow], 'relative overflow-hidden', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
