import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Toggle';
import { LocalStorageCacheModal } from '../../components/common/LocalStorageCacheModal';
import { AvatarUpload } from '../../components/common/AvatarUpload';
import { 
  Settings, 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Download, 
  ShieldAlert, 
  Check, 
  Sparkles,
  RotateCcw,
  LogOut,
  HardDrive,
  Trash2,
  RotateCw
} from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    updateCurrentUser,
    resetAllData, 
    clearLocalStorageCache, 
    reloadFromStorage, 
    getStorageMetrics, 
    logout, 
    profiles, 
    links, 
    cards 
  } = useTapIt();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isCacheModalOpen, setIsCacheModalOpen] = useState(false);

  const [notifyTaps, setNotifyTaps] = useState(true);
  const [notifyClicks, setNotifyClicks] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setUsername(currentUser.username || '');
      setAvatar(currentUser.avatar || '');
    }
  }, [currentUser]);

  const metrics = getStorageMetrics();
  const approxKb = (metrics.approxBytes / 1024).toFixed(1);

  const handleAvatarChange = (newAvatarUrl: string) => {
    setAvatar(newAvatarUrl);
    updateCurrentUser({ avatar: newAvatarUrl });
    triggerConfetti();
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name,
      username: username.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      email,
      avatar,
    });
    setIsSaved(true);
    triggerConfetti();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportData = () => {
    const exportPayload = {
      user: currentUser,
      profiles,
      links,
      cards,
      exportedAt: new Date().toISOString(),
      platform: 'TapIt Smart Identity Platform',
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tapit-data-export-${currentUser.username}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">Account Settings</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your personal account credentials, notifications, and local storage cache.
          </p>
        </div>

        <Button
          variant="glow"
          size="sm"
          onClick={() => setIsCacheModalOpen(true)}
          leftIcon={<HardDrive className="w-4 h-4 text-cyan-300" />}
        >
          Storage Cache Inspector ({approxKb} KB)
        </Button>
      </div>

      {/* Local Storage Cache & Offline Hydration Manager */}
      <div className="bg-[#081224] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            Local Storage Cache & State Hydration
          </h3>
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-full">
            ● Hydrated Locally First
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          TapIt operates with an offline-first storage engine. All your profiles, registered NFC tags, and telemetry events are saved directly in your browser&apos;s LocalStorage and hydrated first upon page refresh.
        </p>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-[#050b18] p-3 rounded-2xl border border-white/[0.08] text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Cached Storage</span>
            <span className="text-base font-extrabold text-cyan-300 font-mono">{approxKb} KB</span>
          </div>
          <div className="bg-[#050b18] p-3 rounded-2xl border border-white/[0.08] text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Keys</span>
            <span className="text-base font-extrabold text-white font-mono">{metrics.keysCount}</span>
          </div>
          <div className="bg-[#050b18] p-3 rounded-2xl border border-white/[0.08] text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Saved Profiles</span>
            <span className="text-base font-extrabold text-purple-300 font-mono">{profiles.length}</span>
          </div>
          <div className="bg-[#050b18] p-3 rounded-2xl border border-white/[0.08] text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">NFC Cards</span>
            <span className="text-base font-extrabold text-emerald-300 font-mono">{cards.length}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Wipe all local storage cache and hard-reload the site?')) {
                clearLocalStorageCache({ keepSession: false, reload: true });
              }
            }}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Clear Local Storage Cache & Hard Reload
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCacheModalOpen(true)}
            leftIcon={<HardDrive className="w-4 h-4" />}
          >
            Open Cache Inspector
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              reloadFromStorage();
              triggerConfetti();
            }}
            leftIcon={<RotateCw className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Sync from LocalStorage
          </Button>
        </div>
      </div>

      {/* Profile Details Form */}
      <form onSubmit={handleSaveAccount} className="bg-[#0d1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          Personal Credentials
        </h3>

        {/* Account Avatar with Crop & Readjust */}
        <AvatarUpload
          currentAvatar={avatar}
          name={name || currentUser?.name || 'Account'}
          userId={currentUser?.id || 'usr_current'}
          label="Account Avatar Photo"
          description="Your primary account avatar shown across your dashboard, card previews, and platform navigation."
          onAvatarChange={handleAvatarChange}
          size="lg"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            helperText={`tapit.app/@${username}`}
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex items-center justify-end">
          <Button variant="primary" size="md" type="submit" leftIcon={isSaved ? <Check className="w-4 h-4" /> : undefined}>
            {isSaved ? 'Account Updated!' : 'Save Account Changes'}
          </Button>
        </div>
      </form>

      {/* Password Change */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" />
          Security & Password
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Current Password"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="New Password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              alert('Password updated successfully.');
              setCurrentPass('');
              setNewPass('');
            }}
          >
            Update Password
          </Button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-400" />
          Notification Preferences
        </h3>

        <div className="space-y-4 divide-y divide-slate-800">
          <div className="pt-2">
            <Toggle
              label="Real-time NFC Tap Alerts"
              description="Get instant notifications whenever someone taps your physical NFC cards"
              checked={notifyTaps}
              onChange={setNotifyTaps}
            />
          </div>
          <div className="pt-4">
            <Toggle
              label="Link Click Notifications"
              description="Notify when a visitor clicks a key portfolio or contact link"
              checked={notifyClicks}
              onChange={setNotifyClicks}
            />
          </div>
          <div className="pt-4">
            <Toggle
              label="Weekly Analytics Digest"
              description="Summary of weekly impressions, new tappers, and top-clicked links"
              checked={weeklyDigest}
              onChange={setWeeklyDigest}
            />
          </div>
        </div>
      </div>

      {/* Data Export & Danger Zone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Data Export */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-cyan-400" />
            Export Data
          </h4>
          <p className="text-xs text-slate-400">
            Download a full JSON archive containing all your profiles, custom links, and registered NFC card tokens.
          </p>
          <Button variant="secondary" size="sm" onClick={handleExportData} leftIcon={<Download className="w-4 h-4" />}>
            Export JSON Archive
          </Button>
        </div>

        {/* Danger Zone & Sign Out */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-3xl p-6 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            Account Session & Sign Out
          </h4>
          <p className="text-xs text-slate-400">
            Sign out of your active session or reset all local demo state.
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm('Reset all state and clear local storage cache?')) {
                  resetAllData();
                }
              }}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset All Demo State
            </Button>
          </div>
        </div>
      </div>

      {/* LOCAL STORAGE CACHE MODAL */}
      <LocalStorageCacheModal
        isOpen={isCacheModalOpen}
        onClose={() => setIsCacheModalOpen(false)}
      />
    </div>
  );
};
