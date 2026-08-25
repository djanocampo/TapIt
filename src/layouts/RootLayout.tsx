import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoBar } from '../components/layout/DemoBar';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { NFCTapSimulatorModal } from '../components/nfc/NFCTapSimulatorModal';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <DemoBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <NFCTapSimulatorModal />
    </div>
  );
};
