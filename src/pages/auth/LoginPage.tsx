import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';
import tapItLogo from '../../assets/tapit-logo.png';

import { INITIAL_ADMIN, INITIAL_USER } from '../../data/mockData';

export const LoginPage: React.FC = () => {
  const { login, allUsers, setActiveProfileId, profiles } = useTapIt();
  const navigate = useNavigate();
  const [email, setEmail] = useState('djan.ocampo@tapit.app');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const cleanInput = email.trim().toLowerCase();
      // Admin Match
      if (cleanInput === 'admin' || cleanInput === 'admin@tapit.app') {
        login(INITIAL_ADMIN, 'admin');
        navigate('/admin');
        return;
      }

      // User Match (Djan or any newly created invited user)
      const matchedUser = allUsers.find(
        u => u.email.toLowerCase() === cleanInput || u.username.toLowerCase() === cleanInput
      ) || INITIAL_USER;

      login(matchedUser, 'user');
      const userProfile = profiles.find(p => p.userId === matchedUser.id);
      if (userProfile) {
        setActiveProfileId(userProfile.id);
      }
      navigate('/dashboard');
    }, 400);
  };

  const handleLoginAsAdmin = () => {
    login(INITIAL_ADMIN, 'admin');
    navigate('/admin');
  };

  const handleLoginAsDjan = () => {
    login(INITIAL_USER, 'user');
    navigate('/dashboard');
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
          <h2 className="text-2xl font-bold text-white font-display">Welcome Back</h2>
          <p className="text-xs text-slate-300">Sign in to your TapIt account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email or Username"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
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
              <span className="text-cyan-400 text-xs">Demo Mode Active</span>
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

        {/* Quick Demo Logins strictly for the 2 users */}
        <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
          <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
            1-Click Demo Logins:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleLoginAsAdmin}
              className="p-3 rounded-2xl bg-[#09152b] border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold text-slate-100 flex flex-col items-center justify-center gap-1.5 transition shadow-sm hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-white font-bold">Admin</span>
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Role: Admin</span>
            </button>

            <button
              type="button"
              onClick={handleLoginAsDjan}
              className="p-3 rounded-2xl bg-[#09152b] border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold text-slate-100 flex flex-col items-center justify-center gap-1.5 transition shadow-sm hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="text-white font-bold">Djan</span>
              <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">Role: User</span>
            </button>
          </div>
        </div>

        {/* Footer link */}
        <div className="text-center text-xs text-slate-400">
          Ready to explore?{' '}
          <Link to="/" className="text-cyan-400 font-bold hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
