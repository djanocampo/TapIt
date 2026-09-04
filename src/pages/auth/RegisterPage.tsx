import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, User, AtSign, Check, X, ArrowRight } from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';
import tapItLogo from '../../assets/tapit-logo.png';

export const RegisterPage: React.FC = () => {
  const { registerUser, allUsers } = useTapIt();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check taken usernames against live state
  const cleanUser = username.toLowerCase().trim();
  const isUsernameTaken = allUsers.some(u => u.username.toLowerCase() === cleanUser);
  const isUsernameValid = cleanUser.length >= 3 && !isUsernameTaken;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!isUsernameValid) {
      setErrorMessage('Please choose a valid and available username.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = registerUser({
        name,
        email,
        username: cleanUser,
        password,
      });

      setIsLoading(false);
      if (res.success) {
        triggerConfetti();
        navigate('/dashboard');
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
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
          <h2 className="text-2xl font-bold text-white font-display">Create Your TapIt Account</h2>
          <p className="text-xs text-slate-300">Claim your personalized URL and start sharing with one tap</p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          {/* Username with live validation */}
          <div className="space-y-1.5">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              leftIcon={<AtSign className="w-4 h-4" />}
              required
            />
            {/* Live validation feedback */}
            <div className="flex items-center justify-between text-xs px-1">
              {username.length > 0 && (
                <>
                  {isUsernameValid ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      ✓ {username} is available
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      ✕ This username is already taken
                    </span>
                  )}
                  <span className="text-slate-400 font-mono text-[11px]">
                    tapit.app/@{username || 'username'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
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
            disabled={!isUsernameValid}
            className="w-full justify-center mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Your Account
          </Button>
        </form>

        {/* Footer link */}
        <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
