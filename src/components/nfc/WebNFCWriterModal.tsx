import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { NFCCard, Profile } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  Radio, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Zap, 
  RotateCw, 
  ShieldCheck,
  ExternalLink,
  Info,
  Sparkles
} from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';

interface WebNFCWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: NFCCard | null;
  profile?: Profile;
}

export const WebNFCWriterModal: React.FC<WebNFCWriterModalProps> = ({
  isOpen,
  onClose,
  card,
  profile,
}) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'writing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [writeType, setWriteType] = useState<'dynamic' | 'direct'>('dynamic');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'read'>('write');
  const [scannedTagInfo, setScannedTagInfo] = useState<{ serialNumber?: string; records?: string[] } | null>(null);

  // Determine current origin or production fallback
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapit.app';
  
  // Calculate Target URLs
  const dynamicUrl = card ? `${origin}/t/${card.cardToken}` : `${origin}/t/CARD_TOKEN`;
  const directUrl = profile ? `${origin}/@${profile.slug}` : `${origin}/@djan`;
  const targetUrl = writeType === 'dynamic' ? dynamicUrl : directUrl;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('NDEFReader' in window);
    }
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMessage('');
      setScannedTagInfo(null);
    }
  }, [isOpen]);

  // Audio & Haptic Feedback helper
  const triggerSuccessFeedback = () => {
    triggerConfetti();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15); // A6
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // AudioContext unavailable or blocked by autoplay policy
    }
  };

  // Write Web NFC Function
  const handleWriteNFC = async () => {
    if (!('NDEFReader' in window)) {
      setStatus('error');
      setErrorMessage('Web NFC is not supported in this browser. Please use Chrome on Android or follow the manual NFC Tools guide below.');
      return;
    }

    try {
      setStatus('writing');
      setErrorMessage('');

      const NDEFReader = (window as any).NDEFReader;
      const ndef = new NDEFReader();

      // Write NDEF URI record
      await ndef.write({
        records: [
          {
            recordType: 'url',
            data: targetUrl,
          },
        ],
      });

      setStatus('success');
      triggerSuccessFeedback();
    } catch (err: any) {
      console.error('NFC Write Error:', err);
      setStatus('error');
      if (err.name === 'NotAllowedError') {
        setErrorMessage('NFC permission was denied. Please allow NFC permissions in your browser settings.');
      } else if (err.name === 'NotReadableError') {
        setErrorMessage('NFC device is disabled or unavailable. Please enable NFC in your phone settings.');
      } else {
        setErrorMessage(err.message || 'Failed to write to NFC card. Please ensure the card is placed firmly near your phone NFC antenna.');
      }
    }
  };

  // Read Web NFC Function
  const handleReadNFC = async () => {
    if (!('NDEFReader' in window)) {
      setStatus('error');
      setErrorMessage('Web NFC is not supported in this browser.');
      return;
    }

    try {
      setStatus('scanning');
      setErrorMessage('');
      setScannedTagInfo(null);

      const NDEFReader = (window as any).NDEFReader;
      const ndef = new NDEFReader();
      await ndef.scan();

      ndef.onreading = (event: any) => {
        const serialNumber = event.serialNumber || 'Unknown UID';
        const records: string[] = [];

        for (const record of event.message.records) {
          if (record.recordType === 'url') {
            const textDecoder = new TextDecoder();
            records.push(`URL: ${textDecoder.decode(record.data)}`);
          } else if (record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding);
            records.push(`Text: ${textDecoder.decode(record.data)}`);
          } else {
            records.push(`Type: ${record.recordType} (${record.data.byteLength} bytes)`);
          }
        }

        setScannedTagInfo({ serialNumber, records });
        setStatus('success');
        triggerSuccessFeedback();
      };

      ndef.onreadingerror = () => {
        setStatus('error');
        setErrorMessage('Cannot read data from the NFC card. The tag might be corrupted or incompatible.');
      };
    } catch (err: any) {
      console.error('NFC Read Error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to scan NFC tag.');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="In-App Web NFC Writer & Reader"
      description="Program your generic NFC smart card directly from the browser using Web NFC."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Mode Tabs */}
        <div className="flex bg-[#070e1c] p-1 rounded-2xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => { setActiveTab('write'); setStatus('idle'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'write'
                ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Write / Program Card</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('read'); setStatus('idle'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'read'
                ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Scan / Read Chip Info</span>
          </button>
        </div>

        {/* Browser Web NFC Compatibility Banner */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
          isSupported 
            ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200' 
            : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
        }`}>
          {isSupported ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Web NFC Supported on this Device!</strong>
                <span>You are browsing on a Web NFC compatible browser (Chrome on Android). You can touch your card to the back of your phone to write it instantly.</span>
              </div>
            </>
          ) : (
            <>
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Web NFC Direct Writing Notice</strong>
                <span>Direct browser NFC writing requires <strong>Google Chrome on Android</strong>. On iOS or desktop, you can copy the target URL below or use the free <strong>NFC Tools</strong> app to flash the chip in 5 seconds!</span>
              </div>
            </>
          )}
        </div>

        {/* ================= WRITE TAB ================= */}
        {activeTab === 'write' && (
          <div className="space-y-5">
            {/* Target URL Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Choose Link Format to Program into Chip:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option A: Dynamic Token */}
                <button
                  type="button"
                  onClick={() => setWriteType('dynamic')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    writeType === 'dynamic'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-glow-cyan'
                      : 'border-white/[0.08] bg-[#071124]/70 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Dynamic Token Link
                    </span>
                    {writeType === 'dynamic' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Recommended. Lets you reassign profiles or disable a lost card anytime from the cloud.
                  </p>
                  <p className="text-[10px] font-mono text-cyan-300 mt-2 truncate bg-black/40 px-2 py-1 rounded">
                    {dynamicUrl}
                  </p>
                </button>

                {/* Option B: Direct Profile */}
                <button
                  type="button"
                  onClick={() => setWriteType('direct')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    writeType === 'direct'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-glow-cyan'
                      : 'border-white/[0.08] bg-[#071124]/70 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      Direct Profile Link
                    </span>
                    {writeType === 'direct' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Writes your direct public profile URL (@{profile?.slug || 'djan'}) directly to the chip.
                  </p>
                  <p className="text-[10px] font-mono text-cyan-300 mt-2 truncate bg-black/40 px-2 py-1 rounded">
                    {directUrl}
                  </p>
                </button>
              </div>
            </div>

            {/* Live Interactive Scanner Radar / Touch Zone */}
            <div className="relative rounded-3xl bg-[#060e1e] border border-white/[0.08] p-6 text-center overflow-hidden flex flex-col items-center justify-center space-y-4">
              {/* Radar Glow Animation */}
              {status === 'writing' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-full border border-cyan-400/40 animate-ping opacity-60"></div>
                  <div className="w-64 h-64 rounded-full border border-cyan-400/20 animate-ping opacity-40 delay-200"></div>
                </div>
              )}

              {/* Status Graphic */}
              <div className="relative z-10">
                {status === 'idle' && (
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-glow-cyan mx-auto">
                    <Smartphone className="w-8 h-8" />
                  </div>
                )}
                {status === 'writing' && (
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-400/50 animate-bounce mx-auto">
                    <Radio className="w-8 h-8 animate-pulse text-cyan-300" />
                  </div>
                )}
                {status === 'success' && (
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-400/40 mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 text-rose-300 flex items-center justify-center shadow-lg shadow-rose-400/40 mx-auto">
                    <AlertCircle className="w-9 h-9" />
                  </div>
                )}
              </div>

              {/* Status Text Messages */}
              <div className="relative z-10 space-y-1 max-w-sm">
                {status === 'idle' && (
                  <>
                    <h4 className="text-base font-bold text-white">Ready to Program NFC Card</h4>
                    <p className="text-xs text-slate-400">
                      Click the button below, then touch your generic NFC card to the back of your phone.
                    </p>
                  </>
                )}
                {status === 'writing' && (
                  <>
                    <h4 className="text-base font-extrabold text-cyan-300 animate-pulse">
                      Hold Card Firmly to Phone...
                    </h4>
                    <p className="text-xs text-slate-300">
                      Writing NDEF URL payload: <strong className="text-cyan-400">{targetUrl}</strong>
                    </p>
                  </>
                )}
                {status === 'success' && (
                  <>
                    <h4 className="text-base font-extrabold text-emerald-400">
                      Card Successfully Programmed!
                    </h4>
                    <p className="text-xs text-slate-300">
                      Your NFC card is now live. Anyone who taps it will instantly open your TapIt link!
                    </p>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <h4 className="text-base font-bold text-rose-400">Writing Failed</h4>
                    <p className="text-xs text-rose-300/90">{errorMessage}</p>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
                {isSupported ? (
                  <Button
                    variant="glow"
                    size="md"
                    onClick={handleWriteNFC}
                    isLoading={status === 'writing'}
                    leftIcon={<Radio className="w-4 h-4" />}
                  >
                    {status === 'writing' ? 'Waiting for Card Tap...' : 'Touch Card to Write'}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleCopyUrl}
                    leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  >
                    {copied ? 'Copied to Clipboard!' : 'Copy Target URL'}
                  </Button>
                )}

                {status !== 'idle' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatus('idle')}
                    leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Quick QR Code for Android Chrome Writing */}
            <div className="p-4 rounded-2xl bg-[#081326] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Smartphone className="w-3.5 h-3.5" />
                  Writing from Desktop or iPhone?
                </span>
                <p className="text-[11px] text-slate-300 max-w-md">
                  Scan this QR code with an Android phone (Chrome) to open this live writer, or paste the URL into the free <strong>NFC Tools</strong> app.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-white shrink-0 shadow-md">
                <QRCodeSVG value={targetUrl} size={64} level="M" />
              </div>
            </div>
          </div>
        )}

        {/* ================= READ TAB ================= */}
        {activeTab === 'read' && (
          <div className="space-y-5">
            <div className="relative rounded-3xl bg-[#060e1e] border border-white/[0.08] p-6 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-glow-cyan">
                <Radio className={`w-8 h-8 ${status === 'scanning' ? 'animate-pulse' : ''}`} />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Scan Generic NFC Card</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Touch any physical NFC smart card, keyfob, or sticker to your phone to read its hardware UID and stored NDEF records.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="glow"
                  size="md"
                  onClick={handleReadNFC}
                  isLoading={status === 'scanning'}
                  leftIcon={<Radio className="w-4 h-4" />}
                >
                  {status === 'scanning' ? 'Scanning for NFC Tag...' : 'Start Scanning'}
                </Button>
              </div>
            </div>

            {/* Scanned Tag Results */}
            {scannedTagInfo && (
              <div className="p-4 rounded-2xl bg-[#081326] border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">Chip Hardware Serial Number (UID):</span>
                  <span className="text-xs font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded">
                    {scannedTagInfo.serialNumber}
                  </span>
                </div>
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <span className="text-[11px] font-semibold text-slate-400">Stored Payload Records:</span>
                  {scannedTagInfo.records?.map((rec, i) => (
                    <p key={i} className="text-xs font-mono text-slate-200 bg-black/30 p-2 rounded truncate">
                      {rec}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs text-slate-400">
          <span className="flex items-center gap-1 text-cyan-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>NXP NTAG213 / NTAG215 / NTAG216 Compatible</span>
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
