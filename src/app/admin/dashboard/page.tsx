'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Briefcase, Zap, IndianRupee, Clock, ArrowUpRight,
  ChevronRight, Search, Download, Filter, Eye, Phone, Mail,
  ExternalLink, CheckCircle2, AlertCircle, RefreshCw, Calculator,
  Sparkles, Layers, ShieldCheck, TrendingUp, Building2, UserPlus
} from 'lucide-react';
import Link from 'next/link';

interface AdminData {
  stats: {
    total_creators: number;
    total_brands: number;
    total_applications: number;
    total_calculator_leads: number;
    total_users: number;
    total_audience_reach: number;
    estimated_pipeline_value: number;
    active_roster_count: number;
  };
  onboarded_creators: any[];
  brand_inquiries: any[];
  creator_applications: any[];
  calculator_leads: any[];
  recent_activity: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'creators' | 'brands' | 'applications' | 'calculator'>('creators');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/stats');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format numbers (e.g. 110000 -> 110K)
  const formatNum = (n: number | string | undefined) => {
    const num = Number(n);
    if (!num || isNaN(num)) return '0';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString();
  };

  // CSV Export utility
  const exportToCSV = (items: any[], filename: string) => {
    if (!items || items.length === 0) {
      alert('No data available to export.');
      return;
    }
    const headers = Object.keys(items[0]).join(',');
    const rows = items.map(obj => 
      Object.values(obj).map(val => 
        typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${String(val || '').replace(/"/g, '""')}"`
      ).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Roster Creators
  const filteredCreators = useMemo(() => {
    if (!data?.onboarded_creators) return [];
    if (!searchQuery.trim()) return data.onboarded_creators;
    const q = searchQuery.toLowerCase();
    return data.onboarded_creators.filter(c => 
      c.name?.toLowerCase().includes(q) || 
      c.channelName?.toLowerCase().includes(q) || 
      c.niche?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q)
    );
  }, [data?.onboarded_creators, searchQuery]);

  // Filtered Brand Inquiries
  const filteredBrands = useMemo(() => {
    if (!data?.brand_inquiries) return [];
    if (!searchQuery.trim()) return data.brand_inquiries;
    const q = searchQuery.toLowerCase();
    return data.brand_inquiries.filter(b => 
      b.applicantName?.toLowerCase().includes(q) ||
      b.applicantEmail?.toLowerCase().includes(q) ||
      b.data?.['Organization / Channel']?.toLowerCase().includes(q) ||
      b.data?.['Referenced Creator']?.toLowerCase().includes(q)
    );
  }, [data?.brand_inquiries, searchQuery]);

  // Filtered Creator Applications
  const filteredApplications = useMemo(() => {
    if (!data?.creator_applications) return [];
    if (!searchQuery.trim()) return data.creator_applications;
    const q = searchQuery.toLowerCase();
    return data.creator_applications.filter(a => 
      a.applicantName?.toLowerCase().includes(q) ||
      a.applicantEmail?.toLowerCase().includes(q) ||
      a.data?.['Creator Category / Niche']?.toLowerCase().includes(q) ||
      a.data?.['Followers / Audience Size']?.toLowerCase().includes(q)
    );
  }, [data?.creator_applications, searchQuery]);

  // Filtered Calculator Valuation Leads
  const filteredCalcLeads = useMemo(() => {
    if (!data?.calculator_leads) return [];
    if (!searchQuery.trim()) return data.calculator_leads;
    const q = searchQuery.toLowerCase();
    return data.calculator_leads.filter(l => 
      l.handle?.toLowerCase().includes(q) ||
      l.niche?.toLowerCase().includes(q) ||
      l.platform?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q)
    );
  }, [data?.calculator_leads, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-semibold">Loading verified ecosystem data...</p>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-wider border border-cyan-500/20">
              Live Verified Database
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Updated: {new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Admin Executive Command Center</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Real-time telemetry on onboarded creators, brand deal inquiries, and creator valuation leads.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          
          <Link
            href="/admin/creators"
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-black flex items-center gap-1.5 shadow-lg hover:bg-cyan-400 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Roster</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Onboarded Creators */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#101926] to-[#0A1019] border border-cyan-500/30 relative overflow-hidden shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Onboarded Roster
            </span>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Exclusive Creators</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-white">{stats?.total_creators || 0}</h3>
            <span className="text-xs text-emerald-400 font-bold">
              {formatNum(stats?.total_audience_reach)} Total Reach
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Active in Tech, AI, EdTech & SaaS roster
          </p>
        </motion.div>

        {/* Brand Inquiries */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#101926] to-[#0A1019] border border-emerald-500/30 relative overflow-hidden shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Inbound Deals
            </span>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Brand Deal Inquiries</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-white">{stats?.total_brands || 0}</h3>
            <span className="text-xs text-emerald-400 font-bold">
              Direct Inbounds
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Sponsors & agency campaign requests
          </p>
        </motion.div>

        {/* Creator Onboarding Applications */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#101926] to-[#0A1019] border border-amber-500/30 relative overflow-hidden shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Representation Inbounds
            </span>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Creator Applications</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-white">{stats?.total_applications || 0}</h3>
            <span className="text-xs text-amber-400 font-bold">
              Pending Review
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Applied for management representation
          </p>
        </motion.div>

        {/* Brand Deal Calculator Valuation Leads */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#101926] to-[#0A1019] border border-purple-500/30 relative overflow-hidden shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              Valuation Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Calculated Leads</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-white">{stats?.total_calculator_leads || 0}</h3>
            <span className="text-xs text-purple-300 font-bold">
              Handle Valuations
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Pricing queries from calculator tool
          </p>
        </motion.div>

      </div>

      {/* Main Tabbed Data Hub */}
      <div className="bg-[#0B1017] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        
        {/* Navigation Tabs & Search Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
            {[
              { id: 'creators', label: `🎬 Onboarded Roster (${data?.onboarded_creators.length || 0})` },
              { id: 'brands', label: `🏢 Brand Inquiries (${data?.brand_inquiries.length || 0})` },
              { id: 'applications', label: `🚀 Creator Applications (${data?.creator_applications.length || 0})` },
              { id: 'calculator', label: `🧮 Calculator Leads (${data?.calculator_leads.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg border border-cyan-300/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Export */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, handle, email..."
                className="w-full bg-[#121924] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
              />
            </div>

            <button
              onClick={() => {
                if (activeTab === 'creators') exportToCSV(data?.onboarded_creators || [], 'roster_creators');
                if (activeTab === 'brands') exportToCSV(data?.brand_inquiries || [], 'brand_inquiries');
                if (activeTab === 'applications') exportToCSV(data?.creator_applications || [], 'creator_applications');
                if (activeTab === 'calculator') exportToCSV(data?.calculator_leads || [], 'calculator_leads');
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Onboarded Creators */}
        {activeTab === 'creators' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Showing <strong>{filteredCreators.length}</strong> official roster creators</span>
              <Link href="/creators/roster" target="_blank" className="text-cyan-400 hover:underline flex items-center gap-1 font-bold">
                View Public Live Roster <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0E1520] custom-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                <thead className="bg-[#182333] border-b border-white/10 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Creator / Channel</th>
                    <th className="px-4 py-3.5">Niches</th>
                    <th className="px-4 py-3.5">YouTube</th>
                    <th className="px-4 py-3.5">Instagram</th>
                    <th className="px-4 py-3.5">Avg Views</th>
                    <th className="px-4 py-3.5">Location</th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCreators.map((c: any) => (
                    <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={c.img || '/images/default-avatar.png'} 
                            alt={c.name}
                            className="w-9 h-9 rounded-full object-cover border border-cyan-500/30"
                          />
                          <div>
                            <p className="font-bold text-white">{c.name}</p>
                            <p className="text-[11px] text-cyan-400 font-medium">@{c.channelName || c.youtubeHandle || 'Creator'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                          {c.niche || 'Tech'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-red-400 font-mono">
                        {c.youtube || formatNum(c.youtubeNum)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-pink-400 font-mono">
                        {c.instagram || formatNum(c.instaNum)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">
                        {formatNum(c.avgViewsLast10 || 25000)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {c.location || 'India'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                        {c.businessEmail || c.whatsappNumber || 'collabs@creatornest.in'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/admin/creators/${c.id}/edit`}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-bold transition-all inline-flex items-center gap-1"
                        >
                          Edit Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredCreators.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-500">
                        No creators found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Brand Deal Inquiries */}
        {activeTab === 'brands' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Showing <strong>{filteredBrands.length}</strong> commercial brand campaign inquiries</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0E1522] custom-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                <thead className="bg-[#182333] border-b border-white/10 text-emerald-300 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Brand / Organization</th>
                    <th className="px-4 py-3.5">Contact Person</th>
                    <th className="px-4 py-3.5">Email & Phone</th>
                    <th className="px-4 py-3.5">Target Creator / Budget</th>
                    <th className="px-4 py-3.5">Inquiry Details</th>
                    <th className="px-4 py-3.5 text-right">Date Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBrands.map((b: any) => (
                    <tr key={b.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <p className="font-bold text-white">
                            {b.data?.['Organization / Channel'] || b.data?.['Company Name'] || b.data?.['Name'] || 'Enterprise Brand'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-200">
                        {b.applicantName || b.data?.['Full Name'] || b.data?.['Name'] || 'Brand Lead'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-300 font-mono">
                        <p>{b.applicantEmail || b.data?.['Work Email'] || b.data?.['Email']}</p>
                        <p className="text-slate-500">{b.data?.['Phone / Direct Line'] || b.data?.['Contact Number / WhatsApp'] || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-bold text-cyan-300">
                          {b.data?.['Referenced Creator'] ? `For @${b.data?.['Referenced Creator']}` : 'General Roster'}
                        </p>
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          Budget: {b.data?.['Budget / Scale'] || 'Commercial Rate'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-300 max-w-xs truncate">
                        {b.data?.['Message Details'] || b.data?.['Message / Growth Goals'] || b.subject || 'Campaign Proposal'}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-slate-400 font-mono">
                        {b.istTime || new Date(b.timestamp).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {filteredBrands.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500">
                        No brand inquiries found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Creator Applications */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Showing <strong>{filteredApplications.length}</strong> talent representation applications</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0E1522] custom-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                <thead className="bg-[#182333] border-b border-white/10 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Applicant Name</th>
                    <th className="px-4 py-3.5">Contact Info</th>
                    <th className="px-4 py-3.5">Audience Size</th>
                    <th className="px-4 py-3.5">Niche / Category</th>
                    <th className="px-4 py-3.5">Platform Link</th>
                    <th className="px-4 py-3.5 text-right">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredApplications.map((app: any) => (
                    <tr key={app.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
                        {app.applicantName || app.data?.['Name'] || 'Creator Lead'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-300 font-mono">
                        <p>{app.applicantEmail || app.data?.['Email']}</p>
                        <p className="text-slate-500">{app.data?.['Contact Number / WhatsApp'] || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-amber-400">
                        {app.data?.['Followers / Audience Size'] || '10K - 100K'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-xs font-semibold">
                          {app.data?.['Creator Category / Niche'] || app.data?.['Tech Niche / Category'] || 'Content Creator'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-cyan-400 font-mono max-w-xs truncate">
                        {app.data?.['Profile / Platform Link'] ? (
                          <a href={app.data?.['Profile / Platform Link'].startsWith('http') ? app.data?.['Profile / Platform Link'] : `https://${app.data?.['Profile / Platform Link']}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                            {app.data?.['Profile / Platform Link']} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-slate-400 font-mono">
                        {app.istTime || new Date(app.timestamp).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {filteredApplications.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500">
                        No creator applications found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Calculator Valuation Leads */}
        {activeTab === 'calculator' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Showing <strong>{filteredCalcLeads.length}</strong> real creator rate calculations</span>
              <Link href="/tools/brand-deal-calculator" target="_blank" className="text-cyan-400 hover:underline flex items-center gap-1 font-bold">
                Open Live Pricing Engine <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0E1522] custom-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                <thead className="bg-[#182333] border-b border-white/10 text-purple-300 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Creator Handle</th>
                    <th className="px-4 py-3.5">Platform</th>
                    <th className="px-4 py-3.5">Followers</th>
                    <th className="px-4 py-3.5">Avg Views</th>
                    <th className="px-4 py-3.5">Niche</th>
                    <th className="px-4 py-3.5">1-Deal Base Fee (₹)</th>
                    <th className="px-4 py-3.5">Monthly Capacity</th>
                    <th className="px-4 py-3.5 text-right">Calculated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCalcLeads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span>@{lead.handle.replace(/^@/, '')}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${
                          lead.platform === 'youtube' ? 'bg-red-500/15 text-red-300 border border-red-500/30' : 'bg-pink-500/15 text-pink-300 border border-pink-500/30'
                        }`}>
                          {lead.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-200 font-bold">
                        {formatNum(lead.followers)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-cyan-300 font-bold">
                        {formatNum(lead.avg_views)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-300">
                        {lead.niche}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-black text-emerald-400 text-sm">
                        ₹{(lead.base_rate || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                        {lead.monthly_capacity || '1–2 Deals'}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-slate-400 font-mono">
                        {new Date(lead.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {filteredCalcLeads.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-500">
                        No calculator valuation leads recorded yet. Try running the Brand Deal Calculator.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
