import React from 'react';
import { ProfileThemeConfig, ThemeStyle, ButtonStyle, FontStyle } from '../../types';
import { THEME_PRESETS } from '../../data/themes';
import { Check, Sparkles, Layout, Type, Palette, Paintbrush, Pipette } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: ProfileThemeConfig;
  onSelectTheme: (theme: ProfileThemeConfig) => void;
  onUpdateStyleOptions: (options: { buttonStyle?: ButtonStyle; fontStyle?: FontStyle; accentColor?: string; badgeBg?: string }) => void;
}

const ACCENT_PALETTE = [
  { name: 'Cyan Neon', hex: '#06b6d4' },
  { name: 'Electric Sky', hex: '#38bdf8' },
  { name: 'Cyber Purple', hex: '#a855f7' },
  { name: 'Royal Indigo', hex: '#6366f1' },
  { name: 'Rose Pink', hex: '#f43f5e' },
  { name: 'Amber Gold', hex: '#fbbf24' },
  { name: 'Emerald Glow', hex: '#10b981' },
  { name: 'Sunset Orange', hex: '#f97316' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Slate Gray', hex: '#94a3b8' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  onUpdateStyleOptions,
}) => {
  const buttonStyles: { id: ButtonStyle; label: string; desc: string; previewClass: string }[] = [
    { id: 'rounded', label: 'Rounded Rect', desc: 'Sleek 12px curvature', previewClass: 'rounded-xl' },
    { id: 'pill', label: 'Pill Shape', desc: 'Smooth full capsule', previewClass: 'rounded-full' },
    { id: 'glass', label: 'Glassmorphism', desc: 'Frosted blur & border', previewClass: 'rounded-2xl border border-white/25 backdrop-blur-md' },
    { id: 'outline', label: 'Neon Outline', desc: 'High-contrast edge', previewClass: 'rounded-xl border-2 border-cyan-400/80 bg-transparent' },
    { id: 'shadow', label: 'Solid Shadow', desc: 'Deep elevation shadow', previewClass: 'rounded-xl shadow-lg border border-white/10' },
  ];

  const fontStyles: { id: FontStyle; label: string; desc: string; previewClass: string; sample: string }[] = [
    { id: 'plus-jakarta', label: 'Plus Jakarta Sans', desc: 'Modern & Clean Geometric', previewClass: 'font-jakarta', sample: 'Smart Digital Card' },
    { id: 'outfit', label: 'Outfit Display', desc: 'Bold & Tech-Forward', previewClass: 'font-display font-extrabold', sample: 'Smart Digital Card' },
    { id: 'inter', label: 'Inter UI', desc: 'Standard Minimal & Crisp', previewClass: 'font-inter', sample: 'Smart Digital Card' },
    { id: 'mono', label: 'JetBrains Mono', desc: 'Developer & Cyber Terminal', previewClass: 'font-mono', sample: 'Smart Digital Card' },
  ];

  const handleAccentChange = (hex: string) => {
    onUpdateStyleOptions({
      accentColor: hex,
      badgeBg: `${hex}25`,
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. THEME PRESETS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Curated Theme Presets</h3>
              <p className="text-[11px] text-slate-400">Select a pre-tuned aesthetic with matched background & accents</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
            {Object.keys(THEME_PRESETS).length} Presets
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(THEME_PRESETS).map((preset) => {
            const isSelected = currentTheme.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectTheme(preset)}
                className={`group relative rounded-2xl p-3.5 text-left border transition-all duration-200 overflow-hidden flex flex-col justify-between h-28 ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-glow-cyan scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: preset.bgColor,
                  backgroundImage: preset.bgGradient,
                }}
              >
                {/* Mini mock elements */}
                <div className="flex items-center justify-between w-full">
                  <div
                    className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center text-[8px] font-bold"
                    style={{ backgroundColor: preset.accentColor, color: '#000' }}
                  >
                    T
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-sm">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Mini link bar preview */}
                <div
                  className="w-full h-3 rounded-md border"
                  style={{
                    backgroundColor: preset.cardBg,
                    borderColor: preset.cardBorder,
                  }}
                />

                <div className="z-10">
                  <span className="text-xs font-bold block truncate" style={{ color: preset.textColor }}>
                    {preset.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. COLOR PALETTES & ACCENT COLOR */}
      <div className="pt-2 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30">
              <Paintbrush className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Color Palettes & Accent Tone</h3>
              <p className="text-[11px] text-slate-400">Highlights badges, avatar halo, and active icon accents</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: currentTheme.accentColor }}
            />
            <span className="text-[11px] font-mono text-cyan-400 font-bold">
              {currentTheme.accentColor.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-3">
          {ACCENT_PALETTE.map((color) => {
            const isSelected = currentTheme.accentColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => handleAccentChange(color.hex)}
                className={`relative group p-1 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'border-white ring-2 ring-cyan-400/60 bg-white/10 scale-105'
                    : 'border-white/[0.08] hover:border-white/30 bg-[#050c18]'
                }`}
                title={color.name}
              >
                <div
                  className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && (
                    <Check
                      className="w-3.5 h-3.5 stroke-[3]"
                      style={{ color: color.hex === '#ffffff' ? '#000000' : '#ffffff' }}
                    />
                  )}
                </div>
                <span className="text-[9px] font-semibold text-slate-400 truncate max-w-[50px]">
                  {color.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Hex Picker Input */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#050c18] border border-white/[0.08]">
          <div className="relative flex items-center">
            <input
              type="color"
              value={currentTheme.accentColor.startsWith('#') ? currentTheme.accentColor : '#06b6d4'}
              onChange={(e) => handleAccentChange(e.target.value)}
              className="w-9 h-9 rounded-xl cursor-pointer border border-white/20 bg-transparent p-0.5"
              id="custom-accent-color"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label htmlFor="custom-accent-color" className="block text-xs font-bold text-white cursor-pointer">
              Custom Hex Color
            </label>
            <p className="text-[11px] text-slate-400">Pick any custom branded hex color</p>
          </div>
          <input
            type="text"
            value={currentTheme.accentColor}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('#') || val.length <= 7) {
                handleAccentChange(val);
              }
            }}
            placeholder="#06b6d4"
            className="w-28 bg-[#0a1428] border border-white/[0.1] rounded-xl text-xs font-mono font-bold text-cyan-300 py-1.5 px-2.5 focus:border-cyan-400 focus:outline-none uppercase text-center"
          />
        </div>
      </div>

      {/* 3. BUTTON STYLING */}
      <div className="pt-2 border-t border-white/[0.08]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Button Styling & Shapes</h3>
            <p className="text-[11px] text-slate-400">Controls the geometry and border treatment of destination links</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {buttonStyles.map((style) => {
            const isSelected = currentTheme.buttonStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onUpdateStyleOptions({ buttonStyle: style.id })}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/40 scale-[1.02]'
                    : 'bg-[#050c18] border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                {/* Visual Button Preview */}
                <div
                  className={`w-full h-8 flex items-center justify-center text-[10px] font-bold px-2 truncate transition-colors ${style.previewClass}`}
                  style={{
                    backgroundColor: currentTheme.cardBg,
                    borderColor: isSelected ? currentTheme.accentColor : currentTheme.cardBorder,
                    color: currentTheme.textColor,
                  }}
                >
                  <span className="truncate">Button Item</span>
                </div>

                <div className="text-center">
                  <span className="text-xs font-bold block text-slate-200">{style.label}</span>
                  <span className="text-[10px] text-slate-400 block">{style.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. TYPOGRAPHY PAIRING */}
      <div className="pt-2 border-t border-white/[0.08]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Typography Pairing</h3>
            <p className="text-[11px] text-slate-400">Font styling applied to your public name, bio, and buttons</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fontStyles.map((font) => {
            const isSelected = currentTheme.fontStyle === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onUpdateStyleOptions({ fontStyle: font.id })}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/40'
                    : 'bg-[#050c18] border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-base text-white ${font.previewClass}`}>{font.sample}</p>
                  </div>
                  <p className="text-xs font-bold text-slate-300">{font.label}</p>
                  <p className="text-[11px] text-slate-400">{font.desc}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
