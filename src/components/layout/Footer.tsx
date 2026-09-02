import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart, Zap, Shield, Sparkles } from 'lucide-react';
import tapItLogo from '../../assets/tapit-logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05070e] border-t border-slate-800/80 text-slate-400 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={tapItLogo} alt="TapIt" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Smart NFC digital identity and dynamic link management platform. Seamlessly connect physical cards, QR codes, and profiles with live analytics telemetry.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1.5 rounded-lg w-fit">
              <Zap className="w-3.5 h-3.5" />
              <span>Tap. Connect. Analyze.</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/features" className="hover:text-cyan-400 transition">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-cyan-400 transition">How It Works</Link></li>
              <li><Link to="/qr-share" className="hover:text-cyan-400 transition">QR Sharing Studio</Link></li>
              <li><Link to="/t/NEW_TAP_77" className="hover:text-cyan-400 transition">NFC Card Claim</Link></li>
              <li><Link to="/@djan" className="hover:text-cyan-400 transition">Live Demo Profile</Link></li>
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition">User Dashboard</Link></li>
              <li><Link to="/dashboard/profiles" className="hover:text-cyan-400 transition">Profile Manager</Link></li>
              <li><Link to="/dashboard/cards" className="hover:text-cyan-400 transition">NFC Cards</Link></li>
              <li><Link to="/dashboard/analytics" className="hover:text-cyan-400 transition">Deep Analytics</Link></li>
              <li><Link to="/admin" className="hover:text-cyan-400 transition flex items-center gap-1"><Shield className="w-3 h-3" /> Admin Suite</Link></li>
            </ul>
          </div>

          {/* Tech & Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Ecosystem</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-slate-500">NFC NTAG215 / NTAG216</li>
              <li className="text-slate-500">vCard 3.0 Standard</li>
              <li className="text-slate-500">Dynamic QR Vector SVG</li>
              <li className="text-slate-500">Real-Time Event Bus</li>
              <li className="text-slate-500">ISO/IEC 14443-A Ready</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TapIt Platform. Designed for modern digital identity.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 flex items-center gap-1">
              Built for <strong className="text-slate-200">Djan Ocampo</strong>
            </span>
            <span>•</span>
            <span className="text-cyan-400 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block"></span>
              Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
