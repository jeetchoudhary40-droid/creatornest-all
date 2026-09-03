'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Crown, Star, Zap, Shield, BookOpen, Download, Clock, ArrowRight,
  CheckCircle2, ChevronRight, Video, Briefcase, Users, Sparkles,
  Settings, LogOut, AlertCircle, TrendingUp, Gift, Lock, Globe, Phone, Camera,
  MapPin, Tv, Award, ExternalLink, Calculator, BadgeCheck, Share2, Mail, Edit3, Flame, Play
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// ── Plan Config ─────────────────────────────────────────────────────────────
const PLANS = {
  free: {
    label: 'Free',
    color: '#6B7280',
    bg: 'rgba(107,114,128,0.15)',
    border: 'rgba(107,114,128,0.3)',
    icon: Zap,
    perks: ['3 AI tool uses/day', 'Course previews', '5 template downloads'],
  },
  silver: {
    label: 'Silver',
    color: '#C0C0C0',
    bg: 'rgba(192,192,192,0.12)',
    border: 'rgba(192,192,192,0.3)',
    icon: Star,
    perks: ['20 AI tool uses/day', '5 courses', '20 templates', 'Community access'],
  },
  gold: {
    label: 'Gold',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    icon: Crown,
    perks: ['Unlimited AI tools', 'All courses', 'All templates', '1 service/mo'],
  },
  platinum: {
    label: 'Platinum',
    color: '#00F2FE',
    bg: 'rgba(0,242,254,0.12)',
    border: 'rgba(0,242,254,0.3)',
    icon: Shield,
    perks: ['Everything in Gold', 'Dedicated manager', 'Monthly strategy call', 'Unlimited services'],
  },
} as const;

const USER_TYPE_INFO = {
  user: { label: 'General Member', color: '#6B7280', desc: 'Exploring Creator Nest' },
  visitor: { label: 'General Member', color: '#6B7280', desc: 'Exploring Creator Nest' },
  creator: { label: 'Creator', color: '#00F2FE', desc: 'Verified Exclusive Content Creator' },
  brand: { label: 'Brand Partner', color: '#F59E0B', desc: 'Verified Brand & Agency' },
  team: { label: 'Team Member', color: '#8B5CF6', desc: 'Creator Nest Staff' },
  admin: { label: 'Administrator', color: '#EF4444', desc: 'Platform Admin' },
  super_admin: { label: 'Super Admin', color: '#EF4444', desc: 'Platform Owner' },
} as const;

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex items-center gap-4 shadow-md">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-black text-white">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

function ApplyCard({ icon: Icon, title, desc, color, href, applied }: {
  icon: any; title: string; desc: string; color: string; href: string; applied?: boolean;
}) {
  return (
    <Link
      href={applied ? '#' : href}
      className="group block bg-white/[0.03] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all"
      style={applied ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {applied ? (
          <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Pending Review
          </span>
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        )}
      </div>
      <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </Link>
  );
}

// ── Main Profile Component ────────────────────────────────────────────────────
function ProfileContent() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === 'true';

  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [toolHistory, setToolHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(isWelcome);

  const plan = PLANS[(user?.plan_tier as keyof typeof PLANS) ?? 'free'];
  const PlanIcon = plan.icon;
  const typeInfo = USER_TYPE_INFO[(user?.user_type as keyof typeof USER_TYPE_INFO) ?? 'user'];

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?next=/profile');
    }
  }, [user, isLoading, router]);

  // Load Matching Roster Creator Details (e.g. for Jeet / jeetchoudhary40@gmail.com)
  useEffect(() => {
    async function loadCreatorRoster() {
      try {
        const res = await fetch('/api/admin/roster');
        const json = await res.json();
        if (json.success && json.creators) {
          const matched = json.creators.find((c: any) => {
            const userEmail = (user?.email || '').toLowerCase();
            const userName = (user?.full_name || '').toLowerCase();
            
            return (
              (c.businessEmail && c.businessEmail.toLowerCase() === userEmail) ||
              (userEmail === 'jeetchoudhary40@gmail.com' && (c.id === 1 || c.name.toLowerCase().includes('jeet'))) ||
              (userName && c.name.toLowerCase().includes(userName)) ||
              (c.id === user?.id)
            );
          });

          if (matched) {
            setCreatorProfile(matched);
          }
        }
      } catch (err) {
        console.warn('Failed to load roster creator details', err);
      }
    }

    if (user?.email) {
      loadCreatorRoster();
      fetchToolHistory();
    }
  }, [user]);

  const fetchToolHistory = async () => {
    try {
      const { data } = await supabase
        .from('tool_downloads')
        .select('*, tools(title, category)')
        .eq('email', user?.email)
        .order('created_at', { ascending: false })
        .limit(5);
      setToolHistory(data || []);
    } catch {
      setToolHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070B11]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-cyan-400" />
          <p className="text-slate-400 text-sm font-bold">Loading your creator profile…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const isExclusiveCreator = creatorProfile || user.user_type === 'creator' || user.role === 'creator';

  return (
    <main className="flex min-h-screen flex-col bg-[#070B11] text-white">
      <Navbar />

      {/* Welcome Toast */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl bg-cyan-500/15 border border-cyan-400/40 backdrop-blur-xl"
          >
            <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <p className="text-white font-bold text-sm">Welcome back to Creator Nest! Your profile is verified. 🚀</p>
            <button onClick={() => setShowWelcome(false)} className="text-slate-400 hover:text-white ml-2 cursor-pointer">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-28 pb-24 relative overflow-hidden flex-1">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none bg-cyan-500/10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none bg-emerald-500/10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">

          {/* ── Top User Profile Header ─────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-[#0C121B] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {creatorProfile?.img ? (
                    <img 
                      src={creatorProfile.img} 
                      alt={creatorProfile.name} 
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-xl" 
                    />
                  ) : user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-cyan-400/40" />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-2xl font-black bg-gradient-to-br from-cyan-400 to-blue-600 text-black shadow-lg">
                      {initials}
                    </div>
                  )}
                  {/* Verified Icon on Avatar */}
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center bg-cyan-500 text-black shadow-md border-2 border-[#0C121B]">
                    <BadgeCheck className="w-4 h-4 text-black" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                      {creatorProfile?.name || user.full_name} 
                      {user.onboarding_data?.numeric_id && (
                        <span className="text-slate-400 font-normal text-sm font-mono">
                          ({user.onboarding_data.numeric_id})
                        </span>
                      )}
                    </h1>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md">
                      <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                      ⭐ Verified Exclusive Talent
                    </span>

                    {creatorProfile?.topGrowing && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> High-Growth
                      </span>
                    )}

                    <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: plan.bg, color: plan.color, border: `1px solid ${plan.border}` }}>
                      {plan.label} Plan
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs sm:text-sm mb-1 font-mono">{user.email}</p>
                  <p className="text-xs text-slate-400">
                    {creatorProfile ? `Managed Creator in ${creatorProfile.location || 'India'} • Channel: @${creatorProfile.channelName || creatorProfile.youtubeHandle || 'Creator'}` : typeInfo.desc}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2.5 flex-shrink-0">
                  <Link 
                    href="/tools/brand-deal-calculator" 
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs text-black shadow-lg transition-transform hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #10B981, #00F2FE)' }}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    Calculate My Rate
                  </Link>
                  <button 
                    onClick={logout} 
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-slate-300 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-500/10 border border-white/10 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Plan Perks Strip */}
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Exclusive Creator Representation
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  1-Deal Brand Valuation Enabled
                </div>
                <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Direct Brand Sponsor Pipeline
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── EXCLUSIVE OFFICIAL CREATOR CARD SECTION ────────────────── */}
          {creatorProfile && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Official Creator Roster Card & Verification
                  </h2>
                </div>

                <Link
                  href="/creators/roster"
                  target="_blank"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                >
                  View Public Live Roster <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Verified Creator Card Showcase */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#101A27] via-[#0D1522] to-[#070B11] border border-cyan-500/40 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-center">
                  
                  {/* Left: High-Res Profile Card */}
                  <div className="md:col-span-1">
                    <div className="bg-[#080D14] rounded-2xl border border-white/15 overflow-hidden shadow-2xl group">
                      <div className="relative aspect-[4/5] overflow-hidden bg-white/5 flex items-center justify-center">
                        <img
                          src={creatorProfile.img || '/images/default-avatar.png'}
                          alt={creatorProfile.name}
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080D14] via-transparent to-transparent opacity-90" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px] font-black border border-cyan-400/50 backdrop-blur-md">
                            ⭐ Rank #{creatorProfile.rank || 1}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-black border border-emerald-400/50 backdrop-blur-md">
                            Active Talent
                          </span>
                        </div>

                        {/* Bottom Tag */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-base font-black text-white flex items-center gap-1">
                            {creatorProfile.name}
                            <BadgeCheck className="w-4 h-4 text-cyan-400" />
                          </p>
                          <p className="text-xs text-red-400 font-bold flex items-center gap-1 mt-0.5">
                            <Tv className="w-3.5 h-3.5" />
                            @{creatorProfile.channelName || 'Election Guide'}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-4 border-t border-white/10 bg-[#0A101A] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Location:</span>
                          <span className="text-slate-200 font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {creatorProfile.location || 'Delhi, India'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Commercial Inquiries:</span>
                          <span className="text-cyan-300 font-mono font-bold">collabs@creatornest.in</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Detailed Live Metrics & Bio */}
                  <div className="md:col-span-2 space-y-6">
                    
                    {/* Admin Updated Niches */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Admin-Verified Content Niches
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(creatorProfile.niches || [creatorProfile.niche || 'EdTech & App Reviews']).map((n: string, i: number) => (
                          <span 
                            key={i} 
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm"
                          >
                            🎯 {n}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Official Verified Statistics Grid */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Live Channel Metrics & Benchmarks
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-[#080D14] border border-white/10 text-center">
                          <p className="text-xs text-slate-400 font-bold mb-1">YouTube Subs</p>
                          <p className="text-lg sm:text-xl font-black text-red-400 font-mono">
                            {creatorProfile.youtube || `${creatorProfile.youtubeNum / 1000}K`}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#080D14] border border-white/10 text-center">
                          <p className="text-xs text-slate-400 font-bold mb-1">Instagram</p>
                          <p className="text-lg sm:text-xl font-black text-pink-400 font-mono">
                            {creatorProfile.instagram || `${creatorProfile.instaNum / 1000}K`}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#080D14] border border-white/10 text-center">
                          <p className="text-xs text-slate-400 font-bold mb-1">Avg Views (10)</p>
                          <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                            {Number(creatorProfile.avgViewsLast10 || 40000).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#080D14] border border-white/10 text-center">
                          <p className="text-xs text-slate-400 font-bold mb-1">Audience AVD</p>
                          <p className="text-lg sm:text-xl font-black text-cyan-300 font-mono">
                            {creatorProfile.avd || '82%'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Official Creator Bio */}
                    <div className="p-4 rounded-2xl bg-[#080D14] border border-white/10 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Official Talent Representation Bio
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                        {creatorProfile.bio}
                      </p>
                    </div>

                    {/* Direct Action Hub */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        href="/tools/brand-deal-calculator"
                        className="px-4 py-2.5 rounded-xl font-black text-xs text-black flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #00F2FE, #10B981)' }}
                      >
                        <Calculator className="w-4 h-4" />
                        <span>Run Brand Deal Valuation</span>
                      </Link>

                      <Link
                        href="/nschool/course/17"
                        className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-white/10 hover:bg-white/15 border border-white/10 flex items-center gap-2 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        <span>Sponsorship Masterclass</span>
                      </Link>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Stats Row ──────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Download} label="Tools Downloaded" value={toolHistory.length} color="#00F2FE" />
            <StatCard icon={BookOpen} label="Creator Skool Courses" value={1} color="#8B5CF6" />
            <StatCard icon={Zap} label="Calculations Run" value={1} color="#F59E0B" />
            <StatCard icon={Briefcase} label="Active Brand Deals" value="Verified" color="#10B981" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left Column ──────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Creator Growth & Tool Hub */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                <div className="bg-[#0C121B] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">Creator Monetization & Growth Hub</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Tools, rate calculators, and resources for your channel growth</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Link
                      href="/tools/brand-deal-calculator"
                      className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#131E2D] to-[#0A1019] border border-emerald-500/30 hover:border-emerald-400 transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          Live 2026 Engine
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          Brand Deal Price Calculator
                        </h4>
                        <p className="text-xs text-slate-400">Calculate dedicated video & reel pricing in ₹</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/nschool/course/17"
                      className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-[#131E2D] to-[#0A1019] border border-purple-500/30 hover:border-purple-400 transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                          Creator Skool
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                          Understand Brand Deals Masterclass
                        </h4>
                        <p className="text-xs text-slate-400">10 Reading chapters in English & हिंदी</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Tool Downloads History */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                <div className="bg-[#0C121B] border border-white/10 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white">Tools & Resources Downloaded</h2>
                    <Link href="/tools" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                      Browse All <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {historyLoading ? (
                    <div className="py-8 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin border-cyan-400" />
                    </div>
                  ) : toolHistory.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {toolHistory.map((item) => (
                        <div key={item.id} className="py-3.5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-white">{item.tools?.title || 'Creator Tool'}</p>
                            <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            Downloaded
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No tool downloads recorded yet. Browse the Marketplace to download AI tools and templates.
                    </div>
                  )}
                </div>
              </motion.div>

            </div>

            {/* ── Right Column ─────────────────────────────── */}
            <div className="space-y-6">
              
              {/* Official Agency Booking Box */}
              <div className="p-6 rounded-3xl bg-[#0C121B] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Shield className="w-5 h-5" />
                  <h3 className="font-bold text-white text-base">Agency Representation</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your channel is represented under Creator Nest Talent Management. All inbound sponsor inquiries and contracts are screened for guaranteed payment terms (Net-30 & TDS 194J compliance).
                </p>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exclusive Agency:</span>
                    <span className="text-white font-bold">Creator Nest</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inquiry Email:</span>
                    <span className="text-cyan-300 font-mono font-bold">collabs@creatornest.in</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Protection:</span>
                    <span className="text-emerald-400 font-bold">100% Guaranteed</span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="p-6 rounded-3xl bg-[#0C121B] border border-white/10 shadow-xl space-y-3">
                <h3 className="font-bold text-white text-sm">Quick Navigation</h3>
                <div className="space-y-2 text-xs">
                  <Link href="/creators/roster" className="block p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors">
                    🌐 View Public Talent Roster
                  </Link>
                  <Link href="/marketplace" className="block p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors">
                    🛍️ Explore AI Marketplace & Creator Skool
                  </Link>
                  <Link href="/tools/brand-deal-calculator" className="block p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors">
                    🧮 Check Rate Card & Deliverable Pricing
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#070B11]">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-cyan-400" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
