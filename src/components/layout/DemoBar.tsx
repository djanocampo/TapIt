import React from 'react';
import { useTapIt } from '../../store';
import { UserRole } from '../../types';
import { Radio, ShieldAlert, Sparkles, Smartphone, RotateCcw, User, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoBar: React.FC = () => {
  const { currentRole, setRole, openSimulator, resetAllData, activeProfile } = useTapIt();

  return (
    <aside aria-label="Demo Bar" className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-cyan-500/20 text-xs px-3 sm:px-6 py-2 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 shadow-lg shadow-black/40">
      {/* Left: Role Switcher & Tag */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 font-bold tracking-wide uppercase text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md text-[10px]">
          <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
          <span>Interactive Demo Mode</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
          <span className="text-[11px] text-slate-400 px-2 font-medium hidden sm:inline">Role:</span>
          {(['user', 'guest', 'admin'] as UserRole[]).map((r) => {
            const isActive = currentRole === r;
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all duration-150 flex items-center gap-1 ${
                  isActive
                    ? r === 'admin'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : r === 'user'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'admin' && <ShieldAlert className="w-3 h-3" />}
                {r === 'user' && <User className="w-3 h-3" />}
                {r === 'guest' && <Eye className="w-3 h-3" />}
                {r === 'user' ? 'Djan (User)' : r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Simulator trigger & Quick Links */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => openSimulator()}
          className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/40 text-cyan-300 px-2.5 py-1 rounded-lg font-medium transition duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-semibold">Tap NFC Simulator</span>
        </button>

        <Link
          to={`/@${activeProfile.slug}`}
          target="_blank"
          className="text-slate-300 hover:text-cyan-400 hidden md:flex items-center gap-1 px-2 py-1 hover:bg-slate-800/60 rounded-md transition"
        >
          <Smartphone className="w-3 h-3 text-slate-400" />
          <span>Live Profile</span>
        </Link>

        <button
          onClick={() => {
            if (window.confirm('Reset all demo profiles, cards, and analytics back to defaults?')) {
              resetAllData();
            }
          }}
          title="Reset state to initial mock data"
          className="text-slate-400 hover:text-rose-400 p-1 hover:bg-slate-800/60 rounded-md transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
