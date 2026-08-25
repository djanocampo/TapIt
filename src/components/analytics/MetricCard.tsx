import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changePeriod?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'purple' | 'emerald' | 'amber';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changePeriod = 'vs last period',
  icon: Icon,
  variant = 'cyan',
}) => {
  const isPositive = change !== undefined && change >= 0;

  const variantStyles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25 shadow-glow-cyan',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/25 shadow-glow-purple',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-glow-emerald',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  };

  return (
    <div className="bg-[#0d1322] border border-slate-800/90 rounded-2xl p-5 shadow-xl hover:border-slate-700/80 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl border ${variantStyles[variant]} transition-transform group-hover:scale-110`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
          {typeof value === 'number' ? formatNumber(value) : value}
        </h3>

        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs font-semibold">
            {isPositive ? (
              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +{change}%
              </span>
            ) : (
              <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {change}%
              </span>
            )}
          </div>
        )}
      </div>

      {changePeriod && (
        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
          <span>{changePeriod}</span>
        </p>
      )}
    </div>
  );
};
