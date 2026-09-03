'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export default function LanguageSwitcher({ compact = false, className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-[#0D1520] border border-white/20 backdrop-blur-md shadow-lg relative select-none ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <div className="flex items-center text-xs font-black text-cyan-400 pl-2 pr-1 gap-1">
        <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
      </div>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`relative z-10 px-3 py-1 text-xs font-black rounded-full transition-all duration-200 cursor-pointer ${
          language === 'en'
            ? 'text-white'
            : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
        }`}
      >
        {language === 'en' && (
          <motion.div
            layoutId="lang-pill"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_12px_rgba(0,242,254,0.45)] border border-cyan-300/40"
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          />
        )}
        <span className="relative z-10 tracking-wide font-sans">{compact ? 'EN' : 'English'}</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`relative z-10 px-3 py-1 text-xs font-black rounded-full transition-all duration-200 cursor-pointer ${
          language === 'hi'
            ? 'text-white'
            : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
        }`}
      >
        {language === 'hi' && (
          <motion.div
            layoutId="lang-pill"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_12px_rgba(16,185,129,0.45)] border border-emerald-300/40"
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          />
        )}
        <span className="relative z-10 tracking-wide font-sans">{compact ? 'HI' : 'हिंदी'}</span>
      </button>
    </div>
  );
}
