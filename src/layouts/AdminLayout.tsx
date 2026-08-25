import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DemoBar } from '../components/layout/DemoBar';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { NFCTapSimulatorModal } from '../components/nfc/NFCTapSimulatorModal';
import { Menu, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="min-h-screen flex flex-col bg-[#06060c] text-slate-100 selection:bg-purple-500 selection:text-white">
      <DemoBar />

      <div className="flex-1 flex h-[calc(100vh-41px)] overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#080812] z-10">
              <AdminSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070a13]">
          {/* Header */}
          <header className="bg-[#080812]/90 backdrop-blur-md border-b border-purple-900/30 px-4 sm:px-6 lg:px-8 py-3.5 sticky top-10 z-30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-white font-display tracking-tight flex items-center gap-2">
                  {pageInfo.title}
                </h1>
                <p className="text-xs text-purple-400/80 hidden sm:block">{pageInfo.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
              >
                <span>User Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <NFCTapSimulatorModal />
    </div>
  );
};
