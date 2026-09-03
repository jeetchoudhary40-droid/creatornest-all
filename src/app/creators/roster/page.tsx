'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck, Search, Filter, Video, Camera, TrendingUp,
  MapPin, Trophy, Crown, Medal, Star, X, SlidersHorizontal, Handshake, Loader2, Tv
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { niches, platforms, subscriberTiers, sorts, allCreators as staticCreators } from './rosterData';
import { supabase } from '@/lib/supabase';

// Our dynamically mapped creator type
export type CreatorType = {
  id: string;
  name: string;
  channelName?: string;
  niche: string;
  niches?: string[];
  youtube: string;
  youtubeNum: number;
  instagram: string;
  instaNum: number;
  avd: string;
  avgViewsLast10?: number | string;
  location: string;
  featured: boolean;
  topGrowing: boolean;
  platform: 'Youtube' | 'Instagram' | 'Both';
  img: string;
  bio: string;
  rank?: number;
  show_on_home?: boolean;
  show_on_roster?: boolean;
  
  // CRM and Stats fields
  contactPhone?: string;
  whatsappNumber?: string;
  businessEmail?: string;
  youtubeUrl?: string;
  youtubeHandle?: string;
  instaUrl?: string;
  instaHandle?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
};

/* ───────── Leaderboard Card ───────── */
function LeaderboardCard({ creator, index }: { creator: CreatorType; index: number }) {
  const rankIcon = index === 0
    ? <Crown className="w-5 h-5 text-yellow-400" />
    : index === 1
      ? <Medal className="w-5 h-5 text-gray-300" />
      : index === 2
        ? <Medal className="w-5 h-5 text-amber-600" />
        : <span className="text-xs font-black text-gray-500 w-5 text-center">#{index + 1}</span>;

  const ringColor = index === 0
    ? 'ring-yellow-400/60 shadow-[0_0_14px_rgba(250,204,21,0.2)]'
    : index === 1 ? 'ring-gray-300/40' : index === 2 ? 'ring-amber-600/40' : 'ring-white/10';

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all group cursor-pointer
        ${index < 3 ? 'bg-surface/80 border border-white/8 hover:border-primary/30' : 'hover:bg-surface/40'}
      `}
    >
      <div className="w-6 sm:w-7 shrink-0 flex justify-center">{rankIcon}</div>
      <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 shrink-0 bg-white/5 flex items-center justify-center ${ringColor}`}>
        {creator.img ? (
          <Image src={creator.img} alt={creator.name} fill unoptimized className="object-cover object-top" sizes="56px" />
        ) : (
          <span className="text-base sm:text-lg font-bold text-primary">{creator.name.charAt(0)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-primary transition-colors">{creator.name}</span>
          <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          {creator.topGrowing && <TrendingUp className="w-3 h-3 text-green-400 shrink-0" />}
        </div>
        {creator.channelName && (
          <span className="text-[10px] text-gray-400 truncate block">
            {creator.channelName}
          </span>
        )}
        <span className="text-[11px] sm:text-xs text-gray-500 truncate block">
          {creator.niche}
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-right">
        {creator.youtube && creator.youtube !== '0' && (
          <div className="text-right">
            <span className="text-[9px] sm:text-xs font-extrabold block text-red-400 tracking-wide">YT</span>
            <span className="text-xs sm:text-sm font-bold text-white">{creator.youtube}</span>
          </div>
        )}
        {creator.instagram && creator.instagram !== '0' && (
          <div className="text-right">
            <span className="text-[9px] sm:text-xs font-extrabold block text-pink-400 tracking-wide">IG</span>
            <span className="text-xs sm:text-sm font-bold text-white">{creator.instagram}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ───────── Creator Card with Refined Single-Line Stats ───────── */
function CreatorCard({ creator }: { creator: CreatorType }) {
  const displayNiches = creator.niches && creator.niches.length > 0 ? creator.niches : [creator.niche];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-[#0B0F15] rounded-2xl border border-white/10 hover:border-primary/40 transition-all group shadow-xl hover:shadow-[0_0_30px_rgba(0,242,254,0.2)] relative flex flex-col overflow-hidden"
    >
      {/* Image Area */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-white/5 flex items-center justify-center">
        {creator.img ? (
          <Image
            src={creator.img}
            alt={creator.name}
            fill
            unoptimized
            sizes="(max-width:640px) 50vw, (max-width:1200px) 33vw, 25vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <span className="text-5xl font-bold text-primary">{creator.name.charAt(0)}</span>
        )}

        {/* Ambient Dark Gradient for Non-Hover State */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F15] via-[#0B0F15]/40 to-transparent opacity-90 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />

        {/* Smaller Top Badges (Trending / Top Rated) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
          {creator.topGrowing ? (
            <span className="bg-emerald-500/25 backdrop-blur-md border border-emerald-500/50 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center shadow-md">
              <TrendingUp className="w-2.5 h-2.5 mr-1 text-emerald-400" /> Trending
            </span>
          ) : <span />}
          <div className="flex gap-1 items-center">
            {creator.featured && (
              <span className="bg-yellow-400/25 backdrop-blur-md border border-yellow-400/50 text-yellow-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center shadow-md">
                <Trophy className="w-2.5 h-2.5 mr-1 text-yellow-400" /> Top Rated
              </span>
            )}
          </div>
        </div>

        {/* Default Name, Channel & Single Primary Niche Overlay */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 group-hover:opacity-0 group-hover:translate-y-2 transition-all duration-300 pointer-events-none flex flex-col gap-0.5">
          {/* Full Creator Name + Verified Badge */}
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center drop-shadow-md">
            <span className="truncate">{creator.name}</span>
            <BadgeCheck className="w-4 h-4 text-primary ml-1 shrink-0 drop-shadow-[0_0_6px_rgba(0,242,254,0.6)]" />
          </h3>

          {/* Channel Name */}
          {creator.channelName && (
            <p className="text-[11px] text-gray-300 font-medium truncate flex items-center gap-1">
              <Tv className="w-3 h-3 text-red-400 shrink-0" />
              <span>{creator.channelName}</span>
            </p>
          )}

          {/* Primary Niche Only */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-200 border border-white/15">
              {displayNiches[0]}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-gray-300 font-medium drop-shadow ml-auto">
              <MapPin className="w-3 h-3 text-primary" />
              {creator.location}
            </span>
          </div>
        </div>

        {/* Polished Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06090F]/95 via-[#06090F]/85 to-[#06090F]/60 backdrop-blur-[1.5px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex flex-col justify-between p-3.5 sm:p-4 border-b border-primary/20">
          {/* Top Header */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center drop-shadow-md mb-0.5">
              <span className="truncate">{creator.name}</span>
              <BadgeCheck className="w-4 h-4 text-primary ml-1 shrink-0 drop-shadow-[0_0_6px_rgba(0,242,254,0.6)]" />
            </h3>

            {creator.channelName && (
              <p className="text-xs text-red-400 font-semibold mb-1 flex items-center gap-1">
                <Tv className="w-3 h-3" />
                <span>{creator.channelName}</span>
              </p>
            )}

            {/* Single Primary Niche Tag on Hover */}
            <div className="mb-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40 inline-block">
                {displayNiches[0]}
              </span>
            </div>
            
            <p className="text-xs leading-relaxed text-gray-200 line-clamp-3 font-medium">
              {creator.bio}
            </p>
          </div>

          {/* Action Button & Direct Social Links */}
          <div className="space-y-2">
            {/* Avg Views or AVD */}
            {creator.avd ? (
              <div className="flex items-center justify-between px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px]">
                <span className="text-gray-300 font-medium">Avg Retention:</span>
                <span className="font-black text-emerald-400">{creator.avd}</span>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <Link
                href={`/contact?creator=${encodeURIComponent(creator.name)}`}
                className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-primary via-cyan-300 to-primary hover:from-cyan-300 hover:to-primary text-[#05080E] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-[0.98]"
              >
                <Handshake className="w-3.5 h-3.5 text-[#05080E] shrink-0" />
                <span>Want to Collab</span>
              </Link>
              
              {creator.youtubeUrl && (
                <a
                  href={creator.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-black/50 hover:bg-black/80 border border-white/20 text-white hover:text-primary transition-all shrink-0"
                  title="View YouTube Channel"
                >
                  <Video className="w-3.5 h-3.5 text-red-500" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Single-Line Compact Platform Stats Bar */}
      <div className="p-2 sm:p-2.5 bg-[#080B10]">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/5">
          {/* YouTube */}
          <div className="flex items-center space-x-1.5 min-w-0">
            <Video className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-black text-white leading-none">{creator.youtube}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">YT</span>
            </div>
          </div>

          <div className="h-3 w-[1px] bg-white/10 shrink-0" />

          {/* Instagram */}
          <div className="flex items-center space-x-1.5 min-w-0">
            <Camera className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-black text-white leading-none">{creator.instagram}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">IG</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────── Filter Checkbox ───────── */
function FilterCheckbox({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button onClick={onClick} className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${active ? 'bg-primary/15 text-primary font-semibold border border-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${active ? 'bg-primary border-primary' : 'border-white/20'}`}>
          {active && <div className="w-1 h-1 bg-background rounded-sm" />}
        </div>
        <span>{label}</span>
      </div>
      {count !== undefined && <span className={`text-[10px] px-1.5 py-px rounded-full ${active ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-500'}`}>{count}</span>}
    </button>
  );
}

/* ───────── Main Page ───────── */
export default function RosterPage() {
  const [allCreators, setAllCreators] = useState<CreatorType[]>(() => {
    return staticCreators.map(c => ({
      id: String(c.id),
      name: c.name,
      channelName: c.channelName || c.youtubeHandle?.replace(/^@/, '') || '',
      niche: c.niche,
      niches: c.niches && c.niches.length > 0 ? c.niches : [c.niche],
      youtube: c.youtube,
      youtubeNum: c.youtubeNum,
      instagram: c.instagram,
      instaNum: c.instaNum,
      avd: c.avd,
      avgViewsLast10: c.avgViewsLast10 || 0,
      location: c.location,
      featured: c.featured,
      topGrowing: c.topGrowing,
      platform: c.platform,
      img: c.img,
      bio: c.bio,
      contactPhone: '',
      whatsappNumber: '',
      businessEmail: '',
      youtubeUrl: '',
      youtubeHandle: '',
      instaUrl: '',
      instaHandle: '',
      linkedinUrl: '',
      twitterUrl: '',
      websiteUrl: '',
    }));
  });
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeNiche, setActiveNiche] = useState("All");
  const [activePlatform, setActivePlatform] = useState("All");
  const [activeTier, setActiveTier] = useState(0);
  const [sortBy, setSortBy] = useState("Highest Subs");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const loadRoster = async () => {
      try {
        // Fetch live creator roster from persistent API (/api/admin/roster)
        const res = await fetch('/api/admin/roster');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.creators) && json.creators.length > 0) {
            const visible = json.creators.filter((c: any) => c.show_on_roster !== false);
            const mapped = visible.map((c: any) => {
              const nichesList: string[] = Array.isArray(c.niches) && c.niches.length > 0
                ? c.niches
                : (c.niche ? String(c.niche).split(',').map((s: string) => s.trim()).filter(Boolean) : ['AI & Automation']);

              return {
                id: String(c.id),
                name: c.name,
                channelName: c.channelName || c.youtubeHandle?.replace(/^@/, '') || '',
                niche: nichesList[0] || c.niche || 'AI & Automation',
                niches: nichesList,
                youtube: c.youtube || '0',
                youtubeNum: Number(c.youtubeNum) || 0,
                instagram: c.instagram || '0',
                instaNum: Number(c.instaNum) || 0,
                avd: c.avd || '',
                avgViewsLast10: Number(c.avgViewsLast10) || 0,
                location: c.location || 'India',
                featured: Boolean(c.featured),
                topGrowing: Boolean(c.topGrowing),
                platform: c.platform || 'Both',
                img: c.img || '',
                bio: c.bio || '',
                rank: Number(c.rank) || 999,
                show_on_home: Boolean(c.show_on_home),
                show_on_roster: c.show_on_roster !== false,
                contactPhone: c.contactPhone || '',
                whatsappNumber: c.whatsappNumber || '',
                businessEmail: c.businessEmail || '',
                youtubeUrl: c.youtubeUrl || '',
                youtubeHandle: c.youtubeHandle || '',
                instaUrl: c.instaUrl || '',
                instaHandle: c.instaHandle || '',
              };
            });
            setAllCreators(mapped as any);
            return;
          }
        }
      } catch (apiErr) {
        console.warn('Could not fetch dynamic roster, using static data', apiErr);
      }
    };
    loadRoster();
  }, []);

  const activeFilterCount = [activeNiche !== "All", activePlatform !== "All", activeTier > 0].filter(Boolean).length;
  const clearAll = () => { setSearchQuery(""); setActiveNiche("All"); setActivePlatform("All"); setActiveTier(0); };

  const leaderboard = useMemo(() => {
    const list = [...allCreators].filter(c => c.featured || c.show_on_home);
    return list.sort((a: any, b: any) => {
      const rankA = Number((a as any).rank) || 999;
      const rankB = Number((b as any).rank) || 999;
      return rankA - rankB;
    }).slice(0, 10);
  }, [allCreators]);

  const filteredCreators = useMemo(() => {
    let result = [...allCreators];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.channelName && c.channelName.toLowerCase().includes(q)) ||
        c.niche.toLowerCase().includes(q) ||
        (c.niches && c.niches.some(n => n.toLowerCase().includes(q)))
      );
    }
    if (activeNiche !== "All") {
      result = result.filter(c =>
        c.niche === activeNiche || (c.niches && c.niches.includes(activeNiche))
      );
    }
    if (activePlatform !== "All") result = result.filter(c => c.platform === activePlatform || c.platform === "Both");
    const tierMin = subscriberTiers[activeTier]?.min ?? 0;
    if (tierMin > 0) result = result.filter(c => c.youtubeNum >= tierMin || c.instaNum >= tierMin);
    result.sort((a: any, b: any) => {
      if (sortBy === "Highest Subs") {
        const rankA = Number(a.rank) || 999;
        const rankB = Number(b.rank) || 999;
        return rankA - rankB;
      }
      if (sortBy === "Highest AVD") return parseInt(b.avd) - parseInt(a.avd);
      if (sortBy === "Top Growing") return (a.topGrowing === b.topGrowing) ? 0 : a.topGrowing ? -1 : 1;
      if (sortBy === "Name A-Z") return a.name.localeCompare(b.name);
      return 0;
    });
    return result;
  }, [allCreators, searchQuery, activeNiche, activePlatform, activeTier, sortBy]);

  const nicheCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allCreators.length };
    niches.forEach(n => {
      if (n === 'All') return;
      counts[n] = allCreators.filter(c => c.niche === n || (c.niches && c.niches.includes(n))).length;
    });
    return counts;
  }, [allCreators]);

  /* ───── Sidebar ───── */
  const filterContent = (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search creators…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-surface/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors" />
      </div>

      <div className="bg-surface/40 border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-primary" />
            <span className="font-bold text-white text-sm">Filters</span>
          </div>
          {activeFilterCount > 0 && <button onClick={clearAll} className="text-[10px] text-primary hover:text-white transition-colors font-medium">Clear</button>}
        </div>

        <div className="px-3 py-3 space-y-4">
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1.5 flex items-center gap-1"><Video className="w-2.5 h-2.5" /> Platform</p>
            <div className="space-y-0.5">
              {platforms.map(p => <FilterCheckbox key={p} label={p === "All" ? "All Platforms" : p} active={activePlatform === p} onClick={() => setActivePlatform(p)} />)}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1.5 flex items-center gap-1"><Star className="w-2.5 h-2.5" /> Niche</p>
            <div className="space-y-0.5">
              {niches.map(n => <FilterCheckbox key={n} label={n === "All" ? "All Niches" : n} active={activeNiche === n} onClick={() => setActiveNiche(n)} count={nicheCounts[n] || 0} />)}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1.5 flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> Subscribers</p>
            <div className="space-y-0.5">
              {subscriberTiers.map((t, i) => <FilterCheckbox key={t.label} label={t.label === "All" ? "Any Size" : t.label} active={activeTier === i} onClick={() => setActiveTier(i)} />)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface/40 border border-white/5 rounded-xl px-3 py-3">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1"><SlidersHorizontal className="w-2.5 h-2.5" /> Sort By</p>
        <div className="space-y-0.5">
          {sorts.map(s => (
            <button key={s} onClick={() => setSortBy(s)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${sortBy === s ? 'bg-primary/15 text-primary font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero — minimal */}
      <section className="relative pt-24 pb-4 sm:pt-28 sm:pb-5 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">
            The Nest <span className="text-primary italic">Roster</span>
          </motion.h1>
        </div>
      </section>

      {loading ? (
        <div className="flex-1 flex justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Top 10 Leaderboard */}
          {leaderboard.length > 0 && (
            <section className="py-4 sm:py-6 border-b border-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-yellow-400/15 border border-yellow-400/30 shadow-[0_0_16px_rgba(250,204,21,0.15)]">
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">Top 10 <span className="text-primary">Featured</span></h2>
                    <p className="text-sm text-gray-400">Ranked by total reach</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {leaderboard.map((c, i) => <LeaderboardCard key={c.id} creator={c} index={i} />)}
                </div>
              </div>
            </section>
          )}

          {/* Full Roster */}
          <section className="py-4 sm:py-6 flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">Complete <span className="text-primary">Roster</span></h2>
                  <p className="text-xs text-gray-500">Hover on cards to see details</p>
                </div>
                {/* Mobile filter + sort */}
                <div className="flex items-center gap-2 lg:hidden">
                  <button onClick={() => setShowMobileFilters(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-white/10 rounded-lg text-xs font-medium text-white hover:border-primary/30 transition-all">
                    <SlidersHorizontal className="w-3 h-3 text-primary" />
                    Filters
                    {activeFilterCount > 0 && <span className="bg-primary text-background text-[10px] font-bold px-1.5 py-px rounded-full">{activeFilterCount}</span>}
                  </button>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-surface border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-primary/50">
                    {sorts.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Mobile filter drawer */}
              <AnimatePresence>
                {showMobileFilters && (
                  <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setShowMobileFilters(false)} />
                    <motion.div
                      initial={{ x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -280, opacity: 0 }} transition={{ type: "spring", damping: 25 }}
                      className="fixed top-0 left-0 bottom-0 w-[80vw] max-w-[300px] bg-background border-r border-white/10 z-[60] p-4 overflow-y-auto lg:hidden"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white text-sm">Filters & Sort</h3>
                        <button onClick={() => setShowMobileFilters(false)} className="p-1.5 rounded-lg hover:bg-white/5"><X className="w-4 h-4 text-gray-400" /></button>
                      </div>
                      {filterContent}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Mobile Quick Search & Horizontal Niche Filter Bar */}
              <div className="block lg:hidden mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search creators or niche..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-surface/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-9 text-base sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/60 transition-colors shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Horizontal Scrollable Niche Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {niches.map(n => {
                    const isActive = activeNiche === n;
                    return (
                      <button
                        key={n}
                        onClick={() => setActiveNiche(n)}
                        className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-primary text-background shadow-[0_0_15px_rgba(0,242,254,0.35)]'
                            : 'bg-white/[0.04] text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {n === 'All' ? '✨ All Niches' : n}
                        {nicheCounts[n] !== undefined && (
                          <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black/20 text-black font-extrabold' : 'bg-white/10 text-gray-400'}`}>
                            {nicheCounts[n]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-5">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
                  {filterContent}
                </aside>

                {/* Grid */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-4 px-3 py-2 bg-surface/20 border border-white/5 rounded-lg">
                    <span className="text-gray-400 text-xs sm:text-sm">
                      Showing <strong className="text-white">{filteredCreators.length}</strong> creator{filteredCreators.length !== 1 ? 's' : ''}
                    </span>
                    {activeFilterCount > 0 && <button onClick={clearAll} className="text-xs text-primary hover:underline font-semibold">Clear Filters</button>}
                  </div>

                  {filteredCreators.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
                      <AnimatePresence mode="popLayout">
                        {filteredCreators.map(c => <CreatorCard key={c.id} creator={c} />)}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-surface/20 rounded-xl border border-white/5">
                      <Filter className="w-10 h-10 text-white/20 mb-3" />
                      <h3 className="text-base font-bold text-white mb-1">No creators found</h3>
                      <p className="text-gray-400 text-xs max-w-xs">Try adjusting your filters to see more results.</p>
                      <button onClick={clearAll} className="mt-4 text-primary hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">Clear all filters</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  );
}
