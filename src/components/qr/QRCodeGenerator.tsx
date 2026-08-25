import React, { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Button } from '../ui/Button';
import { Download, Share2, Copy, Check, Radio } from 'lucide-react';
import { copyToClipboard } from '../../lib/utils';

interface QRCodeGeneratorProps {
  url: string;
  title?: string;
  subtitle?: string;
  fgColor?: string;
  bgColor?: string;
  size?: number;
  showDownloadButtons?: boolean;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  url,
  title = 'Scan to Connect',
  subtitle = 'Point camera or NFC scanner to open profile',
  fgColor = '#06b6d4',
  bgColor = '#090d16',
  size = 200,
  showDownloadButtons = true,
}) => {
  const [copied, setCopied] = React.useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = async () => {
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `tapit-qr-${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-[#0d1322] border border-slate-800 rounded-3xl shadow-2xl text-center space-y-4 max-w-sm mx-auto">
      {/* Title */}
      <div>
        <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          {title}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      {/* QR Code Canvas container */}
      <div
        ref={canvasRef}
        className="p-4 rounded-2xl border border-slate-700/80 shadow-inner flex items-center justify-center relative group"
        style={{ backgroundColor: bgColor }}
      >
        <QRCodeCanvas
          value={url}
          size={size}
          fgColor={fgColor}
          bgColor={bgColor}
          level="H"
          includeMargin={false}
        />
      </div>

      {/* URL Link pill */}
      <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <span className="truncate text-slate-300 font-mono">{url}</span>
        <button
          onClick={handleCopyLink}
          className="text-cyan-400 hover:text-cyan-300 shrink-0 font-medium flex items-center gap-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Download / Share Buttons */}
      {showDownloadButtons && (
        <div className="grid grid-cols-2 gap-2 w-full pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadPNG}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download PNG
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopyLink}
            leftIcon={<Share2 className="w-3.5 h-3.5" />}
          >
            Share Link
          </Button>
        </div>
      )}
    </div>
  );
};
