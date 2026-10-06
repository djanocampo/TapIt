import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { NFCCard } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Radio, CreditCard, Sparkles, CheckCircle2, ArrowRight, Layers, Smartphone } from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';
import tapItLogo from '../../assets/tapit-logo.png';
import { BitsInfinityEmblem } from '../../components/common/BitsBrandElements';

interface UnclaimedCardPageProps {
  cardToken: string;
  isNewToken?: boolean;
}

export const UnclaimedCardPage: React.FC<UnclaimedCardPageProps> = ({
  cardToken,
  isNewToken = false,
}) => {
  const { currentRole, profiles, claimCard, setRole } = useTapIt();
  const navigate = useNavigate();

  const [step, setStep] = useState<'welcome' | 'select_profile' | 'success'>('welcome');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || '');
  const [customCardName, setCustomCardName] = useState('My TapIt NFC Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activatedCard, setActivatedCard] = useState<NFCCard | null>(null);

  const handleClaim = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = claimCard(cardToken, selectedProfileId, customCardName);
      setIsProcessing(false);
      if (res.success) {
        triggerConfetti();
        if (res.card) {
          setActivatedCard(res.card);
        }
        setStep('success');
      } else {
        alert(res.message);
      }
    }, 700);
  };

  const assignedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-bits-midnight bits-hero-mesh flex items-center justify-center p-3 sm:p-4 py-8 sm:py-16 selection:bg-bits-cyan selection:text-bits-midnight">
      <div className="w-full max-w-lg bg-bits-navy/90 border border-bits-vapor/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-card-bits space-y-6 relative overflow-hidden backdrop-blur-2xl">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-bits-amber/15 rounded-full blur-3xl pointer-events-none" />

        {/* STEP 1: Welcome / Unclaimed Prompt */}
        {step === 'welcome' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center pb-1">
              <img src={tapItLogo} alt="TapIt" className="h-8 w-auto object-contain drop-shadow-[0_2px_14px_rgba(245,158,11,0.3)]" />
            </div>

            <div className="w-16 h-16 rounded-2xl bg-bits-amber/15 border border-bits-amber/40 text-bits-amber flex items-center justify-center mx-auto shadow-glow-amber">
              <CreditCard className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-bits-amber bg-amber-950/60 border border-bits-amber/40 px-3 py-1 rounded-full">
                <BitsInfinityEmblem size={12} />
                <span>Unclaimed BITS Tap™ NFC Hardware</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Welcome to TapIt
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                This TapIt Card hasn't been activated yet. Claim it now to bind your dynamic digital identity.
              </p>
            </div>

            {/* Token box */}
            <div className="p-3 bg-bits-midnight/80 border border-bits-horizon/40 rounded-2xl text-xs font-mono text-bits-cyan">
              Hardware Token: <strong className="text-white">/t/{cardToken}</strong>
            </div>

            <div className="pt-2">
              <Button
                variant="glow"
                size="lg"
                onClick={() => setStep('select_profile')}
                className="w-full justify-center"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Claim This Card
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Profile & Assign */}
        {step === 'select_profile' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white font-display">
                Connect Card to Profile
              </h3>
              <p className="text-xs text-slate-400">
                Choose which digital identity will open when someone taps this NFC card.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Select Profile:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profiles.map((p) => {
                  const isSelected = selectedProfileId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProfileId(p.id)}
                      className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-glow-cyan'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{p.name}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">@{p.slug}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Card Nickname"
              value={customCardName}
              onChange={(e) => setCustomCardName(e.target.value)}
              placeholder="Card Nickname"
            />

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button variant="secondary" size="md" onClick={() => setStep('welcome')}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isProcessing}
                onClick={handleClaim}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Confirm & Activate
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Success Celebration */}
        {step === 'success' && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mx-auto shadow-glow-emerald animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Card Activated ✓
              </span>
              <h2 className="text-2xl font-extrabold text-white font-display">
                Success!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                Your TapIt Card is now connected to:
              </p>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl inline-flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>💼 {assignedProfile?.name} Profile (@{assignedProfile?.slug})</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link to={`/@${assignedProfile?.slug}`} className="block w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  rightIcon={<Smartphone className="w-4 h-4" />}
                >
                  View Live Profile
                </Button>
              </Link>

              <Link to="/dashboard/cards" className="block w-full">
                <Button variant="secondary" size="md" className="w-full justify-center">
                  Go to My TapIt Cards
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
