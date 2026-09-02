import React from 'react';
import { useTapIt } from '../../store';
import { LinkItem } from '../../types';
import { Toggle } from '../../components/ui/Toggle';
import { 
  Link2, 
  ExternalLink, 
  MousePointerClick, 
  Briefcase,
  Linkedin,
  Github,
  FileText,
  Mail,
  Instagram,
  Youtube,
  Music,
  Coffee,
  Calendar,
  CreditCard,
  Twitter,
  Globe,
  Sparkles,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';
import { formatNumber } from '../../lib/utils';

const PRESET_ICONS: Record<string, React.ElementType> = {
  Briefcase,
  Linkedin,
  Github,
  FileText,
  Mail,
  Instagram,
  Twitter,
  Youtube,
  Music,
  Coffee,
  CreditCard,
  Calendar,
  Globe,
};

export const MyLinksPage: React.FC = () => {
  const { profiles, activeProfile, setActiveProfileId, links, toggleLinkActive } = useTapIt();

  const profileLinks = links
    .filter((l) => l.profileId === activeProfile.id)
    .sort((a, b) => b.clicks - a.clicks); // Sorted by most clicked for monitoring!

  const totalClicks = profileLinks.reduce((acc, l) => acc + l.clicks, 0);
  const activeCount = profileLinks.filter((l) => l.isActive).length;

  return (
    <div className="space-y-8">
      {/* Top Header with Profile Dropdown on the far right (Monitoring Only) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#081224]/90 border border-white/[0.08] shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white font-display">Links Monitoring & Telemetry</h2>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              {profileLinks.length} Tracked Links
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time click engagement and traffic telemetry for <strong>{activeProfile.name}</strong> profile.
          </p>
        </div>

        {/* Profile Dropdown Aligned to the Right */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-slate-400 font-semibold hidden sm:inline">Profile:</label>
          <select
            value={activeProfile.id}
            onChange={(e) => setActiveProfileId(e.target.value)}
            className="bg-[#050c18] border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold text-cyan-300 rounded-xl px-3.5 py-2 focus:outline-none shadow-sm cursor-pointer"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#081224] text-white">
                {p.name} Profile
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#081224]/90 border border-white/[0.08] rounded-2xl p-4 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            <MousePointerClick className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Link Clicks</span>
            <p className="text-xl font-bold text-white font-display">{formatNumber(totalClicks)}</p>
          </div>
        </div>

        <div className="bg-[#081224]/90 border border-white/[0.08] rounded-2xl p-4 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Active / Visible Links</span>
            <p className="text-xl font-bold text-white font-display">{activeCount} / {profileLinks.length}</p>
          </div>
        </div>

        <div className="bg-[#081224]/90 border border-white/[0.08] rounded-2xl p-4 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30">
            <TrendingUp className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Top Performing Link</span>
            <p className="text-xs font-bold text-cyan-300 truncate max-w-[160px]">
              {profileLinks[0]?.title || 'No links yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Links Monitoring List */}
      <div className="space-y-3">
        {profileLinks.length === 0 ? (
          <div className="text-center py-16 bg-[#081224]/90 border border-white/[0.08] rounded-3xl space-y-2 backdrop-blur-xl">
            <Link2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No tracked links found for {activeProfile.name}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Links can be configured inside the Profile Editor under the "Links" card.
            </p>
          </div>
        ) : (
          profileLinks.map((link) => {
            const IconComponent = PRESET_ICONS[link.icon] || Globe;

            return (
              <div
                key={link.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl ${
                  link.isActive
                    ? 'bg-[#081224]/90 border-white/[0.08] hover:border-cyan-500/30 shadow-xl'
                    : 'bg-slate-950/60 border-white/[0.04] opacity-60'
                }`}
              >
                {/* Icon + Title + URL */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{link.title}</h4>
                      <span className="text-[10px] font-medium bg-white/[0.06] text-slate-300 px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline">
                        {link.category}
                      </span>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-cyan-400 truncate flex items-center gap-1 font-mono mt-0.5"
                    >
                      <span>{link.url}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  </div>
                </div>

                {/* Right side: Click Telemetry + Toggle Visibility */}
                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.08]">
                  {/* Click Badge */}
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 rounded-xl">
                    <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{formatNumber(link.clicks)} clicks</span>
                  </div>

                  {/* Visibility Switch */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {link.isActive ? 'Active' : 'Hidden'}
                    </span>
                    <Toggle
                      checked={link.isActive}
                      onChange={() => toggleLinkActive(link.id)}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
