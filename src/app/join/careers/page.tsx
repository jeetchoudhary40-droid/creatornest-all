'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film, Sparkles, Palette, ImageIcon,
  Aperture, Clapperboard, Camera, Video, Zap, Clipboard,
  Mic, Tv2, BookOpen, Music2,
  Target, BarChart2, PenLine,
  TrendingUp, Users, CalendarCheck, Star,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type WorkType = 'Full-Time' | 'Part-Time' | 'Freelance';
type Department = 'All' | 'Production & Visual' | 'Direction & Shoot' | 'Audio & On-Screen' | 'Strategy & Planning' | 'Management & Ops';

interface Role {
  id: string;
  title: string;
  dept: Exclude<Department, 'All'>;
  icon: React.ComponentType<{ className?: string }>;
  types: WorkType[];
  status: 'hiring' | 'waitlist';
}

const typeColors: Record<WorkType, string> = {
  'Full-Time':  'bg-primary/10 text-primary border-primary/20',
  'Part-Time':  'bg-secondary/10 text-secondary border-secondary/20',
  'Freelance':  'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const roles: Role[] = [
  // Production & Visual
  { id: 'video-editor',      title: 'Video Editor',                       dept: 'Production & Visual', icon: Film,          types: ['Full-Time','Part-Time','Freelance'], status: 'hiring' },
  { id: 'motion-graphics',   title: 'Motion Graphics Artist',             dept: 'Production & Visual', icon: Sparkles,      types: ['Part-Time','Freelance'],             status: 'hiring' },
  { id: 'graphic-designer',  title: 'Graphic Designer',                   dept: 'Production & Visual', icon: Palette,       types: ['Full-Time','Part-Time','Freelance'], status: 'hiring' },
  { id: 'thumbnail-designer',title: 'Thumbnail Designer',                 dept: 'Production & Visual', icon: ImageIcon,     types: ['Freelance'],                         status: 'hiring' },
  // Direction & Shoot
  { id: 'dop',               title: 'Director of Photography (DOP)',      dept: 'Direction & Shoot',   icon: Aperture,      types: ['Freelance'],                         status: 'hiring' },
  { id: 'director',          title: 'Video Director / Creative Director', dept: 'Direction & Shoot',   icon: Clapperboard,  types: ['Freelance','Part-Time'],             status: 'hiring' },
  { id: 'camera-operator',   title: 'Camera Operator / Videographer',     dept: 'Direction & Shoot',   icon: Camera,        types: ['Part-Time','Freelance'],             status: 'hiring' },
  { id: 'camera-assistant',  title: 'Camera Assistant (1st AC)',          dept: 'Direction & Shoot',   icon: Video,         types: ['Freelance'],                         status: 'hiring' },
  { id: 'lighting-tech',     title: 'Lighting Technician / Gaffer',       dept: 'Direction & Shoot',   icon: Zap,           types: ['Freelance'],                         status: 'hiring' },
  { id: 'set-coordinator',   title: 'Set Coordinator / Production Asst.', dept: 'Direction & Shoot',   icon: Clipboard,     types: ['Freelance','Part-Time'],             status: 'hiring' },
  // Audio & On-Screen
  { id: 'voice-artist',      title: 'Voice Artist',                       dept: 'Audio & On-Screen',   icon: Mic,           types: ['Freelance'],                         status: 'hiring' },
  { id: 'show-anchor',       title: 'Show Anchor / On-Camera Host',       dept: 'Audio & On-Screen',   icon: Tv2,           types: ['Part-Time','Freelance'],             status: 'hiring' },
  { id: 'script-reader',     title: 'Script Reader / Teleprompter Artist',dept: 'Audio & On-Screen',   icon: BookOpen,      types: ['Freelance'],                         status: 'hiring' },
  { id: 'audio-engineer',    title: 'Music & Audio Engineer',             dept: 'Audio & On-Screen',   icon: Music2,        types: ['Freelance'],                         status: 'hiring' },
  // Strategy & Planning
  { id: 'content-strategist',title: 'Content Strategist & Research Expert',dept: 'Strategy & Planning',icon: Target,        types: ['Full-Time','Part-Time'],             status: 'hiring' },
  { id: 'content-analyst',   title: 'Content Analyst & Planning Expert',  dept: 'Strategy & Planning', icon: BarChart2,     types: ['Full-Time','Part-Time'],             status: 'hiring' },
  { id: 'script-writer',     title: 'Script Writer',                      dept: 'Strategy & Planning', icon: PenLine,       types: ['Freelance','Part-Time'],             status: 'hiring' },
  // Management & Ops
  { id: 'social-media-mgr',  title: 'Social Media Manager',               dept: 'Management & Ops',    icon: TrendingUp,    types: ['Full-Time','Part-Time'],             status: 'hiring' },
  { id: 'team-manager',      title: 'Team Manager / Project Lead',        dept: 'Management & Ops',    icon: Users,         types: ['Full-Time'],                         status: 'hiring' },
  { id: 'organizer',         title: 'Organizer / Production Coordinator', dept: 'Management & Ops',    icon: CalendarCheck, types: ['Full-Time','Part-Time'],             status: 'hiring' },
  { id: 'talent-manager',    title: 'Talent Manager',                     dept: 'Management & Ops',    icon: Star,          types: ['Full-Time'],                         status: 'hiring' },
];

const depts: Department[] = ['All', 'Production & Visual', 'Direction & Shoot', 'Audio & On-Screen', 'Strategy & Planning', 'Management & Ops'];

export default function JoinPage() {
  const [activeDept, setActiveDept] = useState<Department>('All');
  const filtered = activeDept === 'All' ? roles : roles.filter(r => r.dept === activeDept);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(0,242,254,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.6) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-400 font-semibold">Actively Hiring — 21 Open Roles</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Work Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white italic">Creativity</span><br />Meets Strategy.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Join Creator Nest as a full-time collaborator, part-time contributor, or freelance specialist.
            Real campaigns. Real creators. Real impact.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3">
            {['🏢 Full-Time Roles', '⚡ Part-Time Roles', '🎯 Freelance Projects'].map(tag => (
              <span key={tag} className="bg-surface border border-white/10 text-white px-4 py-2 rounded-full text-sm font-medium">{tag}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Department Filter */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {depts.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeDept === dept
                    ? 'bg-primary text-background font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                    : 'bg-surface border border-white/10 text-gray-300 hover:text-white hover:border-primary/30'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((role) => {
                const Icon = role.icon;
                return (
                  <motion.div
                    key={role.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="bg-surface border border-white/5 hover:border-primary/25 rounded-3xl p-8 flex flex-col group transition-all hover:shadow-[0_0_40px_rgba(0,242,254,0.04)]"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors relative">
                        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Icon className="w-7 h-7 text-primary relative z-10" />
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        role.status === 'hiring'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {role.status === 'hiring' ? '● Hiring Now' : '○ Waitlist'}
                      </span>
                    </div>

                    {/* Department + Title */}
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1.5">{role.dept}</p>
                    <h3 className="text-xl font-bold text-white mb-5 group-hover:text-primary transition-colors leading-snug">{role.title}</h3>

                    {/* Work Type Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {role.types.map((type) => (
                        <span key={type} className={`text-xs px-3 py-1 rounded-full border font-semibold ${typeColors[type]}`}>
                          {type}
                        </span>
                      ))}
                    </div>

                    {/* Apply CTA */}
                    <div className="mt-auto pt-5 border-t border-white/5">
                      <Link
                        href={`/join/careers/apply?role=${role.id}&title=${encodeURIComponent(role.title)}`}
                        className="w-full inline-flex items-center justify-center space-x-2 bg-primary/10 hover:bg-primary text-primary hover:text-background border border-primary/20 hover:border-primary px-6 py-3 rounded-xl font-bold transition-all text-sm group/btn"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-20 bg-surface/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { emoji: '🚀', title: 'Fast Growth Environment', desc: 'Work on real campaigns and creator brands — not mockups or side projects. Your work ships to real audiences.' },
              { emoji: '₹',  title: 'Fair Pay + Incentives',   desc: 'Market-rate compensation for all roles. Freelancers get per-project rates. Full-timers get performance bonuses.' },
              { emoji: '🎬', title: 'Seen By Millions',        desc: 'Every project you create reaches real audiences — sometimes 1M+ views on day one. Your name, your craft.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="p-8 rounded-3xl bg-surface/50 border border-white/5">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
