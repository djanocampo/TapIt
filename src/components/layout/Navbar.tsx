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

export const Navbar: React.FC = () => {
  const { currentRole, currentUser, isAuthenticated, logout } = useTapIt();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home', path: '/' },
    { label: 'About Us', href: '#about', path: '/#about' },
    { label: 'Pricing', href: '#pricing', path: '/#pricing' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
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
    <header className="sticky top-0 z-50 bg-[#040c1a]/85 backdrop-blur-2xl border-b border-white/[0.06] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-20">
          {/* Left Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group py-2">
            <img
              src={tapItLogo}
              alt="TapIt"
              className="h-11 sm:h-12 lg:h-[75px] w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </Link>

          {/* Center Floating Glass Pill Menu */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0b162c]/70 border border-white/10 rounded-full px-2 py-1.5 backdrop-blur-xl shadow-2xl">
            {navLinks.map((link) => {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }
                  }}
                  className="text-xs lg:text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/[0.06]"
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
                  className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition"
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
                  <Button variant="glow" size="sm" className="rounded-full px-4 font-bold">
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
              className="p-2.5 rounded-full text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070e1c] border-b border-slate-800/80 px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                    }
                    handleNavClick(link.href);
                  }}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/80"
                >
                  {link.label}
                </a>
              );
            })}
          </div>
          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
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
