import React from 'react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import {
  Zap,
  Smartphone,
  BarChart3
} from 'lucide-react';
import { Rotating3DCardHero } from '../../components/nfc/Rotating3DCardHero';

import tapItLogo from '../../assets/tapit-logo.png';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#040c1a] text-slate-100 overflow-hidden relative selection:bg-cyan-500 selection:text-black">
      {/* Ambient Atmospheric Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-b from-[#0e3b6d]/30 via-[#0a274e]/20 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[25%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[55%] left-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* ========================================================
          1. HOME SECTION (HERO)
          ======================================================== */}
      <section id="home" className="relative pt-6 pb-16 sm:pt-14 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

          {/* Left Column: Logo & CTAs */}
          <div className="lg:col-span-5 space-y-6 z-20 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* TapIt Logo as Hero Title (+30% larger) */}
            <div className="w-full flex justify-center lg:justify-start">
              <img
                src={tapItLogo}
                alt="TapIt"
                className="h-[84px] xs:h-[104px] sm:h-[125px] lg:h-[146px] w-auto object-contain drop-shadow-[0_12px_28px_rgba(6,182,212,0.35)] select-none"
              />
            </div>

            {/* Description Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-lg leading-relaxed font-normal">
              Unleash the speed of instant connection. Networking redefined in every tap — all in one sleek smart card.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full">
              <Link
                to="/register"
                className="inline-flex items-center gap-3.5 bg-[#0b172e] hover:bg-[#102449] text-white border border-cyan-400/40 hover:border-cyan-300 px-6 py-3.5 rounded-full text-sm sm:text-base font-bold shadow-xl shadow-cyan-950/80 transition-all duration-300 group hover:scale-[1.02]"
              >
                <span>Create Your TapIt</span>
                <span className="w-7 h-7 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-black group-hover:rotate-90 transition-transform duration-300 shadow-md shadow-cyan-400/30 text-sm">
                  +
                </span>
              </Link>

              <Link
                to="/features"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/80 px-5 py-3.5 rounded-full transition-all duration-200"
              >
                <span>Explore Features</span>
              </Link>
            </div>
          </div>

          {/* Right Column: 360-Degree Continuous Rotating Card Stage */}
          <div className="lg:col-span-7 relative w-full flex justify-center">
            <Rotating3DCardHero />
          </div>
        </div>
      </section>

      {/* ========================================================
          2. ABOUT US SECTION
          ======================================================== */}
      <section id="about" className="py-24 bg-[#050e1f]/80 border-y border-white/[0.06] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-1.5 rounded-full">
              About Us
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              Redefining How the World Connects
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              TapIt was created to replace outdated paper business cards and fragmented bio links with one smart, dynamic, and eco-friendly physical card.
            </p>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-[#091429]/90 border border-white/[0.08] hover:border-cyan-400/40 rounded-3xl p-8 backdrop-blur-xl shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display mb-3">
                Instant Contactless Tap
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Powered by high-frequency NFC microchips. Simply tap your TapIt card against any smartphone to share your identity instantly—zero apps required.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#091429]/90 border border-white/[0.08] hover:border-cyan-400/40 rounded-3xl p-8 backdrop-blur-xl shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display mb-3">
                Dynamic Cloud Profiles
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Change your phone number, social links, portfolio, or resume anytime from your dashboard without ever needing to reprint or rewrite your card.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#091429]/90 border border-white/[0.08] hover:border-cyan-400/40 rounded-3xl p-8 backdrop-blur-xl shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display mb-3">
                Real-Time Telemetry
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Track how many people tap your card, see which links convert, monitor visitor trends, and protect your privacy with encrypted token security.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
