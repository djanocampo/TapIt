import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Button } from '../ui/Button';
import { 
  Plus, 
  Radio, 
  Smartphone, 
  QrCode, 
  Menu, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  LayoutDashboard, 
  LogIn, 
  User,
  LogOut 
} from 'lucide-react';

import tapItLogo from '../../assets/tapit-logo.png';

import { BitsInfinityEmblem } from '../common/BitsBrandElements';

export const Navbar: React.FC = () => {
  const { currentRole, currentUser, isAuthenticated, logout } = useTapIt();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home', path: '/' },
    { label: 'Platform Features', href: '/features', path: '/features', isRoute: true },
    { label: 'How It Works', href: '/how-it-works', path: '/how-it-works', isRoute: true },
    { label: 'About Us', href: '#about', path: '/#about' },
  ];

  const handleNavClick = (href: string, isRoute?: boolean) => {
    setMobileMenuOpen(false);
    if (!isRoute && location.pathname === '/') {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#060c1c]/90 backdrop-blur-2xl border-b border-[#1b2d55]/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left Brand Logo & BITS Submark */}
          <Link to="/" className="flex items-center gap-3 group py-2">
            <img
              src={tapItLogo}
              alt="TapIt"
              className="h-10 sm:h-12 lg:h-[65px] w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div className="hidden lg:flex flex-col border-l border-[#1b2d55] pl-3 py-0.5">
              <span className="text-[10px] font-mono tracking-widest text-[#38BDF8] uppercase font-bold flex items-center gap-1.5">
                <BitsInfinityEmblem size={12} />
                <span>BITS Tap™ Core</span>
              </span>
              <span className="text-[9px] text-slate-400 font-medium">Boundless IT Solutions</span>
            </div>
          </Link>

          {/* Center Floating Glass Pill Menu */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0a142c]/90 border border-[#1b2d55] rounded-full px-3 py-1.5 backdrop-blur-xl shadow-xl shadow-black/40">
            {navLinks.map((link) => {
              if (link.isRoute) {
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="text-xs lg:text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200 text-slate-300 hover:text-white hover:bg-[#124294]/30"
                  >
                    {link.label}
                  </Link>
                );
              }
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      handleNavClick(link.href, false);
                    }
                  }}
                  className="text-xs lg:text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200 text-slate-300 hover:text-white hover:bg-[#124294]/30"
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action: Log In / Portal / Sign Out */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated && currentUser ? (
              <>
                {currentUser.role === 'admin' ? (
                  <Link to="/admin">
                    <Button variant="primary" size="sm" className="rounded-full px-4 font-bold" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                      Admin Suite
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <Button variant="glow" size="sm" className="rounded-full px-4 font-bold" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                      My Dashboard
                    </Button>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/[0.08] transition"
                >
                  Log In
                </Link>
                <Link to="/login">
                  <Button variant="glow" size="sm" className="rounded-full px-5 font-bold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full text-slate-300 hover:text-white bg-[#0a142c] border border-[#1b2d55] focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a142c] border-b border-[#1b2d55] px-4 pt-3 pb-6 space-y-3 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain touch-pan-y">
          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.isRoute) {
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-[#124294]/30 hover:text-white"
                  >
                    {link.label}
                  </Link>
                );
              }
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                    }
                    handleNavClick(link.href, false);
                  }}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-[#124294]/30 hover:text-white"
                >
                  {link.label}
                </a>
              );
            })}
          </div>
          <div className="pt-3 border-t border-[#1b2d55] flex flex-col gap-2">
            {isAuthenticated && currentUser ? (
              <>
                <Link to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="glow" className="w-full justify-center rounded-full">
                    Enter {currentUser.role === 'admin' ? 'Admin Suite' : 'Dashboard'}
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="w-full justify-center rounded-full text-rose-400 hover:text-rose-300"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-center rounded-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="glow" className="w-full justify-center rounded-full">
                    Create Your TapIt
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
