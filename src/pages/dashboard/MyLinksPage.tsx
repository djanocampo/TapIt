import React, { useState } from 'react';
import { useTapIt } from '../../store';
import { LinkItem, LinkCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Toggle } from '../../components/ui/Toggle';
import { 
  Link2, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Copy, 
  ExternalLink, 
  MousePointerClick, 
  GripVertical,
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
  Layers
} from 'lucide-react';
import { formatNumber, triggerConfetti } from '../../lib/utils';

const PRESET_ICONS = [
  { id: 'Briefcase', label: 'Portfolio', icon: Briefcase },
  { id: 'Linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'Github', label: 'GitHub', icon: Github },
  { id: 'FileText', label: 'Resume', icon: FileText },
  { id: 'Mail', label: 'Email', icon: Mail },
  { id: 'Instagram', label: 'Instagram', icon: Instagram },
  { id: 'Twitter', label: 'X / Twitter', icon: Twitter },
  { id: 'Youtube', label: 'YouTube', icon: Youtube },
  { id: 'Music', label: 'Spotify', icon: Music },
  { id: 'Coffee', label: 'Buy Me Coffee', icon: Coffee },
  { id: 'CreditCard', label: 'Store / NFC Order', icon: CreditCard },
  { id: 'Calendar', label: 'Book Meeting', icon: Calendar },
  { id: 'Globe', label: 'Custom Website', icon: Globe },
];

export const MyLinksPage: React.FC = () => {
  const { profiles, activeProfile, setActiveProfileId, links, addLink, updateLink, deleteLink, toggleLinkActive, reorderLinks } = useTapIt();

  const profileLinks = links
    .filter((l) => l.profileId === activeProfile.id)
    .sort((a, b) => a.position - b.position);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formIcon, setFormIcon] = useState('Globe');
  const [formCategory, setFormCategory] = useState<LinkCategory>('work');

  const handleOpenAdd = () => {
    setEditingLinkId(null);
    setFormTitle('');
    setFormUrl('');
    setFormIcon('Globe');
    setFormCategory('work');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: LinkItem) => {
    setEditingLinkId(link.id);
    setFormTitle(link.title);
    setFormUrl(link.url);
    setFormIcon(link.icon);
    setFormCategory(link.category);
    setIsModalOpen(true);
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) return;

    if (editingLinkId) {
      updateLink(editingLinkId, {
        title: formTitle,
        url: formUrl.startsWith('http') || formUrl.startsWith('mailto:') || formUrl.startsWith('tel:') ? formUrl : `https://${formUrl}`,
        icon: formIcon,
        category: formCategory,
      });
    } else {
      addLink({
        profileId: activeProfile.id,
        title: formTitle,
        url: formUrl.startsWith('http') || formUrl.startsWith('mailto:') || formUrl.startsWith('tel:') ? formUrl : `https://${formUrl}`,
        icon: formIcon,
        category: formCategory,
        position: profileLinks.length,
        isActive: true,
      });
      triggerConfetti();
    }

    setIsModalOpen(false);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= profileLinks.length) return;

    const reordered = [...profileLinks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    reorderLinks(activeProfile.id, reordered.map((l) => l.id));
  };

  const handleDuplicate = (link: LinkItem) => {
    addLink({
      profileId: activeProfile.id,
      title: `${link.title} (Copy)`,
      url: link.url,
      icon: link.icon,
      category: link.category,
      position: profileLinks.length,
      isActive: true,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">Link Management</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Add, reorder, and analyze links for your active profile (<strong>{activeProfile.name}</strong>).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Profile Switcher */}
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

          <Button variant="glow" size="md" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Add New Link
          </Button>
        </div>
      </div>

      {/* Links List with Drag & Drop Controls */}
      <div className="space-y-3">
        {profileLinks.length === 0 ? (
          <div className="text-center py-12 bg-[#0d1322] border border-slate-800 rounded-3xl space-y-3">
            <Link2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No links added to this profile yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your portfolio, social profiles, resumes, or any destination URL you want to share via NFC.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
              Add First Link
            </Button>
          </div>
        ) : (
          profileLinks.map((link, index) => {
            const IconComponent = PRESET_ICONS.find((i) => i.id === link.icon)?.icon || Globe;

            return (
              <div
                key={link.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  link.isActive
                    ? 'bg-[#0d1322] border-slate-800 hover:border-slate-700 shadow-xl'
                    : 'bg-slate-950/60 border-slate-850 opacity-60'
                }`}
              >
                {/* Reorder arrows + Icon + Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Move Up/Down Controls */}
                  <div className="flex sm:flex-col items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === profileLinks.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{link.title}</h4>
                      <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.2 rounded-md uppercase tracking-wider hidden sm:inline">
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

                {/* Right side: Click Count + Toggle + Action Icons */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  {/* Click Badge */}
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 rounded-xl">
                    <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{formatNumber(link.clicks)} clicks</span>
                  </div>

                  {/* Visibility Switch */}
                  <Toggle
                    checked={link.isActive}
                    onChange={() => toggleLinkActive(link.id)}
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(link)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit link"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(link)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Duplicate link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete link "${link.title}"?`)) {
                          deleteLink(link.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete link"
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

      {/* ADD / EDIT LINK MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLinkId ? 'Edit Link' : 'Add New Link'}
        description="Add a destination URL to your public TapIt profile."
        maxWidth="md"
      >
        <form onSubmit={handleSaveLink} className="space-y-4">
          <Input
            label="Link Title"
            placeholder="e.g. 💼 View My Portfolio & Case Studies"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <Input
            label="Destination URL"
            placeholder="https://..."
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
            required
          />

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Icon Preset:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {PRESET_ICONS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = formIcon === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setFormIcon(preset.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
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
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as LinkCategory)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="portfolio">Portfolio</option>
              <option value="work">Work & Repos</option>
              <option value="social">Social Media</option>
              <option value="contact">Contact & Meeting</option>
              <option value="media">Media / Video / Audio</option>
              <option value="commerce">Store / Commerce</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingLinkId ? 'Save Changes' : 'Add Link'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
