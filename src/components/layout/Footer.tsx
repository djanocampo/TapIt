import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart, Zap, Shield, Sparkles } from 'lucide-react';
import tapItLogo from '../../assets/tapit-logo.png';

import { BitsInfinityEmblem } from '../common/BitsBrandElements';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#040814] border-t border-[#1b2d55] text-slate-400 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={tapItLogo} alt="TapIt" className="h-8 w-auto object-contain" />
              <div className="flex items-center gap-1.5 pl-2 border-l border-[#1b2d55]">
                <BitsInfinityEmblem size={16} />
                <span className="text-xs font-mono font-bold text-[#38BDF8] tracking-wider uppercase">BITS Tap™</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Stay Grounded, Be Boundless. TapIt smart NFC digital identity and hardware platform engineered for high-scale enterprise—zero per-user seat penalties, bank-grade audits, and sovereign bedrock data security.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#38BDF8] bg-[#124294]/30 border border-[#1B55C6]/50 px-3 py-1.5 rounded-lg w-fit">
                <Zap className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Tap. Connect. Analyze.</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-[#0a142c] border border-[#1b2d55] px-2.5 py-1.5 rounded-lg">
                NPC DPA & BSP Circulars Aligned
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/features" className="hover:text-[#38BDF8] transition">Platform Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#38BDF8] transition">How It Works</Link></li>
              <li><Link to="/qr-share" className="hover:text-[#38BDF8] transition">Dynamic QR Studio</Link></li>
              <li><Link to="/t/NEW_TAP_77" className="hover:text-[#38BDF8] transition">NFC Card Claim</Link></li>
              <li><Link to="/@djan" className="hover:text-[#38BDF8] transition">Live Demo Profile</Link></li>
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Portals & Fleet</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/dashboard" className="hover:text-[#38BDF8] transition">User Dashboard</Link></li>
              <li><Link to="/dashboard/profiles" className="hover:text-[#38BDF8] transition">Persona Manager</Link></li>
              <li><Link to="/dashboard/cards" className="hover:text-[#38BDF8] transition">NFC Smart Cards</Link></li>
              <li><Link to="/dashboard/analytics" className="hover:text-[#38BDF8] transition">Deep Telemetry</Link></li>
              <li><Link to="/admin" className="hover:text-[#38BDF8] transition flex items-center gap-1"><Shield className="w-3 h-3 text-[#38BDF8]" /> Admin Suite</Link></li>
            </ul>
          </div>

          {/* Tech & Info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Hardware & Standards</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-slate-400">NFC NTAG215 / NTAG216</li>
              <li className="text-slate-400">vCard 3.0 Standard</li>
              <li className="text-slate-400">Deterministic Token Routing</li>
              <li className="text-slate-400">Zero Monthly Per-User Fees</li>
              <li className="text-slate-400">ISO/IEC 14443-A Compliant</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#1b2d55] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TapIt Platform • Boundless IT Solutions (BITS 2026 Edition).</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 flex items-center gap-1">
              Built for <strong className="text-slate-200">Djan Ocampo</strong>
            </span>
            <span>•</span>
            <span className="text-[#38BDF8] flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping inline-block"></span>
              All Telemetry Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
