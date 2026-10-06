import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'pills' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'pills',
}) => {
  if (variant === 'underline') {
    return (
      <div className={cn('flex border-b border-[#1b2d55] space-x-4 overflow-x-auto no-scrollbar', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative pb-3 pt-2 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer',
                isActive ? 'text-[#38BDF8] font-bold' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#0a142c] text-slate-300 font-mono border border-[#1b2d55]">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#38BDF8] to-[#2563EB]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex p-1 bg-[#081329] border border-[#1b2d55] rounded-xl space-x-1 overflow-x-auto no-scrollbar', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap z-10 cursor-pointer',
              isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#2563EB]/30 to-[#124294]/40 border border-[#38BDF8]/40 shadow-sm z-[-1]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                isActive ? 'bg-[#38BDF8] text-slate-950 font-bold' : 'bg-[#0a142c] text-slate-400 border border-[#1b2d55]'
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
