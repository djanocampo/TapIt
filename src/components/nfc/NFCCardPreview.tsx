import React from 'react';
import { NFCCard, Profile } from '../../types';
import { Radio, Wifi, ShieldCheck, CheckCircle2, AlertCircle, ArrowUpRight, Cpu } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

interface NFCCardPreviewProps {
  card: NFCCard;
  profile?: Profile;
  onManage?: () => void;
  onTapSimulate?: () => void;
  interactive?: boolean;
}

export const NFCCardPreview: React.FC<NFCCardPreviewProps> = ({
  card,
  profile,
  onManage,
  onTapSimulate,
  interactive = true,
}) => {
  // Material themes
  const materialStyles = {
    'matte-black': 'bg-gradient-to-tr from-[#0b0c10] via-[#16181f] to-[#0f1118] text-slate-100 border-slate-700/60 shadow-2xl',
    'cyber-cyan': 'bg-gradient-to-tr from-[#041d24] via-[#083344] to-[#0e4e5f] text-cyan-50 border-cyan-500/50 shadow-glow-cyan',
    'gold-metal': 'bg-gradient-to-tr from-[#1f1606] via-[#382b0f] to-[#594212] text-amber-100 border-amber-500/50 shadow-2xl',
    'aurora-violet': 'bg-gradient-to-tr from-[#130722] via-[#2a0e4a] to-[#451368] text-purple-100 border-purple-500/50 shadow-glow-purple',
    'white-ceramic': 'bg-gradient-to-tr from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] text-slate-900 border-white/80 shadow-2xl',
  };

  const isLight = card.material === 'white-ceramic';

  return (
    <div className="relative group">
      {/* 3D Physical Card Body */}
      <div
        className={`relative w-full aspect-[1.586/1] rounded-2xl p-5 sm:p-6 border overflow-hidden transition-all duration-300 ${
          materialStyles[card.material] || materialStyles['matte-black']
        } ${interactive ? 'hover:-translate-y-1 hover:shadow-2xl' : ''}`}
      >
        {/* NFC Ripple Wave overlay */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full border border-white/5 pointer-events-none" />

        {/* Top bar: Chip + NFC Icon + Status */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            {/* NFC Microchip visual */}
            <div className={`w-10 h-8 rounded-lg border flex items-center justify-center p-1 relative overflow-hidden ${
              isLight ? 'bg-amber-100/80 border-amber-400 text-amber-800' : 'bg-amber-400/10 border-amber-400/40 text-amber-300'
            }`}>
              <div className="w-full h-full border border-current opacity-40 rounded grid grid-cols-2 gap-0.5 p-0.5">
                <div className="border-r border-b border-current"></div>
                <div className="border-b border-current"></div>
                <div className="border-r border-current"></div>
                <div></div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Wifi className={`w-5 h-5 rotate-90 ${isLight ? 'text-slate-700' : 'text-cyan-400'}`} />
              <span className={`text-[10px] font-mono uppercase tracking-widest font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                NFC
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {card.status === 'active' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active
              </span>
            )}
            {card.status === 'unclaimed' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full">
                Unclaimed
              </span>
            )}
            {card.status === 'disabled' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded-full">
                Disabled
              </span>
            )}
          </div>
        </div>

        {/* Middle: Brand Tag & Token */}
        <div className="my-auto pt-4 relative z-10">
          <p className={`text-xs font-mono font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-cyan-400/90'}`}>
            ID: tapit.app/t/{card.cardToken}
          </p>
          <h3 className={`text-base sm:text-lg font-extrabold truncate mt-0.5 font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {card.name}
          </h3>
        </div>

        {/* Bottom Bar: Assigned Profile & Total Taps */}
        <div className="flex items-end justify-between pt-4 relative z-10 border-t border-white/10">
          <div>
            <span className={`text-[10px] uppercase tracking-wider block font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Assigned Profile
            </span>
            <p className={`text-xs sm:text-sm font-bold truncate max-w-[160px] ${isLight ? 'text-slate-800' : 'text-white'}`}>
              {profile ? `💼 ${profile.name}` : 'Unassigned'}
            </p>
          </div>

          <div className="text-right">
            <span className={`text-[10px] uppercase tracking-wider block font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Total Taps
            </span>
            <p className={`text-sm sm:text-base font-extrabold font-mono ${isLight ? 'text-slate-950' : 'text-cyan-300'}`}>
              {formatNumber(card.taps)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Strip */}
      {interactive && (
        <div className="mt-3 flex items-center justify-between gap-2 px-1">
          {onTapSimulate && (
            <button
              onClick={onTapSimulate}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500/60 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Simulate Tap</span>
            </button>
          )}

          {onManage && (
            <button
              onClick={onManage}
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl transition flex items-center gap-1 ml-auto"
            >
              <span>Manage Card</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
