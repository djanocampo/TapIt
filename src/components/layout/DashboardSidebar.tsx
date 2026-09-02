import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { 
  LayoutDashboard, 
  UserSquare2, 
  Link2, 
  CreditCard, 
  QrCode, 
  BarChart3, 
  Palette, 
  Settings, 
  Radio, 
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  LogOut
} from 'lucide-react';

import tapItLogo from '../../assets/tapit-logo.png';

interface DashboardSidebarProps {
  collapsed?: boolean;
  onCloseMobile?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onCloseMobile }) => {
  const navigate = useNavigate();
  const { currentUser, currentRole, profiles, activeProfile, setActiveProfileId, openSimulator, logout } = useTapIt();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'My Profiles', path: '/dashboard/profiles', icon: UserSquare2 },
    { label: 'My Links', path: '/dashboard/links', icon: Link2 },
    { label: 'My TapIt Cards', path: '/dashboard/cards', icon: CreditCard },
    { label: 'QR Codes', path: '/dashboard/qr', icon: QrCode },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Appearance', path: '/dashboard/appearance', icon: Palette },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#050a17] border-r border-white/[0.08] flex flex-col h-full shrink-0 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={tapItLogo} alt="TapIt" className="h-7 w-auto object-contain group-hover:scale-105 transition-transform" />
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
          SaaS v1.0
        </span>
      </div>

      {/* Profile Switcher Quick Widget */}
      <div className="p-3 mx-3 my-3 bg-slate-900/90 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            Active Profile
          </span>
          <Link
            to={`/@${activeProfile.slug}`}
            target="_blank"
            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
          >
            Preview <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
        <select
          value={activeProfile.id}
          onChange={(e) => setActiveProfileId(e.target.value)}
          className="w-full bg-[#070a13] border border-slate-700/80 text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none cursor-pointer"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.displayName})
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/15 text-cyan-300 font-bold border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
            </NavLink>
          );
        })}
      </nav>

      {/* Simulator Quick Action in sidebar */}
      <div className="p-3 border-t border-white/[0.08]">
        <button
          onClick={() => openSimulator()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-sky-500/30 border border-cyan-400/40 text-cyan-300 py-2 rounded-xl text-xs font-bold transition shadow-md"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Simulate NFC Tap</span>
        </button>
      </div>

      {/* User Chip & Sign Out */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt={currentUser?.name || 'User'}
            className="w-9 h-9 rounded-full object-cover border border-cyan-500/40 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-100 truncate">{currentUser?.name || 'User'}</p>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              Role: {currentUser?.role === 'admin' ? 'Admin' : 'User'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
