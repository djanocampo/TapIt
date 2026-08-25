import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { 
  Radio, 
  Layers, 
  BarChart3, 
  QrCode, 
  CreditCard, 
  ShieldCheck, 
  Download, 
  Zap, 
  Smartphone, 
  ArrowRight,
  Sparkles,
  Lock,
  Cpu,
  Globe,
  Share2
} from 'lucide-react';
import { useTapIt } from '../../store';

export const FeaturesPage: React.FC = () => {
  const { openSimulator } = useTapIt();

  const featureBlocks = [
    {
      title: 'High-Performance NFC Architecture',
      badge: 'Hardware & Token Interceptor',
      description: 'TapIt uses high-speed ISO/IEC 14443 Type A NFC chips (NTAG215/216) that communicate via a lightweight token resolution server. Never rewrite your card—all link and theme changes are dynamic in the cloud.',
      icon: Cpu,
      color: 'cyan',
    },
    {
      title: 'Multi-Profile Architecture',
      badge: 'Unified Identity Management',
      description: 'Switch between Professional, Personal, Creator, and Startup business profiles in one click. Link specific NFC cards or QR codes to specific profiles for focused networking at different events.',
      icon: Layers,
      color: 'purple',
    },
    {
      title: 'One-Tap vCard 3.0 Contact Download',
      badge: 'Native Mobile Address Book Integration',
      description: 'Visitors can save your full name, phone number, work email, portfolio website, company position, and bio directly to their iOS Contacts or Google Contacts with zero manual typing.',
      icon: Download,
      color: 'emerald',
    },
    {
      title: 'Real-Time Telemetry & Event Logging',
      badge: 'Privacy-Compliant Analytics',
      description: 'Track granular events (profile_view, nfc_tap, qr_scan, link_click, contact_save). Visualize traffic sources, peak hours, most clicked links, and compare individual NFC cards performance.',
      icon: BarChart3,
      color: 'amber',
    },
    {
      title: 'Instant Lost Card Kill-Switch',
      badge: 'Enterprise Security Guard',
      description: 'Misplaced your physical NFC card or keyfob? Deactivate it in 1 second from your dashboard. Anyone tapping the disabled card will see a secure notice with zero personal information exposed.',
      icon: ShieldCheck,
      color: 'rose',
    },
    {
      title: 'Customizable Dynamic QR Engine',
      badge: 'Vector SVG & Printable Formats',
      description: 'Generate branded QR codes styled with your custom brand color, logo emblems, and high-DPI export formats ready for business cards, brochures, or event exhibition stands.',
      icon: QrCode,
      color: 'sky',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Everything Built For Seamless Connection</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
            Designed to Revolutionize Digital Networking
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Explore the comprehensive feature suite powering the TapIt NFC Smart Identity Platform.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <div
                key={block.title}
                className="bg-[#0d1322] border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col justify-between hover:border-slate-700 transition space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-full">
                      {block.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-display mb-2">{block.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{block.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Simulation Banner */}
        <div className="bg-gradient-to-r from-[#0a1226] via-[#121b38] to-[#0a1226] border border-cyan-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-glow-cyan">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Want to test an NFC card tap right now?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Use our built-in NFC simulator to test card token resolutions, unclaimed chip claiming, and live telemetry logging without needing physical hardware.
          </p>
          <Button
            variant="glow"
            size="lg"
            onClick={() => openSimulator()}
            leftIcon={<Radio className="w-4 h-4" />}
          >
            Launch Interactive NFC Simulator
          </Button>
        </div>
      </div>
    </div>
  );
};
