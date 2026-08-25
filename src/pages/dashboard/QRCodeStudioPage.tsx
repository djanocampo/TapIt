import React, { useState } from 'react';
import { useTapIt } from '../../store';
import { QRCodeGenerator } from '../../components/qr/QRCodeGenerator';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  QrCode, 
  Download, 
  Printer, 
  Share2, 
  Palette, 
  Sparkles, 
  Layers,
  Check,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export const QRCodeStudioPage: React.FC = () => {
  const { profiles, activeProfile, setActiveProfileId, qrCodes, recordQRScan } = useTapIt();

  const [selectedProfileId, setSelectedProfileId] = useState(activeProfile.id);
  const currentProf = profiles.find((p) => p.id === selectedProfileId) || activeProfile;

  const [qrColor, setQrColor] = useState(currentProf.theme.accentColor || '#06b6d4');
  const [qrBg, setQrBg] = useState('#090d16');
  const [cardTitle, setCardTitle] = useState(currentProf.displayName);
  const [cardSubtitle, setCardSubtitle] = useState(currentProf.headline);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const profileUrl = `${window.location.origin}/@${currentProf.slug}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">QR Code Studio</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Generate, customize, and print high-resolution QR codes linked to your TapIt profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsPrintModalOpen(true)}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Printable Sheet
          </Button>

          <Button
            variant="glow"
            size="md"
            onClick={() => recordQRScan(currentProf.id)}
            leftIcon={<QrCode className="w-4 h-4" />}
          >
            Simulate QR Scan
          </Button>
        </div>
      </div>

      {/* Editor & Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings & Customization */}
        <div className="lg:col-span-7 bg-[#0d1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Select Profile:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {profiles.map((p) => {
                const isSelected = selectedProfileId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProfileId(p.id);
                      setCardTitle(p.displayName);
                      setCardSubtitle(p.headline);
                      setQrColor(p.theme.accentColor || '#06b6d4');
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/50 text-white shadow-glow-cyan'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold block truncate">{p.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">@{p.slug}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Card Title"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
            />
            <Input
              label="Subtitle / Headline"
              value={cardSubtitle}
              onChange={(e) => setCardSubtitle(e.target.value)}
            />
          </div>

          {/* Color Palettes */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Branded Color Accent:
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: 'Cyan', color: '#06b6d4' },
                { label: 'Purple', color: '#8b5cf6' },
                { label: 'Emerald', color: '#10b981' },
                { label: 'Amber', color: '#f59e0b' },
                { label: 'Rose', color: '#f43f5e' },
                { label: 'White', color: '#ffffff' },
              ].map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setQrColor(c.color)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                    qrColor === c.color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.color }}
                >
                  {qrColor === c.color && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live QR Card Generator Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <QRCodeGenerator
            url={profileUrl}
            title={cardTitle}
            subtitle={cardSubtitle}
            fgColor={qrColor}
            bgColor={qrBg}
            size={220}
            showDownloadButtons={true}
          />
        </div>
      </div>

      {/* PRINTABLE CARD SHEET MODAL */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Printable QR Business Cards & Tabletop Sheet"
        description="Ready-to-print layout formatted for standard A4 paper or desk display stands."
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div className="p-6 bg-white text-slate-900 rounded-2xl shadow-inner grid grid-cols-2 gap-4 print:p-0 print:border-none">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center text-center space-y-2"
              >
                <div className="p-2 bg-slate-950 rounded-xl">
                  <QRCodeCanvas
                    value={profileUrl}
                    size={90}
                    fgColor="#06b6d4"
                    bgColor="#090d16"
                    level="H"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{currentProf.displayName}</h4>
                  <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{currentProf.headline}</p>
                  <p className="text-[9px] font-mono font-bold text-cyan-600 mt-0.5">tapit.app/@{currentProf.slug}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" size="md" onClick={() => setIsPrintModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="md" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
              Print Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
