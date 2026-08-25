import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { NFCCard, CardMaterial } from '../../types';
import { NFCCardPreview } from '../../components/nfc/NFCCardPreview';
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
  Trash2
} from 'lucide-react';
import { formatNumber, triggerConfetti } from '../../lib/utils';

export const MyCardsPage: React.FC = () => {
  const { cards, profiles, claimCard, updateCard, toggleCardStatus, reassignCard, openSimulator } = useTapIt();

  // Manage Modal State
  const [selectedCard, setSelectedCard] = useState<NFCCard | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Form states
  const [claimToken, setClaimToken] = useState('');
  const [claimProfileId, setClaimProfileId] = useState(profiles[0]?.id || '');
  const [claimName, setClaimName] = useState('');

  const [editName, setEditName] = useState('');
  const [editProfileId, setEditProfileId] = useState('');
  const [editMaterial, setEditMaterial] = useState<CardMaterial>('matte-black');

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

  const handleClaimCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimToken.trim()) return;

    const res = claimCard(claimToken, claimProfileId, claimName);
    if (res.success) {
      triggerConfetti();
      setIsClaimModalOpen(false);
      setClaimToken('');
      setClaimName('');
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">My TapIt NFC Cards</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your physical NFC smart cards, reassign profiles, and monitor hardware tap telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => openSimulator()}
            leftIcon={<Radio className="w-4 h-4 text-cyan-400 animate-pulse" />}
          >
            Simulate Tap
          </Button>

          <Button
            variant="glow"
            size="md"
            onClick={() => setIsClaimModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Register / Claim Card
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const assignedProfile = profiles.find((p) => p.id === card.profileId);

          return (
            <div
              key={card.id}
              className="bg-[#0d1322] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <NFCCardPreview
                  card={card}
                  profile={assignedProfile}
                  onManage={() => handleOpenManage(card)}
                  onTapSimulate={() => openSimulator(card)}
                  interactive={true}
                />
              </div>

              {/* Status Bar & Quick Kill Switch */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-400">
                  Status:{' '}
                  <strong className={card.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}>
                    {card.status}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={card.status === 'active' ? 'danger' : 'outline'}
                    size="xs"
                    onClick={() => toggleCardStatus(card.id)}
                  >
                    {card.status === 'active' ? 'Disable Card' : 'Reactivate'}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'matte-black', label: 'Matte Black' },
                  { id: 'cyber-cyan', label: 'Cyber Cyan' },
                  { id: 'gold-metal', label: 'Gold Metal' },
                  { id: 'aurora-violet', label: 'Aurora Violet' },
                  { id: 'white-ceramic', label: 'White Ceramic' },
                ].map((mat) => {
                  const isSelected = editMaterial === mat.id;
                  return (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => setEditMaterial(mat.id as CardMaterial)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
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
