import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { 
  Home, 
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
  Sparkles
} from 'lucide-react';

interface DashboardSidebarProps {
  collapsed?: boolean;
  onCloseMobile?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onCloseMobile }) => {
  const { currentUser, currentRole, profiles, activeProfile, setActiveProfileId, openSimulator } = useTapIt();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: Home, end: true },
    { label: 'My Profiles', path: '/dashboard/profiles', icon: UserSquare2 },
    { label: 'My Links', path: '/dashboard/links', icon: Link2 },
    { label: 'My TapIt Cards', path: '/dashboard/cards', icon: CreditCard },
    { label: 'QR Codes', path: '/dashboard/qr', icon: QrCode },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Appearance', path: '/dashboard/appearance', icon: Palette },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <span className="text-lg font-extrabold text-white font-display">TapIt</span>
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
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
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-400 font-semibold border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
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

        {/* Admin Link if authorized or demo */}
        {currentRole === 'admin' && (
          <div className="pt-3 mt-3 border-t border-slate-800/80">
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-purple-400 bg-purple-950/30 border border-purple-500/30 hover:bg-purple-900/40 transition"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Simulator Quick Action in sidebar */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => openSimulator()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-cyan-500/15 hover:from-cyan-500/25 hover:to-purple-500/25 border border-cyan-500/30 text-cyan-300 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Simulate NFC Tap</span>
        </button>
      </div>

      {/* User Chip */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-9 h-9 rounded-full object-cover border border-cyan-500/40 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</p>
          <p className="text-[10px] text-slate-400 truncate">@{currentUser.username}</p>
        </div>
      </div>
    </aside>
  );
};
