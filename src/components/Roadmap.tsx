'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
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
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface Step {
  number: string;
  phase: string;
  phaseColor: string;
  icon: any;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  title: string;
  desc: string;
  deliverables: string[];
}

const phases = [
  {
    phaseNumber: "01",
    phaseTitle: "Foundation & Positioning",
    phaseBadge: "Phase 1: Architecture",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    steps: [
      {
        number: "01",
        phase: "Phase 1",
        phaseColor: "text-cyan-400",
        icon: SearchCode,
        iconBg: "bg-cyan-500/10",
        iconBorder: "border-cyan-500/20",
        iconColor: "text-cyan-400",
        title: "Channel & Audience Audit",
        desc: "Deep-dive diagnostic of audience demographics, buyer vs. viewer intent, retention curves, and monetization leakages across platforms.",
        deliverables: ["RPM & Demographics Audit", "Retention Drop-off Analysis", "Content Gap & Trend Mapping"]
      },
      {
        number: "02",
        phase: "Phase 1",
        phaseColor: "text-cyan-400",
        icon: Compass,
        iconBg: "bg-cyan-500/10",
        iconBorder: "border-cyan-500/20",
        iconColor: "text-cyan-400",
        title: "Niche Thesis & Positioning",
        desc: "Establish clear category leadership in Education, Tech, Entertainment, Gaming, or Lifestyle across YouTube, Instagram, and newsletters.",
        deliverables: ["Unique Angle / Moat Definition", "Multi-Platform Distribution Plan", "Quarterly Growth KPIs"]
      }
    ]
  },
  {
    phaseNumber: "02",
    phaseTitle: "Production & Sponsorships",
    phaseBadge: "Phase 2: Acceleration",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    steps: [
      {
        number: "03",
        phase: "Phase 2",
        phaseColor: "text-primary",
        icon: Cpu,
        iconBg: "bg-primary/10",
        iconBorder: "border-primary/20",
        iconColor: "text-primary",
        title: "Production & Content Packaging",
        desc: "Equip your workflow with high-CTR packaging, script reviews, editing systems, and automated live media kits for brands.",
        deliverables: ["Live Dynamic Media Kit", "High-CTR Thumbnail System", "Script Pacing & Hook Refinement"]
      },
      {
        number: "04",
        phase: "Phase 2",
        phaseColor: "text-primary",
        icon: Coins,
        iconBg: "bg-primary/10",
        iconBorder: "border-primary/20",
        iconColor: "text-primary",
        title: "High-Ticket Brand Matchmaking",
        desc: "Direct integration pipeline with top national & global brands across EdTech, D2C, Tech, FinTech, and FMCG at premium CPMs.",
        deliverables: ["Standardized Rate Card", "Inbound Deal Negotiation", "Guaranteed Brand Contracts"]
      }
    ]
  },
  {
    phaseNumber: "03",
    phaseTitle: "Scale & Digital Business",
    phaseBadge: "Phase 3: Scale & IP",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    steps: [
      {
        number: "05",
        phase: "Phase 3",
        phaseColor: "text-purple-400",
        icon: GraduationCap,
        iconBg: "bg-purple-500/10",
        iconBorder: "border-purple-500/20",
        iconColor: "text-purple-400",
        title: "Digital Products & LMS Launch",
        desc: "Break free from pure AdSense. Launch proprietary cohort courses, digital toolkits, merchandise, and high-margin community memberships.",
        deliverables: ["Course & Curriculum Funnel", "Member Portal & LMS Setup", "Direct Stripe/Razorpay Billing"]
      },
      {
        number: "06",
        phase: "Phase 3",
        phaseColor: "text-purple-400",
        icon: Rocket,
        iconBg: "bg-purple-500/10",
        iconBorder: "border-purple-500/20",
        iconColor: "text-purple-400",
        title: "IP, Media Network & Brand Equity",
        desc: "Transform from a single creator into an enduring media brand holding company with owned intellectual property and long-term equity upside.",
        deliverables: ["Co-founder & Equity Structuring", "Spin-out Podcasts/Shows & Merchandise", "Long-term Brand Valuation"]
      }
    ]
  }
];

export default function Roadmap() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <section id="roadmap" className="py-24 bg-[#070B11] relative border-t border-white/5 overflow-hidden">
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
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 mb-5 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              The Creator Nest Incubation & Scaling Engine
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.2] mb-4">
            From Solo Creator to <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-white">
              Scalable Media Brand.
            </span>
          </h2>

          <p className="text-gray-400 text-sm sm:text-lg leading-relaxed">
            We don&apos;t just manage talent. We partner with creators across Education, Tech, Entertainment, Lifestyle, Gaming & more to systematically optimize production, maximize sponsorship revenue, and launch owned digital businesses.
          </p>
        </motion.div>

        {/* 3-Phase Roadmap Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {phases.map((phase, pIdx) => (
            <motion.div
              key={pIdx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: pIdx * 0.15, duration: 0.5 }}
              className="flex flex-col rounded-3xl bg-surface/40 border border-white/10 p-6 sm:p-7 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all duration-300 shadow-xl"
            >
              {/* Top Phase Indicator */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-black text-white/30 group-hover:text-white/60 transition-colors">
                    {phase.phaseNumber}
                  </span>
                  <div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${phase.badgeColor}`}>
                      {phase.phaseBadge}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {phase.phaseTitle}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Steps inside this Phase */}
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                {phase.steps.map((step, sIdx) => {
                  const Icon = step.icon;
                  const isHovered = activeStep === step.number;
                  
                  return (
                    <div 
                      key={sIdx}
                      onMouseEnter={() => setActiveStep(step.number)}
                      onMouseLeave={() => setActiveStep(null)}
                      className={`p-5 rounded-2xl bg-white/[0.02] border transition-all duration-300 relative ${
                        isHovered 
                          ? 'border-primary/40 bg-primary/[0.04] translate-x-1 shadow-lg shadow-primary/5' 
                          : 'border-white/5 hover:border-white/15'
                      }`}
                    >
                      {/* Step Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl ${step.iconBg} border ${step.iconBorder} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${step.iconColor}`} />
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                              Step {step.number}
                            </span>
                            <h4 className="text-base font-bold text-white group-hover/step:text-primary transition-colors">
                              {step.title}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
                        {step.desc}
                      </p>

                      {/* Deliverables Pills */}
                      <div className="space-y-1.5 pt-3 border-t border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                          Key Deliverables:
                        </span>
                        {step.deliverables.map((item, dIdx) => (
                          <div key={dIdx} className="flex items-center space-x-2 text-xs text-gray-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action / Callout Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-primary/10 via-surface/90 to-cyan-950/20 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-primary uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Ready To Accelerate Your Channel?</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold text-white">
              Join India&apos;s Premier Multi-Category Creator Roster
            </h4>
            <p className="text-gray-400 text-xs sm:text-sm max-w-xl">
              We provide strategic guidance, production support, and high-value sponsorships with top national and global brands.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/creators/roster"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-background font-extrabold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>Explore Verified Roster</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all text-center active:scale-[0.98]"
            >
              Apply for Representation
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
