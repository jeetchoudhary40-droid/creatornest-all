'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export default function Logo({
  className = "",
  showText = true,
  size = 'md',
  animated = true,
}: LogoProps) {
  const sizeMap = {
    sm: { box: 'w-10 h-10 sm:w-11 sm:h-11', img: 44, text: 'text-xl sm:text-2xl', sub: 'text-[10px]' },
    md: { box: 'w-12 h-12 sm:w-14 sm:h-14', img: 60, text: 'text-2xl sm:text-3xl', sub: 'text-[11px] sm:text-[12px]' },
    lg: { box: 'w-16 h-16 sm:w-20 sm:h-20', img: 84, text: 'text-3xl sm:text-4xl', sub: 'text-xs sm:text-sm' },
    xl: { box: 'w-24 h-24 sm:w-28 sm:h-28', img: 120, text: 'text-4xl sm:text-5xl', sub: 'text-sm sm:text-base' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      {/* 3D Glowing Neon Animated Circular "N" Logo Icon */}
      <motion.div
        className={`relative ${currentSize.box} flex items-center justify-center shrink-0 select-none rounded-full`}
        whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {/* Ambient Cyan / Neon Glow Halo */}
        <div className="absolute inset-0 bg-primary/35 rounded-full blur-xl pointer-events-none" />
        <motion.div
          className="absolute -inset-1.5 bg-gradient-to-tr from-primary/50 via-cyan-400/40 to-transparent rounded-full blur-lg opacity-85 pointer-events-none"
          animate={animated ? {
            opacity: [0.6, 0.95, 0.6],
            scale: [0.96, 1.06, 0.96],
          } : undefined}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* 100% Pure Circular 3D "N" Logo Image Container */}
        <div className="relative w-full h-full rounded-full overflow-hidden z-10 drop-shadow-[0_0_16px_rgba(0,242,254,0.6)] border border-primary/30 flex items-center justify-center bg-black">
          <Image
            src="/images/logo-icon.png"
            alt="Creator Nest Logo"
            width={currentSize.img}
            height={currentSize.img}
            priority
            unoptimized
            className="w-full h-full object-cover rounded-full transform scale-105"
          />
        </div>
      </motion.div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${currentSize.text} font-black tracking-tight text-white`}>
            CREATOR <span className="text-primary drop-shadow-[0_0_14px_rgba(0,242,254,0.5)]">NEST</span>
          </span>
          <span className={`${currentSize.sub} uppercase tracking-[0.24em] text-gray-400 font-bold mt-1`}>
            Growth Ecosystem
          </span>
        </div>
      )}
    </div>
  );
}
