import React from 'react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import {
  Zap,
  Smartphone,
  BarChart3,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { Rotating3DCardHero } from '../../components/nfc/Rotating3DCardHero';
import { BitsInfinityEmblem, BitsEnterpriseBadge } from '../../components/common/BitsBrandElements';
import { Button } from '../../components/ui/Button';

import tapItLogo from '../../assets/tapit-logo.png';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#060c1c] text-slate-100 relative selection:bg-[#38BDF8] selection:text-slate-950">
      {/* BITS Ambient Atmospheric Hero Mesh */}
      <div className="absolute inset-0 bits-hero-mesh pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[550px] h-[550px] bg-[#124294]/25 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[50%] left-[-10%] w-[500px] h-[500px] bg-[#38BDF8]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* ========================================================
          1. HOME SECTION (HERO)
          ======================================================== */}
      <section id="home" className="relative pt-8 pb-16 sm:pt-16 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

          {/* Left Column: Logo, Tagline & CTAs */}
          <div className="lg:col-span-5 space-y-6 z-20 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* BITS Submark Monogram Chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#124294]/30 border border-[#38BDF8]/40 text-[#E0F2FE] text-xs font-semibold backdrop-blur-md shadow-glow-cyan">
              <BitsInfinityEmblem size={16} />
              <span className="tracking-wide uppercase font-mono text-[11px]">STAY GROUNDED, BE BOUNDLESS</span>
            </div>

            {/* TapIt Logo as Hero Title */}
            <div className="w-full flex justify-center lg:justify-start">
              <img
                src={tapItLogo}
                alt="TapIt"
                className="h-[84px] xs:h-[104px] sm:h-[125px] lg:h-[146px] w-auto object-contain drop-shadow-[0_16px_36px_rgba(27,85,198,0.45)] select-none"
              />
            </div>

            {/* Value Proposition Description Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-lg leading-relaxed font-normal">
              1 Card for Life. Tap any smartphone to share dynamic profiles, portfolios, and contact credentials. High-altitude cloud clarity paired with grounded bedrock security.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full">
              <Link to="/register">
                <Button
                  variant="glow"
                  size="lg"
                  className="rounded-full px-7 font-extrabold"
                  rightIcon={<span className="w-6 h-6 rounded-full bg-white text-slate-950 flex items-center justify-center font-black text-sm">+</span>}
                >
                  Create Your TapIt
                </Button>
              </Link>

              <Link to="/features">
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full px-6"
                >
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Trust Micro-Badges */}
            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400 font-mono flex-wrap justify-center lg:justify-start">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                Zero Seat Penalties
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                ISO/IEC 14443-A Ready
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                NPC & BSP Compliant
              </span>
            </div>
          </div>

          {/* Right Column: 360-Degree Continuous Rotating Card Stage */}
          <div className="lg:col-span-7 relative w-full flex justify-center">
            <Rotating3DCardHero />
          </div>
        </div>
      </section>

      {/* ========================================================
          2. CORE VALUE EQUATION (Tailored Systems > Generic SaaS)
          ======================================================== */}
      <section className="py-16 bg-[#0a142c]/90 border-y border-[#1b2d55] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-widest bg-[#124294]/40 border border-[#1B55C6]/50 px-3.5 py-1.5 rounded-full font-mono">
              THE CORE VALUE EQUATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Tailored Systems &gt; Generic SaaS
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Built on the BITS standard: concrete architecture and working previews instead of speculative futures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div className="p-6 rounded-2xl bg-[#081329] border border-[#1b2d55] hover:border-[#38BDF8]/40 transition shadow-lg">
              <div className="text-xs font-mono font-bold text-[#38BDF8] mb-2 uppercase">Rule 01</div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Zero Per-User Traps</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Flat, transparent tiers that scale with output, not headcounts. No seat penalties or artificial paywalls as your team expands.
              </p>
            </div>

            {/* Box 2 */}
            <div className="p-6 rounded-2xl bg-[#081329] border border-[#1b2d55] hover:border-[#38BDF8]/40 transition shadow-lg">
              <div className="text-xs font-mono font-bold text-[#38BDF8] mb-2 uppercase">Rule 02</div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">No Speculative Futures</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Concrete architecture and working previews instead of jargon. Direct browser Web NFC flashing, verified token encryption, and native vCard.
              </p>
            </div>

            {/* Box 3 */}
            <div className="p-6 rounded-2xl bg-[#081329] border border-[#1b2d55] hover:border-[#38BDF8]/40 transition shadow-lg">
              <div className="text-xs font-mono font-bold text-[#38BDF8] mb-2 uppercase">Rule 03</div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">The Dual Mandate</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                High-altitude cloud clarity paired with on-premise bedrock security. BSP, NPC DPA, and BIR CAS compliant data governance.
              </p>
            </div>
          </div>

          {/* 4 Telemetry Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#1b2d55]">
            <div className="text-center p-4 rounded-xl bg-[#060c1c]/60 border border-[#1b2d55]">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">&lt;300ms</div>
              <div className="text-[11px] text-[#38BDF8] font-mono mt-1 uppercase">Tap-to-Profile Speed</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#060c1c]/60 border border-[#1b2d55]">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">1 Card</div>
              <div className="text-[11px] text-[#38BDF8] font-mono mt-1 uppercase">Lifetime Dynamic Identity</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#060c1c]/60 border border-[#1b2d55]">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">Zero ₱</div>
              <div className="text-[11px] text-[#38BDF8] font-mono mt-1 uppercase">Monthly Seat Penalties</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#060c1c]/60 border border-[#1b2d55]">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#F59E0B] font-display">99.99%</div>
              <div className="text-[11px] text-amber-400 font-mono mt-1 uppercase">Telemetry Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. ABOUT US SECTION (3 Pillars)
          ======================================================== */}
      <section id="about" className="py-24 bg-[#060c1c] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-widest bg-[#124294]/30 border border-[#1B55C6]/50 px-3.5 py-1.5 rounded-full font-mono">
              ENGINEERED FOR SCALE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              Redefining How Enterprise Connects
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              TapIt replaces disposable paper cards and rigid link services with an unbroken, automated operational identity cycle.
            </p>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bits-glass rounded-3xl p-8 hover:border-[#38BDF8]/40 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/20 border border-[#38BDF8]/30 text-[#38BDF8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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
            <div className="bits-glass rounded-3xl p-8 hover:border-[#38BDF8]/40 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/20 border border-[#38BDF8]/30 text-[#38BDF8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display mb-3">
                Dynamic Cloud Profiles
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Switch between Professional, Executive, and Creator personas in real time without ever needing to reprint or reflash the physical card.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bits-glass rounded-3xl p-8 hover:border-[#38BDF8]/40 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/20 border border-[#38BDF8]/30 text-[#38BDF8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display mb-3">
                Real-Time Telemetry
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Floor metrics, tap conversion tracking, traffic attribution, and instant lost-card killswitch protection with zero data leak.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
