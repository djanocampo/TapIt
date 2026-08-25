import React from 'react';
import { Profile, LinkItem } from '../../types';
import { PublicProfileRenderer } from './PublicProfileRenderer';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFramePreviewProps {
  profile: Profile;
  links: LinkItem[];
  className?: string;
  onOpenShare?: () => void;
}

export const MobileFramePreview: React.FC<MobileFramePreviewProps> = ({
  profile,
  links,
  className,
  onOpenShare,
}) => {
  return (
    <div className={`relative mx-auto w-[320px] sm:w-[350px] aspect-[9/19.5] rounded-[48px] p-3.5 bg-slate-950 border-[6px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col ${className}`}>
      {/* Top Notch / Dynamic Island */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
        <div className="w-2 h-2 rounded-full bg-cyan-500/80 animate-pulse"></div>
      </div>

      {/* Screen Area */}
      <div className="relative w-full h-full rounded-[38px] overflow-hidden flex flex-col bg-[#070a13] border border-white/5">
        {/* Status Bar */}
        <div className="h-7 w-full flex items-center justify-between px-6 pt-1 text-[10px] text-slate-400 font-semibold z-20 select-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-2.5 h-2.5" />
            <Wifi className="w-2.5 h-2.5" />
            <Battery className="w-3 h-3 text-slate-300" />
          </div>
        </div>

        {/* Scrollable Public Profile */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          <PublicProfileRenderer
            profile={profile}
            links={links}
            isEmbed={true}
            onOpenShare={onOpenShare}
          />
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="h-4 w-full flex items-center justify-center pb-1 z-20 pointer-events-none">
          <div className="w-28 h-1 rounded-full bg-slate-600/70"></div>
        </div>
      </div>
    </div>
  );
};
