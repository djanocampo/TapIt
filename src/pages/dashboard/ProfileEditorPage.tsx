import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Toggle } from '../../components/ui/Toggle';
import { MobileFramePreview } from '../../components/profile/MobileFramePreview';
import { ThemeSelector } from '../../components/profile/ThemeSelector';
import { THEME_PRESETS } from '../../data/themes';
import { AvatarUpload } from '../../components/common/AvatarUpload';
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
  Loader2,
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
  Palette,
  Facebook,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Music,
  FileText,
  MessageCircle,
  Send,
  Video,
  Share2
} from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';
import { LinkItem, LinkCategory, ProfileThemeConfig, Profile } from '../../types';

const PRESET_ICONS = [
  { id: 'Facebook', label: 'Facebook', icon: Facebook },
  { id: 'Instagram', label: 'Instagram', icon: Instagram },
  { id: 'Twitter', label: 'X / Twitter', icon: Twitter },
  { id: 'Linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'Github', label: 'GitHub', icon: Github },
  { id: 'Youtube', label: 'YouTube', icon: Youtube },
  { id: 'Music', label: 'Spotify', icon: Music },
  { id: 'MessageCircle', label: 'WhatsApp', icon: MessageCircle },
  { id: 'Send', label: 'Telegram', icon: Send },
  { id: 'Video', label: 'Video Call', icon: Video },
  { id: 'Briefcase', label: 'Portfolio', icon: Briefcase },
  { id: 'FileText', label: 'Resume', icon: FileText },
  { id: 'Globe', label: 'Website', icon: Globe },
  { id: 'Link2', label: 'General Link', icon: Link2 },
  { id: 'ExternalLink', label: 'Custom URL', icon: ExternalLink },
  { id: 'Mail', label: 'Email', icon: Mail },
  { id: 'Phone', label: 'Phone', icon: Phone },
];

export const ProfileEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    currentUser,
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

  const cleanId = id ? (id.startsWith('prof_usr_') ? id.replace('prof_usr_', 'prof_') : id) : undefined;
  const targetProfile = profiles.find((p) => p.id === id || (cleanId && p.id === cleanId)) || activeProfile;

  // Collapsible cards state
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({
    identity: false,
    theme: false,
    contact: false,
    links: false,
  });

  const toggleCardCollapse = (cardKey: string) => {
    setCollapsedCards(prev => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  // Theme & Appearance State
  const [currentTheme, setCurrentTheme] = useState<ProfileThemeConfig>(() => {
    const raw = targetProfile.theme;
    if (typeof raw === 'string') return THEME_PRESETS[raw] || THEME_PRESETS['cyberpunk-neon'];
    if (raw && typeof raw === 'object') {
      const base = THEME_PRESETS[raw.id] || THEME_PRESETS['cyberpunk-neon'];
      return { ...base, ...raw };
    }
    return THEME_PRESETS['cyberpunk-neon'];
  });

  // Form inputs state
  const [formData, setFormData] = useState({
    name: targetProfile.name || '',
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
  const [isSaving, setIsSaving] = useState(false);
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
      const raw = targetProfile.theme;
      let safeT: ProfileThemeConfig = THEME_PRESETS['cyberpunk-neon'];
      if (typeof raw === 'string') safeT = THEME_PRESETS[raw] || safeT;
      else if (raw && typeof raw === 'object') safeT = { ...(THEME_PRESETS[raw.id] || safeT), ...raw };
      setCurrentTheme(safeT);
      setFormData({
        name: targetProfile.name || '',
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

  // Instant real-time preview profile object: combines targetProfile, current live formData, and currentTheme
  const previewProfile: Profile = useMemo(() => {
    const cleanSlug = (formData.slug || formData.displayName || targetProfile.slug || 'profile')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '');

    return {
      ...targetProfile,
      name: formData.name || targetProfile.name,
      displayName: formData.displayName,
      slug: cleanSlug,
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
      theme: currentTheme,
    };
  }, [targetProfile, formData, currentTheme]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSelectTheme = (newTheme: ProfileThemeConfig) => {
    setCurrentTheme(newTheme);
    setIsSaved(false);
  };

  const handleUpdateStyleOptions = (options: { buttonStyle?: any; fontStyle?: any; accentColor?: string; badgeBg?: string }) => {
    setCurrentTheme((prev) => ({
      ...prev,
      ...options,
    }));
    setIsSaved(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const cleanSlug = (formData.slug || formData.displayName || targetProfile.slug || 'profile')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]/g, '');

      const result = await updateProfile(targetProfile.id, {
        name: formData.name || formData.displayName || targetProfile.name,
        displayName: formData.displayName,
        slug: cleanSlug,
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
        theme: currentTheme,
      });

      if (result && !result.success) {
        alert(result.message || 'Failed to save profile changes. Please try again.');
        setIsSaving(false);
        return;
      }

      if (result?.profile) {
        setFormData(prev => ({
          ...prev,
          slug: result.profile!.slug || prev.slug,
          displayName: result.profile!.displayName ?? prev.displayName,
          name: result.profile!.name ?? prev.name,
        }));
      }

      setIsSaved(true);
      triggerConfetti();

      setTimeout(() => {
        setIsSaving(false);
      }, 300);

      setTimeout(() => {
        setIsSaved(false);
      }, 4000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile changes: ' + (err?.message || err));
      setIsSaving(false);
    }
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

          {/* Unsaved indicator badge */}
          {!isSaved && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Unsaved Changes
            </span>
          )}

          <Link to={`/@${targetProfile.slug}`} target="_blank">
            <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open Public Profile
            </Button>
          </Link>

          <Button
            variant="glow"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <Check className="w-4 h-4 text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
          >
            {isSaving ? 'Saving...' : isSaved ? 'Changes Saved!' : 'Save Profile'}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Persona Name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Persona Name"
                    required
                  />
                  <Input
                    label="Display Name"
                    value={formData.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                    placeholder="Display Name"
                    required
                  />
                  <Input
                    label="Custom URL Slug"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="Custom URL Slug"
                    helperText={`tapit.app/@${formData.slug}`}
                    required
                  />
                </div>

                <AvatarUpload
                  currentAvatar={formData.avatar}
                  name={formData.displayName || targetProfile.name}
                  userId={targetProfile.userId || currentUser?.id || 'usr_current'}
                  label="Profile Avatar Photo"
                  description="Customize this persona's avatar with circular crop, zoom & pan readjustments."
                  onAvatarChange={(newUrl) => handleChange('avatar', newUrl)}
                  extraActions={
                    currentUser?.avatar && currentUser.avatar !== formData.avatar ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleChange('avatar', currentUser.avatar)}
                        leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                        title="Use photo from your main account"
                      >
                        Use Account Photo
                      </Button>
                    ) : undefined
                  }
                />

                <Input
                  label="Headline / Tagline"
                  value={formData.headline}
                  onChange={(e) => handleChange('headline', e.target.value)}
                  placeholder="Headline / Tagline"
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
                    placeholder="About / Bio"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              CARD 2: THEME, APPEARANCE & BUTTON STYLING (COLLAPSIBLE)
              ======================================================== */}
          <div className="bg-[#081224]/90 border border-white/[0.08] rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl transition duration-200">
            {/* Card Header & Collapse Toggle */}
            <div className="p-5 flex items-center justify-between border-b border-white/[0.06] bg-[#050c18]/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-400/30">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Theme, Appearance & Styling
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Preset: <span className="text-cyan-400 font-bold">{currentTheme.name}</span> • Button: <span className="text-slate-200 font-bold capitalize">{currentTheme.buttonStyle}</span> • Font: <span className="text-slate-200 font-bold capitalize">{currentTheme.fontStyle}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleCardCollapse('theme')}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] transition flex items-center gap-1 text-xs font-semibold"
                title={collapsedCards.theme ? 'Expand Card' : 'Collapse Card'}
              >
                <span>{collapsedCards.theme ? 'Expand' : 'Collapse'}</span>
                {collapsedCards.theme ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Card Body */}
            {!collapsedCards.theme && (
              <div className="p-6">
                <ThemeSelector
                  currentTheme={currentTheme}
                  onSelectTheme={handleSelectTheme}
                  onUpdateStyleOptions={handleUpdateStyleOptions}
                />
              </div>
            )}
          </div>

          {/* ========================================================
              CARD 3: PROFESSIONAL & CONTACT DETAILS (COLLAPSIBLE)
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
                    placeholder="Job Title"
                  />
                  <Input
                    label="Company / Org"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    leftIcon={<Building className="w-4 h-4" />}
                    placeholder="Company / Org"
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
                    placeholder="Email Address"
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
                    placeholder="Phone Number"
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
                    placeholder="Location"
                  />
                  <Input
                    label="Personal Website"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    leftIcon={<Globe className="w-4 h-4" />}
                    placeholder="Personal Website"
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

          {/* Bottom Save Action Bar */}
          <div className="p-5 rounded-3xl bg-[#081224]/90 border border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                {isSaved ? 'All Profile Changes Saved!' : 'Ready to Publish Changes?'}
              </p>
              <p className="text-xs text-slate-400">
                {isSaved ? 'Your live public profile and NFC endpoints are updated.' : 'Check the live phone preview on the right, then hit Save Profile to publish.'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="glow"
                size="md"
                className="w-full sm:w-auto min-w-[170px]"
                onClick={handleSave}
                disabled={isSaving}
                leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <Check className="w-4 h-4 text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
              >
                {isSaving ? 'Saving Profile...' : isSaved ? 'Profile Saved!' : 'Save Profile'}
              </Button>
            </div>
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
            profile={previewProfile}
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
            placeholder="Link Title"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            required
          />

          <Input
            label="Destination URL"
            placeholder="Destination URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            required
          />

          {/* Icon Preset Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Icon Preset:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
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
