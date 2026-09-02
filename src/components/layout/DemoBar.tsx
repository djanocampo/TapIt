import React from 'react';
import { useTapIt } from '../../store';
import { Radio, ShieldCheck, Sparkles, Smartphone, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoBar: React.FC = () => {
  const { currentRole, openSimulator, resetAllData, activeProfile, currentUser } = useTapIt();

  return (
    <aside aria-label="Demo Bar" className="bg-[#050a17] border-b border-cyan-500/20 text-xs px-3 sm:px-6 py-2 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 shadow-lg shadow-black/40">
      {/* Left: Active User & Tag */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 font-bold tracking-wide uppercase text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full text-[10px]">
          <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
          <span>Interactive Demo</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Logged in as: <strong className="text-white">{currentUser.name}</strong> (Administrator)</span>
        </div>
      </div>

      {/* Right: Simulator trigger & Quick Links */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => openSimulator()}
          className="flex items-center gap-1.5 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-400/40 text-cyan-300 px-3 py-1 rounded-full font-bold transition shadow-sm"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>NFC Simulator</span>
        </button>

        <Link
          to={`/@${activeProfile.slug}`}
          target="_blank"
          className="text-slate-300 hover:text-cyan-400 hidden md:flex items-center gap-1 px-2.5 py-1 hover:bg-slate-800/60 rounded-full transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live Profile</span>
        </Link>

        <button
          onClick={resetAllData}
          title="Reset database to default seed state"
          className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800/60 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
