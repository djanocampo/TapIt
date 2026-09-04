import React, { useState } from 'react';
import { useTapIt } from '../../store';
import { NFCCard, CardMaterial } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { WebNFCWriterModal } from '../../components/nfc/WebNFCWriterModal';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Radio, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Trash2,
  Zap,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import { formatNumber, triggerConfetti } from '../../lib/utils';

export const CardInventoryPage: React.FC = () => {
  const { allCards, allProfiles, allUsers, generateBatchCards, toggleCardStatus, updateCard, deleteCard } = useTapIt();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchCount, setBatchCount] = useState(5);
  const [batchMaterial, setBatchMaterial] = useState<CardMaterial>('matte-black');

  // Web NFC Admin Modal State
  const [isNfcWriterOpen, setIsNfcWriterOpen] = useState(false);
  const [writerCard, setWriterCard] = useState<NFCCard | null>(null);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<NFCCard | null>(null);

  const filteredCards = allCards.filter((c) => {
    const assignedUser = allUsers.find(u => u.id === c.userId);
    const assignedProfile = allProfiles.find(p => p.id === c.profileId);

    const matchesSearch = 
      c.cardToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignedUser?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignedProfile?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGenerateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    generateBatchCards(Number(batchCount), batchMaterial);
    triggerConfetti();
    setIsBatchModalOpen(false);
  };

  const handleOpenWriter = (card?: NFCCard) => {
    setWriterCard(card || allCards[0] || null);
    setIsNfcWriterOpen(true);
  };

  const handleOpenDelete = (card: NFCCard) => {
    setCardToDelete(card);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cardToDelete) {
      deleteCard(cardToDelete.id);
      setIsDeleteModalOpen(false);
      setCardToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#081224]/90 border border-white/[0.08] shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white font-display">NFC Hardware Inventory</h2>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              {allCards.length} Total Registered Cards
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Admin tool: Provision, batch generate, and program physical NFC hardware tokens using Web NFC.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="glow"
            size="md"
            onClick={() => handleOpenWriter()}
            leftIcon={<Zap className="w-4 h-4" />}
          >
            Web NFC Flasher & Inspector
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsBatchModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Batch Provision Tokens
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#081224]/90 border border-white/[0.08] rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by token, card name, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">All Statuses ({allCards.length})</option>
            <option value="active">Active</option>
            <option value="unclaimed">Unclaimed</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Cards Table with Exact User-Requested Headers */}
      <div className="bg-[#081224]/90 border border-white/[0.08] rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#040813] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-medium">Hardware Token</th>
                <th className="py-3.5 px-4 font-medium">User</th>
                <th className="py-3.5 px-4 font-medium">Assigned Profile</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium">Taps Recorded</th>
                <th className="py-3.5 px-4 text-right font-medium">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-200">
              {filteredCards.map((card) => {
                const assignedUser = allUsers.find((u) => u.id === card.userId);
                const assignedProfile = allProfiles.find((p) => p.id === card.profileId);

                return (
                  <tr key={card.id} className="hover:bg-white/[0.03] transition">
                    {/* 1. Hardware Token */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 shrink-0">
                          <Radio className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <p className="font-bold text-white font-mono text-xs text-cyan-300">
                            {card.cardToken}
                          </p>
                          <p className="text-[11px] text-slate-300">
                            {card.name}
                          </p>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            Finish: {card.material === 'white-ceramic' ? 'Pure White' : 'Matte Black'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. User (If null, displays Unassigned) */}
                    <td className="py-3.5 px-4">
                      {assignedUser ? (
                        <div className="flex items-center gap-2.5">
                          <img
                            src={assignedUser.avatar}
                            alt={assignedUser.name}
                            className="w-7 h-7 rounded-full object-cover border border-cyan-500/30 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white text-xs">{assignedUser.name}</p>
                            <p className="text-[10px] text-cyan-400 font-mono">@{assignedUser.username}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-xs font-medium">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* 3. Assigned Profile */}
                    <td className="py-3.5 px-4">
                      {assignedProfile ? (
                        <div className="space-y-0.5">
                          <span className="text-slate-100 font-bold text-xs flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-cyan-400" />
                            {assignedProfile.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            tapit.app/@{assignedProfile.slug}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-xs font-medium">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* 4. Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          card.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : card.status === 'unclaimed'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {card.status}
                      </span>
                    </td>

                    {/* 5. Taps Recorded */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300 text-xs">
                      {formatNumber(card.taps)} taps
                    </td>

                    {/* 6. Admin Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenWriter(card)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
                          title="Flash this token onto a physical NFC card"
                        >
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <span>Flash Chip</span>
                        </button>

                        <Button
                          variant={card.status === 'active' ? 'danger' : 'secondary'}
                          size="xs"
                          onClick={() => toggleCardStatus(card.id)}
                        >
                          {card.status === 'active' ? 'Disable' : 'Reactivate'}
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(card)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition"
                          title="Delete NFC Card from Inventory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WEB NFC WRITER MODAL (ADMIN ONLY) */}
      <WebNFCWriterModal
        isOpen={isNfcWriterOpen}
        onClose={() => setIsNfcWriterOpen(false)}
        card={writerCard}
        profile={allProfiles.find((p) => p.id === (writerCard?.profileId || allProfiles[0]?.id))}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete NFC Smart Card"
        description="Are you sure you want to permanently remove this NFC card from the hardware inventory?"
        maxWidth="sm"
      >
        {cardToDelete && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {cardToDelete.name}
                  </h4>
                  <p className="text-[11px] font-mono text-cyan-300">
                    Token: {cardToDelete.cardToken}
                  </p>
                </div>
              </div>

              {cardToDelete.userId && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1">
                  <span className="text-[10px] text-amber-300 uppercase font-bold block">
                    ⚠️ Bound Member Card:
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    This card is bound to an active user profile. Deleting it will unlink the card and prevent it from redirecting when tapped.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* BATCH GENERATOR MODAL */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title="Batch Provision Hardware NFC Tokens"
        description="Generate unique cryptographic URL tokens ready to be encoded into physical NFC cards."
        maxWidth="md"
      >
        <form onSubmit={handleGenerateBatch} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Quantity to Generate:
            </label>
            <select
              value={batchCount}
              onChange={(e) => setBatchCount(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value={5}>5 NFC Card Tokens</option>
              <option value={10}>10 NFC Card Tokens</option>
              <option value={20}>20 NFC Card Tokens</option>
              <option value={50}>50 NFC Card Tokens</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Physical Card Finish:
            </label>
            <select
              value={batchMaterial}
              onChange={(e) => setBatchMaterial(e.target.value as CardMaterial)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="matte-black">Matte Black NFC Card</option>
              <option value="white-ceramic">White Ceramic Card</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsBatchModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" type="submit">
              Provision Batch
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
