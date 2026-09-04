import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { NFCCard, CardMaterial } from '../../types';
import { NFCCardPreview } from '../../components/nfc/NFCCardPreview';
import { WebNFCWriterModal } from '../../components/nfc/WebNFCWriterModal';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
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
  Zap,
  Smartphone
} from 'lucide-react';
import { formatNumber, triggerConfetti } from '../../lib/utils';

export const MyCardsPage: React.FC = () => {
  const { cards, profiles, currentRole, claimCard, updateCard, toggleCardStatus, reassignCard } = useTapIt();

  // Manage Modal State
  const [selectedCard, setSelectedCard] = useState<NFCCard | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isNfcWriterOpen, setIsNfcWriterOpen] = useState(false);
  const [writerCard, setWriterCard] = useState<NFCCard | null>(null);

  // Form states
  const [claimToken, setClaimToken] = useState('');
  const [claimProfileId, setClaimProfileId] = useState(profiles[0]?.id || '');
  const [claimName, setClaimName] = useState('');
  const [claimError, setClaimError] = useState('');

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

  const handleOpenWriter = (card?: NFCCard) => {
    setWriterCard(card || cards[0] || null);
    setIsNfcWriterOpen(true);
  };

  const handleClaimCard = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError('');

    if (!claimToken.trim()) {
      setClaimError('Please enter a valid card token.');
      return;
    }

    const res = claimCard(claimToken.trim(), claimProfileId, claimName.trim() || undefined);
    if (!res.success) {
      setClaimError(res.message);
      return;
    }

    triggerConfetti();
    setIsClaimModalOpen(false);
    setClaimToken('');
    setClaimName('');
    
    // Auto-open writer terminal for newly claimed card
    if (res.card) {
      setWriterCard(res.card);
      setIsNfcWriterOpen(true);
    }
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
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">My TapIt Smart Cards</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your physical NFC smart cards, reassign profile destinations, or write to new tags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="glow"
            size="md"
            onClick={() => handleOpenWriter()}
            leftIcon={<Zap className="w-4 h-4 text-cyan-300" />}
          >
            Write NFC Tag
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsClaimModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Claim Card
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="bg-[#081224]/80 border border-white/[0.08] rounded-3xl p-8 sm:p-12 text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-display">No Physical Smart Cards Claimed Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Ready to set up your NFC card? Click &ldquo;Claim Card&rdquo; with your hardware token or tap &ldquo;Write NFC Tag&rdquo; to program your chip directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="glow"
              size="sm"
              onClick={() => handleOpenWriter()}
              leftIcon={<Zap className="w-4 h-4 text-cyan-300" />}
            >
              Write NFC Tag
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsClaimModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Claim Card
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const assignedProfile = profiles.find((p) => p.id === card.profileId);

            return (
              <div
                key={card.id}
                className="bg-[#081224]/90 border border-white/[0.08] rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between backdrop-blur-xl"
              >
                <div>
                  <NFCCardPreview
                    card={card}
                    profile={assignedProfile}
                    onManage={() => handleOpenManage(card)}
                    interactive={true}
                  />
                </div>

                {/* Status Bar & Quick Action Controls */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs text-slate-400">
                    Status:{' '}
                    <strong className={card.status === 'active' ? 'text-cyan-400' : 'text-rose-400'}>
                      {card.status}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="glow"
                      size="xs"
                      onClick={() => handleOpenWriter(card)}
                      leftIcon={<Zap className="w-3 h-3 text-cyan-300" />}
                    >
                      Write Tag
                    </Button>
                    <Button
                      variant={card.status === 'active' ? 'danger' : 'outline'}
                      size="xs"
                      onClick={() => toggleCardStatus(card.id)}
                    >
                      {card.status === 'active' ? 'Disable' : 'Reactivate'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => handleOpenManage(card)}
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WEB NFC WRITER MODAL */}
      <WebNFCWriterModal
        isOpen={isNfcWriterOpen}
        onClose={() => setIsNfcWriterOpen(false)}
        card={writerCard}
        profile={profiles.find((p) => p.id === (writerCard?.profileId || profiles[0]?.id))}
      />

      {/* CLAIM / REGISTER CARD MODAL */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title="Register & Connect NFC Card"
        description="Enter the unique token found on your TapIt NFC card or keyfob packaging."
        maxWidth="md"
      >
        <form onSubmit={handleClaimCard} className="space-y-4">
          <Input
            label="NFC Card Token"
            placeholder="e.g. 8xK29mQ or TAP-XYZ"
            value={claimToken}
            onChange={(e) => setClaimToken(e.target.value)}
            helperText="Located on the back of your card or in the URL after /t/"
            required
          />

          <Input
            label="Card Nickname (Optional)"
            placeholder="e.g. Executive Matte Black Card"
            value={claimName}
            onChange={(e) => setClaimName(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Assign to Profile:
            </label>
            <select
              value={claimProfileId}
              onChange={(e) => setClaimProfileId(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} Profile (@{p.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsClaimModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Claim & Activate Card
            </Button>
          </div>
        </form>
      </Modal>

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
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
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

            {/* Quick Web NFC action in modal */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsManageModalOpen(false);
                  handleOpenWriter(selectedCard);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-sky-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-cyan-500/30 transition shadow-sm"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Program Physical NFC Chip via Web NFC</span>
              </button>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <Button
                variant={selectedCard.status === 'active' ? 'danger' : 'outline'}
                size="sm"
                type="button"
                onClick={() => {
                  toggleCardStatus(selectedCard.id);
                  setIsManageModalOpen(false);
                }}
              >
                {selectedCard.status === 'active' ? 'Disable This Card' : 'Reactivate Card'}
              </Button>

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
