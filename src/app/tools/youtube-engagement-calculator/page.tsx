'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Sparkles, ArrowRight, CheckCircle2, AlertCircle,
  HelpCircle, BarChart3, Play, Video, ThumbsUp, MessageSquare, Eye,
  ShieldCheck, Share2, Copy, Check, Calculator, Award, Zap,
  Search, Loader2, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface NicheInfo {
  name: string;
  baseCpmMin: number;
  baseCpmMax: number;
  benchmarkEr: number;
}

const NICHES: Record<string, NicheInfo> = {
  music: { name: 'Music & Songs', baseCpmMin: 90, baseCpmMax: 200, benchmarkEr: 1.5 },
  entertainment: { name: 'Entertainment & Film', baseCpmMin: 120, baseCpmMax: 260, benchmarkEr: 3.0 },
  gaming: { name: 'Gaming & Esports', baseCpmMin: 180, baseCpmMax: 350, benchmarkEr: 4.5 },
  education: { name: 'Education & Civics / Tutorials', baseCpmMin: 220, baseCpmMax: 500, benchmarkEr: 2.2 },
  tech: { name: 'Tech & Gadgets', baseCpmMin: 400, baseCpmMax: 800, benchmarkEr: 3.8 },
  finance: { name: 'Finance & Business', baseCpmMin: 600, baseCpmMax: 1400, benchmarkEr: 3.2 },
  lifestyle: { name: 'Lifestyle & Travel', baseCpmMin: 250, baseCpmMax: 500, benchmarkEr: 3.9 },
  fitness: { name: 'Fitness & Health', baseCpmMin: 300, baseCpmMax: 650, benchmarkEr: 4.0 },
  news: { name: 'News & Current Affairs', baseCpmMin: 100, baseCpmMax: 220, benchmarkEr: 1.8 },
  comedy: { name: 'Comedy & Entertainment', baseCpmMin: 140, baseCpmMax: 280, benchmarkEr: 4.8 },
};

const PRESETS = [
  { label: 'Music & Label (1.2M Views)', views: 1200000, likes: 28000, comments: 1400, niche: 'music' },
  { label: 'Civics / Education (16K Views)', views: 16300, likes: 130, comments: 26, niche: 'education' },
  { label: 'Tech & Reviews (65K Views)', views: 65000, likes: 3800, comments: 420, niche: 'tech' },
  { label: 'Finance & Crypto (40K Views)', views: 40000, likes: 2100, comments: 390, niche: 'finance' },
  { label: 'Viral Gaming (120K Views)', views: 120000, likes: 8900, comments: 1200, niche: 'gaming' },
];

export default function YouTubeEngagementCalculatorPage() {
  const [views, setViews] = useState<number>(45000);
  const [likes, setLikes] = useState<number>(2600);
  const [comments, setComments] = useState<number>(380);
  const [selectedNiche, setSelectedNiche] = useState<string>('tech');
  const [copiedLink, setCopiedLink] = useState(false);

  // YouTube Data API Live Sync State
  const [channelQuery, setChannelQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncedChannel, setSyncedChannel] = useState<any | null>(null);
  const [showVideoTable, setShowVideoTable] = useState(true);

  // Calculations
  const stats = useMemo(() => {
    const safeViews = Math.max(1, views || 0);
    const safeLikes = Math.max(0, likes || 0);
    const safeComments = Math.max(0, comments || 0);

    const totalInteractions = safeLikes + safeComments;
    const er = (totalInteractions / safeViews) * 100;
    const likeRatio = (safeLikes / safeViews) * 100;
    const commentRatio = (safeComments / safeViews) * 100;

    const nicheData = NICHES[selectedNiche] || NICHES.tech;
    
    // Engagement tier grading
    let tier = 'Average';
    let tierColor = '#F59E0B';
    let tierBg = 'rgba(245, 158, 11, 0.15)';
    let tierBorder = 'rgba(245, 158, 11, 0.35)';
    let tierDesc = 'Standard engagement. Brands consider this a reliable baseline.';
    let multiplier = 1.0;

    if (er < 1.8) {
      tier = 'Below Average';
      tierColor = '#EF4444';
      tierBg = 'rgba(239, 68, 68, 0.15)';
      tierBorder = 'rgba(239, 68, 68, 0.35)';
      tierDesc = 'Lower interaction than typical channel views. Focus on stronger hooks & questions to viewers.';
      multiplier = 0.85;
    } else if (er >= 1.8 && er < 3.5) {
      tier = 'Decent / Average';
      tierColor = '#38BDF8';
      tierBg = 'rgba(56, 189, 248, 0.15)';
      tierBorder = 'rgba(56, 189, 248, 0.35)';
      tierDesc = 'Good audience consistency. Perfect for scalable integrated brand shoutouts.';
      multiplier = 1.0;
    } else if (er >= 3.5 && er < 6.0) {
      tier = 'High Engagement ⭐';
      tierColor = '#10B981';
      tierBg = 'rgba(16, 185, 129, 0.15)';
      tierBorder = 'rgba(16, 185, 129, 0.35)';
      tierDesc = 'Brand favorite! Strong community loyalty means higher conversion rates and pricing power.';
      multiplier = 1.25;
    } else {
      tier = 'Viral / Elite Loyalty 🔥';
      tierColor = '#A855F7';
      tierBg = 'rgba(168, 85, 247, 0.15)';
      tierBorder = 'rgba(168, 85, 247, 0.35)';
      tierDesc = 'Top 1% creator loyalty. Brands achieve exceptional organic amplification and ROI.';
      multiplier = 1.5;
    }

    // Estimated commercial rate estimation
    const cpmMin = Math.round(nicheData.baseCpmMin * multiplier);
    const cpmMax = Math.round(nicheData.baseCpmMax * multiplier);

    const estDedicatedMin = Math.round((safeViews / 1000) * cpmMin);
    const estDedicatedMax = Math.round((safeViews / 1000) * cpmMax);
    const estIntegratedMin = Math.round(estDedicatedMin * 0.45);
    const estIntegratedMax = Math.round(estDedicatedMax * 0.45);

    return {
      er: Number(er.toFixed(2)),
      likeRatio: Number(likeRatio.toFixed(2)),
      commentRatio: Number(commentRatio.toFixed(2)),
      tier,
      tierColor,
      tierBg,
      tierBorder,
      tierDesc,
      multiplier,
      estDedicatedMin,
      estDedicatedMax,
      estIntegratedMin,
      estIntegratedMax,
      benchmark: nicheData.benchmarkEr,
      nicheName: nicheData.name
    };
  }, [views, likes, comments, selectedNiche]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setViews(preset.views);
    setLikes(preset.likes);
    setComments(preset.comments);
    setSelectedNiche(preset.niche);
    setSyncedChannel(null);
  };

  const handleSyncChannel = async (queryToUse?: string) => {
    const q = (queryToUse || channelQuery).trim();
    if (!q) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch(`/api/youtube/analyze?query=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Channel not found on YouTube');
      }
      setSyncedChannel(json.data);
      setViews(json.data.metrics.avgViews);
      setLikes(json.data.metrics.avgLikes);
      setComments(json.data.metrics.avgComments);
      setChannelQuery(json.data.handle || q);

      // Auto-set the real detected niche
      if (json.data.detectedNiche && NICHES[json.data.detectedNiche.id]) {
        setSelectedNiche(json.data.detectedNiche.id);
      }

      setShowVideoTable(true);
    } catch (err: any) {
      setSyncError(err.message || 'Failed to sync with YouTube API');
    } finally {
      setIsSyncing(false);
    }
  };

  const mediaKitTargetUrl = `/tools/media-kit-builder?er=${stats.er}&views=${views}&niche=${selectedNiche}&likes=${likes}&comments=${comments}${
    syncedChannel
      ? `&channelName=${encodeURIComponent(syncedChannel.title)}&handle=${encodeURIComponent(syncedChannel.handle)}&avatar=${encodeURIComponent(syncedChannel.avatarUrl)}&banner=${encodeURIComponent(syncedChannel.bannerUrl || '')}&subs=${encodeURIComponent(syncedChannel.subscribers)}&email=${encodeURIComponent(syncedChannel.contactEmail || '')}&country=${encodeURIComponent(syncedChannel.countryName || '')}`
      : ''
  }`;

  return (
    <main className="min-h-screen bg-[#070B11] text-white flex flex-col selection:bg-cyan-500/30">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 pb-8 sm:pt-32 sm:pb-12 border-b border-white/10 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-4 right-1/4 w-[450px] h-[250px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
                <Play className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                <span>Free YouTube Engagement Rate Checker</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                YouTube <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-cyan-400">Engagement Rate</span> Calculator
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                Brands don't buy subscriber counts anymore—they pay for active, loyal viewership. Calculate your real engagement rate by average views and turn your proof of influence into a 6-figure sponsorship rate card.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Calculator'}</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Main Interactive Tool Section */}
      <section className="py-10 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* ⚡ Live YouTube Channel API Sync Card */}
          <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-[#101926] via-[#121E2E] to-[#0A1017] border-2 border-red-500/30 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                    <Play className="w-4 h-4 fill-red-500 text-red-500" />
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Auto-Sync with Live YouTube Data API v3
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Official API
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Enter your channel handle (e.g. <strong className="text-white">@electionguide</strong>), channel URL, or ID to instantly fetch your last 15 uploads with real views, likes, and comments.
                </p>
              </div>

              {/* Sample 1-Click test button */}
              <button
                type="button"
                onClick={() => {
                  setChannelQuery('@electionguide');
                  handleSyncChannel('@electionguide');
                }}
                className="self-start md:self-auto text-xs px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 hover:bg-red-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>⚡ Test with @electionguide</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSyncChannel();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={channelQuery}
                  onChange={(e) => setChannelQuery(e.target.value)}
                  placeholder="Enter @channelhandle, channel URL, or ID (e.g. @electionguide)"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#090D14] border border-white/15 text-sm text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-red-500/80 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSyncing || !channelQuery.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all cursor-pointer shrink-0"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing 15 Uploads...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Sync Live Channel Data</span>
                  </>
                )}
              </button>
            </form>

            {syncError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{syncError}</span>
              </div>
            )}

            {/* Synced Channel Banner Card */}
            {syncedChannel && (
              <div className="p-4 rounded-2xl bg-[#070B10] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {syncedChannel.avatarUrl ? (
                    <img
                      src={syncedChannel.avatarUrl}
                      alt={syncedChannel.title}
                      className="w-12 h-12 rounded-full border-2 border-red-500/50 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-black">
                      YT
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-white">{syncedChannel.title}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                      <span>{syncedChannel.handle}</span>
                      <span>•</span>
                      <span className="text-white font-semibold">{syncedChannel.subscribers.toLocaleString('en-IN')} Subscribers</span>
                      <span>•</span>
                      <span>{syncedChannel.videoCount} Uploads</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    15 Videos Verified
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVideoTable(!showVideoTable)}
                    className="text-xs px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1 transition-all"
                  >
                    <span>{showVideoTable ? 'Hide Table' : 'Show 15 Videos'}</span>
                    {showVideoTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preset Quick Fill Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Quick Sample Presets:
            </span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p)}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#121A26] border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (Inputs): 5 Columns */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#0D1520] border border-white/12 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-cyan-400" />
                  <span>Channel Video Metrics</span>
                </h2>
                <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                  Last 10-15 Videos
                </span>
              </div>

              {/* 1. Niche Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Channel Niche</span>
                  <span className="text-gray-400 font-normal">Industry Benchmark: {stats.benchmark}%</span>
                </label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#162232] border border-white/15 text-sm text-white font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {Object.entries(NICHES).map(([key, n]) => (
                    <option key={key} value={key} className="bg-[#0D1520]">
                      {n.name} (Avg Benchmark: {n.benchmarkEr}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Average Views */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Average Views Per Video</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {views.toLocaleString('en-IN')} views
                  </span>
                </div>
                <input
                  type="number"
                  min="100"
                  step="1000"
                  value={views}
                  onChange={(e) => setViews(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-[#162232] border border-white/15 text-sm text-white font-bold focus:outline-none focus:border-cyan-400 font-mono"
                />
                <input
                  type="range"
                  min="1000"
                  max="500000"
                  step="1000"
                  value={views}
                  onChange={(e) => setViews(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* 3. Average Likes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Average Likes Per Video</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    {likes.toLocaleString('en-IN')} likes
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={likes}
                  onChange={(e) => setLikes(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-[#162232] border border-white/15 text-sm text-white font-bold focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* 4. Average Comments */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    <span>Average Comments Per Video</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-purple-300">
                    {comments.toLocaleString('en-IN')} comments
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={comments}
                  onChange={(e) => setComments(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-[#162232] border border-white/15 text-sm text-white font-bold focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400 leading-relaxed">
                💡 <strong>Calculation Formula:</strong> <br />
                <code>Engagement Rate % = ((Likes + Comments) ÷ Views) × 100</code>
              </div>

            </div>

            {/* Right Column (Live Results & Funnel): 7 Columns */}
            <div className="lg:col-span-7 space-y-6">

              {/* Main Score Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#101926] via-[#0E1520] to-[#070B11] border-2 border-cyan-500/40 shadow-2xl relative overflow-hidden space-y-6">
                
                {/* Glow behind score */}
                <div 
                  className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-[100px] pointer-events-none opacity-40"
                  style={{ background: stats.tierColor }}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-gray-400">
                      True YouTube Engagement Rate
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                        {stats.er}%
                      </span>
                      <span
                        className="text-xs sm:text-sm font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm"
                        style={{ background: stats.tierBg, color: stats.tierColor, borderColor: stats.tierBorder }}
                      >
                        {stats.tier}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      {stats.nicheName} Benchmark
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-200 font-mono">
                      {stats.benchmark}%
                    </span>
                    <span className="text-[11px] block mt-0.5 font-bold" style={{ color: stats.er >= stats.benchmark ? '#10B981' : '#F59E0B' }}>
                      {stats.er >= stats.benchmark ? `+${(stats.er - stats.benchmark).toFixed(1)}% above average` : `${(stats.benchmark - stats.er).toFixed(1)}% below benchmark`}
                    </span>
                  </div>
                </div>

                {/* Barometer Scale */}
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-full rounded-full bg-[#182333] overflow-hidden flex">
                    <div style={{ width: '25%' }} className="bg-red-500/60 h-full" title="Below Avg (< 1.8%)" />
                    <div style={{ width: '25%' }} className="bg-sky-400/60 h-full" title="Average (1.8% - 3.5%)" />
                    <div style={{ width: '25%' }} className="bg-emerald-400/70 h-full" title="High (3.5% - 6%)" />
                    <div style={{ width: '25%' }} className="bg-purple-500/80 h-full" title="Elite (> 6%)" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>&lt; 1.8% Low</span>
                    <span>1.8% - 3.5% Decent</span>
                    <span>3.5% - 6% High</span>
                    <span>&gt; 6% Elite</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {stats.tierDesc}
                </p>

                {/* Sub-Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[#14202F] border border-white/10">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Like Ratio</span>
                    <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">{stats.likeRatio}%</span>
                    <span className="text-[10px] text-gray-500 block">per view</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#14202F] border border-white/10">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Comment Ratio</span>
                    <span className="text-base sm:text-lg font-black text-purple-400 font-mono">{stats.commentRatio}%</span>
                    <span className="text-[10px] text-gray-500 block">per view</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#14202F] border border-white/10 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Pricing Power</span>
                    <span className="text-base sm:text-lg font-black text-cyan-400 font-mono">{stats.multiplier}x</span>
                    <span className="text-[10px] text-gray-500 block">niche rate index</span>
                  </div>
                </div>

                {/* Sponsorship Potential Breakdown */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#162334] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span>Estimated Sponsorship Rate Cards (India 2026)</span>
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      CPM Calibrated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[11px] text-gray-400 font-semibold block">Dedicated Video</span>
                      <span className="text-base font-black text-white font-mono">
                        ₹{stats.estDedicatedMin.toLocaleString('en-IN')} – ₹{stats.estDedicatedMax.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[11px] text-gray-400 font-semibold block">60-Sec Integration</span>
                      <span className="text-base font-black text-cyan-300 font-mono">
                        ₹{stats.estIntegratedMin.toLocaleString('en-IN')} – ₹{stats.estIntegratedMax.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ⚡ High-Converting Funnel CTA: Bridge directly into the Media Kit & Rate Card Suite */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-primary/15 to-purple-500/20 border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(0,242,254,0.15)] relative overflow-hidden space-y-4">
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-400 text-[#05080E] flex items-center justify-center shrink-0 shadow-lg font-black text-xl">
                    <Zap className="w-6 h-6 fill-current" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Turn this {stats.er}% Engagement Rate into a Brand Deal Media Kit
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                      Don’t send static, outdated PDFs or spreadsheets to sponsors. Convert your verified <strong>{stats.er}% ER</strong> and <strong>{views.toLocaleString('en-IN')} views</strong> directly into an interactive, no-code web media kit with live rate cards and lead tracking.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link
                    href={mediaKitTargetUrl}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-[#05080E] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Generate Your Live Media Kit & Rate Card</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/marketplace?tab=tools"
                    className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center transition-all"
                  >
                    <span>All AI Tools</span>
                  </Link>
                </div>

              </div>

            </div>

          </div>

          {/* 📊 Analyzed Videos Breakdown Table (Only visible when synced) */}
          {syncedChannel && syncedChannel.analyzedVideos && syncedChannel.analyzedVideos.length > 0 && showVideoTable && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1520] border border-white/10 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                      YouTube Studio Source Data
                    </span>
                    <span className="text-xs text-slate-400">
                      Sample: {syncedChannel.analyzedVideos.length} Consecutive Long-Form Uploads
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                    Analyzed Video Metrics for {syncedChannel.title}
                  </h3>
                </div>

                <div className="text-xs text-slate-400">
                  Total Sample Views: <strong className="text-cyan-300 font-mono">{syncedChannel.metrics.totalViews.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121C2B] text-gray-300 uppercase font-black tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="py-3 px-3 text-center">#</th>
                      <th className="py-3 px-4">Video Title</th>
                      <th className="py-3 px-3 text-center">Publish Date</th>
                      <th className="py-3 px-3 text-right">Views</th>
                      <th className="py-3 px-3 text-right">Likes</th>
                      <th className="py-3 px-3 text-right">Comments</th>
                      <th className="py-3 px-3 text-center">True ER%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#090E16]">
                    {syncedChannel.analyzedVideos.map((v: any, i: number) => (
                      <tr key={v.videoId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-gray-400 font-bold">{i + 1}</td>
                        <td className="py-3 px-4 font-medium text-white max-w-xs sm:max-w-md truncate">
                          <a
                            href={`https://www.youtube.com/watch?v=${v.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-cyan-400 transition-colors flex items-center gap-2 group"
                          >
                            <span className="truncate">{v.title}</span>
                            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-cyan-400 shrink-0" />
                          </a>
                        </td>
                        <td className="py-3 px-3 text-center text-gray-400 font-mono">{v.publishedAt}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-cyan-300">{v.views.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-300">{v.likes.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right font-mono text-purple-300">{v.comments.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${
                            v.erPct >= 3.0 ? 'bg-emerald-500/15 text-emerald-300' :
                            v.erPct >= 1.5 ? 'bg-cyan-500/15 text-cyan-300' :
                            'bg-yellow-500/15 text-yellow-300'
                          }`}>
                            {v.erPct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Summary Row */}
                    <tr className="bg-[#121D2C] font-black border-t-2 border-white/20 text-white text-xs">
                      <td className="py-3.5 px-3 text-center uppercase tracking-wider text-cyan-400" colSpan={3}>
                        Total / Average Summary ({syncedChannel.analyzedVideos.length} Videos)
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-cyan-300">
                        <div>{syncedChannel.metrics.totalViews.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-gray-400 font-normal">Avg: {syncedChannel.metrics.avgViews.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-emerald-300">
                        <div>{syncedChannel.metrics.totalLikes.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-gray-400 font-normal">Avg: {syncedChannel.metrics.avgLikes.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-purple-300">
                        <div>{syncedChannel.metrics.totalComments.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-gray-400 font-normal">Avg: {syncedChannel.metrics.avgComments.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-emerald-400">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/40">
                          {syncedChannel.metrics.trueEngagementRate}% True ER
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Educational / SEO FAQ Section */}
          <div className="p-6 sm:p-10 rounded-3xl bg-[#0D1520] border border-white/10 space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs uppercase font-extrabold text-cyan-400 tracking-widest">
                Creator Economy Benchmarks
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                Frequently Asked Questions on YouTube Engagement
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-[#131E2D] border border-white/5 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>What is considered a good YouTube engagement rate?</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For most long-form YouTube creators, an engagement rate between <strong>2% to 4%</strong> is considered healthy and normal. Channels exceeding <strong>4.5%</strong> are viewed as high-converting influencers by agencies and can demand a 20-35% price premium.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131E2D] border border-white/5 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Why do brands care more about ER than subscriber count?</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Subscribers are a vanity metric; thousands of legacy channels have 500K subs but only 3K views. Brands calculate Return on Investment (ROI) based on active engaged eyeballs who click sponsor links and buy products.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131E2D] border border-white/5 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>How do comments affect my brand deal pricing?</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Comments reflect active viewer investment. A comment-to-view ratio above <strong>0.5%</strong> signifies that viewers pause, reflect, and trust your recommendations—making you ideal for high-ticket SaaS and FinTech sponsorships.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131E2D] border border-white/5 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>How should I present these stats to brand marketing managers?</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Never send screenshots of YouTube Studio. Send a live, responsive <strong>Creator Media Kit link</strong> with verified metrics, audience demographics, deliverable rate bands, and a direct 'Work With Me' inquiry form.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
