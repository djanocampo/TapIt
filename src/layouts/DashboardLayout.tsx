import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DemoBar } from '../components/layout/DemoBar';
import { DashboardSidebar } from '../components/layout/DashboardSidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { NFCTapSimulatorModal } from '../components/nfc/NFCTapSimulatorModal';
import { ShareProfileModal } from '../components/profile/ShareProfileModal';
import { useTapIt } from '../store';

export const DashboardLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { activeProfile } = useTapIt();
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Overview', subtitle: 'Real-time networking insights & performance' };
      case '/dashboard/profiles':
        return { title: 'My Profiles', subtitle: 'Manage distinct personal & professional digital identities' };
      case '/dashboard/links':
        return { title: 'My Links', subtitle: 'Add, organize, and prioritize destination links' };
      case '/dashboard/cards':
        return { title: 'My TapIt Cards', subtitle: 'Physical NFC card provisioning & status control' };
      case '/dashboard/qr':
        return { title: 'QR Code Studio', subtitle: 'High-DPI vector QR codes & printable sheet export' };
      case '/dashboard/analytics':
        return { title: 'Analytics Studio', subtitle: 'Detailed telemetry across taps, visits, and clicks' };
      case '/dashboard/appearance':
        return { title: 'Appearance Studio', subtitle: 'Curated themes, button shapes, and typography' };
      case '/dashboard/settings':
        return { title: 'Account Settings', subtitle: 'Manage credentials, security, and notification alerts' };
      default:
        if (location.pathname.startsWith('/dashboard/profiles/edit')) {
          return { title: 'Profile Editor', subtitle: 'Real-time mobile preview & details configuration' };
        }
        return { title: 'Dashboard', subtitle: 'Smart identity and link management' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <DemoBar />

      <div className="flex-1 flex h-[calc(100vh-41px)] overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full">
          <DashboardSidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#090d16] z-10">
              <DashboardSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070a13]">
          <DashboardHeader
            title={pageInfo.title}
            subtitle={pageInfo.subtitle}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <NFCTapSimulatorModal />
      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={activeProfile}
      />
    </div>
  );
};
