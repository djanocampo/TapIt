import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { NFCCard } from '../../types';
import { Radio, Smartphone, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NFCTapSimulatorModal: React.FC = () => {
  const { isSimulatorOpen, closeSimulator, cards, simulatorCard, recordCardTap, profiles } = useTapIt();
  const navigate = useNavigate();

  const [selectedToken, setSelectedToken] = useState<string>(
    simulatorCard?.cardToken || cards[0]?.cardToken || '8xK29mQ'
  );
  const [customToken, setCustomToken] = useState('');
  const [isTapping, setIsTapping] = useState(false);
  const [tapResult, setTapResult] = useState<{ status: string; card?: NFCCard; profileName?: string } | null>(null);

  const activeToken = customToken.trim() || selectedToken;

  const handleSimulateTap = () => {
    setIsTapping(true);
    setTapResult(null);

    setTimeout(() => {
      const result = recordCardTap(activeToken);
      const matchedProfile = result.profile || profiles.find(p => p.id === result.card?.profileId);
      
      setTapResult({
        status: result.status,
        card: result.card,
        profileName: matchedProfile?.displayName || matchedProfile?.name || 'Profile',
      });
      setIsTapping(false);
    }, 1200);
  };

  const handleNavigateToResult = () => {
    closeSimulator();
    navigate(`/t/${activeToken}`);
  };

  return (
    <Modal
      isOpen={isSimulatorOpen}
      onClose={closeSimulator}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-base font-bold text-white">NFC Tap & Tag Simulator</span>
            <p className="text-xs text-slate-400 font-normal">Test physical card interactions & URL resolutions</p>
          </div>
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Token Selector */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Select an NFC Card or Enter Token:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cards.map((c) => {
              const isSelected = selectedToken === c.cardToken && !customToken;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedToken(c.cardToken);
                    setCustomToken('');
                    setTapResult(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-glow-cyan'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400">/t/{c.cardToken}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      c.status === 'unclaimed' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 mt-1 truncate">{c.name}</p>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <input
              type="text"
              placeholder="Or type custom card token (e.g. 8xK29mQ)..."
              value={customToken}
              onChange={(e) => {
                setCustomToken(e.target.value);
                setTapResult(null);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Tap Visualizer Stage */}
        <div className="relative py-8 px-4 rounded-2xl bg-gradient-to-b from-[#050813] to-[#0b1022] border border-slate-800 flex flex-col items-center justify-center overflow-hidden min-h-[220px]">
          {/* Animated Background NFC Waves */}
          {isTapping && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full border-2 border-cyan-400/80 nfc-wave-1"></div>
              <div className="w-48 h-48 rounded-full border-2 border-cyan-400/60 nfc-wave-2"></div>
              <div className="w-64 h-64 rounded-full border-2 border-cyan-400/40 nfc-wave-3"></div>
            </div>
          )}

          {!tapResult && (
            <div className="flex flex-col items-center text-center z-10 space-y-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform ${
                isTapping ? 'scale-110 bg-cyan-500 text-slate-950 shadow-glow-cyan animate-bounce' : 'bg-slate-800 text-cyan-400 border border-slate-700'
              }`}>
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {isTapping ? 'Simulating NFC Tap...' : 'Ready to Tap'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target URL: <span className="font-mono text-cyan-400 font-semibold">https://tapit.app/t/{activeToken}</span>
                </p>
              </div>
            </div>
          )}

          {tapResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center z-10 space-y-3"
            >
              {tapResult.status === 'active' && (
                <>
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-glow-emerald">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Card Validated</span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      Redirecting to {tapResult.profileName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Tap event logged to real-time analytics stream.
                    </p>
                  </div>
                </>
              )}

              {tapResult.status === 'unclaimed' && (
                <>
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center">
                    <HelpCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Unclaimed Chip</span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      This TapIt card is not linked to any profile yet.
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Claim flow is ready to bind this card to your account.
                    </p>
                  </div>
                </>
              )}

              {(tapResult.status === 'disabled' || tapResult.status === 'suspended') && (
                <>
                  <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Card Disabled</span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      Card is deactivated by the owner.
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Profile details are protected and hidden from visitor.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={closeSimulator}>
            Cancel
          </Button>

          {!tapResult ? (
            <Button
              variant="glow"
              size="md"
              isLoading={isTapping}
              onClick={handleSimulateTap}
              leftIcon={<Radio className="w-4 h-4" />}
            >
              Simulate NFC Tap
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleNavigateToResult}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open TapIt URL (/t/{activeToken})
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
