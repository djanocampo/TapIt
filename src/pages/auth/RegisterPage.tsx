import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Radio, Mail, Lock, User, AtSign, Check, X, ArrowRight } from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';

export const RegisterPage: React.FC = () => {
  const { setRole } = useTapIt();
  const navigate = useNavigate();

  const [name, setName] = useState('Djan Ocampo');
  const [email, setEmail] = useState('djan.ocampo@tapit.app');
  const [username, setUsername] = useState('djan');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  // Simulated taken usernames
  const TAKEN_USERNAMES = ['admin', 'root', 'support', 'help', 'system'];
  const isUsernameTaken = TAKEN_USERNAMES.includes(username.toLowerCase().trim());
  const isUsernameValid = username.length >= 3 && !isUsernameTaken;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUsernameValid) return;
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      triggerConfetti();
      setRole('user');
      navigate('/dashboard');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 py-16 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-glow-cyan">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-white font-display">TapIt</span>
          </Link>
          <h2 className="text-xl font-bold text-white font-display">Create Your TapIt Account</h2>
          <p className="text-xs text-slate-400">Claim your personalized URL and start sharing with one tap</p>
        </div>

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
