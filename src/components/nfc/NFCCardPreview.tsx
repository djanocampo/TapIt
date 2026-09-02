import React, { useState } from 'react';
import { NFCCard, Profile } from '../../types';
import { Radio, Wifi, ShieldCheck, CheckCircle2, AlertCircle, ArrowUpRight, Cpu, Layers } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import tapItLogo from '../../assets/tapit-logo.png';

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
  const [isFlipped, setIsFlipped] = useState(false);

  // Normalize material: strictly Matte Black or Pure White (Ceramic)
  const isWhite = card.material === 'white-ceramic';

  return (
    <div className="space-y-4">
      {/* 3D Physical Card Face (Identical to Landing Page Hero Card) */}
      <div
        className="relative w-full aspect-[1.586/1] perspective-1000 select-none group cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        title="Click to flip card"
      >
        <div
          className={`relative w-full h-full rounded-2xl sm:rounded-3xl border transition-all duration-500 transform-style-3d shadow-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          } ${
            isWhite
              ? 'bg-gradient-to-tr from-[#ffffff] via-[#f8fafc] to-[#e8edf5] border-white/80 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.15)] text-slate-900'
              : 'bg-gradient-to-tr from-[#05070c] via-[#0d1017] to-[#161a24] border-slate-800/90 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9),0_0_20px_rgba(6,182,212,0.15)] text-slate-100'
          }`}
        >
          {/* ======================= FRONT FACE ======================= */}
          <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between backface-hidden rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Holographic Sheen Layer */}
            <div className="absolute inset-0 holo-sheen pointer-events-none opacity-35" />

            {/* Ambient Corner Highlight */}
            <div
              className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-xl pointer-events-none ${
                isWhite ? 'bg-cyan-500/10' : 'bg-cyan-500/15'
              }`}
            />

            {/* Top Bar: Contactless Wave + Status Pill */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-xl border flex items-center justify-center ${
                    isWhite
                      ? 'bg-black/5 border-black/10 text-slate-800'
                      : 'bg-white/5 border-white/10 text-cyan-400'
                  }`}
                >
                  <Wifi className="w-4 h-4 rotate-90" />
                </div>
                <span
                  className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
                    isWhite ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  NFC SMART CARD
                </span>
              </div>

              <div>
                {card.status === 'active' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active
                  </span>
                )}
                {card.status === 'unclaimed' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    Unclaimed
                  </span>
                )}
                {card.status === 'disabled' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    Disabled
                  </span>
                )}
              </div>
            </div>

            {/* CENTER: Prominent Official Transparent TapIt Logo */}
            <div className="relative z-10 my-auto flex items-center justify-center p-2">
              <img
                src={tapItLogo}
                alt="TapIt Logo"
                className={`max-h-12 sm:max-h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${
                  isWhite
                    ? 'drop-shadow-[0_6px_12px_rgba(0,0,0,0.2)]'
                    : 'drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]'
                }`}
              />
            </div>

            {/* Bottom Bar: Hardware Token and Card Material Name */}
            <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/10">
              <div>
                <p
                  className={`text-[10px] uppercase tracking-wider font-semibold ${
                    isWhite ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Hardware Finish
                </p>
                <p
                  className={`text-xs font-bold font-display ${
                    isWhite ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {isWhite ? 'Pure White Ceramic' : 'Matte Black Obsidian'}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`text-[10px] uppercase tracking-wider font-semibold ${
                    isWhite ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Dynamic Token
                </p>
                <p
                  className={`text-xs font-mono font-bold ${
                    isWhite ? 'text-cyan-700' : 'text-cyan-300'
                  }`}
                >
                  {card.cardToken}
                </p>
              </div>
            </div>
          </div>

          {/* ======================= BACK FACE ======================= */}
          <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between backface-hidden rotate-y-180 rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Holographic Sheen Layer */}
            <div className="absolute inset-0 holo-sheen pointer-events-none opacity-35" />

            <div className="flex items-center justify-between relative z-10">
              <span
                className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
                  isWhite ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                TapIt Contactless Identity
              </span>
              <span
                className={`text-[10px] font-bold ${
                  isWhite ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Tap anywhere to connect
              </span>
            </div>

            {/* Center Logo on Back */}
            <div className="relative z-10 my-auto flex items-center justify-center p-2 opacity-90">
              <img
                src={tapItLogo}
                alt="TapIt Logo"
                className={`max-h-10 sm:max-h-14 w-auto object-contain ${
                  isWhite
                    ? 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]'
                    : 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]'
                }`}
              />
            </div>

            <div className="text-center relative z-10 text-[11px] font-mono opacity-75">
              tapit.app/t/{card.cardToken}
            </div>
          </div>
        </div>
      </div>

      {/* Card Info Details (Assigned Profile & Total Taps) */}
      <div className="p-4 rounded-2xl bg-[#050c18] border border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Assigned Persona
            </span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              {profile ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{profile.name} ({profile.displayName})</span>
                </>
              ) : (
                <span className="text-slate-500 font-normal">Unassigned</span>
              )}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Tap Volume
            </span>
            <span className="text-sm font-mono font-bold text-cyan-300 mt-0.5 block">
              {formatNumber(card.taps)} taps
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {interactive && (
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
            {onTapSimulate && (
              <button
                type="button"
                onClick={onTapSimulate}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500/60 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Simulate Tap</span>
              </button>
            )}

            {onManage && (
              <button
                type="button"
                onClick={onManage}
                className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl transition flex items-center gap-1 ml-auto"
              >
                <span>Reassign Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
