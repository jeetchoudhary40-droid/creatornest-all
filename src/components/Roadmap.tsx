'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SearchCode, 
  Compass, 
  Cpu, 
  Coins, 
  GraduationCap, 
  Rocket, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

const phases = [
  {
    id: 'phase1',
    phaseNumber: "01",
    phaseTitle: "Foundation & Positioning",
    phaseBadge: "Architecture",
    badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    activeTabBg: "bg-cyan-500/20 border-cyan-400/40 text-cyan-300",
    steps: [
      {
        icon: SearchCode,
        iconBg: "bg-cyan-500/10",
        iconBorder: "border-cyan-500/20",
        iconColor: "text-cyan-400",
        title: "Channel & Audience Audit",
        deliverables: ["RPM & Demographics Audit", "Retention Drop-off Analysis", "Content Gap & Trend Mapping"]
      },
      {
        icon: Compass,
        iconBg: "bg-cyan-500/10",
        iconBorder: "border-cyan-500/20",
        iconColor: "text-cyan-400",
        title: "Niche Thesis & Positioning",
        deliverables: ["Unique Angle / Moat Definition", "Multi-Platform Distribution Plan", "Quarterly Growth KPIs"]
      }
    ]
  },
  {
    id: 'phase2',
    phaseNumber: "02",
    phaseTitle: "Production & Sponsorships",
    phaseBadge: "Acceleration",
    badgeColor: "bg-primary/15 text-primary border-primary/30",
    activeTabBg: "bg-primary/20 border-primary/40 text-primary",
    steps: [
      {
        icon: Cpu,
        iconBg: "bg-primary/10",
        iconBorder: "border-primary/20",
        iconColor: "text-primary",
        title: "Production & Content Packaging",
        deliverables: ["Live Dynamic Media Kit", "High-CTR Thumbnail System", "Script Pacing & Hook Refinement"]
      },
      {
        icon: Coins,
        iconBg: "bg-primary/10",
        iconBorder: "border-primary/20",
        iconColor: "text-primary",
        title: "High-Ticket Brand Matchmaking",
        deliverables: ["Standardized Rate Card", "Inbound Deal Negotiation", "Guaranteed Brand Contracts"]
      }
    ]
  },
  {
    id: 'phase3',
    phaseNumber: "03",
    phaseTitle: "Scale & Digital Business",
    phaseBadge: "Scale & IP",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    activeTabBg: "bg-purple-500/20 border-purple-400/40 text-purple-300",
    steps: [
      {
        icon: GraduationCap,
        iconBg: "bg-purple-500/10",
        iconBorder: "border-purple-500/20",
        iconColor: "text-purple-400",
        title: "Digital Products & LMS Launch",
        deliverables: ["Course & Curriculum Funnel", "Member Portal & LMS Setup", "Direct Stripe/Razorpay Billing"]
      },
      {
        icon: Rocket,
        iconBg: "bg-purple-500/10",
        iconBorder: "border-purple-500/20",
        iconColor: "text-purple-400",
        title: "IP, Media Network & Brand Equity",
        deliverables: ["Co-founder & Equity Structuring", "Spin-out Podcasts/Shows & Merchandise", "Long-term Brand Valuation"]
      }
    ]
  }
];

export default function Roadmap() {
  const [activePhase, setActivePhase] = useState(0);
  const current = phases[activePhase];

  return (
    <section id="roadmap" className="py-14 bg-[#070B11] relative border-t border-white/5 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 mb-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Creator Growth Engine
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-[1.2] mb-2">
            From Solo Creator to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-white">
              Scalable Media Brand.
            </span>
          </h2>

          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            A systematic 3-phase roadmap to optimize production, maximize revenue, and launch owned digital businesses.
          </p>
        </motion.div>

        {/* Phase Tab Selector */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
          {phases.map((phase, idx) => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(idx)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer active:scale-[0.97] ${
                activePhase === idx
                  ? `${phase.activeTabBg} shadow-lg`
                  : 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <span className="text-lg sm:text-xl font-black opacity-50">{phase.phaseNumber}</span>
              <span className="hidden sm:inline">{phase.phaseTitle}</span>
              <span className="sm:hidden">{phase.phaseBadge}</span>
            </button>
          ))}
        </div>

        {/* Active Phase Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {/* Phase Header */}
            <div className="flex items-center gap-3 mb-5">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${current.badgeColor}`}>
                Phase {current.phaseNumber}: {current.phaseBadge}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {current.phaseTitle}
              </h3>
            </div>

            {/* Steps Grid — 2 columns on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {current.steps.map((step, sIdx) => {
                const Icon = step.icon;
                const stepNum = activePhase * 2 + sIdx + 1;
                return (
                  <div
                    key={sIdx}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-primary/25 transition-all duration-200 group"
                  >
                    {/* Step Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${step.iconBg} border ${step.iconBorder} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${step.iconColor}`} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Step {String(stepNum).padStart(2, '0')}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                          {step.title}
                        </h4>
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-1.5 pl-[52px]">
                      {step.deliverables.map((item, dIdx) => (
                        <div key={dIdx} className="flex items-center space-x-2 text-xs text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action / Callout Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-surface/90 to-cyan-950/20 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl"
        >
          <div className="space-y-0.5 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-primary uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Ready To Accelerate?</span>
            </div>
            <h4 className="text-base sm:text-xl font-extrabold text-white">
              Join India&apos;s Premier Multi-Category Creator Roster
            </h4>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/creators/roster"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-background font-extrabold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>Explore Verified Roster</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all text-center active:scale-[0.98]"
            >
              Apply for Representation
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
