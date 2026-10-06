import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { 
  Radio, 
  Smartphone, 
  CreditCard, 
  Share2, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Layers,
  Download
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {

  const steps = [
    {
      num: '01',
      title: 'Create Your Profiles & Add Links',
      subtitle: 'Build your digital identities in seconds',
      description: 'Set up your display name, headline, bio, contact phone, email, and social networks. Add rich links to your portfolio, GitHub repositories, resumes, and custom destinations. Choose from our curated modern dark and light theme presets with live previews.',
      tags: ['Multi-Profile', 'Theme Engine', 'Drag & Drop Links'],
      icon: Layers,
    },
    {
      num: '02',
      title: 'Link Your NFC Card or Generate QR Codes',
      subtitle: 'Hardware integration made effortless',
      description: 'Acquire a TapIt physical NFC card or keyfob. Tap the card against your phone to activate it with our 1-click Claim Wizard. You can assign any card to your Professional profile today, and switch it to your Creator profile tomorrow without rewriting the physical chip.',
      tags: ['NTAG216 Chip', 'Dynamic Token URLs', 'Zero App Required'],
      icon: Radio,
    },
    {
      num: '03',
      title: 'Tap to Share & Save Contacts Instantly',
      subtitle: 'Seamless mobile-first visitor experience',
      description: 'When you meet someone, simply tap your TapIt card to the top of an iPhone or back of an Android device. Your beautiful, mobile-optimized profile appears instantly in their browser with a 1-tap "Save Contact (.vcf)" button.',
      tags: ['Native vCard 3.0', 'No App Needed', 'iOS & Android Ready'],
      icon: Smartphone,
    },
    {
      num: '04',
      title: 'Analyze Engagement & Conversion',
      subtitle: 'Data-driven networking insights',
      description: 'Log into your TapIt dashboard to see exactly how many people tapped your card, which links they clicked, what devices and browsers they used, and compare the performance of multiple cards over daily, weekly, and monthly timelines.',
      tags: ['Traffic Telemetry', 'Link Click Ranking', 'NFC Hardware Analytics'],
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#060c1c] text-slate-100 py-12 sm:py-16 relative">
      <div className="absolute inset-0 bits-hero-mesh pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#124294]/30 border border-[#38BDF8]/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#38BDF8] font-mono">
            <Zap className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>UNBROKEN OPERATIONAL CYCLES • ARCHITECTURE</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
            How TapIt Technology Works
          </h1>
          <p className="text-base sm:text-lg text-slate-300">
            Learn how TapIt bridges physical NFC hardware with high-availability dynamic digital identities.
          </p>
        </div>

        {/* Technical Architecture Diagram Banner */}
        <div className="bits-glass rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] text-center mb-6 font-mono">
            Deterministic NFC Token Resolution Lifecycle
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#081329] border border-[#1b2d55] w-full md:w-48 shadow-md">
              <CreditCard className="w-6 h-6 text-[#38BDF8] mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white">1. Physical Card</h4>
              <p className="text-[10px] text-[#38BDF8] font-mono mt-1">tapit.app/t/8xK29mQ</p>
            </div>
            <span className="text-[#38BDF8] font-bold hidden md:inline">→</span>
            <div className="p-4 rounded-2xl bg-[#081329] border border-[#1b2d55] w-full md:w-48 shadow-md">
              <Zap className="w-6 h-6 text-[#2563EB] mx-auto mb-2 animate-pulse" />
              <h4 className="text-xs font-bold text-white">2. Token Router</h4>
              <p className="text-[10px] text-slate-300 mt-1">&lt;300ms Validation</p>
            </div>
            <span className="text-[#38BDF8] font-bold hidden md:inline">→</span>
            <div className="p-4 rounded-2xl bg-[#081329] border border-[#1b2d55] w-full md:w-48 shadow-md">
              <Smartphone className="w-6 h-6 text-[#38BDF8] mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white">3. Public Profile</h4>
              <p className="text-[10px] text-slate-300 mt-1">Live Persona Render</p>
            </div>
            <span className="text-[#38BDF8] font-bold hidden md:inline">→</span>
            <div className="p-4 rounded-2xl bg-[#081329] border border-[#1b2d55] w-full md:w-48 shadow-md">
              <BarChart3 className="w-6 h-6 text-[#F59E0B] mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white">4. Telemetry Stream</h4>
              <p className="text-[10px] text-slate-300 mt-1">Event Bus Audit</p>
            </div>
          </div>
        </div>

        {/* Detailed 4 Steps */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bits-glass rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start gap-6 hover:border-[#38BDF8]/40 transition group"
              >
                <div className="flex sm:flex-col items-center gap-3 shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#124294]/40 text-[#38BDF8] border border-[#38BDF8]/30 flex items-center justify-center font-display font-black text-xl shadow-glow-cyan/30">
                    {step.num}
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#081329] border border-[#1b2d55] text-[#38BDF8] hidden sm:flex group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <div>
                    <span className="text-xs font-semibold text-[#38BDF8] font-mono">{step.subtitle}</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{step.description}</p>
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold bg-[#081329] border border-[#1b2d55] text-slate-200 px-2.5 py-1 rounded-lg"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-4 pt-8">
          <Link to="/register">
            <Button
              variant="glow"
              size="lg"
              className="rounded-full px-8 font-extrabold"
              leftIcon={<Smartphone className="w-4 h-4" />}
            >
              Get Your TapIt Smart Card Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
