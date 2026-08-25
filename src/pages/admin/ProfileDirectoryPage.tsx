import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { 
  UserSquare2, 
  Search, 
  ExternalLink, 
  Layers, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert 
} from 'lucide-react';
import { formatRelativeTime } from '../../lib/utils';

export const ProfileDirectoryPage: React.FC = () => {
  const { profiles, links } = useTapIt();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProfiles = profiles.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.headline.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">Profile Directory</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Browse and inspect all public and private digital identity profiles registered across the platform.
          </p>
        </div>

        <div className="text-xs font-semibold text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
          {profiles.length} Active Profiles
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="max-w-md">
          <Input
            placeholder="Search profiles by name, slug, headline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Profiles Table */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-medium">Profile Name & Slug</th>
                <th className="py-3.5 px-4 font-medium hidden sm:table-cell">Theme</th>
                <th className="py-3.5 px-4 font-medium hidden md:table-cell">Links Count</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredProfiles.map((prof) => {
                const profLinks = links.filter((l) => l.profileId === prof.id);

                return (
                  <tr key={prof.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prof.avatar}
                          alt={prof.displayName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{prof.name} ({prof.displayName})</p>
                          <p className="text-[11px] text-cyan-400 font-mono">tapit.app/@{prof.slug}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{prof.headline}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <span className="text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg capitalize">
                        🎨 {prof.theme.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300 hidden md:table-cell">
                      {profLinks.length} links
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          prof.isArchived
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {prof.isArchived ? 'Archived' : 'Published'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/@${prof.slug}`} target="_blank">
                        <Button variant="secondary" size="xs" rightIcon={<ExternalLink className="w-3 h-3" />}>
                          Inspect Public
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
