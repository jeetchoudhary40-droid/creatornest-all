'use client';
import { motion } from 'framer-motion';

export default function StatsBand() {
  return (
    <section className="border-y border-white/5 bg-surface/80 backdrop-blur-sm relative z-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
          {[
            { value: '25M+', label: 'Monthly Creator Views', sub: 'Cross-Category Reach' },
            { value: '₹5Cr+', label: 'Brand Deals Closed', sub: 'Verified Creator GMV' },
            { value: '100+', label: 'Top Multi-Niche Creators', sub: 'Managed & Vetted' },
            { value: '80%+', label: 'Avg. Retention', sub: 'High Watch Time' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center justify-center text-center px-3 pt-4 sm:pt-0"
            >
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-cyan-300 to-white mb-1.5">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
                {stat.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
