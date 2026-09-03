'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Zap, Briefcase, Rocket, Video, Brain, TrendingUp, FileText, ChevronRight, Clock, Star, Filter, GraduationCap, Sparkles, Target, Users, BarChart3, Palette, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import * as Lucide from 'lucide-react';
import { getUUIDFromStaticId } from '@/lib/uuidHelper';

/* ─── Data ─── */
const categories = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'ai-tools', label: 'AI Tools', icon: Brain },
  { id: 'brand-deals', label: 'Brand Deals', icon: Briefcase },
  { id: 'quick-start', label: 'Quick Start', icon: Rocket },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
  { id: 'production', label: 'Production', icon: Video },
  { id: 'monetization', label: 'Monetization', icon: BarChart3 },
];

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'] as const;

interface Resource {
  id: string | number; title: string; description: string; category: string;
  level: string; duration: string; rating: number; tags: string[];
  icon: typeof BookOpen; accent: string; lessons: number; type: string;
}

const resources: Resource[] = [
  { id:1, title:'ChatGPT for Script Writing', description:'Master AI-powered scriptwriting — hooks, storytelling arcs, and viral formats using ChatGPT prompts built for creators.', category:'ai-tools', level:'Beginner', duration:'45 min', rating:4.9, tags:['ChatGPT','Scripts','AI'], icon:Brain, accent:'primary', lessons:8, type:'Guide' },
  { id:2, title:'Midjourney Thumbnail Mastery', description:'Create scroll-stopping thumbnails with Midjourney. Learn prompting, style tuning, and A/B testing workflows.', category:'ai-tools', level:'Intermediate', duration:'1.5 hrs', rating:4.8, tags:['Midjourney','Thumbnails','Design'], icon:Palette, accent:'secondary', lessons:12, type:'Course' },
  { id:3, title:'AI Video Generation with Runway & Sora', description:'Produce cinematic B-roll and effects using Runway ML and OpenAI Sora. No camera required.', category:'ai-tools', level:'Advanced', duration:'2 hrs', rating:4.7, tags:['Runway','Sora','Video AI'], icon:Video, accent:'primary', lessons:15, type:'Workshop' },
  { id:4, title:'Landing Your First Brand Deal', description:'Step-by-step playbook to pitch brands, negotiate rates, and close your first paid collaboration — even under 10K followers.', category:'brand-deals', level:'Beginner', duration:'1 hr', rating:4.9, tags:['Pitching','Negotiation','First Deal'], icon:Target, accent:'secondary', lessons:10, type:'Playbook' },
  { id:5, title:'Rate Card & Media Kit Builder', description:'Build a professional rate card and media kit that commands premium pricing. Includes free templates.', category:'brand-deals', level:'Intermediate', duration:'50 min', rating:4.8, tags:['Rate Card','Media Kit','Pricing'], icon:FileText, accent:'primary', lessons:6, type:'Template Kit' },
  { id:6, title:'Long-Term Brand Partnerships', description:'Move beyond one-off deals. Learn retention strategies, exclusivity clauses, and ambassador program frameworks.', category:'brand-deals', level:'Advanced', duration:'1.5 hrs', rating:4.7, tags:['Retention','Ambassador','Strategy'], icon:Shield, accent:'secondary', lessons:9, type:'Masterclass' },
  { id:7, title:'Creator Quick Start: 0 to First Video', description:'Everything you need to publish your first professional video — gear, editing, SEO, and distribution in one checklist.', category:'quick-start', level:'Beginner', duration:'30 min', rating:5.0, tags:['Setup','First Video','Checklist'], icon:Rocket, accent:'primary', lessons:5, type:'Checklist' },
  { id:8, title:'Channel Setup & Branding Blueprint', description:'Set up your YouTube channel, Instagram bio, and cross-platform branding like a pro from Day 1.', category:'quick-start', level:'Beginner', duration:'40 min', rating:4.8, tags:['Branding','Setup','Identity'], icon:Globe, accent:'secondary', lessons:7, type:'Blueprint' },
  { id:9, title:'YouTube Algorithm Deep Dive', description:'Understand impressions, CTR, AVD, and the recommendation engine. Data-driven strategies to hack the algorithm.', category:'growth', level:'Intermediate', duration:'2 hrs', rating:4.9, tags:['Algorithm','YouTube','Analytics'], icon:TrendingUp, accent:'primary', lessons:14, type:'Course' },
  { id:10, title:'Instagram Reels Growth System', description:'A systematic approach to Reels — trending audio, hook patterns, hashtag strategy, and posting cadence.', category:'growth', level:'Intermediate', duration:'1 hr', rating:4.7, tags:['Reels','Instagram','Viral'], icon:Zap, accent:'secondary', lessons:8, type:'System' },
  { id:11, title:'Professional Lighting on a Budget', description:'Achieve studio-quality lighting with affordable gear. Three-point setups, natural light hacks, and color grading.', category:'production', level:'Beginner', duration:'1 hr', rating:4.6, tags:['Lighting','Budget','Quality'], icon:Video, accent:'primary', lessons:6, type:'Guide' },
  { id:12, title:'DaVinci Resolve Editing Masterclass', description:'From cuts to color grading — master professional video editing with free software used by Hollywood editors.', category:'production', level:'Advanced', duration:'4 hrs', rating:4.9, tags:['DaVinci','Editing','Color'], icon:Palette, accent:'secondary', lessons:22, type:'Masterclass' },
  { id:13, title:'Monetization Beyond AdSense', description:'Diversify revenue: memberships, merch, courses, affiliate marketing, and licensing. Build a real business.', category:'monetization', level:'Intermediate', duration:'1.5 hrs', rating:4.8, tags:['Revenue','Diversify','Business'], icon:BarChart3, accent:'primary', lessons:11, type:'Course' },
  { id:14, title:'Building a Community That Pays', description:'Turn followers into superfans. Discord strategies, membership tiers, and community-led content creation.', category:'monetization', level:'Advanced', duration:'2 hrs', rating:4.7, tags:['Community','Membership','Superfans'], icon:Users, accent:'secondary', lessons:13, type:'Workshop' },
  { id:15, title:'AI Voiceover & Dubbing Tools', description:'Clone your voice, auto-dub in 50+ languages, and create faceless content using ElevenLabs, HeyGen & more.', category:'ai-tools', level:'Intermediate', duration:'1 hr', rating:4.6, tags:['Voiceover','Dubbing','ElevenLabs'], icon:Brain, accent:'primary', lessons:7, type:'Guide' },
  { id:16, title:'Collaboration & Cross-Promotion Playbook', description:'Find the right collab partners, structure win-win deals, and cross-promote to double your reach overnight.', category:'growth', level:'Beginner', duration:'45 min', rating:4.8, tags:['Collab','Cross-Promo','Networking'], icon:Users, accent:'secondary', lessons:6, type:'Playbook' },
];

const getLucideIcon = (iconName: string) => {
  if (!iconName) return BookOpen;
  return (Lucide as any)[iconName] || BookOpen;
};

/* ─── Component ─── */
export default function NSchoolPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('All Levels');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [displayResources, setDisplayResources] = useState<Resource[]>(() => {
    return resources.map(r => ({
      ...r,
      rating: r.rating || 4.8,
      lessons: 10,
      type: r.type || 'Course'
    }));
  });

  useEffect(() => {
    const loadCourses = async () => {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('cn_courses');
        if (cached) {
          const parsed = JSON.parse(cached);
          const visibleCached = parsed.filter((c: any) => c.is_published);
          if (visibleCached.length > 0) {
            const mappedCached = visibleCached.map((c: any) => ({
              id: c.id,
              title: c.title,
              description: c.short_desc,
              category: c.category,
              level: c.level,
              duration: c.duration,
              rating: parseFloat(c.rating) || 4.8,
              tags: c.tags || [],
              icon: getLucideIcon(c.icon),
              accent: c.accent || 'primary',
              lessons: 10,
              type: 'Course'
            }));
            setDisplayResources(mappedCached);
          }
        }
      }

      try {
        const { data: dbCourses, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true);

        if (!error && dbCourses && dbCourses.length > 0) {
          const mapped = dbCourses.map(c => ({
            id: c.id,
            title: c.title,
            description: c.short_desc,
            category: c.category,
            level: c.level,
            duration: c.duration,
            rating: parseFloat(c.rating) || 4.8,
            tags: c.tags || [],
            icon: getLucideIcon(c.icon),
            accent: c.accent || 'primary',
            lessons: 10,
            type: 'Course'
          }));
          setDisplayResources(mapped);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('cn_courses', JSON.stringify(dbCourses));
          }
          return;
        }

        // Auto-seed to Supabase if empty and no error occurred
        if (!error && dbCourses && dbCourses.length === 0) {
          const seedPayload = resources.map((r) => ({
            id: getUUIDFromStaticId(String(r.id)),
            title: r.title,
            short_desc: r.description,
            long_desc: r.description,
            level: r.level,
            duration: r.duration,
            rating: r.rating,
            instructor: 'Creator Nest Team',
            category: r.category,
            plan: 'free',
            accent: r.accent,
            icon: r.icon?.name || r.icon?.displayName || 'BookOpen',
            tags: r.tags,
            is_published: true
          }));
          await supabase.from('courses').insert(seedPayload);
        }
      } catch (err) {
        console.error(err);
        setDisplayResources(resources);
      }
    };
    loadCourses();
  }, []);

  const filtered = useMemo(() => {
    return displayResources.filter(r => {
      const matchCat = selectedCategory === 'all' || r.category === selectedCategory || r.category === categories.find(c => c.id === selectedCategory)?.label;
      const matchLvl = selectedLevel === 'All Levels' || r.level === selectedLevel;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || (r.tags && r.tags.some(t => t.toLowerCase().includes(q)));
      return matchCat && matchLvl && matchSearch;
    });
  }, [selectedCategory, selectedLevel, searchQuery, displayResources]);

  const stats = [
    { label: 'Resources', value: '50+', icon: BookOpen },
    { label: 'Categories', value: '6', icon: Filter },
    { label: 'Creators Trained', value: '2,500+', icon: GraduationCap },
    { label: 'Avg. Rating', value: '4.8★', icon: Star },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero — Compact */}
      <section className="pt-24 pb-4 sm:pt-28 sm:pb-5 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Row 1: Title + Stats */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">N School</span>
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">Industry-grade training for content creators</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              {stats.map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <s.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-white">{s.value}</span>
                  <span className="text-xs text-gray-500 hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Row 2: Search */}
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            <div className="relative max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search resources, topics, or tags…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-surface/60 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all"
              />
              <button onClick={() => setShowFilters(!showFilters)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors md:hidden">
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="pb-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar Filters */}
            <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-28 space-y-6">
                {/* Categories */}
                <div className="bg-surface/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                  <div className="space-y-1">
                    {categories.map(cat => {
                      const Icon = cat.icon;
                      const active = selectedCategory === cat.id;
                      return (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary/15 text-primary shadow-[0_0_15px_rgba(0,242,254,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{cat.label}</span>
                          {active && <span className="ml-auto text-xs bg-primary/20 px-2 py-0.5 rounded-full">{cat.id === 'all' ? displayResources.length : displayResources.filter(r => r.category === cat.id || r.category === cat.label).length}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Level */}
                <div className="bg-surface/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Level</h3>
                  <div className="space-y-1">
                    {levels.map(lvl => (
                      <button key={lvl} onClick={() => setSelectedLevel(lvl)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedLevel === lvl ? 'bg-secondary/15 text-secondary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                {(selectedCategory !== 'all' || selectedLevel !== 'All Levels' || searchQuery) && (
                  <button onClick={() => { setSelectedCategory('all'); setSelectedLevel('All Levels'); setSearchQuery(''); }}
                    className="w-full text-center text-sm text-gray-500 hover:text-white py-2 transition-colors">
                    ✕ Clear all filters
                  </button>
                )}
              </div>
            </aside>

            {/* Resource Grid */}
            <div className="flex-1 min-w-0">
              {/* Category pills — mobile & quick access */}
              <div className="flex flex-wrap gap-2 mb-6 lg:hidden">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedCategory === cat.id ? 'bg-primary/15 border-primary/30 text-primary' : 'border-white/10 text-gray-500 hover:text-white'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{filtered.length} resource{filtered.length !== 1 ? 's' : ''} found</p>
              </div>

              <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-24">
                    <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No resources found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                  </motion.div>
                ) : (
                  <motion.div key="grid" initial={{ opacity:0 }} animate={{ opacity:1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity:0, y:15 }}
                        animate={{ opacity:1, y:0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group bg-surface/50 backdrop-blur-sm border border-white/5 hover:border-primary/20 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,242,254,0.06)] hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                      >
                        {/* Hover glow */}
                        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${r.accent === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'}`} />

                        <div className="relative z-10 flex flex-col flex-1">
                          {/* Top Row: Type badge + Level */}
                          <div className="flex items-center justify-between mb-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${r.accent === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                              {r.type}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${r.level === 'Beginner' ? 'border-green-500/30 text-green-400' : r.level === 'Intermediate' ? 'border-yellow-500/30 text-yellow-400' : 'border-red-500/30 text-red-400'}`}>
                              {r.level}
                            </span>
                          </div>

                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.accent === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                            <r.icon className={`w-6 h-6 ${r.accent === 'primary' ? 'text-primary' : 'text-secondary'}`} />
                          </div>

                          {/* Title & Desc */}
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors leading-snug">{r.title}</h3>
                          <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{r.description}</p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {r.tags.map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-500 border border-white/5">{tag}</span>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{r.duration}</span>
                              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{r.lessons} lessons</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                              <span className="text-yellow-400 font-medium">{r.rating}</span>
                            </div>
                          </div>

                          {/* CTA */}
                          <Link href={`/nschool/course/${r.id}`} className="mt-4 flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            Start Learning <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-surface via-surface to-primary/5 border border-white/10 rounded-3xl p-10 md:p-14 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Level Up?</h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8">Join Creator Nest and get personalized mentorship, exclusive resources, and a roadmap built for your growth.</p>
              <a href="/join" className="inline-flex items-center gap-2 bg-primary text-background font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(0,242,254,0.3)]">
                Join the Nest <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
