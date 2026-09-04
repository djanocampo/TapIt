import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { 
  Users, 
  Search, 
  ExternalLink, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  ShieldCheck, 
  Radio, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  Palette, 
  Link as LinkIcon, 
  User as UserIcon,
  Eye
} from 'lucide-react';
import { formatRelativeTime } from '../../lib/utils';

export const ProfileDirectoryPage: React.FC = () => {
  const { allUsers, profiles, links, cards } = useTapIt();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Expanded user rows state (by default expand the first user or all)
  const [expandedUserIds, setExpandedUserIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (allUsers.length > 0) {
      allUsers.forEach(u => {
        initial[u.id] = true; // start expanded for instant clarity
      });
    }
    return initial;
  });

  const toggleUserExpand = (userId: string) => {
    setExpandedUserIds(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleExpandAll = () => {
    const updated: Record<string, boolean> = {};
    allUsers.forEach(u => { updated[u.id] = true; });
    setExpandedUserIds(updated);
  };

  const handleCollapseAll = () => {
    setExpandedUserIds({});
  };

  // Group profiles by user ID
  const filteredUsers = allUsers.filter((user) => {
    const userProfiles = profiles.filter(p => p.userId === user.id);
    const matchesUser = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProfiles = userProfiles.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.headline.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return (matchesUser || matchesProfiles) && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#081224]/90 border border-white/[0.08] shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white font-display">User Profile Directory</h2>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              {profiles.length} Profiles across {allUsers.length} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Organized hierarchy of digital profiles, assigned themes, link trees, and linked NFC hardware per user.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="xs"
            onClick={handleExpandAll}
          >
            Expand All
          </Button>
          <Button
            variant="secondary"
            size="xs"
            onClick={handleCollapseAll}
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#081224]/90 border border-white/[0.08] rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by user, profile name, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Grouped Profiles List organized per User Account */}
      <div className="space-y-5">
        {filteredUsers.length === 0 ? (
          <div className="bg-[#081224]/90 border border-white/[0.08] rounded-3xl p-12 text-center text-slate-400 backdrop-blur-xl">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">No accounts or profiles match your query</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or role filters.</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const userProfiles = profiles.filter((p) => p.userId === user.id);
            const userCards = cards.filter((c) => c.userId === user.id);
            const isExpanded = !!expandedUserIds[user.id];

            return (
              <div
                key={user.id}
                className="bg-[#081224]/90 border border-white/[0.08] hover:border-cyan-500/30 rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl transition duration-200"
              >
                {/* User Header Accordion Trigger Row */}
                <button
                  type="button"
                  onClick={() => toggleUserExpand(user.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-cyan-500/40 shrink-0"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#081224]"></span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-white truncate">
                          {user.name}
                        </span>
                        <span className="text-xs font-mono text-cyan-400">
                          (@{user.username})
                        </span>
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                            <ShieldCheck className="w-3 h-3 text-cyan-400" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40">
                            <UserIcon className="w-3 h-3 text-sky-400" />
                            User
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="hidden sm:flex items-center gap-3 text-xs">
                      <span className="font-semibold text-slate-300 bg-white/[0.05] border border-white/[0.08] px-3 py-1 rounded-xl">
                        {userProfiles.length} {userProfiles.length === 1 ? 'Profile' : 'Profiles'}
                      </span>
                      <span className="font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded-xl">
                        {userCards.length} {userCards.length === 1 ? 'NFC Card' : 'NFC Cards'}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-white transition">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Child Profiles Drawer */}
                {isExpanded && (
                  <div className="border-t border-white/[0.08] bg-[#050c18] p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        Registered Digital Profiles for {user.name}:
                      </span>
                    </div>

                    {userProfiles.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-black/20 border border-white/[0.04] text-center text-xs text-slate-400">
                        No profiles created for this account yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userProfiles.map((prof) => {
                          const profLinks = links.filter((l) => l.profileId === prof.id);
                          const assignedCard = cards.find((c) => c.profileId === prof.id);

                          return (
                            <div
                              key={prof.id}
                              className="bg-[#09152b] border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-4 space-y-3.5 flex flex-col justify-between shadow-lg transition-all duration-200 group"
                            >
                              <div className="space-y-3">
                                {/* Profile Top Meta */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={prof.avatar}
                                      alt={prof.displayName}
                                      className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30 shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <h4 className="font-bold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                                        <span>{prof.name}</span>
                                        {prof.isActive && (
                                          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow-cyan"></span>
                                        )}
                                      </h4>
                                      <p className="text-[11px] text-cyan-400 font-mono truncate">
                                        tapit.app/@{prof.slug}
                                      </p>
                                    </div>
                                  </div>

                                  <span
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                                      prof.isActive
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {prof.isActive ? 'Active' : 'Standby'}
                                  </span>
                                </div>

                                {/* Headline / Bio */}
                                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                                  {prof.headline || prof.bio || 'TapIt Digital Profile Member'}
                                </p>

                                {/* Badges (Theme, Links Count, Linked Card) */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/[0.06] text-slate-300 font-semibold">
                                    <Palette className="w-3 h-3 text-cyan-400" />
                                    {prof.theme?.name || 'Cyberpunk'}
                                  </span>

                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/[0.06] text-slate-300 font-semibold">
                                    <LinkIcon className="w-3 h-3 text-sky-400" />
                                    {profLinks.length} Links
                                  </span>

                                  {assignedCard && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                                      <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                                      {assignedCard.cardToken}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Card Bottom Actions */}
                              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end">
                                <Link
                                  to={`/@${prof.slug}`}
                                  target="_blank"
                                  className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                                >
                                  <span>Inspect Public Profile</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
