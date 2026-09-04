import React, { useState } from 'react';
import { useTapIt } from '../../store';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  Database, 
  Trash2, 
  RotateCw, 
  Download, 
  ShieldCheck, 
  Layers, 
  CreditCard, 
  Link2, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  HardDrive
} from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';

interface LocalStorageCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalStorageCacheModal: React.FC<LocalStorageCacheModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    currentUser, 
    currentRole, 
    profiles, 
    cards, 
    links, 
    analyticsEvents,
    clearLocalStorageCache, 
    reloadFromStorage,
    getStorageMetrics 
  } = useTapIt();

  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const metrics = getStorageMetrics();
  const approxKb = (metrics.approxBytes / 1024).toFixed(1);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to wipe all local storage cache and reload the application?')) {
      setIsProcessing(true);
      clearLocalStorageCache({ keepSession: false, reload: true });
    }
  };

  const handleClearKeepSession = () => {
    setIsProcessing(true);
    clearLocalStorageCache({ keepSession: true, reload: false });
    setIsProcessing(false);
    triggerConfetti();
    setSuccessMsg('Cache wiped while preserving your active session.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSyncFromStorage = () => {
    reloadFromStorage();
    setSuccessMsg('Synchronized state with browser local storage.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      currentUser,
      currentRole,
      profiles,
      cards,
      links,
      analyticsEvents,
      localStorageMetrics: metrics,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tapit-local-cache-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerConfetti();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Local Storage Cache & State Manager"
      description="Inspect your locally cached client state, force real-time sync, or cleanly wipe browser cache."
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Success alert banner */}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Live Local Storage Metrics */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            Browser Cache Status
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#050b18] p-3 rounded-2xl border border-white/[0.08] text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Cached Size</span>
              <span className="text-base font-extrabold text-white font-mono">{approxKb} KB</span>
            </div>
            <div className="bg-[#050b18] p-3 rounded-2xl border border-white/[0.08] text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Storage Keys</span>
              <span className="text-base font-extrabold text-cyan-300 font-mono">{metrics.keysCount}</span>
            </div>
            <div className="bg-[#050b18] p-3 rounded-2xl border border-white/[0.08] text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Profiles</span>
              <span className="text-base font-extrabold text-purple-300 font-mono">{profiles.length}</span>
            </div>
            <div className="bg-[#050b18] p-3 rounded-2xl border border-white/[0.08] text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">NFC Cards</span>
              <span className="text-base font-extrabold text-emerald-300 font-mono">{cards.length}</span>
            </div>
          </div>
        </div>

        {/* Sync & Hydration Notice */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">Offline-First Hydration Guaranteed</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every profile change, link addition, and NFC card flash is immediately saved to your browser&apos;s LocalStorage and hydrated first upon page refresh.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Cache Operations
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={handleSyncFromStorage}
              className="justify-center text-xs"
              leftIcon={<RotateCw className="w-3.5 h-3.5 text-cyan-300" />}
            >
              Sync / Reload Storage
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleExportBackup}
              className="justify-center text-xs"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export JSON Backup
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-400" />
                Clear Local Storage Cache
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Flush cached data in your browser if you want a clean reset before testing new profiles or NFC card registrations.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                variant="danger"
                size="sm"
                isLoading={isProcessing}
                onClick={handleClearAll}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Clear Cache & Reload Site
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearKeepSession}
                className="text-xs text-slate-300 hover:text-white"
              >
                Clear Data (Keep Login)
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-white/[0.08]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
