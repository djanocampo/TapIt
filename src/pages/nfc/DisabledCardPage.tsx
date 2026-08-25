import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, Radio, ArrowLeft, Lock, Smartphone } from 'lucide-react';
import { useTapIt } from '../../store';

interface DisabledCardPageProps {
  cardToken: string;
}

export const DisabledCardPage: React.FC<DisabledCardPageProps> = ({ cardToken }) => {
  const { cards } = useTapIt();
  const card = cards.find((c) => c.cardToken.toLowerCase() === cardToken.toLowerCase());

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 py-16 text-center">
      <div className="w-full max-w-md bg-[#0d1322] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-2xl">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 border border-rose-500/30 px-3 py-1 rounded-full inline-block">
            Card Deactivated
          </span>
          <h2 className="text-2xl font-extrabold text-white font-display">
            Card Not Active
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            This TapIt Card has been deactivated by its owner for privacy and security.
          </p>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-400">
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
