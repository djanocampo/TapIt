import React, { useState } from 'react';
import { useTapIt } from '../../store';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import tapItLogo from '../../assets/tapit-logo.png';

export interface CardVariant {
  id: 'matte-black' | 'white-ceramic';
  name: string;
  subtitle: string;
  material: 'matte-black' | 'white-ceramic';
  primaryColor: string;
  accentGlow: string;
  bgFront: string;
  bgBack: string;
  borderClass: string;
  logoGlowClass: string;
}

// Exactly two card colors: Black & White
const VARIANTS: CardVariant[] = [
  {
    id: 'matte-black',
    name: 'Matte Black',
    subtitle: 'Obsidian Edition',
    material: 'matte-black',
    primaryColor: '#06b6d4',
    accentGlow: 'rgba(6, 182, 212, 0.35)',
    bgFront: 'bg-gradient-to-tr from-[#05070c] via-[#0d1017] to-[#161a24]',
    bgBack: 'bg-gradient-to-tl from-[#05070c] via-[#0d1017] to-[#161a24]',
    borderClass: 'border-slate-800/90 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9),0_0_20px_rgba(6,182,212,0.15)]',
    logoGlowClass: 'drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]',
  },
  {
    id: 'white-ceramic',
    name: 'Pure White',
    subtitle: 'Ceramic Edition',
    material: 'white-ceramic',
    primaryColor: '#06b6d4',
    accentGlow: 'rgba(255, 255, 255, 0.35)',
    bgFront: 'bg-gradient-to-tr from-[#ffffff] via-[#f8fafc] to-[#e8edf5]',
    bgBack: 'bg-gradient-to-tl from-[#ffffff] via-[#f8fafc] to-[#e8edf5]',
    borderClass: 'border-white/90 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_25px_rgba(255,255,255,0.2)]',
    logoGlowClass: 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]',
  },
];

export const Rotating3DCardHero: React.FC = () => {
  const { openSimulator } = useTapIt();
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentVariant = VARIANTS[activeVariantIndex];

  const nextVariant = () => {
    setActiveVariantIndex((prev) => (prev + 1) % VARIANTS.length);
  };

  const prevVariant = () => {
    setActiveVariantIndex((prev) => (prev - 1 + VARIANTS.length) % VARIANTS.length);
  };

  return (
    <div className="relative w-full py-4 flex flex-col items-center justify-center">
      {/* Top Right Variant Selector (Black or White) */}
      <div className="w-full flex justify-center sm:justify-end mb-4 sm:mb-2 pr-0 sm:pr-8 z-20">
        <div className="flex flex-col items-center sm:items-end gap-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            {VARIANTS.map((variant, idx) => {
              const isSelected = activeVariantIndex === idx;
              return (
                <button
                  key={variant.id}
                  onClick={() => setActiveVariantIndex(idx)}
                  className={`group relative text-left p-2 sm:p-2.5 rounded-2xl border transition-all duration-300 backdrop-blur-xl ${isSelected
                    ? 'bg-[#0b172e]/95 border-cyan-400/80 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'bg-[#071124]/60 border-white/10 hover:border-white/20 hover:bg-[#0b172e]/70 opacity-75 hover:opacity-100'
                    }`}
                >
                  {/* Miniature Card Preview */}
                  <div
                    className={`w-14 sm:w-16 h-9 sm:h-10 rounded-lg p-1.5 border flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${variant.bgFront} ${variant.borderClass}`}
                  >
                    <img
                      src={tapItLogo}
                      alt="TapIt"
                      className="w-full h-full object-contain max-h-5 filter drop-shadow-sm"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[11px] sm:text-xs font-bold text-white truncate max-w-[70px] sm:max-w-[85px]">
                      {variant.name}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-cyan-400 font-mono font-medium">
                      {variant.subtitle}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[9px] font-black shadow-md">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Slider Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevVariant}
              className="w-8 h-8 rounded-full bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 text-xs active:scale-95 shadow-md"
              title="Previous card style"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextVariant}
              className="w-8 h-8 rounded-full bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 text-xs active:scale-95 shadow-md"
              title="Next card style"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-8 h-8 rounded-full bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 text-xs active:scale-95 shadow-md"
              title={isPaused ? 'Resume rotation' : 'Pause rotation'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3D ROTATING STAGE AREA */}
      <div className="relative w-full max-w-[560px] h-[300px] xs:h-[340px] sm:h-[400px] md:h-[440px] flex items-center justify-center perspective-1200 select-none overflow-visible">
        {/* Ambient Oceanic Glow behind card */}
        <div
          className="absolute inset-0 rounded-full blur-[90px] opacity-45 pointer-events-none transition-all duration-700"
          style={{ background: currentVariant.accentGlow }}
        />

        {/* Floating Glass Bubbles & Particles */}
        <div className="absolute -top-4 left-4 sm:left-10 w-12 sm:w-20 h-12 sm:h-20 rounded-full glass-bubble animate-bubble-float-1 z-20 pointer-events-none flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-white/60 blur-[1px] -translate-x-1.5 -translate-y-1.5" />
        </div>

        <div className="absolute top-1/2 -left-3 sm:-left-10 w-16 sm:w-24 h-16 sm:h-24 rounded-full glass-bubble animate-bubble-float-2 z-20 pointer-events-none flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white/70 blur-[1px] -translate-x-2 -translate-y-2" />
        </div>

        <div className="absolute -bottom-4 left-10 sm:left-24 w-10 sm:w-16 h-10 sm:h-16 rounded-full glass-bubble animate-bubble-float-3 z-20 pointer-events-none flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white/50 blur-[1px] -translate-x-1 -translate-y-1" />
        </div>

        <div className="absolute top-4 -right-2 sm:right-4 w-12 sm:w-20 h-12 sm:h-20 rounded-full glass-bubble animate-bubble-float-4 z-20 pointer-events-none flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-white/60 blur-[1px] -translate-x-1.5 -translate-y-1.5" />
        </div>

        <div className="absolute bottom-6 -right-3 sm:-right-8 w-18 sm:w-28 h-18 sm:h-28 rounded-full glass-bubble animate-bubble-float-5 z-20 pointer-events-none flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white/80 blur-[1px] -translate-x-3 -translate-y-3" />
        </div>

        {/* 3D CONTINUOUS 360-DEGREE ROTATING CARD WRAPPER */}
        <div
          className={`relative w-[270px] xs:w-[310px] sm:w-[380px] md:w-[420px] aspect-[1.586/1] transform-style-3d cursor-pointer ${isPaused ? '' : 'animate-spin-360-slow'
            }`}
          onClick={() => openSimulator()}
          title="Click to simulate live tap!"
        >
          {/* ===================== FRONT FACE ===================== */}
          <div
            className={`absolute inset-0 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border backface-hidden transform-style-3d overflow-hidden flex items-center justify-center ${currentVariant.bgFront
              } ${currentVariant.borderClass}`}
          >
            {/* Holographic Sheen Layer */}
            <div className="absolute inset-0 holo-sheen pointer-events-none opacity-40" />

            {/* Subtle Metallic Corner Highlight */}
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/[0.06] blur-xl pointer-events-none" />

            {/* Transparent TapIt Logo centered on FRONT */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
              <img
                src={tapItLogo}
                alt="TapIt Logo"
                className={`max-w-[100%] max-h-[100%] object-contain ${currentVariant.logoGlowClass} transition-transform duration-300`}
              />
            </div>
          </div>

          {/* ===================== BACK FACE (Rotated 180 deg) ===================== */}
          <div
            className={`absolute inset-0 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border backface-hidden transform-style-3d rotate-y-180 overflow-hidden flex items-center justify-center ${currentVariant.bgBack
              } ${currentVariant.borderClass}`}
          >
            {/* Holographic Sheen Layer */}
            <div className="absolute inset-0 holo-sheen pointer-events-none opacity-40" />

            {/* Subtle Metallic Corner Highlight */}
            <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-white/[0.06] blur-xl pointer-events-none" />

            {/* Transparent TapIt Logo centered on BACK (Back to Back) */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
              <img
                src={tapItLogo}
                alt="TapIt Logo"
                className={`max-w-[100%] max-h-[100%] object-contain ${currentVariant.logoGlowClass} transition-transform duration-300`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
