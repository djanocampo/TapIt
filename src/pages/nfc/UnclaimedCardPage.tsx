import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { CreditCard, ArrowRight, ShieldCheck, LogIn, Home } from 'lucide-react';
import tapItLogo from '../../assets/tapit-logo.png';
import { BitsInfinityEmblem } from '../../components/common/BitsBrandElements';

interface UnclaimedCardPageProps {
  cardToken: string;
  isNewToken?: boolean;
}

export const UnclaimedCardPage: React.FC<UnclaimedCardPageProps> = ({
  cardToken,
}) => {
  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-bits-midnight bits-hero-mesh flex items-center justify-center p-3 sm:p-4 py-8 sm:py-16 selection:bg-bits-cyan selection:text-bits-midnight">
      <div className="w-full max-w-lg bg-bits-navy/90 border border-bits-vapor/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-card-bits space-y-6 relative overflow-hidden backdrop-blur-2xl text-center">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center pb-1">
          <img src={tapItLogo} alt="TapIt" className="h-8 w-auto object-contain drop-shadow-[0_2px_14px_rgba(56,189,248,0.3)]" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center justify-center mx-auto shadow-glow-cyan">
          <CreditCard className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-400/30 px-3 py-1 rounded-full">
            <BitsInfinityEmblem size={12} />
            <span>BITS Tap™ Reserved Hardware</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Card Pending Activation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            This physical TapIt smart card has been provisioned and is waiting for activation. If you received this card, please complete your profile setup using the personalized link sent by our team.
          </p>
        </div>

        {/* Hardware Token Info */}
        <div className="p-3 bg-bits-midnight/80 border border-bits-horizon/40 rounded-2xl text-xs font-mono text-slate-400">
          Hardware Token: <strong className="text-cyan-300">/t/{cardToken}</strong>
        </div>

        {/* Navigation Actions */}
        <div className="space-y-2.5 pt-2">
          <Link to="/login" className="block w-full">
            <Button
              variant="glow"
              size="lg"
              className="w-full justify-center"
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In to Your Account
            </Button>
          </Link>

          <Link to="/" className="block w-full">
            <Button
              variant="secondary"
              size="md"
              className="w-full justify-center"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Return to Homepage
            </Button>
          </Link>
        </div>

        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted NFC Hardware Endpoint</span>
        </div>
      </div>
    </div>
  );
};
