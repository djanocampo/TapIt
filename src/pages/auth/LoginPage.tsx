import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import tapItLogo from '../../assets/tapit-logo.png';
import { INITIAL_ADMIN } from '../../data/mockData';
import { verifyPassword, hashPassword } from '../../utils/crypto';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mapDBToUser } from '../../services/dualLayerSync';

import { BitsInfinityEmblem } from '../../components/common/BitsBrandElements';

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

    setTimeout(async () => {
      const cleanInput = identifier.trim().toLowerCase();
      const cleanPass = password.trim();

      // 1. Admin Verification
      if (cleanInput === 'admin' || cleanInput === 'admin@tapit.app') {
        const isAdminMatch = await verifyPassword(cleanPass, INITIAL_ADMIN.password);
        if (isAdminMatch) {
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
      let targetUser = allUsers.find(
        u => u.email.toLowerCase() === cleanInput || u.username.toLowerCase() === cleanInput
      );
      let passwordToVerify = targetUser?.password;

      // Authoritative single-user lookup from Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const { data: remoteRow, error } = await supabase
            .from('users')
            .select('*')
            .or(`email.ilike.${cleanInput},username.ilike.${cleanInput}`)
            .maybeSingle();

          if (!error && remoteRow) {
            targetUser = mapDBToUser(remoteRow);
            passwordToVerify = remoteRow.password_hash;
          }
        } catch (e) {
          console.warn('[Login] Remote user lookup exception:', e);
        }
      }

      if (!targetUser) {
        setIsLoading(false);
        setErrorMessage('No account found with this email or username. Please check your credentials or register.');
        return;
      }

      // If user has a password set, verify it securely (no backdoor bypass)
      if (passwordToVerify) {
        let isUserMatch = false;

        // 1. If stored as bcrypt ($2a$ or $2b$) from pgcrypto crypt(), verify via Supabase RPC
        if (passwordToVerify.startsWith('$2') && isSupabaseConfigured()) {
          try {
            const { data: rpcRes } = await supabase.rpc('verify_user_password', {
              identifier: cleanInput,
              candidate_password: cleanPass,
            });
            isUserMatch = Boolean(rpcRes?.success);
          } catch {
            isUserMatch = false;
          }
        } else {
          // 2. Standard salted PBKDF2 or legacy verify
          isUserMatch = await verifyPassword(cleanPass, passwordToVerify);
        }

        if (!isUserMatch) {
          setIsLoading(false);
          setErrorMessage('Incorrect password. Please try again.');
          return;
        }

        // Security Auto-Upgrade: If the password in DB is still plaintext, upgrade it to salted PBKDF2
        if (!passwordToVerify.startsWith('pbkdf2$')) {
          void (async () => {
            try {
              const { hashString } = await hashPassword(cleanPass);
              targetUser!.password = hashString;
              if (isSupabaseConfigured()) {
                await supabase.from('users').update({ password_hash: hashString }).eq('id', targetUser!.id);
              }
            } catch (err) {
              console.warn('Password hash upgrade warning:', err);
            }
          })();
        }
      }

      login(targetUser, targetUser.role || 'user');
      const userProfile = profiles.find(p => p.userId === targetUser?.id);
      if (userProfile) {
        setActiveProfileId(userProfile.id);
      }
      setIsLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#060c1c] flex items-center justify-center p-3.5 sm:p-4 py-8 sm:py-16 relative selection:bg-[#38BDF8] selection:text-slate-950">
      <div className="absolute inset-0 bits-hero-mesh pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#124294]/25 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bits-glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <img
              src={tapItLogo}
              alt="TapIt"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#124294]/30 border border-[#38BDF8]/40 text-[#38BDF8] text-[11px] font-mono">
            <BitsInfinityEmblem size={12} />
            <span>BITS SOVEREIGN AUTHENTICATION</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">Sign In to TapIt</h2>
          <p className="text-xs text-slate-300">Enter your credentials to access your smart identity portal</p>
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
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#1b2d55] bg-[#081329] text-[#2563EB] focus:ring-[#38BDF8]"
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[#38BDF8] text-xs hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isLoading}
            className="w-full justify-center mt-2 rounded-xl"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Footer link */}
        <div className="text-center text-xs text-slate-400 space-y-1 border-t border-[#1b2d55] pt-4">
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#38BDF8] font-bold hover:underline">
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
