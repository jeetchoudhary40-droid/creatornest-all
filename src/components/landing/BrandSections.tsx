'use client';
import { motion } from 'framer-motion';
import { 
  Ghost, 
  Compass, 
  TrendingDown, 
  SearchX, 
  UsersRound, 
  Lightbulb, 
  Rocket, 
  BarChart4, 
  ArrowRight 
} from 'lucide-react';
import LandingSection from './LandingSection';

export function BrandProblem() {
  const problems = [
    { 
      title: "Wrong Creators", 
      desc: "Mismatched audience and brand values",
      icon: <Ghost className="w-8 h-8 text-secondary" />
    },
    { 
      title: "No Strategy", 
      desc: "Random posts without a clear funnel",
      icon: <Compass className="w-8 h-8 text-secondary" />
    },
    { 
      title: "Low ROI", 
      desc: "High spending with no measurable impact",
      icon: <TrendingDown className="w-8 h-8 text-secondary" />
    },
    { 
      title: "No Tracking", 
      desc: "Confusion about real campaign performance",
      icon: <SearchX className="w-8 h-8 text-secondary" />
    }
  ];

  return (
    <LandingSection id="brand-problem" variant="surface">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Most Influencer <br /><span className="text-secondary">Campaigns Fail</span></h2>
        <p className="text-gray-400">You don’t need more creators — you need the right system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {problems.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-2xl bg-background border border-white/5 space-y-6 group hover:border-secondary/30 transition-all"
          >
            <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform relative">
               <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative z-10">{p.icon}</div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </LandingSection>
  );
}

export function BrandSolution() {
  const features = [
    {
      title: "Creator Matching",
      desc: "Access curated, high-quality creators verified by our system",
      icon: <UsersRound className="w-8 h-8 text-secondary" />
    },
    {
      title: "Campaign Strategy",
      desc: "We design your campaign for maximum ROI and brand impact",
      icon: <Lightbulb className="w-8 h-8 text-secondary" />
    },
    {
      title: "End-to-End Execution",
      desc: "From negotiation to content review, we handle everything",
      icon: <Rocket className="w-8 h-8 text-secondary" />
    },
    {
      title: "Performance Tracking",
      desc: "Clear metrics, dashboards, and transparent reporting",
      icon: <BarChart4 className="w-8 h-8 text-secondary" />
    }
  ];

  return (
    <LandingSection id="brand-solution" variant="dark">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 italic">A Structured Creator <br /><span className="text-secondary text-glow-secondary">Marketing Engine</span></h2>
        <p className="text-gray-400 max-w-2xl mx-auto">We combine creator strategy, execution, and performance tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex items-start space-x-6 p-8 rounded-3xl bg-surface border border-white/5 hover:border-secondary/20 transition-all group"
          >
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors relative">
               <div className="absolute inset-0 bg-secondary/10 blur-md rounded-full opacity-50" />
               <div className="relative z-10">{f.icon}</div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </LandingSection>
  );
}

export function BrandCaseStudies() {
  const cases = [
    { 
      title: "+8.4M Views", 
      brand: "Tech Brand X", 
      result: "Campaign Reach",
      quote: "Creator Nest matched us with creators who actually understood our product. The results exceeded every KPI.",
      person: "CMO, Tech Brand X"
    },
    { 
      title: "4.5x ROI", 
      brand: "D2C Startup", 
      result: "Return on Spend",
      quote: "We spent ₹5L and got ₹22L in direct sales. The strategy and execution was completely hands-off for our team.",
      person: "Founder, D2C Startup"
    },
    { 
      title: "32K+ Leads", 
      brand: "App Launch", 
      result: "User Acquisitions",
      quote: "Our app hit Top 10 on the Play Store within a week of the campaign. Incredible execution by the Nest team.",
      person: "Growth Head, App Launch"
    }
  ];

  return (
    <LandingSection id="case-studies">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold">Proven Campaign <span className="text-secondary">Results</span></h2>
          <p className="text-gray-400 mt-4">Real numbers from brands who trust the Nest ecosystem.</p>
        </div>
        <a href="#brand-form" className="text-secondary font-bold flex items-center hover:underline group">
          Explore All Case Studies <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cases.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className="p-10 rounded-3xl bg-surface border border-white/5 flex flex-col space-y-5 hover:border-secondary/30 transition-all shadow-xl group"
          >
            <div className="space-y-1">
              <p className="text-secondary text-xs font-bold tracking-widest uppercase">{c.brand}</p>
              <h3 className="text-4xl font-bold text-white tracking-tight group-hover:text-secondary transition-colors">{c.title}</h3>
              <p className="text-gray-500 font-medium text-sm">{c.result}</p>
            </div>
            <div className="border-t border-white/5 pt-5 flex-1">
              <p className="text-gray-300 text-sm italic leading-relaxed">&ldquo;{c.quote}&rdquo;</p>
              <p className="text-gray-500 text-xs mt-3 font-semibold">— {c.person}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </LandingSection>
  );
}

