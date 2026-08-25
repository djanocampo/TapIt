import React from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  AlertTriangle
} from 'lucide-react';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const { currentUser } = useTapIt();

  const navItems = [
    { label: 'Admin Overview', path: '/admin', icon: ShieldCheck, end: true },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Profile Directory', path: '/admin/profiles', icon: UserSquare2 },
    { label: 'NFC Card Inventory', path: '/admin/cards', icon: CreditCard },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#080812] border-r border-purple-900/30 flex flex-col h-full shrink-0 select-none">
      {/* Admin Header */}
      <div className="p-4 border-b border-purple-900/40 bg-purple-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-white font-display block">TapIt Admin</span>
            <span className="text-[10px] text-purple-400 font-mono">ROOT_LEVEL_ACCESS</span>
          </div>
        </div>
      </div>

      {/* Return to Dashboard */}
      <div className="p-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to User Dashboard</span>
        </Link>
      </div>

      {/* Admin Nav */}
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
                    ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
      <div className="p-3 mx-3 my-3 bg-purple-950/30 border border-purple-800/40 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Security Guard: ON</span>
        </div>
        <p className="text-[11px] text-slate-400">
          NFC token anti-collision & anti-cloning checks active across 6,294 provisioned chips.
        </p>
      </div>

      {/* Admin User Chip */}
      <div className="p-3 border-t border-purple-900/30 bg-[#05050b] flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-8 h-8 rounded-full object-cover border border-purple-500/40"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Super Administrator</span>
        </div>
      </div>
    </aside>
  );
};
