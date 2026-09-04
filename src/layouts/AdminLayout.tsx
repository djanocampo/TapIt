import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { LocalStorageCacheModal } from '../components/common/LocalStorageCacheModal';
import { ShieldAlert, ExternalLink, Sparkles, HardDrive } from 'lucide-react';
import { useTapIt } from '../store';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { getStorageMetrics } = useTapIt();
  const [isCacheModalOpen, setIsCacheModalOpen] = useState(false);

  const metrics = getStorageMetrics();
  const approxKb = (metrics.approxBytes / 1024).toFixed(1);

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
    <div className="min-h-screen bg-[#040c1a] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Desktop Persistent Fixed Sidebar (Pinned to Viewport - Does not scroll with page) */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 z-40">
        <AdminSidebar />
      </div>

      {/* Main Workspace Area (Offset by sidebar width on desktop) */}
      <div className="md:pl-64 flex flex-col min-h-screen min-w-0 bg-[#070a13]">
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
            <button
              type="button"
              onClick={() => setIsCacheModalOpen(true)}
              title="Inspect / Clear Local Storage Cache"
              className="flex items-center gap-1.5 bg-[#081326] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs px-2.5 py-1.5 rounded-xl transition font-medium shadow-sm hover:scale-[1.02]"
            >
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px] font-bold">{approxKb} KB Cache</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content with padding-bottom for mobile bottom nav */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Local Storage Cache Modal */}
      <LocalStorageCacheModal
        isOpen={isCacheModalOpen}
        onClose={() => setIsCacheModalOpen(false)}
      />

      {/* Modern Mobile Bottom Navigation Bar (Admin Suite) */}
      <MobileBottomNav type="admin" />
    </div>
  );
};
