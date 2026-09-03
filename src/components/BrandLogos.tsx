'use client';
import { motion } from 'framer-motion';

const brands = [
  { name: 'Unacademy', category: 'Education & EdTech' },
  { name: 'Notion', category: 'Productivity & Work' },
  { name: 'Spotify', category: 'Audio & Entertainment' },
  { name: 'Zerodha', category: 'FinTech & Investing' },
  { name: 'boAt', category: 'Audio & Lifestyle' },
  { name: 'Canva', category: 'Creative & Design' },
  { name: 'Swiggy', category: 'Consumer & Food' },
  { name: 'AWS', category: 'Cloud Infrastructure' },
  { name: 'Myntra', category: 'Fashion & E-Commerce' },
  { name: 'Zomato', category: 'D2C & Consumer' },
  { name: 'Stripe', category: 'Payments & Business' },
  { name: 'PhysicsWallah', category: 'Education & Test Prep' },
];

export default function BrandLogos() {
  return (
    <section className="py-12 border-y border-white/5 bg-surface/30 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-500 font-bold">
          Trusted by Top Brands Across Education, Tech, D2C, Entertainment & FinTech
        </p>
      </div>

      {/* Infinite scrolling marquee */}
      <div className="relative w-full overflow-hidden flex items-center">
        {/* Gradient Edge Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
          className="flex space-x-6 sm:space-x-8 whitespace-nowrap min-w-max py-2"
        >
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-primary/80 animate-pulse" />
              <div className="text-left">
                <span className="text-white font-extrabold text-sm sm:text-base tracking-tight">
                  {brand.name}
                </span>
                <span className="block text-[10px] text-gray-500 font-medium">
                  {brand.category}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
