'use client';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import LandingSection from './LandingSection';

export default function BrandHero() {
  return (
    <LandingSection className="pt-32 pb-20 bg-gradient-to-b from-[#0B0F14] to-[#140C08] relative">
      {/* Decorative grid mesh */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,81,47,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,81,47,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="flex flex-col items-center text-center space-y-8 relative z-10">
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center space-x-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5"
        >
          <TrendingUp className="w-4 h-4 text-secondary" />
          <span className="text-sm text-secondary font-medium">Performance-Driven Creator Marketing</span>
        </motion.div>

        <motion.h1 
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold max-w-4xl text-glow-secondary"
        >
          Scale Your Brand With <span className="text-secondary italic">High-Impact Creators</span>
        </motion.h1>

        <motion.p
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed"
        >
          Run performance-driven campaigns with curated creators, structured execution, and measurable results.
        </motion.p>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <a href="#brand-form" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-secondary/80 hover:bg-secondary rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,81,47,0.3)]">
            Start Your Campaign <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#case-studies" className="group inline-flex items-center justify-center px-8 py-4 font-bold text-gray-300 border border-white/10 rounded-full hover:bg-white/5 transition-all">
            View Case Studies
          </a>
        </motion.div>

        {/* Brand Social Proof Bar */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-8 mt-2 border-t border-white/5 w-full max-w-2xl flex flex-wrap justify-center gap-8"
        >
          {[
            { value: '50+', label: 'Campaigns Executed' },
            { value: '20+', label: 'Brand Partners' },
            { value: '₹5Cr+', label: 'In Brand Deals' },
            { value: '100+', label: 'Curated Creators' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-2xl font-bold text-secondary">{stat.value}</span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </LandingSection>
  );
}
