import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { NFCCard, CardMaterial } from '../../types';
import { NFCCardPreview } from '../../components/nfc/NFCCardPreview';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Toggle';
import { 
  CreditCard, 
  Plus, 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Edit3, 
  ExternalLink, 
  Layers, 
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Smartphone
} from 'lucide-react';
import { formatNumber, triggerConfetti } from '../../lib/utils';
import { BitsInfinityEmblem } from '../../components/common/BitsBrandElements';

export const MyCardsPage: React.FC = () => {
  const { cards, profiles, currentRole, updateCard, deleteCard, toggleCardStatus, reassignCard } = useTapIt();

  // Manage Modal State
  const [selectedCard, setSelectedCard] = useState<NFCCard | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Edit modal form states
  const [editName, setEditName] = useState('');
  const [editProfileId, setEditProfileId] = useState('');
  const [editMaterial, setEditMaterial] = useState<CardMaterial>('matte-black');

  // Handlers
  const handleOpenManage = (card: NFCCard) => {
    setSelectedCard(card);
    setEditName(card.name);
    setEditProfileId(card.profileId || profiles[0]?.id || '');
    setEditMaterial(card.material);
    setIsManageModalOpen(true);
  };

  const handleSaveManage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    updateCard(selectedCard.id, {
      name: editName,
      profileId: editProfileId,
      material: editMaterial,
    });

    setIsManageModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-bits-cyan bg-bits-azure/30 border border-bits-cyan/30 px-3 py-0.5 rounded-full mb-1">
            <BitsInfinityEmblem size={12} />
            <span>BITS Tap™ Hardware Fleet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">My TapIt Smart Cards</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your physical NFC smart cards and reassign persona destinations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-semibold text-slate-300 bg-white/[0.05] border border-white/[0.08] px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{cards.length} {cards.length === 1 ? 'Smart Card' : 'Smart Cards'} Linked</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-8 sm:p-12 text-center space-y-4 backdrop-blur-xl shadow-card-bits">
          <div className="w-16 h-16 rounded-2xl bg-bits-azure/20 border border-bits-cyan/30 flex items-center justify-center mx-auto text-bits-cyan shadow-glow-cyan">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-display">No Physical Smart Cards Linked Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Your physical smart cards are provisioned and registered by our team. Once you receive your card and complete your activation link, it will automatically appear here ready to route to your profiles.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/dashboard/profiles">
              <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Manage Digital Profiles
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const assignedProfile = profiles.find((p) => p.id === card.profileId);
            const isPaused = card.status !== 'active';
            const isUnassigned = !assignedProfile;

            return (
              <div
                key={card.id}
                className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-5 shadow-card-bits space-y-4 flex flex-col justify-between backdrop-blur-xl hover:border-bits-cyan/30 transition"
              >
                {/* Traffic-Light Status Pill */}
                <div className="flex items-center justify-between gap-2 pb-1">
                  {isPaused ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>🔴 Paused / Disabled</span>
                    </div>
                  ) : isUnassigned ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>🟡 Unassigned Profile</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>🟢 Connected & Ready</span>
                    </div>
                  )}

                  <span className="text-[11px] font-mono text-slate-400">
                    {card.taps} {card.taps === 1 ? 'tap' : 'taps'}
                  </span>
                </div>

                <div>
                  <NFCCardPreview
                    card={card}
                    profile={assignedProfile}
                    onManage={() => handleOpenManage(card)}
                    interactive={true}
                  />
                </div>

                {/* Direct On-Card Destination Selector */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-[#050c18] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      When tapped, open:
                    </span>
                    {assignedProfile && (
                      <Link
                        to={`/@${assignedProfile.slug}`}
                        target="_blank"
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        Preview <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                  <select
                    value={card.profileId || ''}
                    onChange={(e) => {
                      reassignCard(card.id, e.target.value);
                      triggerConfetti();
                    }}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none transition cursor-pointer"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} Profile (@{p.slug})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Bar & Quick Action Controls */}
                <div className="pt-2 border-t border-bits-vapor/10 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={card.status === 'active'}
                      onChange={() => toggleCardStatus(card.id)}
                    />
                    <span className="text-xs font-semibold text-slate-300 select-none">
                      {card.status === 'active' ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => handleOpenManage(card)}
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    >
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}



      {/* MANAGE CARD MODAL */}
      {selectedCard && (
        <Modal
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          title={`Configure ${selectedCard.name}`}
          description={`Hardware ID: tapit.app/t/${selectedCard.cardToken}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveManage} className="space-y-4">
            <Input
              label="Card Nickname"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Assigned Profile:
              </label>
              <select
                value={editProfileId}
                onChange={(e) => setEditProfileId(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-base sm:text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} Profile (@{p.slug})
                  </option>
                ))}
              </select>
            </div>

            {/* Material selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Card Hardware Finish Visual:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'matte-black', label: 'Matte Black' },
                  { id: 'white-ceramic', label: 'White Ceramic' },
                ].map((mat) => {
                  const isSelected = editMaterial === mat.id;
                  return (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => setEditMaterial(mat.id as CardMaterial)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-glow-cyan'
                          : 'border-white/[0.08] bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedCard.status === 'active' ? 'danger' : 'outline'}
                  size="sm"
                  type="button"
                  onClick={() => {
                    toggleCardStatus(selectedCard.id);
                    setIsManageModalOpen(false);
                  }}
                >
                  {selectedCard.status === 'active' ? 'Disable Card' : 'Reactivate'}
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove ${selectedCard.name} (${selectedCard.cardToken})?`)) {
                      deleteCard(selectedCard.id);
                      setIsManageModalOpen(false);
                    }
                  }}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsManageModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
