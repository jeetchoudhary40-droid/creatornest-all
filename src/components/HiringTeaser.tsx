'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';

export default function HiringTeaser() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="relative rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-sm p-10 md:p-12 overflow-hidden group hover:border-primary/20 transition-all"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
            <div className="flex items-start space-x-6">
              <div className="w-14 h-14 bg-green-500/15 border border-green-500/25 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-bold tracking-widest uppercase">We&apos;re Actively Hiring</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Love creating? Come build with us.
                </h3>
                <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                  We&apos;re looking for Video Editors, DOPs, Graphic Designers, Voice Artists,
                  Content Strategists, Show Anchors and 15+ more roles.
                  <span className="text-gray-500"> Full-time, Part-time & Freelance available.</span>
                </p>
              </div>
            </div>
            <Link
              href="/join"
              className="group flex items-center space-x-2 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-white px-8 py-4 rounded-full font-bold transition-all whitespace-nowrap flex-shrink-0"
            >
              <span>Explore 21 Roles</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
