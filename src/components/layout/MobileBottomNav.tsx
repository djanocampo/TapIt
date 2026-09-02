import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { 
  LayoutDashboard, 
  UserSquare2, 
  Link2, 
  CreditCard, 
  MoreHorizontal, 
  ShieldAlert, 
  Users, 
  FolderKanban, 
  Radio, 
  QrCode, 
  BarChart3, 
  Palette, 
  Settings, 
  LogOut, 
  X, 
  ExternalLink,
  ChevronRight,
  Shield,
  Sparkles
} from 'lucide-react';

interface MobileBottomNavProps {
  type: 'dashboard' | 'admin';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, activeProfile } = useTapIt();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    setIsMoreOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsMoreOpen(false);
    navigate('/login');
  };

  // Primary 4 tabs + 1 More tab
  const dashboardTabs = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Profiles', path: '/dashboard/profiles', icon: UserSquare2 },
    { label: 'Links', path: '/dashboard/links', icon: Link2 },
    { label: 'Cards', path: '/dashboard/cards', icon: CreditCard },
  ];

  const adminTabs = [
    { label: 'Overview', path: '/admin', icon: ShieldAlert },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Profiles', path: '/admin/profiles', icon: FolderKanban },
    { label: 'Cards', path: '/admin/cards', icon: Radio },
  ];

  const currentTabs = type === 'admin' ? adminTabs : dashboardTabs;

  return (
    <>
      {/* FIXED BOTTOM NAVIGATION BAR (MOBILE ONLY) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050c18]/95 backdrop-blur-2xl border-t border-white/[0.1] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.8)] px-2 py-1.5 safe-bottom">
        <div className="grid grid-cols-5 items-center gap-1">
          {currentTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActiveRoute(tab.path);

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 ${
                  active
                    ? 'text-cyan-300 font-bold bg-cyan-950/50 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${active ? 'text-cyan-400 scale-110' : ''}`} />
                <span className="text-[10px] tracking-tight truncate max-w-[55px] text-center">
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* 5th Button: MORE OPTION */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 ${
              isMoreOpen
                ? 'text-cyan-300 font-bold bg-cyan-950/50 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 mb-0.5 ${isMoreOpen ? 'text-cyan-400' : ''}`} />
            <span className="text-[10px] tracking-tight truncate max-w-[55px] text-center">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* MORE SLIDE-UP BOTTOM SHEET DRAWER */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Bottom Sheet Modal */}
          <div className="relative z-10 w-full max-h-[85vh] bg-[#070e1c] border-t border-white/[0.12] rounded-t-[32px] p-6 shadow-2xl flex flex-col space-y-5 overflow-y-auto safe-bottom animate-in slide-in-from-bottom duration-300">
            {/* Top Handle & Close Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40"
                />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {currentUser.name}
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                      {currentUser.role}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">@{currentUser.username}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Additional Menu Items */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
                {type === 'admin' ? 'Admin Tools & Navigation' : 'Additional Features'}
              </p>

              {type === 'dashboard' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/dashboard/qr')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0a1428] hover:bg-[#0f1d38] border border-white/[0.06] text-slate-200 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">QR Code Studio</p>
                        <p className="text-[10px] text-slate-400">High-res vector QR generators</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('/dashboard/analytics')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0a1428] hover:bg-[#0f1d38] border border-white/[0.06] text-slate-200 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Analytics Studio</p>
                        <p className="text-[10px] text-slate-400">Tap telemetry & traffic breakdowns</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('/dashboard/appearance')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0a1428] hover:bg-[#0f1d38] border border-white/[0.06] text-slate-200 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Appearance & Themes</p>
                        <p className="text-[10px] text-slate-400">Custom colors, buttons & styles</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('/dashboard/settings')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0a1428] hover:bg-[#0f1d38] border border-white/[0.06] text-slate-200 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-500/10 text-slate-300 border border-slate-500/20">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Account Settings</p>
                        <p className="text-[10px] text-slate-400">Profile credentials & security</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  {/* Open Public Profile */}
                  <a
                    href={`/@${activeProfile.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">View Live Public Profile</p>
                        <p className="text-[10px] text-cyan-400 font-mono">tapit.app/@{activeProfile.slug}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                  </a>

                  {/* Switch to Admin View (If Admin) */}
                  {currentUser.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleNavigate('/admin')}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 text-amber-300 transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-200">Switch to Admin Suite</p>
                          <p className="text-[10px] text-amber-400/80">Access root platform controls</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                    </button>
                  )}
                </>
              ) : (
                /* Admin Additional Items */
                <>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/admin/analytics')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0a1428] hover:bg-[#0f1d38] border border-white/[0.06] text-slate-200 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Platform Analytics</p>
                        <p className="text-[10px] text-slate-400">Global tap volume & telemetry</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('/admin/settings')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0a1428] hover:bg-[#0f1d38] border border-white/[0.06] text-slate-200 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-500/10 text-slate-300 border border-slate-500/20">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">System Settings</p>
                        <p className="text-[10px] text-slate-400">Platform security policies</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('/dashboard')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Switch to User View</p>
                        <p className="text-[10px] text-cyan-400">Manage your personal profiles</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                  </button>
                </>
              )}

              {/* Log Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 text-rose-300 transition text-left pt-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-rose-300">Sign Out of TapIt</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
