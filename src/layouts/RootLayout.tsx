import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { NFCTapSimulatorModal } from '../components/nfc/NFCTapSimulatorModal';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#040c1a] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <NFCTapSimulatorModal />
    </div>
  );
};
