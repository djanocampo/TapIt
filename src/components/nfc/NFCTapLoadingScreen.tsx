import React, { useEffect } from 'react';
import tapItLogo from '../../assets/tapit-logo.png';
import { Wifi, Sparkles } from 'lucide-react';
import { BitsInfinityEmblem } from '../common/BitsBrandElements';

interface NFCTapLoadingScreenProps {
  statusText?: string;
  subText?: string;
  profileName?: string;
  profileSlug?: string;
  isVerifying?: boolean;
}

export const NFCTapLoadingScreen: React.FC<NFCTapLoadingScreenProps> = ({
  statusText = 'Connecting to TapIt Profile...',
  subText = 'Instant digital identity handshake in progress',
  profileName,
  profileSlug,
}) => {
  // Trigger gentle tactile haptic feedback on devices that support Web Vibration API
  useEffect(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([35, 45, 35]);
      }
    } catch {
      // Ignore vibration errors on non-supporting devices
    }
  }, []);

  return (
    <div className="min-h-screen bg-bits-midnight bits-hero-mesh flex flex-col items-center justify-center p-4 text-center relative overflow-hidden select-none">
      {/* Dynamic Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] bg-gradient-to-tr from-bits-azure/30 via-bits-electric/25 to-bits-cyan/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-bits-cyan/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Loading Card Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-4">
        
        {/* Top Status Pill: Contactless Flash Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bits-navy/80 border border-bits-cyan/40 text-bits-cyan shadow-glow-cyan backdrop-blur-md mb-8 animate-fade-in">
          <BitsInfinityEmblem size={12} />
          <Wifi className="w-3.5 h-3.5 text-bits-cyan rotate-90" />
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
            BITS Tap™ NFC Read Handshake
          </span>
        </div>

        {/* Center Logo Experience with Expanding Electromagnetic Waves */}
        <div className="relative flex items-center justify-center my-4 w-44 h-44 sm:w-52 sm:h-52">
          {/* Concentric NFC Electromagnetic Wave Rings */}
          <div className="absolute inset-0 rounded-full border border-bits-cyan/35 nfc-wave-1 pointer-events-none" />
          <div className="absolute inset-0 rounded-full border border-bits-electric/30 nfc-wave-2 pointer-events-none" />
          <div className="absolute inset-0 rounded-full border border-bits-azure/30 nfc-wave-3 pointer-events-none" />

          {/* Glowing Aura Disk */}
          <div className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-bits-azure/30 to-bits-navy/90 border border-bits-cyan/40 shadow-glow-cyan backdrop-blur-xl flex items-center justify-center" />

          {/* Official TapIt Logo */}
          <div className="relative z-10 p-3 flex items-center justify-center">
            <img
              src={tapItLogo}
              alt="TapIt"
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_4px_24px_rgba(6,182,212,0.6)] animate-pulse duration-700"
            />
          </div>
        </div>

        {/* Status Text & Resolved Profile Info */}
        <div className="mt-6 space-y-2.5 w-full">
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
            {statusText}
          </h2>

          {profileName ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{profileName}</span>
              {profileSlug && <span className="text-cyan-400/70 font-mono">(@{profileSlug})</span>}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              {subText}
            </p>
          )}

          {/* High-Tech Shimmer Scanning Bar */}
          <div className="pt-3 w-48 mx-auto">
            <div className="h-1 w-full bg-slate-800/80 rounded-full overflow-hidden relative border border-white/5">
              <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[shimmer_1.4s_infinite] w-full"
                   style={{
                     backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.8) 50%, transparent 100%)',
                     backgroundSize: '200% 100%',
                   }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Contactless Watermark */}
        <div className="mt-10 text-[10px] tracking-widest uppercase font-mono text-slate-500 flex items-center gap-2">
          <span>TapIt Hardware Security</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span>Encrypted Handshake</span>
        </div>

      </div>
    </div>
  );
};
