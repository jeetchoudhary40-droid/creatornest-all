'use client';
import { motion } from 'framer-motion';
import { Search, Compass, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const previewTools = [
  {
    icon: Search,
    title: 'Social Media Audit',
    tier: 'FREE',
    desc: 'Analyze any channel for engagement, growth rate & niche clarity.',
  },
  {
    icon: Compass,
    title: 'Niche Finder Quiz',
    tier: 'FREE',
    desc: 'Discover your most monetizable niche in 6 questions.',
  },
  {
    icon: DollarSign,
    title: 'Brand Deal Calculator',
    tier: 'FREE',
    desc: 'Know your exact market rate for every platform & format.',
  },
];

export default function ToolkitPreview() {
  return (
    <section className="py-24 bg-[#05070A] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4"
        >
          <div>
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">Creator Intelligence Suite</p>
            <h2 className="text-3xl md:text-5xl font-bold">
              The Creator Nest <span className="text-primary italic">Toolkit</span>
            </h2>
            <p className="text-gray-400 mt-3 max-w-lg">
              Free and pro tools to audit, plan, and optimize — no guesswork, no agencies needed.
            </p>
          </div>
          <Link
            href="/tools"
            className="flex items-center space-x-2 text-primary font-bold hover:text-white transition-colors group whitespace-nowrap"
          >
            <span>Explore All 6 Tools</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* 3 Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="bg-surface border border-white/5 hover:border-primary/20 rounded-3xl p-8 group transition-all"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors relative">
                  <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon className="w-7 h-7 text-primary relative z-10" />
                </div>
                <span className="inline-flex items-center bg-primary/10 border border-primary/20 rounded-full px-3 py-0.5 text-xs text-primary font-bold mb-4">
                  {tool.tier}
                </span>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{tool.desc}</p>
                <div className="mt-6 flex items-center text-gray-500 text-xs font-semibold">
                  <span className="inline-flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-yellow-500/60 rounded-full" />
                    <span>Launching Soon</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
