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
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  FileText
} from 'lucide-react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { BitsInfinityEmblem } from '../../components/common/BitsBrandElements';
import { getAppBaseUrl } from '../../lib/utils';

export const QRCodeStudioPage: React.FC = () => {
  const { profiles, activeProfile, setActiveProfileId, qrCodes, recordQRScan } = useTapIt();

  const [selectedProfileId, setSelectedProfileId] = useState(activeProfile.id);
  const currentProf = profiles.find((p) => p.id === selectedProfileId) || activeProfile;

  const [qrColor, setQrColor] = useState(currentProf.theme.accentColor || '#38bdf8');
  const [qrBg, setQrBg] = useState('#060c1c');
  const [cardTitle, setCardTitle] = useState(currentProf.displayName);
  const [cardSubtitle, setCardSubtitle] = useState(currentProf.headline);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Sync color & text when selected profile changes
  React.useEffect(() => {
    setCardTitle(currentProf.displayName);
    setCardSubtitle(currentProf.headline);
    setQrColor(currentProf.theme.accentColor || '#38bdf8');
  }, [currentProf.id]);

  const profileUrl = `${getAppBaseUrl()}/@${currentProf.slug}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadScreenPNG = () => {
    const canvas = document.querySelector('#studio-preview-card canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `tapit-qr-${currentProf.slug}-screens.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleDownloadPrintSVG = () => {
    const svg = document.querySelector('#studio-preview-card svg') as SVGElement | null;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `tapit-qr-${currentProf.slug}-print-vector.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    } else {
      handleDownloadScreenPNG();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-bits-cyan bg-bits-azure/30 border border-bits-cyan/30 px-3 py-0.5 rounded-full mb-1">
            <BitsInfinityEmblem size={12} />
            <span>High-Density Dynamic Matrix</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">QR Code Studio</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Pre-packaged high-resolution QR codes linked to your TapIt profiles.
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
            Simulate Scan
          </Button>
        </div>
      </div>

      {/* Editor & Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings & Customization Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Selector Card */}
          <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 shadow-card-bits space-y-4 backdrop-blur-xl">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              1. Choose Profile Target:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {profiles.map((p) => {
                const isSelected = selectedProfileId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProfileId(p.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'border-bits-cyan bg-bits-azure/30 text-white shadow-glow-cyan'
                        : 'border-bits-vapor/10 bg-bits-midnight/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold block truncate">{p.name}</span>
                    <span className="text-[10px] text-bits-cyan font-mono">@{p.slug}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pre-Packaged Downloads Action Cards */}
          <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 shadow-card-bits space-y-4 backdrop-blur-xl">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              2. Pre-Packaged Downloads:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* For Screens */}
              <div className="p-4 rounded-2xl bg-[#050c18] border border-cyan-500/20 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">For Screens & Digital</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Optimized for mobile lockscreens, email signatures, presentation slides, and LinkedIn cards.
                  </p>
                </div>

                <Button
                  variant="glow"
                  size="sm"
                  className="w-full"
                  onClick={handleDownloadScreenPNG}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download PNG
                </Button>
              </div>

              {/* For Print */}
              <div className="p-4 rounded-2xl bg-[#050c18] border border-purple-500/20 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      <Printer className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">For Physical Print</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Vector SVG scaleable to any billboard or business card with zero pixelation, plus tabletop sheets.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={handleDownloadPrintSVG}
                    leftIcon={<FileText className="w-3.5 h-3.5 text-purple-400" />}
                  >
                    Download SVG
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsPrintModalOpen(true)}
                    title="Open Print Sheet"
                  >
                    Sheet
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Customization Box */}
          <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl shadow-card-bits overflow-hidden backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setIsCustomizing((prev) => !prev)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/[0.06] text-slate-300">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Customize QR Styling & Details
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isCustomizing ? 'Hide custom color accents and label text' : 'Optional: fine-tune brand colors, titles, and card subtitles'}
                  </p>
                </div>
              </div>

              <div className="p-1 rounded-lg bg-white/[0.05] text-slate-400">
                {isCustomizing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isCustomizing && (
              <div className="p-6 pt-2 border-t border-white/[0.06] space-y-5">
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
                      { label: 'Cyan Sky', color: '#38bdf8' },
                      { label: 'Electric Blue', color: '#2563eb' },
                      { label: 'Royal Azure', color: '#124294' },
                      { label: 'Sunrise Amber', color: '#f59e0b' },
                      { label: 'Emerald', color: '#10b981' },
                      { label: 'Pure White', color: '#ffffff' },
                    ].map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setQrColor(c.color)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                          qrColor === c.color ? 'border-white scale-110 shadow-glow-cyan' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.color }}
                      >
                        {qrColor === c.color && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live QR Card Generator Preview Column */}
        <div id="studio-preview-card" className="lg:col-span-5 flex flex-col items-center justify-center">
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
          <div className="p-4 sm:p-6 bg-white text-slate-900 rounded-2xl shadow-inner grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 print:grid-cols-2 print:p-0 print:border-none">
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
