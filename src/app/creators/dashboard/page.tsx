'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Camera, 
  TrendingUp, 
  Users, 
  Heart,
  MessageCircle,
  Briefcase,
  LogOut,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ExternalLink,
  Calculator,
  ShieldCheck,
  Award,
  Tv,
  MapPin,
  BadgeCheck,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export default function CreatorDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'roster_card'>('overview');
  const [creatorData, setCreatorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCreatorDetails() {
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
            setCreatorData(matched);
          } else {
            // Default fallback using user details
            setCreatorData({
              name: user?.full_name || 'Verified Creator',
              channelName: 'Creator Channel',
              niche: 'EdTech & AI',
              niches: ['EdTech & App Reviews', 'AI & Automation'],
              youtube: '110K',
              youtubeNum: 110000,
              instagram: '45K',
              instaNum: 45000,
              location: 'Delhi, India',
              avd: '82%',
              avgViewsLast10: 40000,
              rank: 1,
              topGrowing: true,
              featured: true,
              img: '/images/creators/1787833535582-creator-profile.jpg',
              bio: 'Verified exclusive creator on Creator Nest Talent Roster.',
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load roster data', err);
      } finally {
        setLoading(false);
      }
    }

    loadCreatorDetails();
  }, [user]);

  const initials = (creatorData?.name || user?.full_name || 'C')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const niches = creatorData?.niches && creatorData.niches.length > 0 ? creatorData.niches : [creatorData?.niche || 'Tech'];

  return (
    <div className="min-h-screen bg-[#070B11] text-white flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/10 bg-[#0C121B] flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <Logo />
          <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mt-2">Creator Command Center</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Analytics</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('roster_card')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'roster_card' ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>My Creator Card</span>
          </button>

          <button 
            onClick={() => setActiveTab('deals')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'deals' ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Brand Deals Pipeline</span>
          </button>

          <Link
            href="/tools/brand-deal-calculator"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm text-emerald-400 hover:bg-emerald-500/10 transition-all"
          >
            <Calculator className="w-4 h-4" />
            <span>Brand Deal Calculator</span>
          </Link>

          <Link
            href="/nschool/course/17"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm text-purple-300 hover:bg-purple-500/10 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Creator Skool</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/profile" className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/5 transition-all">
            <span>👤 View Main Profile</span>
          </Link>
          <button 
            onClick={logout} 
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8">
        
        {/* Creator Identity Header */}
        <div className="bg-gradient-to-r from-[#101A27] via-[#0C121B] to-[#080D14] border border-cyan-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            {creatorData?.img ? (
              <img 
                src={creatorData.img} 
                alt={creatorData.name} 
                className="w-24 h-24 rounded-3xl object-cover border-2 border-cyan-400/50 shadow-2xl" 
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-black text-black shadow-xl">
                {initials}
              </div>
            )}

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{creatorData?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                  ⭐ Rank #{creatorData?.rank || 1} Exclusive Roster
                </span>
              </div>

              <p className="text-xs sm:text-sm text-red-400 font-bold flex items-center justify-center md:justify-start gap-1 font-mono">
                <Tv className="w-3.5 h-3.5" />
                @{creatorData?.channelName || creatorData?.youtubeHandle || 'Election Guide'} • {creatorData?.location || 'Delhi, India'}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                {niches.map((n: string) => (
                  <span key={n} className="px-3 py-1 bg-purple-500/15 border border-purple-500/30 rounded-xl text-xs font-bold text-purple-300">
                    🎯 {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <Link 
                href="/creators/roster" 
                target="_blank"
                className="px-4 py-2.5 rounded-xl bg-cyan-500 text-black font-black text-xs flex items-center gap-1.5 shadow-lg hover:bg-cyan-400 transition-all"
              >
                <span>Live Public Roster</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Tab 1: Overview & Analytics */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Live Benchmarks Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-2xl bg-[#0C121B] border border-white/10 space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">YouTube Subscribers</p>
                <p className="text-2xl sm:text-3xl font-black text-red-400 font-mono">
                  {creatorData?.youtube || `${creatorData?.youtubeNum / 1000}K`}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Verified channel audience</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C121B] border border-white/10 space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Instagram Community</p>
                <p className="text-2xl sm:text-3xl font-black text-pink-400 font-mono">
                  {creatorData?.instagram || `${creatorData?.instaNum / 1000}K`}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Reels & stories reach</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C121B] border border-white/10 space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Avg Views Per Video</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {Number(creatorData?.avgViewsLast10 || 40000).toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Last 10 uploads baseline</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C121B] border border-white/10 space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Audience Retention (AVD)</p>
                <p className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                  {creatorData?.avd || '82%'}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Top 5% high retention</p>
              </div>

            </div>

            {/* Quick Actions & Calculator Banner */}
            <div className="p-6 rounded-3xl bg-[#0C121B] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Rate Card & Sponsorship Engine
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Want to know your exact Brand Deal Pricing for 2026?
                </h3>
                <p className="text-xs text-slate-400">
                  Run your metrics through the Creator Nest brand valuation algorithm for guaranteed rate parity.
                </p>
              </div>

              <Link
                href="/tools/brand-deal-calculator"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105 shrink-0"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate 1-Deal Rate</span>
              </Link>
            </div>

          </div>
        )}

        {/* Tab 2: My Creator Card Showcase */}
        {activeTab === 'roster_card' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0C121B] border border-cyan-500/40 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Live Official Creator Card</h2>
                  <p className="text-xs text-slate-400 mt-0.5">This card is featured on the Creator Nest talent directory for prospective brand sponsors.</p>
                </div>
                <Link href="/creators/roster" target="_blank" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                  View Public Directory <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="max-w-sm mx-auto w-full bg-[#080D14] rounded-2xl border border-white/15 overflow-hidden shadow-2xl">
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/5 flex items-center justify-center">
                    <img 
                      src={creatorData?.img || '/images/default-avatar.png'} 
                      alt={creatorData?.name} 
                      className="w-full h-full object-cover object-top" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080D14] via-transparent to-transparent opacity-90" />
                    
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px] font-black border border-cyan-400/50 backdrop-blur-md">
                        ⭐ Rank #{creatorData?.rank || 1}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-black border border-emerald-400/50 backdrop-blur-md">
                        Verified Exclusive
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-base font-black text-white flex items-center gap-1">
                        {creatorData?.name}
                        <BadgeCheck className="w-4 h-4 text-cyan-400" />
                      </p>
                      <p className="text-xs text-red-400 font-bold flex items-center gap-1 mt-0.5">
                        <Tv className="w-3.5 h-3.5" />
                        @{creatorData?.channelName || 'Creator'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0A101A] border-t border-white/10 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary Niche:</span>
                      <span className="text-purple-300 font-bold">{niches[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-slate-200 font-bold">{creatorData?.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Agency Contact:</span>
                      <span className="text-cyan-300 font-mono font-bold">collabs@creatornest.in</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-xs text-slate-400 font-bold uppercase">Official Bio</p>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                      {creatorData?.bio}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-xs text-slate-400 font-bold uppercase">Commercial Representation</p>
                    <p className="text-xs text-slate-300">
                      Managed exclusively by Creator Nest Talent Agency. All campaign agreements, licensing contracts, and deliverable escrow protection are handled directly by your dedicated talent manager.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Deals Pipeline */}
        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0C121B] border border-white/10 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base">Inbound Brand Deals & Pipeline</h3>
              <p className="text-xs text-slate-400">Campaigns matched to your audience profile and active sponsorships.</p>

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0E1522]">
                <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
                  <thead className="bg-[#182333] border-b border-white/10 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Brand / Campaign</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Target Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5 font-bold text-white">EdTech App Review Campaign</td>
                      <td className="px-4 py-3.5 text-slate-300">Dedicated Video + 1 Reel</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                          Active In Pipeline
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-400">Q3 2026</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5 font-bold text-white">Cybersecurity Software Integration</td>
                      <td className="px-4 py-3.5 text-slate-300">60s Mid-Roll Integration</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 font-bold text-xs border border-amber-500/30">
                          Reviewing Terms
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-400">Q3 2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
