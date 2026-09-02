import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardSidebar } from '../components/layout/DashboardSidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { NFCTapSimulatorModal } from '../components/nfc/NFCTapSimulatorModal';
import { ShareProfileModal } from '../components/profile/ShareProfileModal';
import { useTapIt } from '../store';

export const DashboardLayout: React.FC = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { activeProfile } = useTapIt();
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Real-time networking insights & performance' };
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
    <div className="min-h-screen flex flex-col bg-[#040c1a] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <div className="flex-1 flex h-screen overflow-hidden">
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <div className="hidden md:flex h-full">
          <DashboardSidebar />
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070a13]">
          <DashboardHeader
            title={pageInfo.title}
            subtitle={pageInfo.subtitle}
            onOpenMobileMenu={() => {}} // Mobile navigation is now seamlessly managed via MobileBottomNav
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />

          {/* Content with bottom padding for mobile navbar */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Modern Mobile Bottom Navigation Bar (User Dashboard) */}
      <MobileBottomNav type="dashboard" />

      {/* Global Modals */}
      <NFCTapSimulatorModal />
      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={activeProfile}
      />
    </div>
  );
};
