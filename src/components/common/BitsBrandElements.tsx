import React from 'react';

interface BitsEmblemProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

/**
 * Official BITS Infinity Cloud Monogram:
 * Integrates an infinity loop with the letter 'B' within a cloud silhouette.
 * Translates the slogan: "Stay Grounded, Be Boundless."
 */
export const BitsInfinityEmblem: React.FC<BitsEmblemProps> = ({
  className = '',
  size = 32,
  glow = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${glow ? 'bits-infinity-glow' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="bitsCloudGrad" x1="8" y1="12" x2="56" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="45%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#124294" />
          </linearGradient>
          <linearGradient id="bitsInfinityGrad" x1="18" y1="22" x2="46" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <filter id="bitsSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Cloud Silhouette Shell */}
        <path
          d="M48 48H18C12.477 48 8 43.523 8 38C8 33.02 11.64 28.89 16.44 28.11C18.15 20.08 25.32 14 34 14C44.17 14 52.56 21.64 53.84 31.52C57.41 32.74 60 36.08 60 40C60 44.418 56.418 48 52 48H48Z"
          fill="url(#bitsCloudGrad)"
          opacity="0.95"
        />

        {/* Ambient Inner Glass Bevel */}
        <path
          d="M48 46.5H18C13.3 46.5 9.5 42.7 9.5 38C9.5 33.74 12.63 30.18 16.8 29.58L17.8 29.43L18.06 28.47C19.58 21.36 26.06 15.5 34 15.5C43.14 15.5 50.73 22.38 51.9 31.33L52.05 32.48L53.18 32.75C56.36 33.51 58.5 36.49 58.5 40C58.5 43.59 55.59 46.5 52 46.5H48Z"
          stroke="#E0F2FE"
          strokeWidth="1.2"
          strokeOpacity="0.4"
          fill="none"
        />

        {/* The Infinity 'B' Loop */}
        <path
          d="M26 31C28.2 27.5 32.5 27 35 29.5L39 33.5C42 36.5 46 36.5 47.5 34C49 31.5 47.5 28.5 44 28.5H35"
          stroke="url(#bitsInfinityGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M38 33C35.8 36.5 31.5 37 29 34.5L25 30.5C22 27.5 18 27.5 16.5 30C15 32.5 16.5 35.5 20 35.5H29"
          stroke="url(#bitsInfinityGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Central Core Connection */}
        <circle cx="32" cy="32" r="2.2" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export const BitsEnterpriseBadge: React.FC<{
  className?: string;
  variant?: 'subtle' | 'glow' | 'amber';
}> = ({ className = '', variant = 'subtle' }) => {
  if (variant === 'amber') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-semibold ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>KPI TARGET • BITS TELEMETRY</span>
      </div>
    );
  }

  if (variant === 'glow') {
    return (
      <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#124294]/30 border border-[#38BDF8]/40 text-[#E0F2FE] text-xs font-semibold backdrop-blur-md shadow-glow-cyan ${className}`}>
        <BitsInfinityEmblem size={16} />
        <span className="tracking-wide">BITS Tap™ Ecosystem</span>
        <span className="text-[10px] text-[#38BDF8] font-mono font-bold uppercase">• Enterprise Grade</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a142c] border border-[#1B55C6]/40 text-slate-300 text-[11px] font-medium backdrop-blur-md ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
      <span>BITS Operating Infrastructure</span>
      <span className="text-[#38BDF8] text-[10px] font-mono">2026 EDITION</span>
    </div>
  );
};
