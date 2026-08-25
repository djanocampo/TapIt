import React, { useState } from 'react';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Toggle';
import { 
  Settings, 
  ShieldCheck, 
  Globe, 
  Layers, 
  Cpu, 
  Check, 
  Sparkles,
  Link2
} from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';

export const SystemSettingsPage: React.FC = () => {
  const { systemSettings, updateSystemSettings } = useTapIt();

  const [platformName, setPlatformName] = useState(systemSettings.platformName);
  const [maintenanceMode, setMaintenanceMode] = useState(systemSettings.maintenanceMode);
  const [allowPublicRegistrations, setAllowPublicRegistrations] = useState(systemSettings.allowPublicRegistrations);
  const [enforceNfcVerification, setEnforceNfcVerification] = useState(systemSettings.enforceNfcVerification);
  const [maxProfilesPerUser, setMaxProfilesPerUser] = useState(systemSettings.maxProfilesPerUser);
  const [maxCardsPerUser, setMaxCardsPerUser] = useState(systemSettings.maxCardsPerUser);
  const [platforms, setPlatforms] = useState(systemSettings.supportedPlatforms);
  const [isSaved, setIsSaved] = useState(false);

  const togglePlatform = (key: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.key === key ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      platformName,
      maintenanceMode,
      allowPublicRegistrations,
      enforceNfcVerification,
      maxProfilesPerUser: Number(maxProfilesPerUser),
      maxCardsPerUser: Number(maxCardsPerUser),
      supportedPlatforms: platforms,
    });
    setIsSaved(true);
    triggerConfetti();
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-display">Global System Settings</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure platform security parameters, supported link platform integrations, and operational toggles.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* General Config */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            Core Platform Branding
          </h3>

          <Input
            label="Platform Title"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Max Profiles Per User"
              type="number"
              value={maxProfilesPerUser}
              onChange={(e) => setMaxProfilesPerUser(Number(e.target.value))}
            />
            <Input
              label="Max Physical Cards Per User"
              type="number"
              value={maxCardsPerUser}
              onChange={(e) => setMaxCardsPerUser(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Operational Toggles */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Security & Registration Rules
          </h3>

          <div className="space-y-4 divide-y divide-slate-800">
            <div className="pt-2">
              <Toggle
                label="Allow Public User Signups"
                description="When disabled, only invited accounts or administrators can create new profiles"
                checked={allowPublicRegistrations}
                onChange={setAllowPublicRegistrations}
              />
            </div>
            <div className="pt-4">
              <Toggle
                label="Enforce Cryptographic NFC Verification"
                description="Require dynamic anti-collision handshake before profile redirection"
                checked={enforceNfcVerification}
                onChange={setEnforceNfcVerification}
              />
            </div>
            <div className="pt-4">
              <Toggle
                label="Maintenance Mode"
                description="Temporarily suspend visitor profile access and show maintenance message"
                checked={maintenanceMode}
                onChange={setMaintenanceMode}
              />
            </div>
          </div>
        </div>

        {/* Supported Link Platforms */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            Supported Link Platforms & Socials
          </h3>
          <p className="text-xs text-slate-400">
            Enable or disable specific platform presets available in the user link creation modal.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {platforms.map((p) => (
              <div
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  p.enabled
                    ? 'bg-slate-900 border-cyan-500/40 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{p.name}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${p.enabled ? 'bg-cyan-400 shadow-glow-cyan' : 'bg-slate-700'}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button variant="primary" size="lg" type="submit" leftIcon={isSaved ? <Check className="w-4 h-4" /> : undefined}>
            {isSaved ? 'Platform Settings Saved!' : 'Save System Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};
