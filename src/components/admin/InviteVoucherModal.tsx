import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UserInvite } from '../../types';
import { downloadQRVoucher } from '../../lib/voucherGenerator';
import { 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Smartphone,
  Printer,
  Trash2
} from 'lucide-react';
import { copyToClipboard } from '../../lib/utils';

interface InviteVoucherModalProps {
  invite: UserInvite | null;
  isOpen: boolean;
  onClose: () => void;
  onRevoke?: (invite: UserInvite) => void;
}

export const InviteVoucherModal: React.FC<InviteVoucherModalProps> = ({
  invite,
  isOpen,
  onClose,
  onRevoke,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [stickerTheme, setStickerTheme] = useState<'light' | 'dark'>('light');
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!invite) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapit.app';
  const inviteUrl = `${origin}/invite/${invite.inviteToken}`;

  const handleCopy = async () => {
    await copyToClipboard(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSticker = async (themeToUse: 'light' | 'dark' = stickerTheme) => {
    try {
      setIsDownloading(true);
      const canvasEl = canvasRef.current?.querySelector('canvas');
      if (!canvasEl) {
        throw new Error('QR canvas element not ready');
      }

      await downloadQRVoucher(canvasEl, {
        userName: invite.initialName,
        cardToken: invite.cardToken,
        material: invite.material,
        inviteToken: invite.inviteToken,
        inviteUrl,
      }, themeToUse);
    } catch (err) {
      console.error('Failed to export sticker:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Physical Card Activation Sticker"
      description="Optimized for printing and placing directly on the physical NFC card."
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Theme Toggle Pill */}
        <div className="flex items-center justify-between bg-[#040914] p-2 rounded-xl border border-white/[0.08] text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5 pl-2">
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Format:</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStickerTheme('light')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                stickerTheme === 'light'
                  ? 'bg-white text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Print-Ready (White Paper)
            </button>
            <button
              type="button"
              onClick={() => setStickerTheme('dark')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                stickerTheme === 'dark'
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark Card
            </button>
          </div>
        </div>

        {/* Live Sticker Preview (Only 4 Elements: Branding, User Name, QR Code, Scan Text) */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#030712] rounded-2xl border border-white/[0.08]">
          <div 
            className={`w-[280px] p-5 rounded-2xl shadow-2xl transition-all ${
              stickerTheme === 'light'
                ? 'bg-white text-slate-900 border-2 border-slate-200'
                : 'bg-[#080d1a] text-white border-2 border-cyan-500/30'
            }`}
          >
            {/* 1. TapIt Branding */}
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span className={`font-black text-sm tracking-wider ${stickerTheme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                TAPIT
              </span>
            </div>

            {/* 2. User Name */}
            <div className="text-center mb-3">
              <h4 className={`text-base font-extrabold truncate ${stickerTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {invite.initialName || 'Member'}
              </h4>
            </div>

            {/* 3. The QR Code */}
            <div 
              ref={canvasRef} 
              className={`p-3 rounded-xl flex items-center justify-center ${
                stickerTheme === 'light'
                  ? 'bg-slate-50 border border-slate-200'
                  : 'bg-white border border-white'
              }`}
            >
              <QRCodeCanvas
                value={inviteUrl}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* 4. Small Callout Text */}
            <div className={`mt-3 py-1.5 px-3 rounded-full text-center border ${
              stickerTheme === 'light'
                ? 'bg-cyan-50 border-cyan-200 text-sky-700'
                : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
            }`}>
              <span className="text-[11px] font-bold tracking-tight block">
                scan me first to finish registration
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center max-w-xs">
            Clean, high-contrast sticker ready to be printed and adhered directly to the physical smart card.
          </p>
        </div>

        {/* Action: 1-Click Copy Link */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            One-Time Registration Link:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 min-w-0 bg-[#050c18] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none select-all truncate"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-cyan-400 font-bold hover:underline py-2"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {onRevoke && (
              <button
                type="button"
                onClick={() => onRevoke(invite)}
                className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-bold py-2 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>

            <Button
              variant="glow"
              size="sm"
              onClick={() => handleDownloadSticker()}
              isLoading={isDownloading}
              leftIcon={<Download className="w-4 h-4 text-cyan-300" />}
            >
              Download Sticker (PNG)
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
