'use client';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import LandingSection from './LandingSection';

export default function CreatorHero() {
  return (
    <LandingSection className="pt-28 pb-14 sm:pt-32 sm:pb-20 bg-gradient-to-b from-[#0B0F14] to-[#0D1219]">
      <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-3.5 py-1 sm:px-4 sm:py-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          <span className="text-xs sm:text-sm text-primary font-medium">Currently onboarding selected creators</span>
        </motion.div>

        <motion.h1 
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-7xl font-extrabold max-w-4xl text-glow-primary leading-[1.15] tracking-tight"
        >
          Turn Your Talent Into a <span className="text-primary italic">Real Income Stream</span>
        </motion.h1>

        <motion.p
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed px-2 sm:px-0"
        >
          Join Creator Nest and build a powerful personal brand with a clear roadmap, expert guidance, and monetization systems.
        </motion.p>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 w-full sm:w-auto items-stretch sm:items-center"
        >
          <a href="#onboarding" className="w-full sm:w-auto group relative inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-background bg-primary hover:bg-primary/90 rounded-2xl sm:rounded-full transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] text-sm sm:text-base active:scale-[0.98]">
            <span>Start Your Creator Journey</span> <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#how-it-works" className="w-full sm:w-auto group inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-gray-300 border border-white/10 rounded-2xl sm:rounded-full hover:bg-white/5 transition-all text-sm sm:text-base active:scale-[0.98]">
            See How It Works
          </a>
        </motion.div>
      </div>
    </LandingSection>
  );
}
