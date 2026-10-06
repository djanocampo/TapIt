import React from 'react';
import { useTapIt } from '../../store';
import { ThemeSelector } from '../../components/profile/ThemeSelector';
import { MobileFramePreview } from '../../components/profile/MobileFramePreview';
import { Button } from '../../components/ui/Button';
import { Palette, Sparkles, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { triggerConfetti } from '../../lib/utils';
import { BitsInfinityEmblem } from '../../components/common/BitsBrandElements';

export const AppearancePage: React.FC = () => {
  const { activeProfile, updateProfile, links, profiles, setActiveProfileId } = useTapIt();

  const handleSelectTheme = (theme: any) => {
    updateProfile(activeProfile.id, { theme });
    triggerConfetti();
  };

  const handleUpdateStyleOptions = (options: any) => {
    updateProfile(activeProfile.id, {
      theme: {
        ...activeProfile.theme,
        ...options,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-bits-cyan bg-bits-azure/30 border border-bits-cyan/30 px-3 py-0.5 rounded-full mb-1">
            <BitsInfinityEmblem size={12} />
            <span>Design Tokens & Aesthetic Customizer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">Appearance Studio</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Customize the look and feel of your public persona with curated themes, fonts, and button shapes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <select
            value={activeProfile.id}
            onChange={(e) => setActiveProfileId(e.target.value)}
            className="bg-bits-midnight border border-bits-horizon/40 hover:border-bits-cyan text-base sm:text-xs font-bold text-bits-cyan rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-bits-navy text-white">
                {p.name} Profile
              </option>
            ))}
          </select>

          <Link to={`/@${activeProfile.slug}`} target="_blank">
            <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5 text-bits-cyan" />}>
              Preview Public
            </Button>
          </Link>
        </div>
      </div>

      {/* Split Screen Layout: Controls (Left) & Phone Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls */}
        <div className="lg:col-span-7 bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 sm:p-8 shadow-card-bits space-y-6 backdrop-blur-xl">
          <ThemeSelector
            currentTheme={activeProfile.theme}
            onSelectTheme={handleSelectTheme}
            onUpdateStyleOptions={handleUpdateStyleOptions}
          />
        </div>

        {/* Live Phone Preview */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Live Theme Preview
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              Theme: {activeProfile.theme.name}
            </span>
          </div>

          <MobileFramePreview
            profile={activeProfile}
            links={links}
          />
        </div>
      </div>
    </div>
  );
};
