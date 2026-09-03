'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, LogIn } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navLinks = [
    { name: t('nav_home', 'Home'), href: '/' },
    { name: t('nav_roster', 'Roster'), href: '/creators/roster' },
    { name: t('nav_marketplace', 'Market Place'), href: '/marketplace' },
    { name: t('nav_about', 'About Us'), href: '/about' },
    { name: t('nav_contact', 'Contact Us'), href: '/contact' },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setIsLoginOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed w-full z-50 bg-background/85 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22">

          {/* Logo */}
          <div className="flex-shrink-0 focus-within:ring-2 focus-within:ring-primary rounded-xl">
            <Link href="/" className="outline-none block p-1">
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
                  className={`transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none px-5 py-2.5 rounded-full font-semibold text-base lg:text-[17px] tracking-wide ${
                    isActive
                      ? 'bg-primary/20 text-primary font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] border border-primary/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Menu */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* Language Switcher */}
            <LanguageSwitcher />

            {user ? (
              /* Logged-in user avatar + dropdown */
              <div ref={userDropdownRef} className="relative" onMouseEnter={() => setIsUserOpen(true)} onMouseLeave={() => setIsUserOpen(false)}>
                <button onClick={() => setIsUserOpen(!isUserOpen)} className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-white/8 transition-colors border border-white/10 cursor-pointer">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #00F2FE, #0070F3)', color: '#0B0F14' }}>
                      {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-white text-base font-semibold leading-none">{user.full_name?.split(' ')[0]}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{user.plan_tier ?? 'free'} plan</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-3 w-56 bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors border-b border-white/5">
                        <User className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-white text-base font-medium">My Profile</p>
                          <p className="text-xs text-gray-400">Tools, courses & plan</p>
                        </div>
                      </Link>
                      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400 cursor-pointer">
                        <X className="w-4 h-4" />
                        <p className="text-base font-medium">{t('nav_logout', 'Sign Out')}</p>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Direct Login Button */
              <Link
                href="/login"
                className="flex items-center space-x-2 transition-all px-6 py-2.5 rounded-full font-bold text-base text-white bg-white/5 hover:bg-primary hover:text-background border border-white/15 hover:border-primary shadow-[0_0_20px_rgba(0,242,254,0.15)] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav_login', 'Login')}</span>
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="-mr-2 flex md:hidden items-center gap-2">
            <LanguageSwitcher compact />
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-surface/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-4 pb-6"
        >
          <div className="space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && !link.href.startsWith('/#') && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3.5 rounded-2xl text-lg transition-colors ${
                    isActive ? 'bg-primary/20 text-primary font-bold border border-primary/30' : 'text-gray-200 font-medium hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-white/10 mt-3 space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-gray-400 font-semibold">Language / भाषा:</span>
                <LanguageSwitcher />
              </div>

              <Link 
                href="/login" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-center space-x-2 w-full py-3.5 rounded-2xl text-base font-bold bg-primary text-background hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
              >
                <LogIn className="w-5 h-5" />
                <span>{t('nav_login', 'Login to Creator Nest')}</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
