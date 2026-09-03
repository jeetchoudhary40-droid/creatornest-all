'use client';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingDown, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Terminal, 
  Smartphone, 
  Database 
} from 'lucide-react';
import Link from 'next/link';

export default function BrandPitchSection() {
  const pillars = [
    {
      icon: Target,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      title: 'Vetted High-Trust Audiences',
      desc: 'Connect with deeply engaged communities across Education, Tech, Entertainment, Finance, Lifestyle, and Gaming with authentic influencer integrations.',
    },
    {
      icon: Smartphone,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      border: 'border-cyan-400/20',
      title: 'Creative Storytelling & Viral Formats',
      desc: 'Custom-crafted YouTube integrations, high-retention Reels, podcasts, and dedicated reviews with industry-leading watch time (80%+ AVD).',
    },
    {
      icon: TrendingDown,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
      title: 'Performance-Driven ROI & Lower CAC',
      desc: 'Slash customer acquisition costs by 35–50% compared to saturated ads through genuine creator endorsements and measurable conversion funnels.',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[#070B11] border-t border-white/5">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              For Brands, Agencies & Modern Companies
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.2]">
            Reach High-Intent Audiences. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-white">
              Scale Your Brand With Top Creators.
            </span>
          </h2>

          <p className="text-gray-400 text-sm sm:text-lg mt-3 sm:mt-4 leading-relaxed">
            Stop burning budget on generic ad clicks. Partner with India&apos;s most trusted creators across Education, Tech, Entertainment, Finance, and Lifestyle for authentic, high-converting collaborations.
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-12">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 sm:p-8 rounded-3xl bg-surface/50 border border-white/10 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${p.bg} border ${p.border} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform`}>
                  <p.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${p.color}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{p.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* B2B Proof Bar & Action */}
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-primary/10 via-surface/80 to-cyan-950/20 border border-primary/20 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <h4 className="text-lg sm:text-2xl font-extrabold text-white">
              Ready to launch a high-converting creator campaign?
            </h4>
            <p className="text-gray-400 text-xs sm:text-sm">
              Get matched with targeted creators across all categories and receive custom rate cards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <Link
              href="/brands"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-background font-extrabold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>Explore Brand Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all text-center active:scale-[0.98]"
            >
              Book Strategy Call
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
