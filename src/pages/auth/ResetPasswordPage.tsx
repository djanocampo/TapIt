import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Lock, CheckCircle2, ArrowRight, AlertCircle, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';
import tapItLogo from '../../assets/tapit-logo.png';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeParams = useParams<{ token?: string }>();
  const { verifyResetToken, resetPasswordWithToken } = useTapIt();

  const tokenFromUrl = routeParams.token || searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate the reset token on mount or when token changes
  useEffect(() => {
    const checkToken = async () => {
      if (!token || !token.trim()) {
        setIsVerifying(false);
        setTokenValid(false);
        setTokenError('No password reset token was detected in the link.');
        return;
      }

      setIsVerifying(true);
      setTokenError('');
      try {
        const res = await verifyResetToken(token.trim());
        setIsVerifying(false);
        if (res.valid) {
          setTokenValid(true);
          setTokenEmail(res.email || '');
        } else {
          setTokenValid(false);
          setTokenError(res.message || 'This password reset link is invalid or has expired.');
        }
      } catch {
        setIsVerifying(false);
        setTokenValid(false);
        setTokenError('Unable to verify this password reset link.');
      }
    };

    void checkToken();
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordWithToken(token.trim(), password);
      setIsLoading(false);

      if (res.success) {
        setIsSuccess(true);
        triggerConfetti();
      } else {
        setErrorMessage(res.message || 'Failed to update password. Please try again.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('An unexpected error occurred while resetting your password.');
    }
  };

  const isMatching = confirmPassword.length > 0 && password === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;

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
          <h2 className="text-2xl font-bold text-white font-display">Create New Password</h2>
          <p className="text-xs text-slate-300">
            Choose a strong, secure password for your TapIt account.
          </p>
        </div>

        {/* LOADING TOKEN STATE */}
        {isVerifying && (
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Verifying security token...</p>
          </div>
        )}

        {/* INVALID / EXPIRED TOKEN STATE */}
        {!isVerifying && !tokenValid && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Invalid or Expired Link</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {tokenError || 'This reset link is either missing, has expired, or has already been used.'}
              </p>
            </div>

            {/* Manual token paste option */}
            <div className="pt-2 space-y-2">
              <label className="text-[11px] text-slate-400">Have a reset token? Enter it here:</label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Paste token (e.g. rst_...)"
                  value={token}
                  onChange={(e) => setToken(e.target.value.trim())}
                  leftIcon={<KeyRound className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link to="/forgot-password">
                <Button variant="glow" size="md" className="w-full justify-center">
                  Request New Password Reset Link
                </Button>
              </Link>
              <Link to="/login" className="text-center text-xs text-slate-400 hover:text-white transition pt-1">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* VALID TOKEN - PASSWORD FORM */}
        {!isVerifying && tokenValid && !isSuccess && (
          <form onSubmit={handleReset} className="space-y-4">
            {tokenEmail && (
              <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Setting new password for: <strong className="text-white font-bold">{tokenEmail}</strong>
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1">
              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              {password.length > 0 && password.length < 6 && (
                <p className="text-[10px] text-amber-400 px-1">Must be at least 6 characters</p>
              )}
            </div>

            <div className="space-y-1">
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              {isMatching && (
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 px-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
              {isMismatch && (
                <p className="text-[10px] text-rose-400 flex items-center gap-1 px-1">
                  <AlertCircle className="w-3 h-3" /> Passwords do not match
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="glow"
              size="lg"
              isLoading={isLoading}
              className="w-full justify-center mt-2 shadow-glow-cyan"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              disabled={password.length < 6 || password !== confirmPassword}
            >
              Update Password
            </Button>
          </form>
        )}

        {/* SUCCESS STATE */}
        {!isVerifying && isSuccess && (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow-emerald">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-white font-display">Password Updated!</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your account password has been successfully changed and encrypted with PBKDF2. You can now sign in with your new credentials.
              </p>
            </div>

            <Link to="/login" className="block w-full">
              <Button variant="primary" size="lg" className="w-full justify-center shadow-glow-cyan">
                Sign In Now
              </Button>
            </Link>
          </div>
        )}

        <div className="text-center pt-2 border-t border-white/[0.08]">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

