import React, { useState } from 'react';
import { QRCodeGenerator } from '../../components/qr/QRCodeGenerator';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { QrCode, Palette, Share2, Sparkles, Layers, Download, Check } from 'lucide-react';

export const QRSharePage: React.FC = () => {
  const { profiles, activeProfile } = useTapIt();
  const [customUrl, setCustomUrl] = useState(`${window.location.origin}/@${activeProfile.slug}`);
  const [qrFgColor, setQrFgColor] = useState('#06b6d4');
  const [qrBgColor, setQrBgColor] = useState('#070a13');
  const [qrTitle, setQrTitle] = useState(activeProfile.displayName);
  const [qrSubtitle, setQrSubtitle] = useState('Scan with any smartphone camera');

  const colorPresets = [
    { label: 'Cyan Glow', fg: '#06b6d4', bg: '#070a13' },
    { label: 'Purple Neon', fg: '#8b5cf6', bg: '#0f051d' },
    { label: 'Emerald Tech', fg: '#10b981', bg: '#021a14' },
    { label: 'Obsidian Gold', fg: '#f59e0b', bg: '#0a0a0b' },
    { label: 'High Contrast Light', fg: '#0f172a', bg: '#ffffff' },
  ];

  const handleSelectProfile = (profileSlug: string) => {
    const p = profiles.find((prof) => prof.slug === profileSlug);
    if (p) {
      setCustomUrl(`${window.location.origin}/@${p.slug}`);
      setQrTitle(p.displayName);
      setQrSubtitle(p.headline);
      setQrFgColor(p.theme.accentColor || '#06b6d4');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-400">
            <QrCode className="w-3.5 h-3.5" />
            <span>Dynamic QR Code Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Generate & Customize Your TapIt QR Code
          </h1>
          <p className="text-sm text-slate-400">
            Create high-resolution vector QR codes ready for print, social media, or event badges.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-7 bg-[#0d1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Quick Select Profile:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProfile(p.slug)}
                    className="p-2.5 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-900/60 text-left text-xs font-semibold transition"
                  >
                    <span className="block truncate text-white">{p.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">@{p.slug}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Input
                label="Target URL"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://tapit.app/@username"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Card Title Header"
                  value={qrTitle}
                  onChange={(e) => setQrTitle(e.target.value)}
                />
                <Input
                  label="Card Subtitle"
                  value={qrSubtitle}
                  onChange={(e) => setQrSubtitle(e.target.value)}
                />
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Color Scheme Presets:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {colorPresets.map((preset) => {
                  const isSelected = qrFgColor === preset.fg && qrBgColor === preset.bg;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setQrFgColor(preset.fg);
                        setQrBgColor(preset.bg);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
                        isSelected ? 'border-cyan-400 bg-slate-800' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.fg }}
                        />
                        <span className="text-slate-200">{preset.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <QRCodeGenerator
              url={customUrl}
              title={qrTitle}
              subtitle={qrSubtitle}
              fgColor={qrFgColor}
              bgColor={qrBgColor}
              size={220}
              showDownloadButtons={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
