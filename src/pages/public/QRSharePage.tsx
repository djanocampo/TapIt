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
    { label: 'BITS Cloud Sky Cyan', fg: '#38BDF8', bg: '#060c1c' },
    { label: 'BITS Royal Azure', fg: '#2563EB', bg: '#0a142c' },
    { label: 'BITS Sunrise Amber', fg: '#F59E0B', bg: '#060c1c' },
    { label: 'Pure Cloud White', fg: '#060c1c', bg: '#FFFFFF' },
    { label: 'Deep Stratosphere', fg: '#E0F2FE', bg: '#124294' },
  ];

  const handleSelectProfile = (profileSlug: string) => {
    const p = profiles.find((prof) => prof.slug === profileSlug);
    if (p) {
      setCustomUrl(`${window.location.origin}/@${p.slug}`);
      setQrTitle(p.displayName);
      setQrSubtitle(p.headline);
      setQrFgColor(p.theme.accentColor || '#38BDF8');
    }
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#060c1c] text-slate-100 py-12 sm:py-16 relative">
      <div className="absolute inset-0 bits-hero-mesh pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#124294]/30 border border-[#38BDF8]/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#38BDF8] font-mono">
            <QrCode className="w-3.5 h-3.5" />
            <span>DYNAMIC QR VECTOR ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Generate & Customize Your TapIt QR Code
          </h1>
          <p className="text-sm text-slate-300">
            Create high-resolution vector QR codes ready for print, social media, or event badges.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-7 bg-[#0a142c] border border-[#1b2d55] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Quick Select Profile:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProfile(p.slug)}
                    className="p-2.5 rounded-xl border border-[#1b2d55] hover:border-[#38BDF8]/60 bg-[#081329] text-left text-xs font-semibold transition cursor-pointer"
                  >
                    <span className="block truncate text-white">{p.name}</span>
                    <span className="text-[10px] text-[#38BDF8] font-mono">@{p.slug}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Input
                label="Target URL"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Target URL"
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
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                        isSelected ? 'border-[#38BDF8] bg-[#124294]/30 shadow-glow-cyan' : 'border-[#1b2d55] bg-[#081329] hover:border-[#38BDF8]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: preset.fg }}
                        />
                        <span className="text-slate-200 truncate">{preset.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />}
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
