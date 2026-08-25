import React from 'react';
import { useTapIt } from '../../store';
import { ThemeSelector } from '../../components/profile/ThemeSelector';
import { MobileFramePreview } from '../../components/profile/MobileFramePreview';
import { Button } from '../../components/ui/Button';
import { Palette, Sparkles, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { triggerConfetti } from '../../lib/utils';

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
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">Appearance Studio</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Customize the look and feel of your public profile with curated themes, fonts, and button shapes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeProfile.id}
            onChange={(e) => setActiveProfileId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl px-3 py-2 focus:border-cyan-500 focus:outline-none"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} Profile
              </option>
            ))}
          </select>

          <Link to={`/@${activeProfile.slug}`} target="_blank">
            <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Preview Public
            </Button>
          </Link>
        </div>
      </div>

      {/* Split Screen Layout: Controls (Left) & Phone Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls */}
        <div className="lg:col-span-7 bg-[#0d1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
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
