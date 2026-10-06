import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'subtle' | 'gradient' | 'interactive';
  glow?: 'cyan' | 'purple' | 'emerald' | 'none';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', glow = 'none', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[#0a142c] border border-[#1b2d55] rounded-2xl shadow-xl',
      glass: 'bits-glass rounded-2xl shadow-2xl',
      subtle: 'bg-[#081329]/60 border border-[#182c58]/40 rounded-2xl backdrop-blur-md',
      gradient: 'bg-gradient-to-b from-[#0f1f42] to-[#0a142c] border border-[#1b2d55] rounded-2xl shadow-xl',
      interactive: 'bg-[#0a142c]/90 border border-[#1b2d55] rounded-2xl shadow-xl hover:border-[#38BDF8]/50 hover:shadow-glow-cyan hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
    };

    const glows = {
      cyan: 'hover:shadow-glow-cyan hover:border-[#38BDF8]/50',
      purple: 'hover:shadow-glow-purple hover:border-purple-500/40',
      emerald: 'hover:shadow-glow-emerald hover:border-emerald-500/40',
      amber: 'hover:shadow-glow-amber hover:border-[#F59E0B]/50',
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
