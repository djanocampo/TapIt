import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2, ArrowRight, Copy, Check, AlertCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import tapItLogo from '../../assets/tapit-logo.png';

export const ForgotPasswordPage: React.FC = () => {
  const { requestPasswordReset } = useTapIt();
  const [identifier, setIdentifier] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetDetails, setResetDetails] = useState<{ resetUrl: string; token: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim()) {
      setErrorMessage('Please enter your account email or username.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(identifier.trim());
      setIsLoading(false);

      if (res.success && res.resetUrl && res.token) {
        setResetDetails({
          resetUrl: res.resetUrl,
          token: res.token,
          email: identifier.trim(),
        });
      } else {
        setErrorMessage(res.message || 'Unable to generate password recovery link.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  const handleCopy = async () => {
    if (!resetDetails?.resetUrl) return;
    try {
      await navigator.clipboard.writeText(resetDetails.resetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#040c1a] flex items-center justify-center p-4 py-16 relative selection:bg-cyan-500 selection:text-black">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#081224]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 backdrop-blur-2xl">
        {/* Brand */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <img
              src={tapItLogo}
              alt="TapIt"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
          <h2 className="text-2xl font-bold text-white font-display">Reset Your Password</h2>
          <p className="text-xs text-slate-300">
            Enter your email address or username and we'll generate your secure password recovery link.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!resetDetails ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address or Username"
              type="text"
              placeholder="e.g. alex@example.com or alex"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="glow"
              size="lg"
              isLoading={isLoading}
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Generate Recovery Link
            </Button>
          </form>
        ) : (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow-emerald">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white font-display">Recovery Link Ready</h4>
              <p className="text-xs text-slate-300 mt-1">
                A secure, single-use password reset link has been prepared for <strong className="text-cyan-300">{resetDetails.email}</strong>.
              </p>
            </div>

            {/* Direct Link Box with 1-Click Copy */}
            <div className="p-4 rounded-2xl bg-[#040813] border border-cyan-500/30 text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Secure Token (Valid for 1 hour)
                </span>
                <span className="text-[10px] text-slate-400">Single-use</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={resetDetails.resetUrl}
                  className="flex-1 bg-[#091122] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none select-all overflow-hidden text-ellipsis"
                />
                <Button
                  variant="glow"
                  size="sm"
                  type="button"
                  onClick={handleCopy}
                  leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                In local and preview environments, use the button below or copy the secure link above to set your new password immediately.
              </p>
            </div>

            <Link
              to={`/reset-password?token=${resetDetails.token}`}
              className="block w-full"
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-glow-cyan"
                rightIcon={<ExternalLink className="w-4 h-4" />}
              >
                Proceed to Reset Password
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => {
                setResetDetails(null);
                setIdentifier('');
              }}
              className="text-xs text-slate-400 hover:text-cyan-400 transition underline underline-offset-4"
            >
              Request for a different account
            </button>
          </div>
        )}

        <div className="text-center pt-2 border-t border-white/[0.08]">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

