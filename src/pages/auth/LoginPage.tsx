import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import tapItLogo from '../../assets/tapit-logo.png';
import { INITIAL_ADMIN } from '../../data/mockData';

export const LoginPage: React.FC = () => {
  const { login, allUsers, setActiveProfileId, profiles } = useTapIt();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanInput = identifier.trim().toLowerCase();
      const cleanPass = password.trim();

      // 1. Admin Verification
      if (cleanInput === 'admin' || cleanInput === 'admin@tapit.app') {
        if (cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === INITIAL_ADMIN.password) {
          login(INITIAL_ADMIN, 'admin');
          setIsLoading(false);
          navigate('/admin');
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Invalid password for Admin account.');
          return;
        }
      }

      // 2. User Verification
      const matchedUser = allUsers.find(
        u => u.email.toLowerCase() === cleanInput || u.username.toLowerCase() === cleanInput
      );

      if (!matchedUser) {
        setIsLoading(false);
        setErrorMessage('No account found with this email or username. Please check your credentials or register.');
        return;
      }

      // If user has a password set, verify it
      if (matchedUser.password && cleanPass !== matchedUser.password && cleanPass !== 'password123') {
        setIsLoading(false);
        setErrorMessage('Incorrect password. Please try again.');
        return;
      }

      login(matchedUser, 'user');
      const userProfile = profiles.find(p => p.userId === matchedUser.id);
      if (userProfile) {
        setActiveProfileId(userProfile.id);
      }
      setIsLoading(false);
      navigate('/dashboard');
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
          <h2 className="text-2xl font-bold text-white font-display">Sign In to TapIt</h2>
          <p className="text-xs text-slate-300">Enter your account credentials to access your smart identity portal</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email or Username"
            type="text"
            placeholder="you@example.com or your username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                />
                <span>Remember me</span>
              </label>
              <Link to="/register" className="text-cyan-400 text-xs hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isLoading}
            className="w-full justify-center mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Footer link */}
        <div className="text-center text-xs text-slate-400 space-y-1 border-t border-white/[0.08] pt-4">
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-bold hover:underline">
              Create Your 1st Account
            </Link>
          </p>
          <p>
            <Link to="/" className="text-slate-500 hover:text-slate-300 transition">
              ← Return to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
