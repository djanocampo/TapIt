import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { NFCTapSimulatorModal } from '../components/nfc/NFCTapSimulatorModal';
import { ShieldAlert, ExternalLink, Sparkles } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/admin':
        return { title: 'Admin Overview', subtitle: 'Platform operations, global telemetry & server health' };
      case '/admin/users':
        return { title: 'User Management', subtitle: 'Search, filter, suspend, and reactivate accounts' };
      case '/admin/profiles':
        return { title: 'Profile Directory', subtitle: 'Platform-wide published profiles directory' };
      case '/admin/cards':
        return { title: 'NFC Card Inventory', subtitle: 'Batch hardware token generator & provisioning' };
      case '/admin/analytics':
        return { title: 'Platform Analytics', subtitle: 'Global event stream, tap volume, and fraud telemetry' };
      case '/admin/settings':
        return { title: 'System Settings', subtitle: 'Global configurations, security policies, and integrations' };
      default:
        return { title: 'Admin Console', subtitle: 'Root administration platform' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen flex flex-col bg-[#040c1a] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <div className="flex-1 flex h-screen overflow-hidden">
        {/* Desktop Persistent Sidebar (Hidden on Mobile) */}
        <div className="hidden md:flex h-full">
          <AdminSidebar />
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070a13]">
          {/* Header */}
          <header className="bg-[#050a17]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 md:hidden">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-white font-display tracking-tight flex items-center gap-2">
                  {pageInfo.title}
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">{pageInfo.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <span>User View</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </Link>
            </div>
          </header>

          {/* Scrollable Content with padding-bottom for mobile bottom nav */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Modern Mobile Bottom Navigation Bar (Admin Suite) */}
      <MobileBottomNav type="admin" />

      {/* Global Tap Simulator Modal */}
      <NFCTapSimulatorModal />
    </div>
  );
};
