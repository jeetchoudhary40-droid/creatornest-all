'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Briefcase, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative pt-24 pb-8 lg:pt-28 lg:pb-10 overflow-hidden">
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[150px] -z-10 mix-blend-screen pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-surface/80 border border-primary/20 rounded-full px-4 py-1.5 w-fit">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm text-primary font-bold uppercase tracking-wider">
                India&apos;s All-Category Creator Growth Ecosystem
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-sans tracking-tight leading-[1.15] text-white">
              Fueling Creators <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-white">to Become Brands.</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-gray-300 max-w-xl leading-relaxed">
              We empower creators across Education, Tech, Entertainment, Lifestyle, Gaming, and Finance to scale their audience, secure high-value brand deals, launch digital products, and build sustainable media empires.
            </p>
            
            {/* Dual CTAs for Creators & Brands */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <Link 
                href="/join" 
                className="w-full sm:w-auto relative inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-background font-extrabold rounded-2xl px-6 sm:px-8 py-3.5 sm:py-4 transition-all duration-300 group shadow-[0_0_25px_rgba(0,242,254,0.35)] hover:shadow-[0_0_35px_rgba(0,242,254,0.55)] text-sm sm:text-base text-center cursor-pointer active:scale-[0.98]"
              >
                <span>Join Creator Roster</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                href="/brands" 
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-surface/80 hover:bg-white/10 text-white font-bold rounded-2xl px-6 sm:px-8 py-3.5 sm:py-4 border border-white/15 hover:border-primary/40 transition-all text-sm sm:text-base text-center cursor-pointer active:scale-[0.98]"
              >
                <Briefcase className="w-4 h-4 text-primary" />
                <span>For Brands & Agencies</span>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400 pt-1">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Roster: 100+ Top Creators</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Multi-Category Reach & High Retention</span>
              </span>
            </div>

          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative lg:h-[580px] w-full flex items-center justify-center pt-2 lg:pt-0 pb-6 lg:pb-0"
          >
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] md:max-w-[450px] lg:max-w-[550px] aspect-[4/5] lg:aspect-auto lg:h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl mx-auto bg-surface/40">
              {/* Floating Animated 3D "N" Logo Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: [0, -6, 0],
                  scale: 1
                }}
                transition={{
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.8, delay: 0.3 }
                }}
                className="absolute top-3 left-3 sm:top-6 sm:left-6 z-20 p-2 sm:p-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-primary/30 shadow-[0_0_25px_rgba(0,242,254,0.35)] flex items-center space-x-2.5 sm:space-x-3"
              >
                <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 drop-shadow-[0_0_10px_rgba(0,242,254,0.6)] border border-primary/30 bg-black">
                  <Image
                    src="/images/logo-icon.png"
                    alt="Creator Nest Logo"
                    width={44}
                    height={44}
                    priority
                    unoptimized
                    className="w-full h-full object-cover rounded-full transform scale-105"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-white font-extrabold text-xs sm:text-sm tracking-tight">Creator Nest</span>
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-ping" />
                  </div>
                  <p className="text-[9px] sm:text-xs text-gray-400 font-medium">India&apos;s #1 Creator Growth Network</p>
                </div>
              </motion.div>

              <Image 
                src="/images/hero.png" 
                alt="Creator Growth Studio Workspace" 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
              />
              {/* Overlay gradient for deeper look */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-75"></div>
              
              {/* Floating Stat Badge */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 p-3 sm:p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] sm:text-[11px] uppercase tracking-wider text-primary font-bold">Cross-Category Creator Reach</p>
                  <p className="text-white font-black text-base sm:text-xl">25M+ Monthly Views</p>
                </div>
                <div className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary font-bold text-[10px] sm:text-xs">
                  High ROI Campaigns
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

