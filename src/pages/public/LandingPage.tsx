import React from 'react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Button } from '../../components/ui/Button';
import { 
  Radio, 
  Smartphone, 
  BarChart3, 
  QrCode, 
  Sparkles, 
  Layers, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Share2, 
  ExternalLink 
} from 'lucide-react';
import { MobileFramePreview } from '../../components/profile/MobileFramePreview';
import { NFCCardPreview } from '../../components/nfc/NFCCardPreview';

export const LandingPage: React.FC = () => {
  const { profiles, links, cards, openSimulator } = useTapIt();
  const professionalProfile = profiles.find((p) => p.slug === 'professional') || profiles[0];

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 overflow-hidden">
      {/* Background glow meshes */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-cyan-600/15 via-purple-600/15 to-transparent blur-[120px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-cyan-300 shadow-glow-cyan animate-pulse">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Generation NFC Smart Identity Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white font-display tracking-tight leading-[1.1]">
            Everything You Share.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
              One Tap Away.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Create your digital identity, connect it to NFC and QR technology, and understand how people interact with your profile in real-time.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register">
              <Button variant="glow" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Your TapIt
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => openSimulator()}
              leftIcon={<Radio className="w-4 h-4 text-cyan-400 animate-pulse" />}
            >
              Explore Live NFC Tap Demo
            </Button>
          </div>

          {/* Interactive Visual Chain (NFC CARD -> TAP -> PROFILE -> CONNECT -> ANALYTICS) */}
          <div className="pt-8">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <CreditCard className="w-4 h-4" />
                <span>NFC CARD</span>
              </div>
              <span className="text-slate-500 font-bold">→</span>
              <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                <Smartphone className="w-4 h-4" />
                <span>📱 TAP</span>
              </div>
              <span className="text-slate-500 font-bold">→</span>
              <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Radio className="w-4 h-4" />
                <span>TAPIT PROFILE</span>
              </div>
              <span className="text-slate-500 font-bold">→</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Share2 className="w-4 h-4" />
                <span>🔗 CONNECT</span>
              </div>
              <span className="text-slate-500 font-bold">→</span>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <BarChart3 className="w-4 h-4" />
                <span>📊 ANALYTICS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Interactive Showcase Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: NFC Card Demo Presentation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Hardware NFC Tag
                </span>
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
                  NTAG216 Chip
                </span>
              </div>
              <NFCCardPreview
                card={cards[0]}
                profile={professionalProfile}
                onTapSimulate={() => openSimulator(cards[0])}
                interactive={true}
              />
              <p className="text-xs text-slate-400 text-center">
                Physical cards store a unique dynamic URL token — update your profile anytime without re-writing your card.
              </p>
            </div>
          </div>

          {/* Center/Right: Live Smartphone Mobile-First Profile Frame */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="text-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full inline-block">
                Mobile-First Visitor Experience
              </span>
            </div>
            <MobileFramePreview
              profile={professionalProfile}
              links={links}
            />
          </div>
        </div>
      </section>

      {/* 3-STEP SECTION: HOW IT WORKS */}
      <section className="py-20 bg-slate-950/80 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/50 border border-cyan-500/30 px-3 py-1 rounded-lg">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              How TapIt Works
            </h2>
            <p className="text-sm text-slate-400">
              Transform your physical interactions into lasting digital connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-cyan-500/40 transition">
              <div className="text-5xl font-black font-display text-slate-800 group-hover:text-cyan-500/20 transition mb-6">
                01
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display mb-2">Create</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Create your customized TapIt profile. Add your portfolio, LinkedIn, GitHub, contact details, resumes, and custom branded themes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition">
              <div className="text-5xl font-black font-display text-slate-800 group-hover:text-purple-500/20 transition mb-6">
                02
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-4">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white font-display mb-2">Tap</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect your NFC smart card or dynamic QR code to your profile. Tap against any NFC-enabled smartphone without needing an app.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition">
              <div className="text-5xl font-black font-display text-slate-800 group-hover:text-emerald-500/20 transition mb-6">
                03
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display mb-2">Connect & Analyze</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Visitors instantly save your contact (.vcf) or view your links. Monitor taps, CTR, location, and traffic trends in your live dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-950/50 border border-purple-500/30 px-3 py-1 rounded-lg">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Built for Modern Professionals & Teams
          </h2>
          <p className="text-sm text-slate-400">
            A comprehensive smart identity platform combining hardware, software, and deep telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#0d1322] border border-slate-800/90 rounded-2xl p-6 shadow-xl hover:border-cyan-500/30 transition group">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit mb-4 group-hover:scale-110 transition">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2">NFC Powered Sharing</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Share your profile instantly with a single tap. Compatible with iPhone and Android without requiring any app installation.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#0d1322] border border-slate-800/90 rounded-2xl p-6 shadow-xl hover:border-purple-500/30 transition group">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-4 group-hover:scale-110 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2">Custom Profiles & Themes</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Personalize colors, fonts, glassmorphism effects, custom button styles, and interactive animated cards to match your personal brand.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#0d1322] border border-slate-800/90 rounded-2xl p-6 shadow-xl hover:border-emerald-500/30 transition group">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-4 group-hover:scale-110 transition">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2">Smart Real-Time Analytics</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Understand views, taps, link clicks, devices, traffic sources, and peak engagement times with interactive charts.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#0d1322] border border-slate-800/90 rounded-2xl p-6 shadow-xl hover:border-amber-500/30 transition group">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mb-4 group-hover:scale-110 transition">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2">Dynamic QR Studio</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Generate customizable high-resolution QR codes in PNG and SVG with logos, frames, and printable sheets for events and tables.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#0d1322] border border-slate-800/90 rounded-2xl p-6 shadow-xl hover:border-sky-500/30 transition group">
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 w-fit mb-4 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2">Multiple Digital Profiles</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Separate your Professional, Personal, Creator, and Business identities under one unified account and switch seamlessly.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#0d1322] border border-slate-800/90 rounded-2xl p-6 shadow-xl hover:border-rose-500/30 transition group">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 w-fit mb-4 group-hover:scale-110 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2">Smart Card Management</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Activate, reassign, or instantly disable lost physical NFC cards to safeguard your contact details and identity in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950 border border-cyan-500/30 shadow-2xl overflow-hidden text-center space-y-6">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Ready to Upgrade How You Network?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join thousands of professionals, developers, and creators who share their digital presence with TapIt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="glow" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get Started for Free
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary" size="lg">
                Explore Demo Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
