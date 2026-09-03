'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, BookOpen, Wrench, Grid3X3, Search, Star,
  Lock, Zap, Crown, ArrowRight, FileText, Flame, ShieldCheck,
  SlidersHorizontal, ArrowUpRight, X
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

import { ITEMS } from './marketData';
import { supabase } from '@/lib/supabase';
import { getUUIDFromStaticId } from '@/lib/uuidHelper';
import * as Lucide from 'lucide-react';

const getLucideIcon = (iconName: any) => {
  if (!iconName) return Lucide.Sparkles;
  if (typeof iconName !== 'string') return iconName;
  return (Lucide as any)[iconName] || Lucide.Sparkles;
};

type TabId = 'all' | 'tools' | 'courses' | 'services' | 'templates';

const PLAN_ORDER: Record<string, number>  = { free: 0, silver: 1, gold: 2, platinum: 3 };
const PLAN_COLORS: Record<string, string> = { free: '#10B981', silver: '#94A3B8', gold: '#F59E0B', platinum: '#00F2FE' };
const PLAN_LABELS: Record<string, string> = { free: 'Free', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' };

// ── Spacious, High-Impact Resource Card ──────────────────────────────────────
function ResourceCard({ item, userTier, isHindi }: { item: any; userTier: string; isHindi: boolean }) {
  const Icon = getLucideIcon(item.icon);
  const locked = PLAN_ORDER[item.plan] > PLAN_ORDER[(userTier as keyof typeof PLAN_ORDER) ?? 'free'];
  const accentColor = item.accent || '#00F2FE';

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'tool': return { label: isHindi ? 'एआई टूल' : 'AI Tool', color: '#00F2FE', bg: 'rgba(0,242,254,0.15)', border: 'rgba(0,242,254,0.35)' };
      case 'course': return { label: isHindi ? 'क्रिएटर स्कूल' : 'Creator Skool', color: '#A78BFA', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.35)' };
      case 'service': return { label: isHindi ? 'सर्विस' : 'Service', color: '#FBBF24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.35)' };
      case 'template': return { label: isHindi ? 'टेम्पलेट' : 'Template', color: '#34D399', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.35)' };
      default: return { label: isHindi ? 'रिसोर्स' : 'Resource', color: '#00F2FE', bg: 'rgba(0,242,254,0.15)', border: 'rgba(0,242,254,0.35)' };
    }
  };

  const typeInfo = getTypeBadge(item.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -5 }}
      className="bg-[#0B0F15] rounded-2xl border border-white/12 hover:border-primary/50 transition-all duration-300 group shadow-lg hover:shadow-[0_0_25px_rgba(0,242,254,0.2)] relative flex flex-col justify-between overflow-hidden p-5 sm:p-6"
    >
      {/* Top Accent Gradient Line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      {/* Ambient background glow */}
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: accentColor }}
      />

      <div>
        {/* Card Header: Icon + Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105 shadow-inner"
            style={{
              background: `${accentColor}20`,
              borderColor: `${accentColor}40`,
              color: accentColor
            }}
          >
            <Icon className="w-6 h-6 drop-shadow-[0_0_8px_currentColor]" />
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {item.badge ? (
              <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-wider bg-white/15 text-white border border-white/25 shadow-sm">
                {item.badge}
              </span>
            ) : null}
            <span
              className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border"
              style={{
                background: typeInfo.bg,
                color: typeInfo.color,
                borderColor: typeInfo.border
              }}
            >
              {typeInfo.label}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-extrabold text-white text-base sm:text-lg mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-1">
          {item.title}
        </h3>
        
        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2 min-h-[40px] font-normal">
          {item.desc}
        </p>
      </div>

      {/* Card Footer: Rating, Meta & CTA */}
      <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 font-bold">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span>{item.rating ? Number(item.rating).toFixed(1) : '4.9'}</span>
            </div>
            {item.meta && (
              <span className="text-gray-400 truncate max-w-[140px] sm:max-w-[180px] ml-1">
                • {item.meta}
              </span>
            )}
          </div>

          {item.price > 0 ? (
            <span className="font-black text-white">
              ₹{item.price.toLocaleString('en-IN')}
            </span>
          ) : (
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-xs">
              {isHindi ? 'मुफ्त एक्सेस' : 'Free Access'}
            </span>
          )}
        </div>

        {/* Action Button */}
        {locked ? (
          <Link
            href="/pricing"
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-white/20 text-gray-200 hover:text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-yellow-400" />
            <span>{isHindi ? 'अनलॉक के लिए अपग्रेड करें' : 'Upgrade to Unlock'}</span>
          </Link>
        ) : (
          <Link
            href={item.href || `/marketplace/item/${item.id}`}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-[#05080E] text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] group/btn cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #00c8d8)`,
              boxShadow: `0 0 20px ${accentColor}30`
            }}
          >
            <span>{item.cta || (isHindi ? 'रिसोर्स खोलें' : 'Open Resource')}</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// ── Compact Trending Spotlight ────────────────────────────────────────────────
function TrendingSpotlight({ items, isHindi }: { items: any[]; isHindi: boolean }) {
  const topTool = items.find(i => i.id === 't1' || i.type === 'tool' || i.id === 'brand-deal-calculator') || items[0];
  const topCourse = items.find(i => i.id === 'c17' || i.id === '17' || i.type === 'course') || items[1];
  const topService = items.find(i => i.id === 's1' || i.type === 'service') || items[2];

  const highlights = [
    {
      item: topTool,
      tag: isHindi ? '🔥 #1 एआई टूल' : '🔥 #1 AI Tool',
      color: '#00F2FE',
      bg: 'from-cyan-500/15 via-surface/80 to-[#0B0F15]',
      border: 'border-cyan-500/30'
    },
    {
      item: topCourse,
      tag: isHindi ? '⭐ फ्लैगशिप क्रिएटर स्कूल' : '⭐ Flagship Creator Skool',
      color: '#A78BFA',
      bg: 'from-purple-500/15 via-surface/80 to-[#0B0F15]',
      border: 'border-purple-500/30'
    },
    {
      item: topService,
      tag: isHindi ? '⚡ टॉप सर्विस' : '⚡ In-Demand Service',
      color: '#FBBF24',
      bg: 'from-amber-500/15 via-surface/80 to-[#0B0F15]',
      border: 'border-amber-500/30'
    }
  ].filter(h => h.item);

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shadow-inner">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <h2 className="text-sm sm:text-base font-black text-white">
          {isHindi ? 'ट्रेंडिंग स्पॉटलाइट' : 'Trending Spotlight'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {highlights.map((h, idx) => {
          const it = h.item;
          const Icon = getLucideIcon(it.icon);
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className={`p-4 rounded-2xl bg-gradient-to-r ${h.bg} border ${h.border} flex items-center gap-3.5 shadow-md relative overflow-hidden group`}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                style={{ background: `${h.color}20`, borderColor: `${h.color}40`, color: h.color }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider block mb-0.5" style={{ color: h.color }}>
                  {h.tag}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                  {it.title}
                </h4>
                <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                  {it.desc}
                </p>
              </div>
              <Link 
                href={it.href || (it.type === 'tool' ? `/marketplace/tool/${it.id}` : `/marketplace/item/${it.id}`)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Marketplace Page Component ──────────────────────────────────────────
export default function MarketplacePage() {
  const { user } = useAuth();
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('featured');

  const TABS: { id: TabId; label: string; icon: any; color: string; activeBg: string; activeBorder: string }[] = useMemo(() => [
    { id: 'all',       label: isHindi ? 'सभी रिसोर्सेज' : 'All Resources', icon: Grid3X3,  color: '#00F2FE', activeBg: 'linear-gradient(135deg, rgba(0,242,254,0.25), rgba(0,242,254,0.08))', activeBorder: '#00F2FE' },
    { id: 'tools',     label: isHindi ? 'एआई टूल्स' : 'AI Tools',      icon: Brain,    color: '#00F2FE', activeBg: 'linear-gradient(135deg, rgba(0,242,254,0.25), rgba(0,242,254,0.08))', activeBorder: '#00F2FE' },
    { id: 'courses',   label: isHindi ? 'क्रिएटर स्कूल' : 'Creator Skool',  icon: BookOpen, color: '#A78BFA', activeBg: 'linear-gradient(135deg, rgba(167,139,250,0.28), rgba(167,139,250,0.08))', activeBorder: '#A78BFA' },
    { id: 'services',  label: isHindi ? 'सर्विसेज' : 'Services',      icon: Wrench,   color: '#FBBF24', activeBg: 'linear-gradient(135deg, rgba(251,191,36,0.28), rgba(251,191,36,0.08))', activeBorder: '#FBBF24' },
    { id: 'templates', label: isHindi ? 'टेम्पलेट्स' : 'Templates',     icon: FileText, color: '#34D399', activeBg: 'linear-gradient(135deg, rgba(52,211,153,0.28), rgba(52,211,153,0.08))', activeBorder: '#34D399' },
  ], [isHindi]);

  const [items, setItems] = useState<any[]>(() => {
    return ITEMS.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      desc: item.desc,
      category: item.category,
      icon: item.icon,
      accent: item.accent,
      plan: item.plan,
      price: 0,
      rating: item.rating || 5.0,
      thumbnail_url: item.thumbnailUrl || '',
      href: item.href || (item.type === 'tool' ? `/marketplace/tool/${item.id}` : item.type === 'service' ? `/marketplace/services/${item.id}` : item.type === 'course' ? `/nschool/course/${item.id}` : `/marketplace/item/${item.id}`),
      tags: item.tags || [],
      badge: item.badge || '',
      cta: item.cta || 'Open'
    }));
  });

  const userTier = user?.plan_tier ?? 'free';

  // Load from LocalStorage and Supabase
  useEffect(() => {
    const loadAll = async () => {
      let cachedMarket = [];
      let cachedCourses = [];
      
      if (typeof window !== 'undefined') {
        const m = localStorage.getItem('cn_market_items');
        if (m) cachedMarket = JSON.parse(m);
        const c = localStorage.getItem('cn_courses');
        if (c) cachedCourses = JSON.parse(c);
      }

      const localCombined = [
        ...cachedMarket.map((item: any) => ({
          id: item.id,
          type: item.item_type,
          title: item.title,
          desc: item.short_desc,
          category: item.category,
          icon: getLucideIcon(item.icon),
          accent: item.accent || '#00F2FE',
          plan: item.plan || 'free',
          price: item.price || 0,
          rating: item.rating || 4.9,
          thumbnail_url: item.thumbnail_url,
          href: item.item_type === 'service' ? `/marketplace/services/${item.id}` : `/marketplace/item/${item.id}`,
          tags: item.tags || [],
          badge: item.features?.badge || item.tags?.[0] || '',
          cta: item.item_type === 'service' ? 'Book Service' : 'Open Tool'
        })),
        ...cachedCourses.map((item: any) => ({
          id: item.id,
          type: 'course',
          title: item.title,
          desc: item.short_desc,
          category: item.category,
          icon: Lucide.BookOpen,
          accent: item.accent || '#A78BFA',
          plan: item.plan || 'free',
          price: item.price || 0,
          rating: parseFloat(item.rating) || 4.9,
          thumbnail_url: item.thumbnail_url,
          href: `/nschool/course/${item.id}`,
          tags: item.tags || [],
          badge: item.level || 'Masterclass',
          cta: 'Enroll Free'
        }))
      ];

      if (localCombined.length > 0) {
        setItems(localCombined);
      }

      try {
        const { data: dbItems } = await supabase
          .from('market_items')
          .select('*')
          .eq('is_published', true);

        const { data: dbCourses } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true);

        const mergedItems = [
          ...(dbItems || []).map(item => ({
            id: item.id,
            type: item.item_type,
            title: item.title,
            desc: item.short_desc,
            category: item.category,
            icon: getLucideIcon(item.icon),
            accent: item.accent || '#00F2FE',
            plan: item.plan || 'free',
            price: item.price || 0,
            rating: item.rating || 4.9,
            thumbnail_url: item.thumbnail_url,
            href: item.item_type === 'service' ? `/marketplace/services/${item.id}` : `/marketplace/item/${item.id}`,
            tags: item.tags || [],
            badge: item.features?.badge || item.tags?.[0] || '',
            cta: item.item_type === 'service' ? 'Book Service' : 'Open Tool'
          })),
          ...(dbCourses || []).map(item => ({
            id: item.id,
            type: 'course',
            title: item.title,
            desc: item.short_desc,
            category: item.category,
            icon: Lucide.BookOpen,
            accent: item.accent || '#A78BFA',
            plan: item.plan || 'free',
            price: item.price || 0,
            rating: parseFloat(item.rating) || 4.9,
            thumbnail_url: item.thumbnail_url,
            href: `/nschool/course/${item.id}`,
            tags: item.tags || [],
            badge: item.level || 'Masterclass',
            cta: 'Enroll Free'
          }))
        ];

        if (mergedItems.length > 0) {
          setItems(mergedItems);
        }
      } catch (err) {
        console.warn("Offline loading database items, keeping cache", err);
      }
    };
    loadAll();
  }, []);

  // Filter and Sort Logic
  const filtered = useMemo(() => {
    let list = [...items];

    // Filter by Tab
    if (activeTab !== 'all') {
      const typeMap: Record<TabId, string> = { all: '', tools: 'tool', courses: 'course', services: 'service', templates: 'template' };
      list = list.filter((i) => i.type === typeMap[activeTab]);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => 
        i.title.toLowerCase().includes(q) || 
        i.desc.toLowerCase().includes(q) || 
        i.tags?.some((t: any) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'free') {
      list.sort((a, b) => (a.plan === 'free' ? -1 : 1));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [activeTab, search, sortBy, items]);

  return (
    <main className="flex min-h-screen flex-col bg-[#070B11] text-white overflow-x-hidden">
      <Navbar />

      {/* ─── Very Compact Hero Section ─── */}
      <section className="relative pt-24 pb-4 sm:pt-28 sm:pb-6 overflow-hidden border-b border-white/10">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[200px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-4 right-1/4 w-[350px] h-[200px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
            
            {/* Title & Short Tagline */}
            <div className="space-y-1 sm:space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 bg-primary/15 border border-primary/30 rounded-full px-2.5 py-0.5 w-fit">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                  {isHindi ? 'क्रिएटर ग्रोथ मार्केटप्लेस' : 'Creator Growth Marketplace'}
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Creator Nest <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-purple-400">{isHindi ? 'मार्केटप्लेस' : 'Marketplace'}</span>
              </h1>

              <p className="text-gray-300 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 max-w-xl font-normal">
                {isHindi 
                  ? 'सत्यापित एआई टूल्स, सर्टिफाइड मास्टरक्लासेस, प्रोडक्शन सर्विसेज और हाई-कन्वर्टिंग क्रिएटर टेम्पलेट्स।'
                  : 'Curated AI tools, certified masterclasses, production services, and high-converting creator templates.'
                }
              </p>
            </div>

            {/* User Plan Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141E2C] border border-white/20 text-xs shrink-0 self-start sm:self-center">
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-gray-300 text-[11px] font-bold">{isHindi ? 'प्लान:' : 'Plan:'}</span>
              <span className="text-white font-extrabold capitalize text-[11px]">{userTier}</span>
              {!user ? (
                <Link
                  href="/login"
                  className="ml-1 px-2.5 py-0.5 rounded-md bg-primary text-[#05080E] text-[10px] font-black hover:opacity-95"
                >
                  {isHindi ? 'लॉग इन' : 'Sign In'}
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="ml-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold"
                >
                  {isHindi ? 'मैनेज' : 'Manage'}
                </Link>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ─── Main Content Section ─── */}
      <section className="py-5 sm:py-7 flex-1">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

          {/* 1. Trending Spotlight (Shown when no active search) */}
          {!search && activeTab === 'all' && (
            <TrendingSpotlight items={items} isHindi={isHindi} />
          )}

          {/* 2. Very Big Category Tabs */}
          <div className="space-y-4">
            
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2 sm:gap-3 w-full px-1 sm:px-2 py-1.5">
              {TABS.map(({ id, label, icon: Icon, color, activeBg, activeBorder }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 min-w-[135px] md:min-w-0 flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-2xl text-xs sm:text-sm md:text-base font-black transition-all border cursor-pointer select-none text-center ${
                      active
                        ? 'text-white shadow-[0_0_25px_rgba(0,242,254,0.35)] ring-2 ring-primary/60 scale-[1.01]'
                        : 'bg-[#182333] hover:bg-[#24334A] border-white/20 text-slate-100 hover:text-white shadow-md'
                    }`}
                    style={active ? {
                      background: activeBg,
                      borderColor: activeBorder,
                      color: '#ffffff'
                    } : {}}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 drop-shadow-sm" style={{ color: active ? color : color }} />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Companion Search & Sort Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#141E2C] border border-white/20 shadow-md">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="text"
                  placeholder={isHindi ? "टूल्स, कोर्सेज, टेम्पलेट्स खोजें..." : "Search resources, tools, courses..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#1E2B3D] border border-white/20 text-xs sm:text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white text-xs p-1 bg-white/10 rounded-full"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown & Result Count */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-xs text-gray-300 font-semibold">
                  {isHindi ? 'दिखाए जा रहे:' : 'Showing'} <strong className="text-primary font-black">{filtered.length}</strong> {isHindi ? 'आइटम्स' : 'items'}
                </span>

                <div className="flex items-center gap-1.5 bg-[#1E2B3D] border border-white/20 rounded-xl px-3 py-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="featured" className="bg-[#1E2B3D]">{isHindi ? 'फीचर्ड' : 'Featured'}</option>
                    <option value="rating" className="bg-[#1E2B3D]">{isHindi ? 'टॉप रेटेड' : 'Top Rated'}</option>
                    <option value="free" className="bg-[#1E2B3D]">{isHindi ? 'फ्री पहले' : 'Free First'}</option>
                    <option value="name" className="bg-[#1E2B3D]">{isHindi ? 'नाम (A-Z)' : 'Name A-Z'}</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* 3. 3-Per-Row Grid */}
          <div>
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-[#0B0F15] rounded-3xl border border-white/10 p-8 shadow-inner">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10 text-gray-400">
                  <Search className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isHindi ? 'कोई रिसोर्स नहीं मिला' : 'No resources found'}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  {isHindi ? 'अलग शब्द से खोजें या फ़िल्टर रीसेट करें।' : "Try adjusting your search terms or switch categories to explore other tools."}
                </p>
                <button
                  onClick={() => { setSearch(''); setActiveTab('all'); }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-[#05080E] text-xs font-bold shadow-lg hover:opacity-95 cursor-pointer"
                >
                  {isHindi ? 'सभी रिसोर्सेज देखें' : 'View All Resources'}
                </button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                <AnimatePresence>
                  {filtered.map((item) => (
                    <ResourceCard key={item.id} item={item} userTier={userTier} isHindi={isHindi} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
