'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, ArrowRight, CheckCircle2, Copy, Check,
  Share2, Download, Printer, Eye, Palette, BarChart3, Users,
  Mail, Phone, MapPin, Globe, Award, DollarSign, FileText,
  Clock, Shield, Send, ExternalLink, RefreshCw, Layers, Sliders,
  HelpCircle, ChevronRight, Zap, Target, MessageSquare, Flame, Play
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

type TabMode = 'editor' | 'preview' | 'crm' | 'contract';

interface BrandDeal {
  id: string;
  creator_handle: string;
  brand_name: string;
  contact_name: string;
  contact_email: string;
  budget_band: string;
  deliverables: string;
  timeline: string;
  message: string;
  status: string;
  utm_source: string;
  utm_campaign?: string;
  deal_value: number;
  created_at: string;
}

const ACCENT_PALETTES = [
  { id: 'cyan', name: 'Neon Cyan', color: '#00F2FE', gradient: 'from-[#00F2FE] to-[#00A3FE]' },
  { id: 'emerald', name: 'Emerald Green', color: '#10B981', gradient: 'from-[#10B981] to-[#059669]' },
  { id: 'purple', name: 'Electric Purple', color: '#A855F7', gradient: 'from-[#A855F7] to-[#7C3AED]' },
  { id: 'amber', name: 'Sunset Amber', color: '#F59E0B', gradient: 'from-[#F59E0B] to-[#D97706]' },
  { id: 'rose', name: 'Coral Rose', color: '#F43F5E', gradient: 'from-[#F43F5E] to-[#E11D48]' },
];

const NICHE_BENCHMARKS: Record<string, { cpmMin: number; cpmMax: number; label: string }> = {
  music: { cpmMin: 90, cpmMax: 200, label: 'Music & Songs' },
  entertainment: { cpmMin: 140, cpmMax: 320, label: 'Entertainment & Shows' },
  news: { cpmMin: 120, cpmMax: 260, label: 'News & Politics / Public Info' },
  education: { cpmMin: 200, cpmMax: 450, label: 'Education & Career' },
  tech: { cpmMin: 350, cpmMax: 850, label: 'Tech & SaaS' },
  finance: { cpmMin: 500, cpmMax: 1200, label: 'Finance & Investing' },
  gaming: { cpmMin: 100, cpmMax: 240, label: 'Gaming & Esports' },
  lifestyle: { cpmMin: 160, cpmMax: 360, label: 'Lifestyle & Fashion' },
  comedy: { cpmMin: 120, cpmMax: 280, label: 'Comedy & Entertainment' },
  fitness: { cpmMin: 200, cpmMax: 450, label: 'Health & Fitness' },
  business: { cpmMin: 500, cpmMax: 1000, label: 'Business & Startups' },
};

export default function MediaKitBuilderPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabMode>('editor');

  // Creator Profile State - authentic defaults (no fake hardcoded values)
  const [name, setName] = useState('Creator');
  const [handle, setHandle] = useState('@channel');
  const [niche, setNiche] = useState('music');
  const [bio, setBio] = useState('Official media kit, rate card, and commercial partnership portfolio.');
  const [location, setLocation] = useState('India');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop');
  const [accentColor, setAccentColor] = useState(ACCENT_PALETTES[0].color);

  // Performance Stats
  const [ytSubs, setYtSubs] = useState('0');
  const [igFollowers, setIgFollowers] = useState('');
  const [avgViews, setAvgViews] = useState(0);
  const [er, setEr] = useState(0);
  const [avd, setAvd] = useState('');
  const [totalVideos, setTotalVideos] = useState<number | null>(null);
  const [importedNotice, setImportedNotice] = useState<string | null>(null);

  // Demographics & Past Brands (Empty by default - creator fills in their real data)
  const [topCity, setTopCity] = useState('');
  const [genderRatio, setGenderRatio] = useState('');
  const [topAge, setTopAge] = useState('');
  const [brandTags, setBrandTags] = useState('');

  // Add-ons Multipliers
  const [hasExclusivity, setHasExclusivity] = useState(false);
  const [hasWhitelisting, setHasWhitelisting] = useState(false);
  const [hasUsageRights, setHasUsageRights] = useState(false);

  // CRM Leads State
  const [leads, setLeads] = useState<BrandDeal[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Brand Inquiry Form State (Within Public Preview)
  const [inquiryBrand, setInquiryBrand] = useState('');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryBudget, setInquiryBudget] = useState('₹50,000 - ₹1,00,000');
  const [inquiryDeliverable, setInquiryDeliverable] = useState('60-Sec Integration');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySending, setInquirySending] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Contract Generation State
  const [contractBrand, setContractBrand] = useState('Acme Technologies Pvt Ltd');
  const [contractFee, setContractFee] = useState('75,000');
  const [contractDeliverable, setContractDeliverable] = useState('1 Dedicated YouTube Video (8-12 Mins)');
  const [contractDeadline, setContractDeadline] = useState('14 Days from Advance Payment');
  const [contractTerms, setContractTerms] = useState('Net-15');
  const [contractCopied, setContractCopied] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // YouTube Auto-Import State
  const [ytImportQuery, setYtImportQuery] = useState('');
  const [ytImporting, setYtImporting] = useState(false);
  const [ytImportError, setYtImportError] = useState<string | null>(null);

  const handleImportFromYouTube = async (queryToUse?: string) => {
    const q = (queryToUse || ytImportQuery).trim();
    if (!q) return;
    setYtImporting(true);
    setYtImportError(null);
    try {
      const res = await fetch(`/api/youtube/analyze?query=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Channel not found');
      }
      const data = json.data;
      setName(data.title);
      setHandle(data.handle);
      if (data.description) setBio(data.description.slice(0, 240) + (data.description.length > 240 ? '...' : ''));
      if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
      if (data.bannerUrl) setBannerUrl(data.bannerUrl);
      setYtSubs(data.subscribers >= 1000 ? `${Math.round(data.subscribers / 1000)}K` : String(data.subscribers));
      setAvgViews(data.metrics.avgViews);
      setEr(data.metrics.trueEngagementRate);
      if (data.detectedNiche?.id && NICHE_BENCHMARKS[data.detectedNiche.id]) {
        setNiche(data.detectedNiche.id);
      }
      if (data.contactEmail) {
        setContactEmail(data.contactEmail);
      }
      if (data.countryName) {
        setLocation(data.countryName);
      }
      if (data.totalVideos) {
        setTotalVideos(data.totalVideos);
      }
      setImportedNotice(`Synced ${data.title} (${data.subscribers.toLocaleString('en-IN')} subs • ${data.metrics.avgViews.toLocaleString('en-IN')} avg views • ${data.metrics.trueEngagementRate}% ER • Category: ${data.detectedNiche?.label || 'General'}) directly from YouTube Data API!`);
    } catch (err: any) {
      setYtImportError(err.message || 'Failed to import from YouTube');
    } finally {
      setYtImporting(false);
    }
  };

  // Read URL query parameters if funneled from Engagement Calculator
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlEr = params.get('er');
      const urlViews = params.get('views');
      const urlNiche = params.get('niche');
      const urlChannelName = params.get('channelName');
      const urlHandle = params.get('handle');
      const urlAvatar = params.get('avatar');
      const urlBanner = params.get('banner');
      const urlSubs = params.get('subs');
      const urlEmail = params.get('email');
      const urlCountry = params.get('country');

      if (urlEr || urlViews || urlNiche || urlChannelName || urlHandle) {
        if (urlEr) setEr(parseFloat(urlEr) || 0);
        if (urlViews) setAvgViews(parseInt(urlViews) || 0);
        if (urlNiche && NICHE_BENCHMARKS[urlNiche]) setNiche(urlNiche);
        if (urlChannelName) setName(decodeURIComponent(urlChannelName));
        if (urlHandle) setHandle(decodeURIComponent(urlHandle));
        if (urlAvatar) setAvatarUrl(decodeURIComponent(urlAvatar));
        if (urlBanner) setBannerUrl(decodeURIComponent(urlBanner));
        if (urlEmail) setContactEmail(decodeURIComponent(urlEmail));
        if (urlCountry) setLocation(decodeURIComponent(urlCountry));
        if (urlSubs) {
          const s = parseInt(urlSubs, 10);
          setYtSubs(s >= 1000 ? `${Math.round(s / 1000)}K` : String(s));
        }
        setImportedNotice(`Imported channel stats (${urlHandle || ''} • ${urlEr ? `${urlEr}% ER` : ''} • ${urlViews ? `${Number(urlViews).toLocaleString('en-IN')} views` : ''}) from YouTube Engagement Calculator!`);
      }
    }
  }, []);

  // Fetch CRM Deals
  const fetchDeals = async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch('/api/creator/brand-lead');
      const data = await res.json();
      if (data.success && Array.isArray(data.deals)) {
        setLeads(data.deals);
      }
    } catch (err) {
      console.error('Failed to load CRM leads', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Pricing Engine Calculations
  const pricing = useMemo(() => {
    const b = NICHE_BENCHMARKS[niche] || NICHE_BENCHMARKS.tech;
    const viewsInK = Math.max(1, avgViews) / 1000;

    // Quality multiplier based on ER
    let erFactor = 1.0;
    if (er >= 4.0 && er < 6.0) erFactor = 1.25;
    else if (er >= 6.0) erFactor = 1.5;
    else if (er < 2.0) erFactor = 0.85;

    // Addon multiplier
    let addOnFactor = 1.0;
    if (hasExclusivity) addOnFactor += 0.5;
    if (hasWhitelisting) addOnFactor += 0.3;
    if (hasUsageRights) addOnFactor += 0.4;

    const cpmMin = Math.round(b.cpmMin * erFactor * addOnFactor);
    const cpmMax = Math.round(b.cpmMax * erFactor * addOnFactor);

    const dedicatedMin = Math.round(viewsInK * cpmMin);
    const dedicatedMax = Math.round(viewsInK * cpmMax);
    const integratedMin = Math.round(dedicatedMin * 0.45);
    const integratedMax = Math.round(dedicatedMax * 0.45);
    const reelMin = Math.round(dedicatedMin * 0.35);
    const reelMax = Math.round(dedicatedMax * 0.35);
    const storyMin = Math.round(dedicatedMin * 0.15);
    const storyMax = Math.round(dedicatedMax * 0.15);

    return {
      cpmMin,
      cpmMax,
      dedicatedMin,
      dedicatedMax,
      integratedMin,
      integratedMax,
      reelMin,
      reelMax,
      storyMin,
      storyMax,
      nicheLabel: b.label
    };
  }, [niche, avgViews, er, hasExclusivity, hasWhitelisting, hasUsageRights]);

  // Submit Brand Inquiry (from Public Preview)
  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryBrand || !inquiryEmail) return;

    setInquirySending(true);
    try {
      const res = await fetch('/api/creator/brand-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_handle: handle,
          brand_name: inquiryBrand,
          contact_name: inquiryName || 'Brand Marketing Lead',
          contact_email: inquiryEmail,
          budget_band: inquiryBudget,
          deliverables: inquiryDeliverable,
          timeline: 'Flexible',
          message: inquiryMessage,
          utm_source: 'live_media_kit_web',
          utm_campaign: 'inbound_pitch',
          deal_value: parseInt(inquiryBudget.replace(/[^0-9]/g, '')) || 75000
        })
      });

      const data = await res.json();
      if (data.success) {
        setInquirySuccess(true);
        setInquiryBrand('');
        setInquiryName('');
        setInquiryEmail('');
        setInquiryMessage('');
        fetchDeals(); // Refresh CRM pipeline
      }
    } catch (err) {
      alert('Error submitting inquiry. Please try again.');
    } finally {
      setInquirySending(false);
    }
  };

  // Update CRM Deal Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/creator/brand-lead', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setLeads(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Copy shareable link
  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/tools/media-kit-builder?creator=${encodeURIComponent(handle)}&utm_source=creator_shared_link`;
      navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2000);
    }
  };

  // Copy Markdown Rate Card
  const handleCopyMarkdown = () => {
    const md = `# Creator Media Kit & Rate Card — ${name} (${handle})
- **Niche**: ${pricing.nicheLabel}
- **Audience Views**: ${avgViews.toLocaleString('en-IN')} avg per video
- **Verified Engagement Rate**: ${er}%
- **YouTube Subscribers**: ${ytSubs}${igFollowers ? ` | **Instagram**: ${igFollowers}` : ''}${totalVideos ? ` | **Uploads**: ${totalVideos.toLocaleString('en-IN')}` : ''}

## Commercial Rate Card (INR)
- **Dedicated YouTube Video**: ₹${pricing.dedicatedMin.toLocaleString('en-IN')} – ₹${pricing.dedicatedMax.toLocaleString('en-IN')}
- **60-Sec Video Integration**: ₹${pricing.integratedMin.toLocaleString('en-IN')} – ₹${pricing.integratedMax.toLocaleString('en-IN')}
- **Instagram Reel / YouTube Short**: ₹${pricing.reelMin.toLocaleString('en-IN')} – ₹${pricing.reelMax.toLocaleString('en-IN')}
- **Story Series + Link**: ₹${pricing.storyMin.toLocaleString('en-IN')} – ₹${pricing.storyMax.toLocaleString('en-IN')}
${(topCity || topAge || genderRatio) ? `
## Audience Demographics
${topCity ? `- **Top Locations**: ${topCity}\n` : ''}${topAge ? `- **Age Distribution**: ${topAge}\n` : ''}${genderRatio ? `- **Gender Ratio**: ${genderRatio}\n` : ''}` : ''}${brandTags.trim() ? `
## Past Brand Partners
${brandTags.split(',').map(b => `- ${b.trim()}`).join('\n')}
` : ''}
## Contact & Booking
Email: ${contactEmail || 'Available on request'} ${contactPhone ? `| Phone: ${contactPhone}` : ''}
`;
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  // Contract Generation Text
  const contractText = `CREATOR SPONSORSHIP AGREEMENT (STANDARD TERMS)

This Agreement is entered into as of ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}, by and between:
Creator: ${name} (${handle}) (hereinafter "Creator")
AND
Brand / Sponsor: ${contractBrand} (hereinafter "Sponsor")

1. DELIVERABLES & SPECIFICATIONS:
Creator agrees to produce and publish the following creator assets:
- ${contractDeliverable}
- Target Publishing Timeline: ${contractDeadline}
- Topic & Theme: Mutually agreed brand messaging with Creator's authentic storytelling.

2. COMMERCIAL COMPENSATION & PAYMENT TERMS:
- Total Sponsorship Fee: ₹${contractFee} (Indian Rupees)
- Payment Schedule: 50% advance deposit upon signing; 50% balance payable within ${contractTerms} of public content release.
- Late Payment: Unpaid balances after due date accrue interest at 2.0% per month.

3. APPROVALS & CREATIVE REVISIONS:
- Sponsor shall receive a private draft for brand safety compliance.
- Up to two (2) rounds of minor edits are included.
- Sponsor must provide feedback within 48 business hours, failing which content is deemed approved.

4. USAGE RIGHTS & EXCLUSIVITY:
- Sponsor receives digital organic reposting rights for thirty (30) days from publication date.
- Creator retains sole ownership of underlying copyright.
- Whitelisting, paid advertising boosts, or category exclusivity beyond standard terms require separate written riders.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement:
Creator: _______________________      Sponsor: _______________________
Date: ${new Date().toLocaleDateString()}
`;

  return (
    <main className="min-h-screen bg-[#070B11] text-white flex flex-col selection:bg-cyan-500/30">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-28 pb-6 sm:pt-32 sm:pb-8 border-b border-white/10 bg-[#0A1019] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live No-Code Media Kit & Rate Card Suite</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Influencer <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400">Media Kit & Rate Card</span> Generator
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Replace outdated PDF rate cards with a live, responsive web media kit. Features algorithmic CPM pricing, built-in brand lead capture with UTM tracking, and 1-click sponsor agreements.
              </p>
            </div>

            {/* Top Mode Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#121B27] border border-white/15 shrink-0 self-stretch sm:self-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'editor'
                    ? 'bg-cyan-500 text-[#05080E] font-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Studio & Pricing</span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'preview'
                    ? 'bg-cyan-500 text-[#05080E] font-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Public Kit</span>
              </button>

              <button
                onClick={() => setActiveTab('crm')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap relative ${
                  activeTab === 'crm'
                    ? 'bg-cyan-500 text-[#05080E] font-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Brand CRM Deals</span>
                {leads.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('contract')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'contract'
                    ? 'bg-cyan-500 text-[#05080E] font-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Sponsor Contract</span>
              </button>
            </div>

          </div>

          {/* Imported Notice */}
          {importedNotice && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {importedNotice}
              </span>
              <button onClick={() => setImportedNotice(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
          )}
        </div>
      </section>

      {/* Main Mode Body */}
      <section className="py-8 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: STUDIO & PRICING ENGINE                                      */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'editor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Creator Profile & Color Customization (5 Cols) */}
              <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#0D1520] border border-white/10 space-y-6 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>No-Code Profile & Branding</span>
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Live Sync</span>
                </div>

                {/* ⚡ One-Click YouTube Sync Card */}
                <div className="p-4 rounded-2xl bg-[#090E17] border border-red-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-red-400 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      Auto-Import from YouTube API
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setYtImportQuery('@electionguide');
                        handleImportFromYouTube('@electionguide');
                      }}
                      className="text-[10px] text-red-300 hover:text-white bg-red-500/15 px-2 py-0.5 rounded border border-red-500/30 transition-all cursor-pointer"
                    >
                      ⚡ Test @electionguide
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ytImportQuery}
                      onChange={(e) => setYtImportQuery(e.target.value)}
                      placeholder="Enter @handle or channel URL"
                      className="flex-1 px-3 py-2 rounded-xl bg-[#131D2A] border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-red-400"
                    />
                    <button
                      type="button"
                      disabled={ytImporting || !ytImportQuery.trim()}
                      onClick={() => handleImportFromYouTube()}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    >
                      {ytImporting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 fill-white" />
                          <span>Sync</span>
                        </>
                      )}
                    </button>
                  </div>
                  {ytImportError && (
                    <p className="text-[11px] text-red-400">{ytImportError}</p>
                  )}
                </div>

                {/* Color Palette Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                    Brand Accent Theme
                  </label>
                  <div className="flex items-center gap-2.5">
                    {ACCENT_PALETTES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setAccentColor(p.color)}
                        className={`w-9 h-9 rounded-xl border-2 transition-transform cursor-pointer flex items-center justify-center ${
                          accentColor === p.color ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={{ background: p.color }}
                        title={p.name}
                      >
                        {accentColor === p.color && <Check className="w-4 h-4 text-[#05080E]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase">Creator Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase">Handle</label>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Creator Bio & Proposition</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white leading-relaxed focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Channel Stats Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">YT Subs</label>
                    <input
                      type="text"
                      value={ytSubs}
                      onChange={(e) => setYtSubs(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">IG Followers</label>
                    <input
                      type="text"
                      value={igFollowers}
                      onChange={(e) => setIgFollowers(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Avg Views</label>
                    <input
                      type="number"
                      value={avgViews}
                      onChange={(e) => setAvgViews(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">ER%</label>
                    <input
                      type="number"
                      step="0.1"
                      value={er}
                      onChange={(e) => setEr(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Demographics Inputs */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Audience Demographics
                    </span>
                    <span className="text-[10px] text-cyan-400">From YouTube Studio Analytics</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block mb-1">Top Geographies</span>
                      <input
                        type="text"
                        value={topCity}
                        onChange={(e) => setTopCity(e.target.value)}
                        placeholder="e.g. India (92%), UK (4%), Canada (2%)"
                        className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block mb-1">Age Bracket</span>
                        <input
                          type="text"
                          value={topAge}
                          onChange={(e) => setTopAge(e.target.value)}
                          placeholder="e.g. 18–34 (78%)"
                          className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block mb-1">Gender Split</span>
                        <input
                          type="text"
                          value={genderRatio}
                          onChange={(e) => setGenderRatio(e.target.value)}
                          placeholder="e.g. 65% Male / 35% Female"
                          className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Past Brand Collaborations Input */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Past Brand Collaborations
                    </span>
                    <span className="text-[10px] text-gray-500">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={brandTags}
                    onChange={(e) => setBrandTags(e.target.value)}
                    placeholder="e.g. Spotify, Boat, Unacademy (comma-separated)"
                    className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-gray-500 leading-normal">
                    Leave blank if you are open for your first sponsor deal. Your public kit will invite brands to be your first partner!
                  </p>
                </div>

                {/* Contact & Booking Details */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Contact & Commercial Booking
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block mb-1">Business Email</span>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="collabs@channel.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block mb-1">Phone / WhatsApp (Optional)</span>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Switch to Preview CTA */}
                <button
                  onClick={() => setActiveTab('preview')}
                  className="w-full py-3 px-4 rounded-xl text-[#05080E] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer"
                  style={{ background: accentColor }}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Live Public Media Kit Preview</span>
                </button>

              </div>

              {/* Right Column: Dynamic Pricing Engine & Rate Card Bands (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1520] border border-white/10 space-y-6 shadow-xl">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                        Search Intent: "youtube sponsorship calculator"
                      </span>
                      <h3 className="text-xl font-black text-white mt-0.5">
                        Dynamic Sponsorship Pricing Engine
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 bg-[#141F2D] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                      <span className="text-gray-400 font-bold">Niche:</span>
                      <select
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        className="bg-transparent text-white font-black focus:outline-none cursor-pointer"
                      >
                        {Object.entries(NICHE_BENCHMARKS).map(([k, v]) => (
                          <option key={k} value={k} className="bg-[#0D1520]">{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing Overview & CPM benchmark */}
                  <div className="p-4 rounded-2xl bg-[#131F2E] border border-white/10 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Effective CPM Band</span>
                      <span className="text-lg sm:text-xl font-black text-white font-mono">
                        ₹{pricing.cpmMin} – ₹{pricing.cpmMax}
                      </span>
                      <span className="text-[10px] text-gray-400 block">per 1,000 views in {pricing.nicheLabel}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Engagement Lift</span>
                      <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                        {er >= 4.0 ? `+${er >= 6.0 ? '50%' : '25%'} Premium` : 'Standard Baseline'}
                      </span>
                      <span className="text-[10px] text-gray-400 block">based on your {er}% ER</span>
                    </div>
                  </div>

                  {/* Rate Card Deliverable Bands */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="p-4 rounded-2xl bg-[#152233] border border-white/10 space-y-1.5 relative overflow-hidden group hover:border-cyan-400/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white uppercase tracking-wider">Dedicated YouTube Video</span>
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Flagship</span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono pt-1">
                        ₹{pricing.dedicatedMin.toLocaleString('en-IN')} – ₹{pricing.dedicatedMax.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[11px] text-gray-400">8–12 mins deep dive, sponsor link top of description, pinned comment.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#152233] border border-white/10 space-y-1.5 relative overflow-hidden group hover:border-cyan-400/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white uppercase tracking-wider">60-Sec Mid-Roll Integration</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Most Popular</span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono pt-1">
                        ₹{pricing.integratedMin.toLocaleString('en-IN')} – ₹{pricing.integratedMax.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[11px] text-gray-400">Native creator demo, custom promo code discount, verbal CTA.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#152233] border border-white/10 space-y-1.5 relative overflow-hidden group hover:border-cyan-400/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white uppercase tracking-wider">Reel / YouTube Short</span>
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">High Reach</span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono pt-1">
                        ₹{pricing.reelMin.toLocaleString('en-IN')} – ₹{pricing.reelMax.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[11px] text-gray-400">Hook-heavy 30-60s vertical reel with audio trending distribution.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#152233] border border-white/10 space-y-1.5 relative overflow-hidden group hover:border-cyan-400/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white uppercase tracking-wider">Story Series + Link Sticker</span>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Quick Conversion</span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono pt-1">
                        ₹{pricing.storyMin.toLocaleString('en-IN')} – ₹{pricing.storyMax.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[11px] text-gray-400">3-part sequence (Hook, Product Proof, Direct Swipe-up / Link).</p>
                    </div>

                  </div>

                  {/* Commercial Add-On Multipliers */}
                  <div className="pt-2 border-t border-white/10 space-y-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Commercial Add-on Multipliers
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setHasExclusivity(!hasExclusivity)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          hasExclusivity ? 'bg-cyan-500/15 border-cyan-400 text-white' : 'bg-white/5 border-white/10 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">Category Exclusivity</span>
                          <span className="text-[10px] font-mono font-bold">+50%</span>
                        </div>
                        <p className="text-[10px]">No competitors for 30 days</p>
                      </button>

                      <button
                        onClick={() => setHasWhitelisting(!hasWhitelisting)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          hasWhitelisting ? 'bg-cyan-500/15 border-cyan-400 text-white' : 'bg-white/5 border-white/10 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">Meta / Ad Whitelisting</span>
                          <span className="text-[10px] font-mono font-bold">+30%</span>
                        </div>
                        <p className="text-[10px]">Brand runs ads via creator ID</p>
                      </button>

                      <button
                        onClick={() => setHasUsageRights(!hasUsageRights)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          hasUsageRights ? 'bg-cyan-500/15 border-cyan-400 text-white' : 'bg-white/5 border-white/10 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">Perpetual Usage</span>
                          <span className="text-[10px] font-mono font-bold">+40%</span>
                        </div>
                        <p className="text-[10px]">Brand website & print rights</p>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: LIVE PUBLIC WEB MEDIA KIT PREVIEW                             */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              
              {/* Share & Actions Toolbar */}
              <div className="p-4 rounded-2xl bg-[#0D1520] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Live Web Media Kit Ready</span>
                  <span className="text-xs text-gray-400 font-mono hidden md:inline">| creator={handle}</span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap justify-end">
                  <button
                    onClick={handleCopyShareLink}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copiedShareLink ? 'Link Copied!' : 'Copy Shareable Link'}</span>
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-purple-400" />}
                    <span>{copiedMarkdown ? 'Copied MD!' : 'Copy Markdown'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>

              {/* Live Media Kit Card (Printable) */}
              <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#0F1724] via-[#0B1019] to-[#070B11] shadow-2xl overflow-hidden relative print:border-none print:shadow-none">
                
                {/* Banner Header */}
                <div className="h-44 sm:h-56 relative w-full overflow-hidden bg-[#152233]">
                  <img src={bannerUrl} alt="Cover" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1724] via-transparent to-black/30" />
                  
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                      Official 2026 Media Kit
                    </span>
                  </div>
                </div>

                {/* Profile Bar */}
                <div className="px-6 sm:px-10 pb-8 relative -mt-16 sm:-mt-20">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-8 border-b border-white/10">
                    <div className="flex items-end gap-4 sm:gap-6">
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#0F1724] shadow-2xl"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl sm:text-3xl font-black text-white">{name}</h2>
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase" style={{ background: `${accentColor}25`, color: accentColor }}>
                            Verified
                          </span>
                        </div>
                        <p className="text-sm font-mono text-cyan-300 font-bold">{handle}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" /> {location} • {pricing.nicheLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <a
                        href="#sponsor-form"
                        className="px-5 py-3 rounded-xl text-[#05080E] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
                        style={{ background: accentColor }}
                      >
                        <Send className="w-4 h-4" />
                        <span>Sponsor My Next Video</span>
                      </a>
                    </div>
                  </div>

                  {/* Bio statement */}
                  <div className="py-6 border-b border-white/10">
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-3xl font-normal">
                      "{bio}"
                    </p>
                  </div>

                  {/* High-Impact Stat Blocks */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-b border-white/10">
                    <div className="p-4 rounded-2xl bg-[#142030] border border-white/10">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">YouTube Subscribers</span>
                      <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5 block">{ytSubs}</span>
                      <span className="text-[11px] text-cyan-300 font-medium">{pricing.nicheLabel} Audience</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#142030] border border-white/10">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Average Views / Video</span>
                      <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5 block">{avgViews.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-emerald-400 font-medium">{avd || 'Verified Views'}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#142030] border border-white/10">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Engagement Rate</span>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5 block">{er}%</span>
                      <span className="text-[11px] text-emerald-300 font-bold">
                        {er >= 3.5 ? 'High Audience Affinity' : 'Verified Engagement'}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#142030] border border-white/10">
                      {igFollowers ? (
                        <>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Instagram Followers</span>
                          <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono mt-0.5 block">{igFollowers}</span>
                          <span className="text-[11px] text-purple-300 font-medium">Reels & Daily Stories</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Channel Videos</span>
                          <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono mt-0.5 block">
                            {totalVideos ? totalVideos.toLocaleString('en-IN') : '15+'}
                          </span>
                          <span className="text-[11px] text-purple-300 font-medium">Active Public Library</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Commercial Rate Card Matrix */}
                  <div className="py-8 border-b border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                        <span>Sponsorship Rate Card (Q3-Q4 2026)</span>
                      </h3>
                      <span className="text-xs text-gray-400">All prices in Indian Rupees (INR)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-[#142030] border border-white/10">
                        <span className="text-xs font-bold text-gray-300 block">Dedicated YouTube Video</span>
                        <span className="text-xl font-black text-white font-mono mt-1 block">
                          ₹{pricing.dedicatedMin.toLocaleString('en-IN')} – ₹{pricing.dedicatedMax.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1">Full 10-15m deep dive</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#142030] border border-white/10">
                        <span className="text-xs font-bold text-gray-300 block">60-Sec Integration</span>
                        <span className="text-xl font-black text-cyan-300 font-mono mt-1 block">
                          ₹{pricing.integratedMin.toLocaleString('en-IN')} – ₹{pricing.integratedMax.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1">Mid-roll native demo</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#142030] border border-white/10">
                        <span className="text-xs font-bold text-gray-300 block">Instagram Reel / Short</span>
                        <span className="text-xl font-black text-purple-300 font-mono mt-1 block">
                          ₹{pricing.reelMin.toLocaleString('en-IN')} – ₹{pricing.reelMax.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1">Short-form vertical video</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#142030] border border-white/10">
                        <span className="text-xs font-bold text-gray-300 block">Story Link Series</span>
                        <span className="text-xl font-black text-amber-300 font-mono mt-1 block">
                          ₹{pricing.storyMin.toLocaleString('en-IN')} – ₹{pricing.storyMax.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1">3-part sequence + sticker</span>
                      </div>
                    </div>
                  </div>

                  {/* Demographics & Past Brands Showcase */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-white/10">
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400">Audience Geography & Demographics</h4>
                      {topCity || topAge || genderRatio ? (
                        <div className="space-y-2 text-xs text-slate-300">
                          {topCity && (
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                              <span className="font-bold">Top Locations:</span>
                              <span className="font-mono text-white">{topCity}</span>
                            </div>
                          )}
                          {topAge && (
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                              <span className="font-bold">Age Bracket:</span>
                              <span className="font-mono text-white">{topAge}</span>
                            </div>
                          )}
                          {genderRatio && (
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                              <span className="font-bold">Gender Ratio:</span>
                              <span className="font-mono text-white">{genderRatio}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
                          <p className="text-slate-300">
                            <strong className="text-white">Audience Location:</strong> {location || 'India'}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Granular age & gender demographic distribution from YouTube Studio Audience analytics provided to brands upon inquiry.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-purple-400">Past Brand Collaborations</h4>
                      {brandTags.trim() ? (
                        <>
                          <p className="text-xs text-gray-400">Trusted brand partners and commercial sponsors:</p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {brandTags.split(',').map((tag, i) => tag.trim() && (
                              <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-200">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold text-white">Open for Brand Partnerships & Sponsorships</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Be among the first brands to partner with {name} on upcoming videos, dedicated reviews, and social activations.
                          </p>
                          <a
                            href="#sponsor-form"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline pt-1"
                          >
                            <span>Sponsor Next Video</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ⚡ Built-in Lead Capture Form ("Work With Me") */}
                  <div id="sponsor-form" className="pt-8 space-y-6">
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121E2E] via-[#0E1724] to-[#0B1019] border-2 border-cyan-500/40 shadow-2xl space-y-6">
                      
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            Search Intent: "how to track brand deals"
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                            Work With Me — Direct Brand Deal Inquiry
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-300 mt-1">
                            Direct line to {name}'s management. All inquiries are reviewed within 24 hours.
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                          <Send className="w-5 h-5" />
                        </div>
                      </div>

                      {inquirySuccess ? (
                        <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-2">
                          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                          <h4 className="text-lg font-bold text-white">Inquiry Sent Successfully!</h4>
                          <p className="text-xs text-emerald-200">
                            Your campaign brief has been routed directly into the creator's deal pipeline. Our team will contact you shortly.
                          </p>
                          <button
                            onClick={() => setInquirySuccess(false)}
                            className="text-xs text-cyan-400 font-bold hover:underline mt-2 inline-block cursor-pointer"
                          >
                            Send Another Brief
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSendInquiry} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-300 uppercase">Brand / Company Name</label>
                              <input
                                type="text"
                                required
                                value={inquiryBrand}
                                onChange={(e) => setInquiryBrand(e.target.value)}
                                placeholder="e.g. Samsung, Boat, Notion"
                                className="w-full px-4 py-3 rounded-xl bg-[#162334] border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-300 uppercase">Contact Email</label>
                              <input
                                type="email"
                                required
                                value={inquiryEmail}
                                onChange={(e) => setInquiryEmail(e.target.value)}
                                placeholder="marketing@brand.com"
                                className="w-full px-4 py-3 rounded-xl bg-[#162334] border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-300 uppercase">Estimated Budget Band</label>
                              <select
                                value={inquiryBudget}
                                onChange={(e) => setInquiryBudget(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[#162334] border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                              >
                                <option value="₹30,000 - ₹50,000">₹30,000 – ₹50,000</option>
                                <option value="₹50,000 - ₹1,00,000">₹50,000 – ₹1,00,000</option>
                                <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 – ₹2,50,000</option>
                                <option value="₹2,50,000+">₹2,50,000+ (High Impact / Retainer)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-300 uppercase">Deliverable Needed</label>
                              <select
                                value={inquiryDeliverable}
                                onChange={(e) => setInquiryDeliverable(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[#162334] border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                              >
                                <option value="Dedicated YouTube Video">Dedicated YouTube Video</option>
                                <option value="60-Sec Integration">60-Sec Mid-Roll Integration</option>
                                <option value="Instagram Reel / Short">Instagram Reel / YouTube Short</option>
                                <option value="Story Series + Link">Story Series + Link</option>
                                <option value="Multi-Video Retainer Package">Multi-Video Retainer Package</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-300 uppercase">Campaign Goals & Message</label>
                            <textarea
                              rows={3}
                              value={inquiryMessage}
                              onChange={(e) => setInquiryMessage(e.target.value)}
                              placeholder="Tell us about your product, campaign objectives, launch dates, or special deliverable requests..."
                              className="w-full px-4 py-3 rounded-xl bg-[#162334] border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={inquirySending}
                            className="w-full py-4 px-6 rounded-2xl text-[#05080E] font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                            style={{ background: accentColor }}
                          >
                            <Send className="w-4 h-4" />
                            <span>{inquirySending ? 'Sending Campaign Brief...' : 'Send Campaign Brief to Creator'}</span>
                          </button>
                        </form>
                      )}

                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: BRAND DEAL CRM & LEAD TRACKER (UTM Attribution)              */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0D1520] border border-white/10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    Search Intent: "how to track brand deals"
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Creator Brand Deal CRM & Lead Pipeline
                  </h3>
                  <p className="text-xs text-gray-400">
                    Track inbound sponsorship requests from your live media kit, social bios, and outreach campaigns.
                  </p>
                </div>

                <button
                  onClick={fetchDeals}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>Refresh Deals</span>
                </button>
              </div>

              {/* CRM Pipeline Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#101A27] border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Inquiries</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">{leads.length}</span>
                  <span className="text-[10px] text-gray-400">Active deal queue</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#101A27] border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Pipeline Value</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                    ₹{leads.reduce((acc, d) => acc + (d.deal_value || 50000), 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-300">Total estimated budget</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#101A27] border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Top Traffic Source</span>
                  <span className="text-lg font-black text-cyan-300 truncate mt-1 block">
                    {leads[0]?.utm_source || 'Instagram Bio'}
                  </span>
                  <span className="text-[10px] text-cyan-400">UTM Attributed</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#101A27] border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Deals Won</span>
                  <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">
                    {leads.filter(d => d.status === 'Deal Won').length}
                  </span>
                  <span className="text-[10px] text-purple-300">Closed sponsorships</span>
                </div>
              </div>

              {/* Deals Table / Cards */}
              <div className="p-6 rounded-3xl bg-[#0D1520] border border-white/10 space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Incoming Brand Inquiries
                </h4>

                {leads.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    No brand inquiries received yet. Share your live media kit link on Instagram bio or cold pitches to start collecting leads!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leads.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-5 rounded-2xl bg-[#121B27] border border-white/10 hover:border-cyan-400/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h5 className="text-base font-black text-white">{deal.brand_name}</h5>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-white/10 text-cyan-300 border border-white/10">
                              {deal.deliverables}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold">
                              {deal.budget_band}
                            </span>
                          </div>

                          <p className="text-xs text-gray-400 line-clamp-1">
                            Contact: <strong className="text-slate-300">{deal.contact_name}</strong> ({deal.contact_email})
                          </p>

                          {deal.message && (
                            <p className="text-xs text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5 line-clamp-2">
                              "{deal.message}"
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-1">
                            <span>📅 {new Date(deal.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-cyan-400 font-bold">
                              🔗 UTM: {deal.utm_source}
                            </span>
                          </div>
                        </div>

                        {/* Status Change & Action */}
                        <div className="flex items-center gap-3 shrink-0">
                          <select
                            value={deal.status}
                            onChange={(e) => handleUpdateStatus(deal.id, e.target.value)}
                            className="px-3 py-2 rounded-xl bg-[#1A2636] border border-white/15 text-xs text-white font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="New Inquiry">New Inquiry</option>
                            <option value="Negotiating">Negotiating</option>
                            <option value="Contract Sent">Contract Sent</option>
                            <option value="Deal Won">Deal Won 🎉</option>
                            <option value="Passed">Passed</option>
                          </select>

                          <button
                            onClick={() => {
                              setContractBrand(deal.brand_name);
                              setContractDeliverable(deal.deliverables);
                              setContractFee(String(deal.deal_value || '75,000'));
                              setActiveTab('contract');
                            }}
                            className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                          >
                            Create Contract →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: STANDARDIZED SPONSORSHIP CONTRACT GENERATOR                  */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'contract' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Contract Parameters (4 Cols) */}
              <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-[#0D1520] border border-white/10 space-y-4 shadow-xl">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    Search Intent: "influencer brand agreement"
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    Contract Generator
                  </h3>
                  <p className="text-xs text-gray-400">
                    Instant legal agreement with Net-15/30 payment terms and deliverable protection.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Sponsor / Brand Name</label>
                  <input
                    type="text"
                    value={contractBrand}
                    onChange={(e) => setContractBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Deliverables Agreed</label>
                  <input
                    type="text"
                    value={contractDeliverable}
                    onChange={(e) => setContractDeliverable(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Total Fee (₹)</label>
                    <input
                      type="text"
                      value={contractFee}
                      onChange={(e) => setContractFee(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Payment Terms</label>
                    <select
                      value={contractTerms}
                      onChange={(e) => setContractTerms(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white font-bold cursor-pointer"
                    >
                      <option value="Net-15 Days">Net-15 Days</option>
                      <option value="Net-30 Days">Net-30 Days</option>
                      <option value="100% Upfront">100% Upfront</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Target Delivery Deadline</label>
                  <input
                    type="text"
                    value={contractDeadline}
                    onChange={(e) => setContractDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141F2D] border border-white/15 text-xs text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(contractText);
                      setContractCopied(true);
                      setTimeout(() => setContractCopied(false), 2000);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#05080E] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    {contractCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{contractCopied ? 'Contract Copied!' : 'Copy Agreement Text'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Live Legal Contract Preview (8 Cols) */}
              <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#0D1520] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Standard Creator-Brand Agreement Template
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Agreement
                  </button>
                </div>

                <pre className="p-6 rounded-2xl bg-[#090E16] border border-white/10 text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto">
                  {contractText}
                </pre>
              </div>

            </div>
          )}

        </div>
      </section>

      <Footer />
    </main>
  );
}
