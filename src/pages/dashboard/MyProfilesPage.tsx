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
  Archive, 
  Trash2, 
  ExternalLink, 
  Edit3, 
  CheckCircle2, 
  Smartphone, 
  Layers,
  Sparkles,
  Palette
} from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';

export const MyProfilesPage: React.FC = () => {
  const { profiles, activeProfile, setActiveProfileId, createProfile, duplicateProfile, deleteProfile, toggleProfileArchive, links } = useTapIt();
  const navigate = useNavigate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileHeadline, setNewProfileHeadline] = useState('');

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">My Profiles</h2>
          <p className="text-xs sm:text-sm text-slate-400">
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

          return (
            <div
              key={profile.id}
              className={`bg-[#0d1322] border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 ${
                isActive
                  ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 shadow-glow-cyan'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top status bar */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.avatar}
                      alt={profile.displayName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white font-display">{profile.name}</h3>
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
                      <p className="text-xs text-cyan-400 font-mono">tapit.app/@{profile.slug}</p>
                    </div>
                  </div>

                  <Link
                    to={`/@${profile.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                    title="View public profile"
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
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                    🔗 {profileLinks.length} Links
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 capitalize">
                    🎨 {profile.theme.name}
                  </span>
                  {profile.jobTitle && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                      💼 {profile.jobTitle}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
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
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(profile.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                    title="Duplicate profile"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleProfileArchive(profile.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                    title={profile.isArchived ? 'Unarchive' : 'Archive'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  {profiles.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete profile "${profile.name}"?`)) {
                          deleteProfile(profile.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete profile"
                    >
                      <Trash2 className="w-4 h-4" />
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
