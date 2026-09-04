import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { 
  ShieldCheck, 
  Users, 
  UserSquare2, 
  CreditCard, 
  BarChart3, 
  Settings, 
  ArrowLeft, 
  Radio, 
  ShieldAlert,
  ChevronRight,
  AlertTriangle,
  LogOut
} from 'lucide-react';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useTapIt();

  const navItems = [
    { label: 'Admin Overview', path: '/admin', icon: ShieldCheck, end: true },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Profile Directory', path: '/admin/profiles', icon: UserSquare2 },
    { label: 'NFC Card Inventory', path: '/admin/cards', icon: CreditCard },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#050a17] border-r border-white/[0.08] flex flex-col h-full shrink-0 select-none">
      {/* Admin Header */}
      <div className="p-4 border-b border-white/[0.06] bg-cyan-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-white font-display block">TapIt Admin</span>
            <span className="text-[10px] text-cyan-400 font-mono">ROOT_LEVEL_ACCESS</span>
          </div>
        </div>
      </div>

      {/* Admin Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-3">
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

      {/* Security Status Box */}
      <div className="p-3 mx-3 my-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Security Guard: ON</span>
        </div>
        <p className="text-[11px] text-slate-400">
          NFC token anti-collision & anti-cloning checks active.
        </p>
      </div>

      {/* Admin User Chip & Sign Out */}
      <div className="p-3 border-t border-white/[0.08] bg-[#040813] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'}
            alt={currentUser?.name || 'Admin'}
            className="w-8 h-8 rounded-full object-cover border border-cyan-400/40 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Admin'}</p>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Role: Admin</span>
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
