import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Toggle } from '../../components/ui/Toggle';
import { MobileFramePreview } from '../../components/profile/MobileFramePreview';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Building, 
  Briefcase, 
  Check, 
  ArrowLeft, 
  ExternalLink, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Edit3,
  GripVertical,
  Link2,
  Layers,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Music,
  FileText,
  Coffee,
  Calendar,
  CreditCard,
  Share2
} from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';
import { LinkItem, LinkCategory } from '../../types';

const PRESET_ICONS = [
  { id: 'Linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'Github', label: 'GitHub', icon: Github },
  { id: 'Instagram', label: 'Instagram', icon: Instagram },
  { id: 'Twitter', label: 'X / Twitter', icon: Twitter },
  { id: 'Youtube', label: 'YouTube', icon: Youtube },
  { id: 'Music', label: 'Spotify', icon: Music },
  { id: 'Briefcase', label: 'Portfolio', icon: Briefcase },
  { id: 'FileText', label: 'Resume', icon: FileText },
  { id: 'Globe', label: 'Website', icon: Globe },
  { id: 'Mail', label: 'Email', icon: Mail },
  { id: 'Phone', label: 'Phone', icon: Phone },
  { id: 'Coffee', label: 'Support', icon: Coffee },
  { id: 'Calendar', label: 'Calendly', icon: Calendar },
  { id: 'CreditCard', label: 'Store', icon: CreditCard },
];

export const ProfileEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    profiles, 
    updateProfile, 
    links, 
    activeProfile, 
    addLink, 
    updateLink, 
    deleteLink, 
    toggleLinkActive, 
    reorderLinks 
  } = useTapIt();

  const targetProfile = profiles.find((p) => p.id === id) || activeProfile;

  // Collapsible cards state
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({
    identity: false,
    contact: false,
    links: false,
  });

  const toggleCardCollapse = (cardKey: string) => {
    setCollapsedCards(prev => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  // Form inputs state
  const [formData, setFormData] = useState({
    displayName: targetProfile.displayName || '',
    slug: targetProfile.slug || '',
    headline: targetProfile.headline || '',
    bio: targetProfile.bio || '',
    avatar: targetProfile.avatar || '',
    company: targetProfile.company || '',
    jobTitle: targetProfile.jobTitle || '',
    email: targetProfile.email || '',
    showEmail: targetProfile.showEmail ?? true,
    phone: targetProfile.phone || '',
    showPhone: targetProfile.showPhone ?? false,
    location: targetProfile.location || '',
    website: targetProfile.website || '',
  });

  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Link Add/Edit Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkIcon, setLinkIcon] = useState('Globe');
  const [linkCategory, setLinkCategory] = useState<LinkCategory>('social');

  const profileLinks = links
    .filter((l) => l.profileId === targetProfile.id)
    .sort((a, b) => a.position - b.position);

  useEffect(() => {
    if (targetProfile) {
      setFormData({
        displayName: targetProfile.displayName || '',
        slug: targetProfile.slug || '',
        headline: targetProfile.headline || '',
        bio: targetProfile.bio || '',
        avatar: targetProfile.avatar || '',
        company: targetProfile.company || '',
        jobTitle: targetProfile.jobTitle || '',
        email: targetProfile.email || '',
        showEmail: targetProfile.showEmail ?? true,
        phone: targetProfile.phone || '',
        showPhone: targetProfile.showPhone ?? false,
        location: targetProfile.location || '',
        website: targetProfile.website || '',
      });
    }
  }, [targetProfile.id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);

    // Immediate state synchronization for live phone preview
    updateProfile(targetProfile.id, {
      [field]: value,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(targetProfile.id, {
      displayName: formData.displayName,
      slug: formData.slug.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      headline: formData.headline,
      bio: formData.bio,
      avatar: formData.avatar,
      company: formData.company,
      jobTitle: formData.jobTitle,
      email: formData.email,
      showEmail: formData.showEmail,
      phone: formData.phone,
      showPhone: formData.showPhone,
      location: formData.location,
      website: formData.website,
    });

    setIsSaved(true);
    triggerConfetti();
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Link Operations inside the Links Card
  const handleOpenAddLink = () => {
    setEditingLinkId(null);
    setLinkTitle('');
    setLinkUrl('');
    setLinkIcon('Globe');
    setLinkCategory('social');
    setIsLinkModalOpen(true);
  };

  const handleOpenEditLink = (link: LinkItem) => {
    setEditingLinkId(link.id);
    setLinkTitle(link.title);
    setLinkUrl(link.url);
    setLinkIcon(link.icon);
    setLinkCategory(link.category);
    setIsLinkModalOpen(true);
  };

  const handleSaveLinkItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    const formattedUrl = linkUrl.startsWith('http') || linkUrl.startsWith('mailto:') || linkUrl.startsWith('tel:')
      ? linkUrl
      : `https://${linkUrl}`;

    if (editingLinkId) {
      updateLink(editingLinkId, {
        title: linkTitle,
        url: formattedUrl,
        icon: linkIcon,
        category: linkCategory,
      });
    } else {
      addLink({
        profileId: targetProfile.id,
        title: linkTitle,
        url: formattedUrl,
        icon: linkIcon,
        category: linkCategory,
        position: profileLinks.length,
        isActive: true,
      });
      triggerConfetti();
    }

    setIsLinkModalOpen(false);
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= profileLinks.length) return;

    const reordered = [...profileLinks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    reorderLinks(targetProfile.id, reordered.map((l) => l.id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/profiles" className="p-2 rounded-xl bg-[#081224] border border-white/[0.08] text-slate-300 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              Editing: {targetProfile.name} Profile
            </h2>
            <p className="text-xs text-slate-400">
              Live updates reflect on your public profile and NFC tap endpoints in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapit.app';
              navigator.clipboard.writeText(`${origin}/@${targetProfile.slug}`);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
              copiedLink
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-[#081224] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/[0.08]'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          <Link to={`/@${targetProfile.slug}`} target="_blank">
            <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open Public Profile
            </Button>
          </Link>
          <Button
            variant="glow"
            size="sm"
            onClick={handleSave}
            leftIcon={isSaved ? <Check className="w-4 h-4 text-slate-950" /> : undefined}
          >
            {isSaved ? 'Changes Saved!' : 'Save Profile'}
          </Button>
        </div>
      </div>

      {/* Split-Screen: Editor (Left) & Real-Time Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form (Left Column) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* ========================================================
              CARD 1: PUBLIC IDENTITY & BIO (COLLAPSIBLE)
              ======================================================== */}
          <div className="bg-[#081224]/90 border border-white/[0.08] rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl transition duration-200">
            {/* Card Header & Collapse Toggle */}
            <div className="p-5 flex items-center justify-between border-b border-white/[0.06] bg-[#050c18]/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Public Identity & Bio
                </h3>
              </div>

              <button
                type="button"
                onClick={() => toggleCardCollapse('identity')}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] transition flex items-center gap-1 text-xs font-semibold"
                title={collapsedCards.identity ? 'Expand Card' : 'Collapse Card'}
              >
                <span>{collapsedCards.identity ? 'Expand' : 'Collapse'}</span>
                {collapsedCards.identity ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Card Body */}
            {!collapsedCards.identity && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Display Name"
                    value={formData.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                    required
                  />
                  <Input
                    label="Custom URL Slug"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    helperText={`tapit.app/@${formData.slug}`}
                    required
                  />
                </div>

                <Input
                  label="Avatar Image URL"
                  value={formData.avatar}
                  onChange={(e) => handleChange('avatar', e.target.value)}
                  placeholder="https://..."
                />

                <Input
                  label="Headline / Tagline"
                  value={formData.headline}
                  onChange={(e) => handleChange('headline', e.target.value)}
                  placeholder="e.g. Information Systems Student | QA Tester | Systems Analyst"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    About / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    className="w-full rounded-2xl bg-[#050c18] border border-white/[0.08] px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    placeholder="Share your background, open opportunities, and specializations..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              CARD 2: PROFESSIONAL & CONTACT DETAILS (COLLAPSIBLE)
              ======================================================== */}
          <div className="bg-[#081224]/90 border border-white/[0.08] rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl transition duration-200">
            {/* Card Header & Collapse Toggle */}
            <div className="p-5 flex items-center justify-between border-b border-white/[0.06] bg-[#050c18]/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Professional & Contact Details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => toggleCardCollapse('contact')}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] transition flex items-center gap-1 text-xs font-semibold"
                title={collapsedCards.contact ? 'Expand Card' : 'Collapse Card'}
              >
                <span>{collapsedCards.contact ? 'Expand' : 'Collapse'}</span>
                {collapsedCards.contact ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Card Body with Email & Phone Tick Boxes */}
            {!collapsedCards.contact && (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Job Title"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    leftIcon={<Briefcase className="w-4 h-4" />}
                    placeholder="e.g. Systems Analyst"
                  />
                  <Input
                    label="Company / Org"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    leftIcon={<Building className="w-4 h-4" />}
                    placeholder="e.g. Nexus Tech Systems"
                  />
                </div>

                {/* Email with Show/Hide Checkbox */}
                <div className="p-4 rounded-2xl bg-[#050c18] border border-white/[0.06] space-y-3">
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    placeholder="name@example.com"
                  />
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={formData.showEmail}
                      onChange={(e) => handleChange('showEmail', e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-400 w-4 h-4"
                    />
                    <span>Display email address publicly on profile</span>
                  </label>
                </div>

                {/* Phone Number with Show/Hide Checkbox */}
                <div className="p-4 rounded-2xl bg-[#050c18] border border-white/[0.06] space-y-3">
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    leftIcon={<Phone className="w-4 h-4" />}
                    placeholder="+63 917 889 2041"
                  />
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={formData.showPhone}
                      onChange={(e) => handleChange('showPhone', e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-400 w-4 h-4"
                    />
                    <span>Display phone number publicly on profile</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4" />}
                    placeholder="e.g. Metro Manila, Philippines"
                  />
                  <Input
                    label="Personal Website"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    leftIcon={<Globe className="w-4 h-4" />}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              CARD 3: LINKS (RENAMED FROM SOCIAL MEDIA) - ONE COLUMN
              ======================================================== */}
          <div className="bg-[#081224]/90 border border-white/[0.08] rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl transition duration-200">
            {/* Card Header with Add Link Button & Collapse Toggle */}
            <div className="p-5 flex items-center justify-between border-b border-white/[0.06] bg-[#050c18]/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Link2 className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Links
                  </h3>
                  <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    {profileLinks.length}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="glow"
                  size="xs"
                  onClick={handleOpenAddLink}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Link
                </Button>

                <button
                  type="button"
                  onClick={() => toggleCardCollapse('links')}
                  className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] transition flex items-center gap-1 text-xs font-semibold"
                  title={collapsedCards.links ? 'Expand Card' : 'Collapse Card'}
                >
                  <span>{collapsedCards.links ? 'Expand' : 'Collapse'}</span>
                  {collapsedCards.links ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Card Body: Single Column List of Links */}
            {!collapsedCards.links && (
              <div className="p-6 space-y-3">
                {profileLinks.length === 0 ? (
                  <div className="text-center py-8 bg-[#050c18] border border-white/[0.04] rounded-2xl space-y-2">
                    <Link2 className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-white">No links added to this profile yet</p>
                    <p className="text-[11px] text-slate-400">Add social accounts, repositories, portfolios, or custom URLs.</p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={handleOpenAddLink}
                      leftIcon={<Plus className="w-3 h-3" />}
                    >
                      Add First Link
                    </Button>
                  </div>
                ) : (
                  profileLinks.map((link, index) => {
                    const IconComponent = PRESET_ICONS.find((i) => i.id === link.icon)?.icon || Globe;

                    return (
                      <div
                        key={link.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          link.isActive
                            ? 'bg-[#050c18] border-white/[0.08] hover:border-cyan-500/40'
                            : 'bg-black/40 border-white/[0.03] opacity-60'
                        }`}
                      >
                        {/* Reorder Arrows + Icon + Title & URL */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex flex-col items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveLink(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20"
                              title="Move up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveLink(index, 'down')}
                              disabled={index === profileLinks.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20"
                              title="Move down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-white truncate">
                                {link.title}
                              </span>
                              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20 uppercase hidden sm:inline">
                                {link.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate font-mono">
                              {link.url}
                            </p>
                          </div>
                        </div>

                        {/* Right: Visibility Switch + Edit + Delete */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Toggle
                            checked={link.isActive}
                            onChange={() => toggleLinkActive(link.id)}
                          />

                          <button
                            type="button"
                            onClick={() => handleOpenEditLink(link)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Edit Link"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteLink(link.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Delete Link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </form>

        {/* Real-Time Live Phone Preview (Right Column) */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Real-Time Phone Preview
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </div>

          <MobileFramePreview
            profile={targetProfile}
            links={links}
          />
        </div>
      </div>

      {/* ========================================================
          ADD / EDIT LINK MODAL (TRIGGERED FROM LINKS CARD)
          ======================================================== */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title={editingLinkId ? 'Edit Link' : 'Add Link to Profile'}
        description={`Add a link destination to ${targetProfile.name} profile.`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveLinkItem} className="space-y-4">
          <Input
            label="Link Title"
            placeholder="e.g. 💼 View GitHub Repos or 📸 Instagram"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            required
          />

          <Input
            label="Destination URL"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            required
          />

          {/* Icon Preset Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Icon Preset:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {PRESET_ICONS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = linkIcon === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setLinkIcon(preset.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] truncate max-w-full font-semibold">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Category:
            </label>
            <select
              value={linkCategory}
              onChange={(e) => setLinkCategory(e.target.value as LinkCategory)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="social">Social Media</option>
              <option value="portfolio">Portfolio</option>
              <option value="work">Work & Repos</option>
              <option value="contact">Contact & Meeting</option>
              <option value="media">Media / Music / Video</option>
              <option value="commerce">Store & Orders</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button variant="secondary" type="button" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" type="submit">
              {editingLinkId ? 'Save Changes' : 'Add Link'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
