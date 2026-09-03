'use client';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, TrendingUp, Users, Smartphone, Database, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const cases = [
  {
    tag: "Education & Upskilling",
    title: "2,800+ Course Enrollments & ₹65L GMV",
    brand: "National EdTech Academy",
    desc: "Partnered with 3 leading educators and domain mentors for cohort launch tutorials, case study breakdowns, and live AMA sessions.",
    metrics: [
      { label: "Paid Enrollments", val: "2,840+" },
      { label: "Gross GMV", val: "₹65,00,000+" },
      { label: "Completion Rate", val: "88%" }
    ],
    highlight: "Highest converting creator campaign in Q3"
  },
  {
    tag: "Tech & Software Apps",
    title: "450K+ App Installs & 38% Day-30 Retention",
    brand: "NextGen Productivity & AI App",
    desc: "Coordinated synchronized reviews across top tech creators and productivity builders with deep-dive walkthroughs and pinned download links.",
    metrics: [
      { label: "Direct Installs", val: "450,000+" },
      { label: "Day-30 Retention", val: "38.4%" },
      { label: "Total Reach", val: "6.2M" }
    ],
    highlight: "#1 Trending in Productivity (India App Store)"
  },
  {
    tag: "Entertainment & D2C Lifestyle",
    title: "12M+ Organic Views & 4.8x Campaign ROAS",
    brand: "D2C Lifestyle & Audio Brand",
    desc: "Launched a multi-creator storytelling & humor integration series across YouTube Shorts and Instagram Reels with trackable discount codes.",
    metrics: [
      { label: "Campaign Views", val: "12.4M+" },
      { label: "ROAS Delivered", val: "4.8x" },
      { label: "Orders Generated", val: "18,200+" }
    ],
    highlight: "Slashed Meta Ad CAC by 44%"
  }
];

export default function CaseStudies() {
  return (
    <section id="case-studies" className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-14 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 w-fit">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Data-Backed Proof</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Real Campaigns. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300">Measurable Brand ROI.</span>
            </h2>
            <p className="text-gray-400 max-w-xl text-sm sm:text-base leading-relaxed">
              No vanity metrics. See how our creator partnerships drive student enrollments, app installs, product sales, and brand authority across multiple industries.
            </p>
          </motion.div>

          <Link
            href="/brands"
            className="inline-flex items-center space-x-2 text-primary hover:text-white font-bold text-sm sm:text-base transition-colors group"
          >
            <span>Explore All Brand Services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Case Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {cases.map((c, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: idx * 0.15 }}
              className="p-5 sm:p-8 rounded-3xl bg-surface/50 border border-white/10 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 shadow-xl relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div>
                <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-3 sm:mb-4">
                  {c.tag}
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-tight">
                  {c.title}
                </h3>
                
                <p className="text-primary font-semibold text-xs mb-3 sm:mb-4">
                  Brand: {c.brand}
                </p>

                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6">
                  {c.desc}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2 py-3 sm:py-4 border-y border-white/5 mb-5 sm:mb-6">
                  {c.metrics.map((m, mi) => (
                    <div key={mi} className="text-center px-0.5">
                      <p className="text-white font-black text-sm sm:text-base md:text-lg tracking-tight truncate">{m.val}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium leading-tight mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Key Highlight */}
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold pt-1 sm:pt-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{c.highlight}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
