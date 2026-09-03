'use client';
import { motion } from 'framer-motion';
import { 
  TrendingDown, 
  Target, 
  Wallet, 
  MessageSquareWarning, 
  DollarSign, 
  Award, 
  ChevronRight,
  Rocket,
  BadgeCheck,
  Handshake, 
  Search,
  Sparkles
} from 'lucide-react';
import LandingSection from './LandingSection';

export function CreatorProblem() {
  const problems = [
    { text: "Posting content but not growing", icon: <TrendingDown className="w-5 h-5 text-secondary" /> },
    { text: "No clear niche or direction", icon: <Target className="w-5 h-5 text-secondary" /> },
    { text: "Not earning from your content", icon: <Wallet className="w-5 h-5 text-secondary" /> },
    { text: "Confused about brand deals", icon: <MessageSquareWarning className="w-5 h-5 text-secondary" /> }
  ];

  return (
    <LandingSection id="problem" variant="surface">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">
            Struggling to Grow <br /><span className="text-gray-500">as a Creator?</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {problems.map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center space-x-3 text-base sm:text-lg text-gray-400 group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors shrink-0">
                  {p.icon}
                </div>
                <span className="group-hover:text-white transition-colors">{p.text}</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-8 sm:mt-10 text-lg sm:text-xl font-bold text-primary flex items-center group">
            You don’t need more effort — you need a system. 
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>
        <div className="relative min-h-[320px] sm:aspect-video rounded-3xl overflow-hidden border border-white/5 bg-background p-5 sm:p-8 group shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/5 group-hover:opacity-80 transition-opacity" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-gray-500">Creator Journey</span>
              <span className="text-[10px] sm:text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2.5 sm:px-3 py-1 font-semibold">After Creator Nest</span>
            </div>
            {/* Metrics comparison */}
            <div className="space-y-3 sm:space-y-4">
              {[
                { label: 'Monthly Views', before: '1.2K', after: '380K', color: 'text-primary' },
                { label: 'Brand Deals / month', before: '₹0', after: '₹1.8L', color: 'text-green-400' },
                { label: 'Followers Growth', before: '+200', after: '+22K', color: 'text-primary' },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-sm">{m.label}</span>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-gray-600 text-xs sm:text-sm line-through">{m.before}</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-500">→</span>
                    <span className={`font-black text-xs sm:text-sm ${m.color}`}>{m.after}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Bar chart visual */}
            <div className="mt-4 pt-3 sm:pt-4 border-t border-white/5">
              <div className="flex items-end space-x-1 sm:space-x-1.5 h-12 sm:h-14">
                {[20, 22, 30, 28, 40, 55, 48, 70, 75, 90, 95, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/40 rounded-t-sm group-hover:bg-primary/70 transition-colors duration-300"
                    style={{ height: `${h}%`, transitionDelay: `${i * 30}ms` }}
                  />
                ))}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2 text-center">Channel Views — 12 Month Growth</p>
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

export function CreatorSolution() {
  const solutions = [
    {
      title: "Talent Analysis",
      desc: "We identify your niche, strengths, and positioning",
      icon: <Search className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />,
    },
    {
      title: "Skill Refinement",
      desc: "We improve your content quality and consistency",
      icon: <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />,
    },
    {
      title: "Monetization System",
      desc: "We help you earn through brand deals and audience growth",
      icon: <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />,
    }
  ];

  return (
    <LandingSection id="solution" variant="dark">
      <div className="text-center mb-10 sm:mb-16">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">We Turn Talent Into <span className="text-primary italic text-glow-primary">Scalable Brands</span></h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">Creator Nest is not just guidance — it’s a structured growth system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {solutions.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className="p-6 sm:p-8 rounded-3xl bg-surface border border-white/5 hover:border-primary/20 transition-all group shadow-lg"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-primary/20 transition-colors relative">
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">{s.icon}</div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">{s.title}</h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </LandingSection>
  );
}

export function CreatorRoadmap() {
  const steps = [
    { title: "Apply & Get Selected", desc: "Submit your profile and goals" },
    { title: "Deep Talent Audit", desc: "We analyze your content and potential" },
    { title: "Custom Growth Plan", desc: "You get a clear roadmap" },
    { title: "Execution & Mentorship", desc: "We guide you step-by-step" },
    { title: "Monetization", desc: "Start earning and scaling" }
  ];

  return (
    <LandingSection id="how-it-works">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 text-center italic">Your <span className="text-primary">Growth</span> Roadmap</h2>
        <div className="space-y-6 sm:space-y-8 relative">
          <div className="absolute left-[21px] sm:left-[27px] top-4 bottom-4 w-0.5 bg-white/5"></div>
          {steps.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start space-x-4 sm:space-x-8 relative group"
            >
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-surface border border-white/10 flex items-center justify-center text-lg sm:text-xl font-bold text-primary z-10 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all shrink-0">
                {i + 1}
              </div>
              <div className="pt-2 sm:pt-3">
                <h3 className="text-lg sm:text-2xl font-bold mb-1 group-hover:text-primary transition-colors text-white">{s.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}

export function CreatorResults() {
  const results = [
    { title: "Grow faster with clarity", icon: <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-primary" /> },
    { title: "Build a strong personal brand", icon: <BadgeCheck className="w-8 h-8 sm:w-10 sm:h-10 text-primary" /> },
    { title: "Start earning consistently", icon: <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-primary" /> },
    { title: "Get access to brand deals", icon: <Handshake className="w-8 h-8 sm:w-10 sm:h-10 text-primary" /> }
  ];

  return (
    <LandingSection variant="surface">
      <div className="text-center mb-10 sm:mb-16">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 italic">What Creators <span className="text-primary">Achieve</span></h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {results.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 sm:p-8 rounded-3xl bg-background border border-white/5 flex flex-col items-center text-center space-y-4 sm:space-y-6 group hover:border-primary/30 transition-all hover:scale-105 shadow-xl"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 group-hover:scale-110 transition-transform">{r.icon}</div>
            </div>
            <p className="font-bold text-base sm:text-lg leading-snug group-hover:text-white transition-colors">{r.title}</p>
          </motion.div>
        ))}
      </div>
    </LandingSection>
  );
}

