import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'neutral' | 'outline' | 'azure' | 'electric';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'cyan',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    cyan: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30',
    amber: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
    azure: 'bg-[#124294]/40 text-[#E0F2FE] border-[#1B55C6]/60',
    electric: 'bg-[#2563EB]/25 text-[#E0F2FE] border-[#38BDF8]/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    neutral: 'bg-[#0f1f42]/80 text-slate-300 border-[#1b2d55]',
    outline: 'bg-transparent text-slate-300 border-[#1b2d55]',
  };

  const sizes = {
    sm: 'text-[10px] font-semibold px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 rounded-lg gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border font-medium tracking-wide shrink-0',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
