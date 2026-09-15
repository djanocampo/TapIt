import React, { useState } from 'react';
import { useTapIt } from '../../store';
import { LinkItem, LinkCategory } from '../../types';
import { Toggle } from '../../components/ui/Toggle';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { MobileFramePreview } from '../../components/profile/MobileFramePreview';
import { 
  Link2, 
  ExternalLink, 
  MousePointerClick, 
  Briefcase,
  Facebook,
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
  Phone,
  MessageCircle,
  Send,
  Video,
  Sparkles,
  TrendingUp,
  Activity,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit3,
  Trash2,
  Smartphone,
  Layers
} from 'lucide-react';
import { formatNumber, triggerConfetti } from '../../lib/utils';
import { Link } from 'react-router-dom';

const PRESET_ICONS: Record<string, React.ElementType> = {
  Facebook,
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
  Phone,
  MessageCircle,
  Send,
  Video,
  Link2,
  ExternalLink,
};

const ICON_PICKER_OPTIONS = [
  { id: 'Globe', label: 'Website', icon: Globe },
  { id: 'Link2', label: 'General', icon: Link2 },
  { id: 'Briefcase', label: 'Portfolio', icon: Briefcase },
  { id: 'Github', label: 'GitHub', icon: Github },
  { id: 'Linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'Twitter', label: 'Twitter / X', icon: Twitter },
  { id: 'Instagram', label: 'Instagram', icon: Instagram },
  { id: 'Youtube', label: 'YouTube', icon: Youtube },
  { id: 'Music', label: 'Spotify', icon: Music },
  { id: 'Mail', label: 'Email', icon: Mail },
  { id: 'Phone', label: 'Phone', icon: Phone },
  { id: 'MessageCircle', label: 'WhatsApp', icon: MessageCircle },
  { id: 'Send', label: 'Telegram', icon: Send },
  { id: 'FileText', label: 'Resume', icon: FileText },
  { id: 'Coffee', label: 'Coffee / Tip', icon: Coffee },
];

export const MyLinksPage: React.FC = () => {
  const { 
    profiles, 
    activeProfile, 
    setActiveProfileId, 
    links, 
    addLink, 
    updateLink, 
    deleteLink, 
    toggleLinkActive, 
    reorderLinks 
  } = useTapIt();

  // Mobile View Tab: 'manage' or 'preview'
  const [mobileTab, setMobileTab] = useState<'manage' | 'preview'>('manage');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUrl, setModalUrl] = useState('');
  const [modalIcon, setModalIcon] = useState('Globe');
  const [modalCategory, setModalCategory] = useState<LinkCategory>('work');

  // Filter links for the active profile
  const profileLinks = links
    .filter((l) => l.profileId === activeProfile.id)
    .sort((a, b) => a.position - b.position);

  const totalClicks = profileLinks.reduce((acc, l) => acc + l.clicks, 0);
  const activeCount = profileLinks.filter((l) => l.isActive).length;
  const topLink = [...profileLinks].sort((a, b) => b.clicks - a.clicks)[0];

  const handleOpenAdd = () => {
    setEditingLinkId(null);
    setModalTitle('');
    setModalUrl('');
    setModalIcon('Globe');
    setModalCategory('work');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: LinkItem) => {
    setEditingLinkId(link.id);
    setModalTitle(link.title);
    setModalUrl(link.url);
    setModalIcon(link.icon || 'Globe');
    setModalCategory(link.category || 'work');
    setIsModalOpen(true);
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim() || !modalUrl.trim()) return;

    let cleanUrl = modalUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl) && !/^mailto:/i.test(cleanUrl) && !/^tel:/i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (editingLinkId) {
      updateLink(editingLinkId, {
        title: modalTitle.trim(),
        url: cleanUrl,
        icon: modalIcon,
        category: modalCategory,
      });
    } else {
      addLink({
        profileId: activeProfile.id,
        title: modalTitle.trim(),
        url: cleanUrl,
        icon: modalIcon,
        category: modalCategory,
        position: profileLinks.length,
        isActive: true,
      });
      triggerConfetti();
    }

    setIsModalOpen(false);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= profileLinks.length) return;

    const newOrder = [...profileLinks];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    reorderLinks(activeProfile.id, newOrder.map(l => l.id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#081224]/90 border border-white/[0.08] shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-white font-display">Links & Mobile View</h2>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              {profileLinks.length} Links
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manage links, reorder destinations, and live-preview in mobile view for <strong>{activeProfile.name}</strong>.
          </p>
        </div>

        {/* Controls: Profile Switcher + Add Button + Preview Link */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={activeProfile.id}
            onChange={(e) => setActiveProfileId(e.target.value)}
            aria-label="Active profile"
            className="bg-[#050c18] border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold text-cyan-300 rounded-xl px-3 py-2 focus:outline-none shadow-sm cursor-pointer"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#081224] text-white">
                {p.name} Profile
              </option>
            ))}
          </select>

          <Button 
            variant="glow" 
            size="sm" 
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Link
          </Button>

          <Link to={`/@${activeProfile.slug}`} target="_blank">
            <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile-Only Segmented Tab Switcher (Visible on small screens) */}
      <div className="lg:hidden flex rounded-2xl bg-[#081224] border border-white/[0.08] p-1 shadow-md">
        <button
          type="button"
          onClick={() => setMobileTab('manage')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            mobileTab === 'manage'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Manage Links ({profileLinks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            mobileTab === 'preview'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Live Mobile View</span>
        </button>
      </div>

      {/* Main Split-Screen Layout: Link Controls & Telemetry (Left) | Mobile Phone Frame Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: KPI Metrics & Reorderable Link Cards */}
        <div className={`space-y-6 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'} lg:col-span-7`}>
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#081224]/90 border border-white/[0.08] rounded-2xl p-3.5 shadow-lg flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <MousePointerClick className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 font-medium truncate block">Total Clicks</span>
                <p className="text-lg font-bold text-white font-display">{formatNumber(totalClicks)}</p>
              </div>
            </div>

            <div className="bg-[#081224]/90 border border-white/[0.08] rounded-2xl p-3.5 shadow-lg flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 font-medium truncate block">Active / Total</span>
                <p className="text-lg font-bold text-white font-display">{activeCount} / {profileLinks.length}</p>
              </div>
            </div>

            <div className="bg-[#081224]/90 border border-white/[0.08] rounded-2xl p-3.5 shadow-lg flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30">
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-slate-400 font-medium truncate block">Top Performing</span>
                <p className="text-xs font-bold text-cyan-300 truncate">
                  {topLink?.title || 'No clicks yet'}
                </p>
              </div>
            </div>
          </div>

          {/* Links List with Add Button Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Profile Destinations
              </span>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Destination</span>
              </button>
            </div>

            {profileLinks.length === 0 ? (
              <div className="text-center py-16 bg-[#081224]/90 border border-white/[0.08] rounded-3xl space-y-3 backdrop-blur-xl p-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
                  <Link2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">No destinations yet on {activeProfile.name}</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Add social profiles, portfolios, payment links, and websites to display in your mobile profile.
                </p>
                <Button variant="glow" size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
                  Add First Link
                </Button>
              </div>
            ) : (
              profileLinks.map((link, index) => {
                const IconComponent = PRESET_ICONS[link.icon] || Globe;

                return (
                  <div
                    key={link.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 backdrop-blur-xl ${
                      link.isActive
                        ? 'bg-[#081224]/90 border-white/[0.08] hover:border-cyan-500/40 shadow-xl'
                        : 'bg-slate-950/60 border-white/[0.04] opacity-60'
                    }`}
                  >
                    {/* Left: Reorder Arrows + Icon + Details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'up')}
                          aria-label="Move link up"
                          className="p-1 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-white/[0.05] disabled:opacity-20 transition"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === profileLinks.length - 1}
                          onClick={() => handleMove(index, 'down')}
                          aria-label="Move link down"
                          className="p-1 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-white/[0.05] disabled:opacity-20 transition"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Icon */}
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{link.title}</h4>
                          <span className="text-[9px] font-mono uppercase bg-white/[0.06] text-slate-300 px-1.5 py-0.5 rounded">
                            {link.category}
                          </span>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-400 hover:text-cyan-400 truncate flex items-center gap-1 font-mono mt-0.5"
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                        </a>
                      </div>
                    </div>

                    {/* Right: Clicks + Active Toggle + Edit / Delete Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.08]">
                      {/* Click Counter */}
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/20 px-2.5 py-1 rounded-xl">
                        <MousePointerClick className="w-3 h-3 text-cyan-400" />
                        <span>{formatNumber(link.clicks)}</span>
                      </div>

                      {/* Toggle */}
                      <Toggle
                        checked={link.isActive}
                        onChange={() => toggleLinkActive(link.id)}
                      />

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(link)}
                          aria-label="Edit link"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteLink(link.id)}
                          aria-label="Delete link"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Mobile Phone Preview */}
        <div className={`space-y-4 ${mobileTab === 'manage' ? 'hidden lg:block' : 'block'} lg:col-span-5 sticky top-28`}>
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Live Mobile View
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Real-Time Sync
            </span>
          </div>

          {/* Interactive Mobile Phone Mockup */}
          <MobileFramePreview
            profile={activeProfile}
            links={links}
          />

          <div className="text-center">
            <p className="text-[11px] text-slate-400">
              Visitors flashing your NFC tag or QR code will see this exact mobile view.
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit Link Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLinkId ? 'Edit Destination Link' : 'Add New Destination Link'}
        description={`Configure destination button for ${activeProfile.name} profile.`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveLink} className="space-y-4">
          <Input
            label="Button Title"
            type="text"
            placeholder="e.g. My Portfolio, Follow me on Instagram, WhatsApp"
            value={modalTitle}
            onChange={(e) => setModalTitle(e.target.value)}
            required
          />

          <Input
            label="Destination URL"
            type="text"
            placeholder="https://example.com or mailto:you@domain.com"
            value={modalUrl}
            onChange={(e) => setModalUrl(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
            <select
              value={modalCategory}
              onChange={(e) => setModalCategory(e.target.value as LinkCategory)}
              className="w-full bg-[#050c18] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="work">Work & Professional</option>
              <option value="social">Social & Community</option>
              <option value="portfolio">Portfolio & Creative</option>
              <option value="contact">Contact & Messaging</option>
              <option value="media">Media & Content</option>
              <option value="commerce">Store & Commerce</option>
              <option value="other">Other Link</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Choose Icon</label>
            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 bg-[#050c18] rounded-xl border border-white/[0.08]">
              {ICON_PICKER_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = modalIcon === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setModalIcon(opt.id)}
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
                      selected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] truncate max-w-[45px]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" size="sm" type="submit">
              {editingLinkId ? 'Save Changes' : 'Add to Profile'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
