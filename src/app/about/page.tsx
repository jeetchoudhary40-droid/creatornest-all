'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { BrainCircuit, GraduationCap, Briefcase, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const pillars = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: "AI-Powered Creator Profiling System",
    desc: "Deeply analyzes every creator's digital presence — evaluating audience quality, engagement authenticity, niche authority, and brand readiness — generating a comprehensive intelligence report that serves as a data-driven growth roadmap for creators and a discovery tool for brands."
  },
  {
    icon: <GraduationCap className="w-8 h-8 text-blue-400" />,
    title: "Creator Academy",
    desc: "Delivers structured courses, expert masterclasses, and personalized growth roadmaps covering content strategy, personal branding, monetization frameworks, and AI tools — turning aspiring creators into professional-grade content entrepreneurs."
  },
  {
    icon: <Briefcase className="w-8 h-8 text-purple-400" />,
    title: "Brand Collaboration Marketplace",
    desc: "Uses AI-powered matchmaking to connect vetted creators with brands seeking authentic, high-performance campaigns — with end-to-end management covering briefs, contracts, content approval, and automated payments."
  },
  {
    icon: <Users className="w-8 h-8 text-pink-400" />,
    title: "Creator Services Marketplace",
    desc: "Connects creators with skilled editors, designers, scriptwriters, and strategists — building a thriving professional ecosystem where every successful creator generates opportunities for others."
  }
];

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      {/* Hero / Main Description */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-24 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
              Creator Nest Media
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 leading-relaxed font-light">
              Creator Nest Media is an AI-powered creator economy platform built to transform India's raw talent into sustainable, monetizable personal brands. We bridge the gap between untapped creative potential and real, predictable income by providing everything a creator needs under one roof.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 relative bg-surface/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 italic leading-snug">
              "We don't just help creators. We build income infrastructure for India."
            </h2>
          </motion.div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-24 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Our Four Core Pillars
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-surface/50 border border-white/5 hover:border-white/10 p-8 md:p-10 rounded-3xl transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{pillar.title}</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing / Automation Statement */}
      <section className="py-20 relative bg-surface/30 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light mb-10">
              Backed by maximum automation through AI-driven CRM, WhatsApp communication, analytics dashboards, and a comprehensive admin system, Creator Nest Media is not just helping creators grow — we are building the backbone of India's creator economy.
            </p>
            <Link 
              href="/join"
              className="inline-flex items-center gap-2 bg-primary text-black font-semibold px-8 py-4 rounded-full hover:bg-primary/90 transition-colors text-lg"
            >
              Join the Ecosystem <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
