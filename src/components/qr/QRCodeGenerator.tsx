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
    <div className="w-full max-w-sm mx-auto flex flex-col items-center p-4 sm:p-6 bits-glass rounded-3xl shadow-2xl text-center space-y-4">
      {/* Title */}
      <div>
        <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5 font-display">
          <Radio className="w-4 h-4 text-[#38BDF8] animate-pulse" />
          {title}
        </h3>
        <p className="text-xs text-slate-300 mt-0.5">{subtitle}</p>
      </div>

      {/* QR Code Canvas container */}
      <div
        ref={canvasRef}
        className="p-3 sm:p-4 rounded-2xl border border-[#1b2d55] shadow-inner flex items-center justify-center relative group max-w-full overflow-hidden"
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
      <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-[#081329] border border-[#1b2d55] rounded-xl text-xs min-w-0">
        <span className="truncate text-slate-300 font-mono text-[11px] min-w-0 flex-1 text-left">{url}</span>
        <button
          onClick={handleCopyLink}
          className="text-[#38BDF8] hover:text-white shrink-0 font-medium flex items-center gap-1 cursor-pointer transition min-h-[32px]"
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
            leftIcon={<Download className="w-3.5 h-3.5 text-[#38BDF8]" />}
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
