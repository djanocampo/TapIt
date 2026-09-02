import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { 
  Radio, 
  Mail, 
  Lock, 
  User, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';
import tapItLogo from '../../assets/tapit-logo.png';

export const InviteRegistrationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { getInviteByToken, completeInviteRegistration, cards } = useTapIt();

  const invite = token ? getInviteByToken(token) : undefined;
  const boundCard = invite ? cards.find(c => c.cardToken.toLowerCase() === invite.cardToken.toLowerCase()) : undefined;

  const [name, setName] = useState(invite?.initialName || '');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (invite?.initialName) {
      setName(invite.initialName);
      const suggestedUser = invite.initialName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (suggestedUser) setUsername(suggestedUser);
    }
  }, [invite]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) return;

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }
    if (!email.trim().includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = completeInviteRegistration(token, {
        name,
        username,
        email,
        password,
      });

      setIsLoading(false);
      if (res.success) {
        triggerConfetti();
        navigate('/dashboard');
      } else {
        setErrorMessage(res.message);
      }
    }, 600);
  };

  // If invite token is not found or already used
  if (!invite) {
    return (
      <div className="min-h-screen bg-[#040c1a] flex items-center justify-center p-4 py-16 text-center">
        <div className="max-w-md w-full bg-[#081224]/90 border border-white/[0.08] rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center justify-center mx-auto shadow-lg">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-display">Invitation Not Found</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              This temporary invitation link is either expired, invalid, or has already been completed.
            </p>
          </div>
          <Link to="/login">
            <Button variant="primary" className="w-full justify-center">
              Go to Login Page
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (invite.isUsed) {
    return (
      <div className="min-h-screen bg-[#040c1a] flex items-center justify-center p-4 py-16 text-center">
        <div className="max-w-md w-full bg-[#081224]/90 border border-white/[0.08] rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-display">Account Already Activated!</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              This invitation has already been claimed and registered. You can log in using your registered credentials.
            </p>
          </div>
          <Link to="/login">
            <Button variant="glow" className="w-full justify-center">
              Sign In to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040c1a] flex items-center justify-center p-4 py-16 relative selection:bg-cyan-500 selection:text-black">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#081224]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 backdrop-blur-2xl">
        {/* Header Branding */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <img
              src={tapItLogo}
              alt="TapIt"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-400/40 px-3 py-1 rounded-full shadow-glow-cyan">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>VIP Account Activation Invitation</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">Welcome to TapIt</h2>
          <p className="text-xs text-slate-300 max-w-sm">
            Complete your registration below to link your provisioned <strong>NFC Smart Card</strong> and launch your digital profile!
          </p>
        </div>

        {/* Bound NFC Card Badge */}
        <div className="p-4 rounded-2xl bg-[#050c18] border border-cyan-500/30 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">
                Pre-Bound Physical NFC Tag:
              </span>
              <p className="text-xs font-mono font-bold text-white">
                tapit.app/t/{invite.cardToken}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
            {invite.material}
          </span>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Desired Username (Public Profile URL)"
            placeholder="e.g. johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            helperText={`Your profile will be live at: tapit.app/@${username || 'username'}`}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isLoading}
            className="w-full justify-center mt-3 font-bold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Activate Account & NFC Smart Card
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/[0.08]">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-bold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
