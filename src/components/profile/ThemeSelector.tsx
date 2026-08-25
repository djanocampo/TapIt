import React from 'react';
import { ProfileThemeConfig, ThemeStyle, ButtonStyle, FontStyle } from '../../types';
import { THEME_PRESETS } from '../../data/themes';
import { Check, Sparkles, Layout, Type, Palette } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: ProfileThemeConfig;
  onSelectTheme: (theme: ProfileThemeConfig) => void;
  onUpdateStyleOptions: (options: { buttonStyle?: ButtonStyle; fontStyle?: FontStyle; accentColor?: string }) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  onUpdateStyleOptions,
}) => {
  const buttonStyles: { id: ButtonStyle; label: string; preview: string }[] = [
    { id: 'rounded', label: 'Rounded Rect', preview: 'rounded-xl' },
    { id: 'pill', label: 'Pill Shape', preview: 'rounded-full' },
    { id: 'glass', label: 'Glassmorphism', preview: 'rounded-2xl border border-white/20' },
    { id: 'outline', label: 'Neon Outline', preview: 'rounded-xl border-2' },
    { id: 'shadow', label: 'Solid Shadow', preview: 'rounded-xl shadow-lg' },
  ];

  const fontStyles: { id: FontStyle; label: string; desc: string }[] = [
    { id: 'plus-jakarta', label: 'Plus Jakarta Sans', desc: 'Modern & Clean' },
    { id: 'outfit', label: 'Outfit Display', desc: 'Bold & Tech-forward' },
    { id: 'inter', label: 'Inter UI', desc: 'Standard Minimal' },
    { id: 'mono', label: 'JetBrains Mono', desc: 'Developer & Cyber' },
  ];

  return (
    <div className="space-y-8">
      {/* Theme Presets Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Curated Theme Presets</h3>
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
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-glow-cyan'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
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
                    <div className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
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

      {/* Button Styles */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layout className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Button Styling</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {buttonStyles.map((style) => {
            const isSelected = currentTheme.buttonStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onUpdateStyleOptions({ buttonStyle: style.id })}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`w-full h-6 bg-slate-800 border border-slate-700 ${style.preview}`} />
                <span className="text-xs font-semibold">{style.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Family */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Typography Pairing</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fontStyles.map((font) => {
            const isSelected = currentTheme.fontStyle === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onUpdateStyleOptions({ fontStyle: font.id })}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-slate-100">{font.label}</p>
                  <p className="text-xs text-slate-400">{font.desc}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
