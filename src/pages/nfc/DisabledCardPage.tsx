import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, Radio, ArrowLeft, Lock, Smartphone } from 'lucide-react';
import { useTapIt } from '../../store';
import tapItLogo from '../../assets/tapit-logo.png';
import { BitsInfinityEmblem } from '../../components/common/BitsBrandElements';

interface DisabledCardPageProps {
  cardToken: string;
}

export const DisabledCardPage: React.FC<DisabledCardPageProps> = ({ cardToken }) => {
  const { cards } = useTapIt();
  const card = cards.find((c) => c.cardToken.toLowerCase() === cardToken.toLowerCase());

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-bits-midnight bits-hero-mesh flex items-center justify-center p-3 sm:p-4 py-8 sm:py-16 text-center selection:bg-bits-cyan selection:text-bits-midnight">
      <div className="w-full max-w-md bg-bits-navy/90 border border-rose-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-card-bits space-y-6 backdrop-blur-2xl">
        <div className="flex justify-center pb-1">
          <img src={tapItLogo} alt="TapIt" className="h-8 w-auto object-contain drop-shadow-[0_2px_14px_rgba(244,63,94,0.3)]" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-2xl">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 border border-rose-500/30 px-3 py-1 rounded-full">
            <BitsInfinityEmblem size={12} />
            <span>Hardware Kill-Switch Active</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white font-display">
            Card Deactivated
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            This TapIt Card has been deactivated by its owner for privacy and bedrock data security.
          </p>
        </div>

        <div className="p-3 bg-bits-midnight/80 border border-bits-horizon/40 rounded-2xl text-xs font-mono text-slate-400">
          Chip Identifier: <span className="text-rose-400 font-bold">/t/{cardToken}</span>
        </div>

        <div className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
          Are you the owner of this card? Log into your TapIt dashboard to reactivate or reassign this card token.
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link to="/dashboard/cards">
            <Button variant="primary" size="md" className="w-full justify-center">
              Reactivate in Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="md" className="w-full justify-center" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to TapIt Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
