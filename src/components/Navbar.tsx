'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ChevronDown, User, LogIn, 
  Home, Users, ShoppingBag, Info, Mail, Calculator, 
  Crown, LogOut, ArrowRight, Sparkles 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t, isHindi } = useLanguage();

  const navLinks: { name: string; href: string; icon: any; badge?: string }[] = [
    { name: t('nav_home', 'Home'), href: '/', icon: Home },
    { name: t('nav_roster', 'Roster'), href: '/creators/roster', icon: Users },
    { name: t('nav_marketplace', 'Market Place'), href: '/marketplace', icon: ShoppingBag },
    { name: t('nav_about', 'About Us'), href: '/about', icon: Info },
    { name: t('nav_contact', 'Contact Us'), href: '/contact', icon: Mail },
  ];

  // Scroll to top smoothly when clicking current active page link or logo
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isCurrentPage =
      pathname === href ||
      (href !== '/' && !href.startsWith('/#') && (pathname === href || pathname.startsWith(href)));

    if (isCurrentPage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
  };

  // Close mobile menu and reset scroll to top on route change
  useEffect(() => {
    setIsOpen(false);
    setIsUserOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsUserOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              onClick={(e) => handleNavClick(e, '/')}
              className="outline-none block p-1 focus-visible:ring-2 focus-visible:ring-primary rounded-xl cursor-pointer"
            >
              <Logo />
            </Link>
          </div>

          {/* Desktop Nav Links Pill Container */}
          <div className="hidden md:flex items-center p-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-inner space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && !link.href.startsWith('/#') && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none px-4 lg:px-5 py-2 rounded-full font-semibold text-sm lg:text-[16px] tracking-wide relative flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-primary/20 text-primary font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] border border-primary/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-400/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher layoutIdPrefix="nav-desktop" />

            {user ? (
              /* Logged-in user avatar + dropdown */
              <div ref={userDropdownRef} className="relative" onMouseEnter={() => setIsUserOpen(true)} onMouseLeave={() => setIsUserOpen(false)}>
                <button 
                  onClick={() => setIsUserOpen(!isUserOpen)} 
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full hover:bg-white/8 transition-colors border border-white/10 cursor-pointer"
                  aria-expanded={isUserOpen}
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #00F2FE, #0070F3)', color: '#0B0F14' }}>
                      {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-white text-sm font-semibold leading-none">{user.full_name?.split(' ')[0]}</p>
                    <p className="text-[11px] text-cyan-400 capitalize mt-0.5">{user.plan_tier ?? 'free'} plan</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isUserOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-[#0E1522] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors border-b border-white/5">
                        <User className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-white text-sm font-medium">My Profile</p>
                          <p className="text-xs text-gray-400">Tools, courses & plan</p>
                        </div>
                      </Link>
                      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400 cursor-pointer">
                        <LogOut className="w-4 h-4" />
                        <p className="text-sm font-medium">{t('nav_logout', 'Sign Out')}</p>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Direct Login Button */
              <Link
                href="/login"
                className="flex items-center space-x-2 transition-all px-5 py-2 rounded-full font-bold text-sm text-white bg-white/5 hover:bg-primary hover:text-background border border-white/15 hover:border-primary shadow-[0_0_20px_rgba(0,242,254,0.15)] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav_login', 'Login')}</span>
              </Link>
            )}
          </div>

          {/* Mobile Right Controls: Language + Hamburger Menu */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0 z-20">
            {/* Compact Language Switcher */}
            <LanguageSwitcher compact layoutIdPrefix="nav-mobile-top" />

            {/* Prominent, Never-Hidden Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] active:scale-95 text-gray-200 hover:text-white border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shrink-0 transition-all shadow-sm"
              aria-label={isOpen ? "Close main menu" : "Open main menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-5 w-5 text-cyan-400" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-20 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-20 left-0 right-0 max-h-[calc(100dvh-5rem)] overflow-y-auto bg-[#0A0F18] border-b border-white/15 px-4 pt-3 pb-8 z-50 md:hidden shadow-2xl flex flex-col space-y-4 divide-y divide-white/10"
            >
              {/* Primary Navigation Links */}
              <div className="space-y-1.5 pt-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && !link.href.startsWith('/#') && pathname.startsWith(link.href));
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 font-bold border border-cyan-500/30 shadow-md' 
                          : 'text-slate-200 font-medium hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/5 text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{link.name}</span>
                      </div>
                      {link.badge ? (
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                          {link.badge}
                        </span>
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Extra Tools & Quick Links */}
              <div className="pt-3 space-y-1.5">
                <div className="px-2 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {isHindi ? 'त्वरित लिंक एवं टूल' : 'Creator Features'}
                </div>
                <Link
                  href="/marketplace?tab=tools"
                  onClick={(e) => handleNavClick(e, '/marketplace?tab=tools')}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    {isHindi ? 'ब्रांड डील कैलकुलेटर व टूल्स' : 'Brand Deal Calculator & Tools'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <Link
                  href="/pricing"
                  onClick={(e) => handleNavClick(e, '/pricing')}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    {isHindi ? 'प्लान्स व प्राइसिंग' : 'Plans & Pricing'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>

              {/* User Account / Login State */}
              <div className="pt-4 space-y-3">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover border border-cyan-400/40" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black" style={{ background: 'linear-gradient(135deg, #00F2FE, #0070F3)', color: '#0B0F14' }}>
                            {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-bold leading-tight">{user.full_name}</p>
                          <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                            {user.plan_tier ?? 'free'} Plan
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors border border-cyan-500/40"
                      >
                        {isHindi ? 'प्रोफाइल' : 'Profile'}
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition-colors border border-white/10"
                      >
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isHindi ? 'मेरा प्रोफाइल' : 'My Profile'}</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          logout();
                        }}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 transition-colors border border-red-500/20 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('nav_logout', 'Sign Out')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      href="/login" 
                      onClick={() => setIsOpen(false)} 
                      className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl text-sm font-bold bg-primary text-background hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{t('nav_login', 'Login to Creator Nest')}</span>
                    </Link>

                    <Link
                      href="/join"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isHindi ? 'क्रिएटर रोस्टर ज्वाइन करें' : 'Join Creator Roster (Free)'}</span>
                    </Link>
                  </div>
                )}

                {/* Language Switcher in Drawer */}
                <div className="pt-3 flex items-center justify-between px-2 bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
                  <span className="text-xs text-slate-300 font-bold">{isHindi ? 'भाषा चुनें:' : 'Language:'}</span>
                  <LanguageSwitcher layoutIdPrefix="nav-mobile-drawer" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
