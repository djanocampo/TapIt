import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Profile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { 
  UserSquare2, 
  Plus, 
  Copy, 
  Check, 
  Archive, 
  Trash2, 
  ExternalLink, 
  Edit3, 
  CheckCircle2, 
  Smartphone, 
  Layers,
  Sparkles,
  Palette,
  Share2,
  CopyCheck
} from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';

export const MyProfilesPage: React.FC = () => {
  const { profiles, activeProfile, setActiveProfileId, createProfile, duplicateProfile, deleteProfile, toggleProfileArchive, links } = useTapIt();
  const navigate = useNavigate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileHeadline, setNewProfileHeadline] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyProfileLink = (profile: Profile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapit.app';
    const profileUrl = `${origin}/@${profile.slug}`;
    
    navigator.clipboard.writeText(profileUrl);
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const created = createProfile({
      name: newProfileName,
      headline: newProfileHeadline || 'Digital Identity & Links',
      slug: newProfileName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    });

    setIsCreateModalOpen(false);
    setNewProfileName('');
    setNewProfileHeadline('');
    triggerConfetti();
    navigate(`/dashboard/profiles/edit/${created.id}`);
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicateProfile(id);
    triggerConfetti();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#081224]/90 border border-white/[0.08] shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white font-display">My Profiles</h2>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              {profiles.length} Active Personas
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manage your distinct digital personas for professional, personal, creator, and business networking.
          </p>
        </div>

        <Button
          variant="glow"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Profile
        </Button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfile.id;
          const profileLinks = links.filter((l) => l.profileId === profile.id);
          const isCopied = copiedId === profile.id;

          return (
            <div
              key={profile.id}
              className={`bg-[#081224]/90 border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 backdrop-blur-xl ${
                isActive
                  ? 'border-cyan-400/80 ring-2 ring-cyan-500/20 shadow-glow-cyan'
                  : 'border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div>
                {/* Top Status Bar */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={profile.avatar}
                      alt={profile.displayName}
                      className="w-12 h-12 rounded-2xl object-cover border border-cyan-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-white font-display truncate">
                          {profile.name}
                        </h3>
                        {isActive && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                            Active
                          </span>
                        )}
                        {profile.isArchived && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                            Archived
                          </span>
                        )}
                      </div>

                      {/* Profile Public URL + 1-Click Copy Badge */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-cyan-400 font-mono truncate">
                          tapit.app/@{profile.slug}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyProfileLink(profile, e)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition flex items-center gap-1 shrink-0 ${
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                              : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border-white/[0.08]'
                          }`}
                          title="Copy Profile Public Link"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-cyan-400" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/@${profile.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-[#050c18] border border-white/[0.08] text-slate-400 hover:text-white transition shrink-0"
                    title="View public profile in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

                {/* Headline & Bio Preview */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                  {profile.headline}
                </p>

                {/* Profile Stats Pills */}
                <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold text-slate-400 mb-6">
                  <span className="px-2.5 py-1 rounded-lg bg-[#050c18] border border-white/[0.06] text-slate-300">
                    🔗 {profileLinks.length} Links
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#050c18] border border-white/[0.06] text-slate-300 capitalize">
                    🎨 {profile.theme.name}
                  </span>
                  {profile.jobTitle && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#050c18] border border-white/[0.06] text-slate-300">
                      💼 {profile.jobTitle}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {!isActive && (
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => setActiveProfileId(profile.id)}
                    >
                      Set Active
                    </Button>
                  )}
                  <Link to={`/dashboard/profiles/edit/${profile.id}`}>
                    <Button variant="primary" size="xs" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                      Edit Details
                    </Button>
                  </Link>
                  <Link to="/dashboard/appearance" onClick={() => setActiveProfileId(profile.id)}>
                    <Button variant="secondary" size="xs" leftIcon={<Palette className="w-3.5 h-3.5 text-pink-400" />}>
                      Theme & Style
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleCopyProfileLink(profile, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] transition flex items-center gap-1 text-xs"
                    title="Copy Profile URL to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(profile.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition"
                    title="Duplicate profile"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleProfileArchive(profile.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/[0.06] transition"
                    title={profile.isArchived ? 'Unarchive' : 'Archive'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete profile "${profile.name}"?`)) {
                          deleteProfile(profile.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] transition"
                      title="Delete profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE PROFILE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Digital Profile"
        description="Add a new persona (e.g. Creator, Portfolio, Consulting, Business) to your account."
        maxWidth="md"
      >
        <form onSubmit={handleCreateProfile} className="space-y-4">
          <Input
            label="Profile Name"
            placeholder="e.g. Consulting, Creator, Photography"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            required
          />

          <Input
            label="Headline / Tagline"
            placeholder="e.g. Independent Brand Designer & Strategist"
            value={newProfileHeadline}
            onChange={(e) => setNewProfileHeadline(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
