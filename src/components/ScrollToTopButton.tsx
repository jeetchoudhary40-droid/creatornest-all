'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { isHindi } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 280px
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed bottom-24 right-5 sm:bottom-24 sm:right-5 z-40 select-none group"
        >
          <button
            type="button"
            onClick={scrollToTop}
            aria-label={isHindi ? 'पेज के शीर्ष पर जाएं' : 'Scroll to top'}
            className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#0B0F17]/95 backdrop-blur-xl border border-cyan-400/40 text-cyan-400 hover:text-white hover:bg-gradient-to-tr hover:from-cyan-500 hover:to-blue-600 hover:border-cyan-300 shadow-[0_8px_25px_rgba(0,0,0,0.6),0_0_15px_rgba(0,242,254,0.25)] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
          >
            <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 duration-200 stroke-[2.5]" />
          </button>

          {/* Tooltip on hover */}
          <span className="pointer-events-none absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#0B0F17]/95 border border-white/10 text-[11px] font-bold text-gray-200 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap hidden sm:block">
            {isHindi ? 'शीर्ष पर जाएं' : 'Back to top'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
