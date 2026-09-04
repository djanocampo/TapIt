import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTapIt } from '../../store';
import { User, CardMaterial } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar,
  Sparkles,
  Plus,
  Radio,
  Copy,
  Check,
  Zap,
  Smartphone,
  ExternalLink,
  ArrowRight,
  User as UserIcon,
  CheckCircle2,
  Share2,
  Loader2,
  Info,
  Layers,
  HelpCircle,
  Hourglass,
  HandMetal,
  RotateCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { formatRelativeTime, triggerConfetti } from '../../lib/utils';

export const UserManagementPage: React.FC = () => {
  const { allUsers, toggleUserStatus, createInvite, deleteUser } = useTapIt();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);

  // Delete User Modal State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Wizard Step 1 inputs
  const [wizardName, setWizardName] = useState('');
  const [wizardMaterial, setWizardMaterial] = useState<CardMaterial>('matte-black');
  const [wizardCardToken, setWizardCardToken] = useState('');
  
  // NFC Flasher State Machine: 'idle' | 'arming' | 'listening' | 'writing' | 'success' | 'error'
  const [nfcState, setNfcState] = useState<'idle' | 'arming' | 'listening' | 'writing' | 'success' | 'error'>('idle');
  const [nfcStatusMessage, setNfcStatusMessage] = useState('');
  const [countdown, setCountdown] = useState<number>(3);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const ndefControllerRef = useRef<AbortController | null>(null);
  const armingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Wizard Step 2 results
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState('');
  const [generatedCardToken, setGeneratedCardToken] = useState('');
  const [copied, setCopied] = useState(false);

  // Clear timers helper
  const clearNfcTimers = () => {
    if (armingTimerRef.current) {
      clearInterval(armingTimerRef.current);
      armingTimerRef.current = null;
    }
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
    if (ndefControllerRef.current) {
      ndefControllerRef.current.abort();
      ndefControllerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearNfcTimers();
    };
  }, []);

  // Audio tone helper
  const playSuccessTone = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted
    }
  };

  // Open Wizard & auto-generate a fresh token
  const handleOpenWizard = () => {
    clearNfcTimers();
    const defaultToken = `TAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setWizardName('');
    setWizardMaterial('matte-black');
    setWizardCardToken(defaultToken);
    setNfcState('idle');
    setNfcStatusMessage('');
    setCountdown(3);
    setCooldownRemaining(0);
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleCancelOrResetNfc = () => {
    clearNfcTimers();
    // Clear the pre-emptive cooldown guard so taps aren't blocked after a cancel
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('tapit_nfc_cooldown_until');
    }
    setNfcState('idle');
    setNfcStatusMessage('');
    setCountdown(3);
    setCooldownRemaining(0);
  };

  // Start 3-Second Arming Countdown before NFC Writing
  const handleStartNFCWrite = () => {
    if (!('NDEFReader' in window)) {
      setNfcState('error');
      setNfcStatusMessage('Web NFC writing requires Google Chrome on Android. For local testing, enable Chrome flags for this IP.');
      return;
    }

    clearNfcTimers();
    setNfcState('arming');
    setNfcStatusMessage('');
    setCountdown(3);

    // Set a 10-second pre-emptive cooldown guard immediately so NFCTapHandler
    // cannot process a phantom auto-read during the entire arm + write + cooldown window.
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('tapit_nfc_cooldown_until', (Date.now() + 10000).toString());
    }

    let count = 3;
    armingTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        if (armingTimerRef.current) clearInterval(armingTimerRef.current);
        executeHardwareNFCWrite();
      }
    }, 1000);
  };

  // Actual NFC Hardware Write Call
  const executeHardwareNFCWrite = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapit.app';
    const targetUrl = `${origin}/t/${wizardCardToken}`;

    try {
      setNfcState('listening');
      setNfcStatusMessage('Sensor active! Hold physical NFC card firmly against the back of your phone...');

      const NDEFReader = (window as any).NDEFReader;
      const ndef = new NDEFReader();
      
      ndefControllerRef.current = new AbortController();
      
      await ndef.write(
        { records: [{ recordType: 'url', data: targetUrl }] },
        { signal: ndefControllerRef.current.signal }
      );

      // Set 3.5s cooldown guard in sessionStorage to prevent immediate auto-read loops
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('tapit_nfc_cooldown_until', (Date.now() + 3500).toString());
      }

      setNfcState('success');
      setNfcStatusMessage('Success! NFC card programmed.');
      playSuccessTone();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      triggerConfetti();

      // Start 3-second pull-away cooldown
      setCooldownRemaining(3);
      let cd = 3;
      cooldownTimerRef.current = setInterval(() => {
        cd -= 1;
        setCooldownRemaining(cd);
        if (cd <= 0 && cooldownTimerRef.current) {
          clearInterval(cooldownTimerRef.current);
        }
      }, 1000);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setNfcState('idle');
        return;
      }
      console.error('NFC Write Error:', err);
      setNfcState('error');
      if (err.name === 'NotAllowedError') {
        setNfcStatusMessage('NFC permission was denied in your browser settings.');
      } else if (err.name === 'NotReadableError') {
        setNfcStatusMessage('NFC device is unavailable. Please make sure NFC is enabled in phone settings.');
      } else {
        setNfcStatusMessage(err.message || 'Writing was interrupted. Please hold card firmly to device.');
      }
    }
  };

  // Submit Step 1 to generate Temporary Link
  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardName.trim()) return;

    const { invite, inviteUrl } = createInvite(wizardName, wizardMaterial, wizardCardToken);
    setGeneratedInviteUrl(inviteUrl);
    setGeneratedCardToken(invite.cardToken);
    setWizardStep(2);
    triggerConfetti();
  };

  const handleCopyInviteUrl = () => {
    navigator.clipboard.writeText(generatedInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Exclude admin accounts — admin oversees the system and should never appear as a regular user
  const nonAdminUsers = allUsers.filter((user) => user.role !== 'admin');

  const filteredUsers = nonAdminUsers.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Top Action Bar (Consolidated Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#081224]/90 border border-white/[0.08] shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white font-display">Account Directory</h2>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              {nonAdminUsers.length} Active Accounts
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manage system users, activate invitation links, and provision hardware NFC tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="glow"
            size="md"
            onClick={handleOpenWizard}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add User (Invite Wizard)
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#081224]/90 border border-white/[0.08] rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#081224]/90 border border-white/[0.08] rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#040813] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-medium">User Profile</th>
                <th className="py-3.5 px-4 font-medium hidden sm:table-cell">Role & Permissions</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium hidden md:table-cell">Joined</th>
                <th className="py-3.5 px-4 font-medium text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.03] transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-cyan-500/30"
                      />
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          {user.name}
                          <span className="text-[10px] font-mono text-cyan-400">(@{user.username})</span>
                        </p>
                        <p className="text-[11px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                        <ShieldCheck className="w-3 h-3 text-cyan-400" />
                        Admin (Full Access)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40">
                        <UserIcon className="w-3 h-3 text-sky-400" />
                        User (Dashboard Access)
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        user.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 hidden md:table-cell text-slate-400">
                    {formatRelativeTime(user.createdAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant={user.status === 'active' ? 'secondary' : 'primary'}
                        size="xs"
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </Button>

                      {user.role !== 'admin' && user.id !== 'usr_admin_001' && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition shadow-sm"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          ADD USER WIZARD MODAL (STEP 1 & STEP 2)
          ========================================================= */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title={wizardStep === 1 ? "Add User & Provision NFC Card (Step 1/2)" : "User Activation Link Ready (Step 2/2)"}
        description={
          wizardStep === 1 
            ? "Configure member info, card finish, and optionally burn the URL record onto the NFC chip." 
            : "Share this temporary link with the user to complete their account registration."
        }
        maxWidth="lg"
      >
        {/* STEP 1: ADMIN INPUT & NFC HARDWARE CONFIGURATION */}
        {wizardStep === 1 && (
          <form onSubmit={handleGenerateInvite} className="space-y-5">
            <div className="space-y-4">
              <Input
                label="Member Name / Nickname"
                placeholder="e.g. Alex Rivera or VIP Corporate Client"
                value={wizardName}
                onChange={(e) => setWizardName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Card Hardware Finish:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'matte-black', label: 'Matte Black' },
                    { id: 'white-ceramic', label: 'White Ceramic' },
                  ].map((mat) => {
                    const isSelected = wizardMaterial === mat.id;
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => setWizardMaterial(mat.id as CardMaterial)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-glow-cyan'
                            : 'border-white/[0.08] bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{mat.label}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* NFC Hardware Token Input & Interactive Flasher */}
              <div className="p-4 rounded-3xl bg-[#060e1e] border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Physical NFC Smart Card Token:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setWizardCardToken(`TAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
                      setNfcState('idle');
                    }}
                    className="text-[10px] font-bold text-cyan-400 hover:underline uppercase"
                  >
                    Generate Fresh Token
                  </button>
                </div>

                <Input
                  value={wizardCardToken}
                  onChange={(e) => {
                    setWizardCardToken(e.target.value.toUpperCase());
                    setNfcState('idle');
                  }}
                  placeholder="e.g. TAP-98K2X"
                  helperText={`Target dynamic token URL: tapit.app/t/${wizardCardToken}`}
                  required
                />

                {/* PHYSICAL NFC PROGRAMMER STATUS BOX */}
                <div className="p-4 rounded-2xl bg-[#040813] border border-cyan-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white">Physical NFC Card Flasher:</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-md">
                      Optional Step
                    </span>
                  </div>

                  {/* IDLE STATE */}
                  {nfcState === 'idle' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <p className="text-xs text-slate-300">
                        Ready to write token <strong className="text-cyan-400 font-mono">{wizardCardToken}</strong> onto a physical card with 3s auto-read protection.
                      </p>
                      <button
                        type="button"
                        onClick={handleStartNFCWrite}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-glow-cyan shrink-0"
                      >
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        <span>Flash Card (3s Buffer)</span>
                      </button>
                    </div>
                  )}

                  {/* ARMING STATE (3-second buffer) */}
                  {nfcState === 'arming' && (
                    <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-400/50 flex items-center justify-between gap-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-black font-mono text-lg flex items-center justify-center shrink-0">
                          {countdown}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-amber-300">
                            Arming NFC Antenna in {countdown}s...
                          </p>
                          <p className="text-[11px] text-slate-300">
                            Get card ready. 3s buffer active to prevent instant auto-read loops.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCancelOrResetNfc}
                        className="text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-700 shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* LISTENING STATE */}
                  {nfcState === 'listening' && (
                    <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/50 flex items-center justify-between gap-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                          <Smartphone className="w-5 h-5 animate-bounce" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-cyan-300">
                            📡 Sensor Active • Hold Card Steady!
                          </p>
                          <p className="text-[11px] text-slate-300">
                            Hold your physical NFC tag against the phone's NFC antenna area.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCancelOrResetNfc}
                        className="text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-700 shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* WRITING STATE */}
                  {nfcState === 'writing' && (
                    <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-400/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-sky-300">
                          Writing NFC URL Record... Loading...
                        </p>
                        <p className="text-[11px] text-slate-300 font-mono">
                          Writing record: tapit.app/t/{wizardCardToken}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SUCCESS STATE */}
                  {nfcState === 'success' && (
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-400/50 space-y-3 shadow-lg">
                      {cooldownRemaining > 0 ? (
                        <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-center gap-2 font-bold animate-pulse">
                          <HandMetal className="w-4 h-4 text-amber-400" />
                          <span>✋ Please pull card away ({cooldownRemaining}s auto-read protection)</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-300 text-[11px] font-bold text-center">
                          ✓ Tag is safe to remove
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-emerald-300">
                              Success! Physical NFC Card Programmed.
                            </p>
                            <p className="text-[11px] text-slate-300 font-mono">
                              NFC chip target: tapit.app/t/{wizardCardToken}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleStartNFCWrite}
                          className="text-[10px] text-cyan-400 hover:underline font-bold uppercase shrink-0"
                        >
                          Re-flash Card
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ERROR STATE */}
                  {nfcState === 'error' && (
                    <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between gap-2 text-rose-300 text-xs">
                      <span>{nfcStatusMessage}</span>
                      <button
                        type="button"
                        onClick={handleStartNFCWrite}
                        className="underline font-bold shrink-0 text-white"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <Button variant="secondary" type="button" onClick={() => setIsWizardOpen(false)}>
                Cancel
              </Button>
              <Button variant="glow" type="submit" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next: Generate Activation Link
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: TEMPORARY LINK & QR CODE DISPLAY */}
        {wizardStep === 2 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold text-sm">Temporary Link Successfully Generated!</strong>
                <span>
                  The physical card (<strong>{generatedCardToken}</strong>) is pre-bound. Send this link to the user to complete registration.
                </span>
              </div>
            </div>

            {/* Link Box & 1-Click Copy */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Temporary User Registration Link:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedInviteUrl}
                  className="flex-1 bg-[#050c18] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none select-all"
                />
                <Button
                  variant="glow"
                  size="md"
                  onClick={handleCopyInviteUrl}
                  leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </div>

            {/* QR Code & Summary Preview */}
            <div className="p-4 rounded-2xl bg-[#060e1e] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  Scan to Complete Registration:
                </span>
                <p className="text-xs text-slate-300 max-w-xs">
                  The user can scan this QR code on their phone to input their Name, Email, and Password.
                </p>
                <div className="pt-1">
                  <a
                    href={generatedInviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 font-bold hover:underline"
                  >
                    <span>Open Link in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0">
                <QRCodeSVG value={generatedInviteUrl} size={110} level="M" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setWizardStep(1)}
              >
                ← Back to Step 1
              </Button>

              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={() => setIsWizardOpen(false)}
              >
                Done & Return to Directory
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =========================================================
          DELETE USER CONFIRMATION MODAL
          ========================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        title="Delete User Account"
        description="This action is irreversible and permanently wipes the user and their personas."
        maxWidth="md"
      >
        {userToDelete && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-white text-sm">
                  Are you sure you want to delete {userToDelete.name}?
                </p>
                <p className="text-slate-300 leading-relaxed">
                  This will permanently remove <span className="font-mono text-cyan-400 font-bold">@{userToDelete.username}</span> ({userToDelete.email}), their digital personas, and custom link trees.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Any physical NFC cards registered to this user will be unlinked and returned to the unclaimed card inventory.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                type="button"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => {
                  if (userToDelete) {
                    deleteUser(userToDelete.id);
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                  }
                }}
              >
                Confirm Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
