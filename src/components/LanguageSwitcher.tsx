'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
  layoutIdPrefix?: string;
}

export default function LanguageSwitcher({ 
  compact = false, 
  className = '',
  layoutIdPrefix
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const reactId = React.useId();
  const pillId = `${layoutIdPrefix || reactId}-lang-pill`;

  return (
    <div
      className={`inline-flex items-center shrink-0 rounded-full bg-[#0D1520] border border-white/20 backdrop-blur-md shadow-md relative select-none ${
        compact ? 'p-0.5 gap-0.5' : 'p-1 gap-1'
      } ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <div className={`flex items-center text-cyan-400 shrink-0 ${compact ? 'pl-1.5 pr-0.5' : 'pl-2 pr-1'}`}>
        <Globe className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-cyan-400 animate-pulse`} />
      </div>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`relative z-10 font-black rounded-full transition-all duration-200 cursor-pointer ${
          compact ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
        } ${
          language === 'en'
            ? 'text-white'
            : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
        }`}
        aria-pressed={language === 'en'}
      >
        {language === 'en' && (
          <motion.div
            layoutId={pillId}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(0,242,254,0.4)] border border-cyan-300/40"
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          />
        )}
        <span className="relative z-10 tracking-wide font-sans">{compact ? 'EN' : 'English'}</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`relative z-10 font-black rounded-full transition-all duration-200 cursor-pointer ${
          compact ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
        } ${
          language === 'hi'
            ? 'text-white'
            : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
        }`}
        aria-pressed={language === 'hi'}
      >
        {language === 'hi' && (
          <motion.div
            layoutId={pillId}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_10px_rgba(16,185,129,0.4)] border border-emerald-300/40"
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          />
        )}
        <span className="relative z-10 tracking-wide font-sans">{compact ? 'HI' : 'हिंदी'}</span>
      </button>
    </div>
  );
}
