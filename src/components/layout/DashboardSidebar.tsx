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
  const { currentUser, currentRole, profiles, activeProfile, setActiveProfileId, logout } = useTapIt();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'My Profiles', path: '/dashboard/profiles', icon: UserSquare2 },
    { label: 'Link Manager', path: '/dashboard/links', icon: Link2 },
    { label: 'My NFC Cards', path: '/dashboard/cards', icon: CreditCard },
    { label: 'QR Code Generator', path: '/dashboard/qr', icon: QrCode },
    { label: 'Deep Telemetry', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Account Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-full bg-[#050a17] border-r border-white/[0.08] flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.08]">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={tapItLogo} alt="TapIt Logo" className="h-8 w-auto object-contain" />
        </Link>
      </div>

      {/* Profile Persona Switcher */}
      <div className="p-4 border-b border-white/[0.08] bg-[#081224]/80">
        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Active Persona
        </label>
        
        <select
          value={activeProfile.id}
          onChange={(e) => handleSelectProfile(e.target.value)}
          className="w-full bg-[#050a17] border border-white/[0.1] rounded-xl text-xs font-semibold text-slate-100 py-2 px-3 focus:outline-none focus:border-cyan-400 transition"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.displayName})
            </option>
          ))}
        </select>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
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
