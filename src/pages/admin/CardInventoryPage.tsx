import React, { useState } from 'react';
import { useTapIt } from '../../store';
import { NFCCard, CardMaterial } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
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
  Trash2 
} from 'lucide-react';
import { formatNumber, triggerConfetti } from '../../lib/utils';

export const CardInventoryPage: React.FC = () => {
  const { cards, profiles, generateBatchCards, toggleCardStatus, updateCard } = useTapIt();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchCount, setBatchCount] = useState(5);
  const [batchMaterial, setBatchMaterial] = useState<CardMaterial>('matte-black');

  const filteredCards = cards.filter((c) => {
    const matchesSearch = 
      c.cardToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGenerateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    generateBatchCards(Number(batchCount), batchMaterial);
    triggerConfetti();
    setIsBatchModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">NFC Hardware Inventory</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Provision, track, and batch generate encrypted hardware NFC tokens and card identifiers.
          </p>
        </div>

        <Button
          variant="glow"
          size="md"
          onClick={() => setIsBatchModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Batch Provision Tokens
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by card token (e.g. 8xK29mQ) or name..."
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
            <option value="all">All Statuses ({cards.length})</option>
            <option value="active">Active</option>
            <option value="unclaimed">Unclaimed</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-medium">Hardware Token & Finish</th>
                <th className="py-3.5 px-4 font-medium">Assigned Profile</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 text-right font-medium">Taps Recorded</th>
                <th className="py-3.5 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredCards.map((card) => {
                const assignedProfile = profiles.find((p) => p.id === card.profileId);

                return (
                  <tr key={card.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                          <Radio className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{card.name}</p>
                          <p className="text-[11px] text-cyan-400 font-mono font-semibold">
                            tapit.app/t/{card.cardToken}
                          </p>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                            Finish: {card.material}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {assignedProfile ? (
                        <span className="text-slate-200 font-semibold flex items-center gap-1">
                          💼 {assignedProfile.name} (@{assignedProfile.slug})
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned (Unclaimed)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          card.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : card.status === 'unclaimed'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {card.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-300">
                      {formatNumber(card.taps)} taps
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant={card.status === 'active' ? 'danger' : 'secondary'}
                        size="xs"
                        onClick={() => toggleCardStatus(card.id)}
                      >
                        {card.status === 'active' ? 'Force Disable' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
              <option value="cyber-cyan">Cyber Glow Cyan Card</option>
              <option value="gold-metal">Gold Metal Hybrid Card</option>
              <option value="aurora-violet">Aurora Violet Card</option>
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
