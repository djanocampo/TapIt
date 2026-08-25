import React, { useState } from 'react';
import { useTapIt } from '../../store';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Menu, 
  Share2, 
  ExternalLink, 
  Smartphone, 
  Radio, 
  CheckCircle2, 
  Info, 
  Clock, 
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatRelativeTime } from '../../lib/utils';
import { Button } from '../ui/Button';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
  onOpenShareModal?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  onOpenShareModal,
}) => {
  const { activeProfile, notifications, markNotificationAsRead, clearAllNotifications, openSimulator } = useTapIt();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky top-10 z-30 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base sm:text-xl font-bold text-white font-display tracking-tight flex items-center gap-2">
            {title || 'Dashboard'}
          </h1>
          {subtitle && <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick NFC Simulator Button */}
        <button
          onClick={() => openSimulator()}
          className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-cyan-300 text-xs px-3 py-2 rounded-xl transition font-medium"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Simulate NFC</span>
        </button>

        {/* Live Public URL Preview Button */}
        <Link
          to={`/@${activeProfile.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 text-xs px-3 py-2 rounded-xl transition font-medium shadow-sm"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">tapit.app/@{activeProfile.slug}</span>
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
        </Link>

        {/* Share Profile Button */}
        {onOpenShareModal && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenShareModal}
            leftIcon={<Share2 className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Share</span>
          </Button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 rounded-full text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-dropdown shadow-2xl p-4 z-50 border border-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllNotifications}
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No new activity yet. Tap a card to test!
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        notif.read
                          ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                          : 'bg-slate-900/90 border-cyan-500/30 text-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
