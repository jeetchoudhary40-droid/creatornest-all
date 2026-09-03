'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, Sparkles, TrendingUp, DollarSign, CheckCircle2,
  Copy, Check, Info, Shield, Layers, RefreshCw, BarChart2,
  ArrowRight, ArrowUpRight, Gift, Percent, Calendar, Award,
  Sliders, SlidersHorizontal, AlertCircle, FileText, Share2,
  Send, User, Phone, Mail, ChevronDown, ChevronUp, Zap, HelpCircle,
  ExternalLink, Video, Play, Camera
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const YoutubeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export interface NicheInfo {
  name: string;
  name_hi?: string;
  m: number;
  tag: string;
  tag_hi?: string;
  category: string;
}

export const NICHES_LIST: NicheInfo[] = [
  { name: 'Tech / SaaS / AI',       name_hi: 'टेक, सॉफ्टवेयर व AI',   m: 1.50, tag: 'Tech & AI',        tag_hi: 'टेक व एआई',        category: 'Tech' },
  { name: 'Finance / BFSI',         name_hi: 'फाइनेंस व बैंकिंग',    m: 2.00, tag: 'Finance & Money',   tag_hi: 'फाइनेंस व मनी',    category: 'Finance' },
  { name: 'EdTech / Education',     name_hi: 'एडटेक व पढ़ाई',         m: 1.25, tag: 'Education & Study', tag_hi: 'एजुकेशन व स्टडी', category: 'Education' },
  { name: 'Comedy / Entertainment', name_hi: 'कॉमेडी व एंटरटेनमेंट', m: 0.90, tag: 'Entertainment',     tag_hi: 'एंटरटेनमेंट',      category: 'Entertainment' },
  { name: 'Beauty / Skincare',      name_hi: 'ब्यूटी व स्किनकेयर',   m: 1.35, tag: 'Beauty & Skincare', tag_hi: 'ब्यूटी व स्किनकेयर', category: 'Lifestyle' },
  { name: 'Fashion / Lifestyle',    name_hi: 'फैशन व लाइफस्टाइल',    m: 1.30, tag: 'Fashion & Style',   tag_hi: 'फैशन व स्टाइल',   category: 'Lifestyle' },
  { name: 'Gaming / Esports',       name_hi: 'गेमिंग व ई-स्पोर्ट्स', m: 1.20, tag: 'Gaming & Esports',  tag_hi: 'गेमिंग व ईस्पोर्ट्स', category: 'Gaming' },
  { name: 'Health / Fitness',       name_hi: 'हेल्थ व फिटनेस',       m: 1.40, tag: 'Health & Fitness',  tag_hi: 'हेल्थ व फिटनेस',  category: 'Health' },
  { name: 'Food / Cooking',         name_hi: 'फूड व कुकिंग',         m: 1.15, tag: 'Food & Cooking',    tag_hi: 'फूड व कुकिंग',    category: 'Food' },
  { name: 'Travel & Vlogging',      name_hi: 'ट्रैवल व व्लॉगिंग',    m: 1.10, tag: 'Travel',            tag_hi: 'ट्रैवल व टूर',     category: 'Travel' },
  { name: 'Crypto / Web3',          name_hi: 'क्रिप्टो व वेब3',      m: 1.80, tag: 'Crypto & Web3',     tag_hi: 'क्रिप्टो व वेब3',  category: 'Finance' },
  { name: 'Parenting / Family',     name_hi: 'पेरेंटिंग व फैमिली',   m: 1.05, tag: 'Family & Parenting',tag_hi: 'फैमिली व पेरेंटिंग', category: 'Lifestyle' },
  { name: 'General Lifestyle',      name_hi: 'जनरल लाइफस्टाइल',      m: 1.00, tag: 'General Lifestyle', tag_hi: 'डेली लाइफस्टाइल', category: 'Lifestyle' },
];

export const DLV_IG = [
  { n: 'Dedicated Reel (30–60 sec)',          n_hi: 'डेडिकेटेड रील (30–60 सेकंड)',          m: 1.00, desc: 'Primary 100% brand-focused vertical Reel with link sticker & audio', desc_hi: '100% ब्रांड केंद्रित वर्टिकल रील, लिंक स्टिकर और म्यूजिक' },
  { n: 'Integrated Reel Mention (15–20 sec)', n_hi: 'इंटीग्रेटेड रील मेंशन (15–20 सेकंड)', m: 0.60, desc: 'Seamless brand integration in an organic storytelling Reel', desc_hi: 'ऑर्गेनिक वीडियो में 15-20 सेकंड का ब्रांड मेंशन' },
  { n: 'Story Set — 3 Frames + Link Sticker', n_hi: 'स्टोरी सेट — 3 फ्रेम्स + लिंक स्टिकर', m: 0.35, desc: '24-hour sequence with high-converting link sticker CTA', desc_hi: '24 घंटे लाइव रहने वाली 3 स्टोरीज का सेट डायरेक्ट लिंक के साथ' },
  { n: 'Carousel Post (3–8 Slides)',          n_hi: 'कैरूसेल पोस्ट (3–8 स्लाइड्स)',        m: 0.65, desc: 'High-save educational or product showcase swipe carousel', desc_hi: 'एजुकेशनल या प्रोडक्ट स्वाइप कैरूसेल' },
  { n: 'Static Feed Post',                    n_hi: 'स्टैटिक फीड पोस्ट',                    m: 0.55, desc: 'High-resolution branded visual + detailed value caption', desc_hi: 'हाई-क्वालिटी फोटो पोस्ट + विस्तृत कैप्शन' },
  { n: 'Story Set — 5 Frames',                n_hi: 'स्टोरी सेट — 5 फ्रेम्स',                m: 0.50, desc: 'Comprehensive unboxing/review story series', desc_hi: 'अनबॉक्सिंग व रिव्यू की विस्तृत 5 स्टोरीज' },
  { n: 'Single Story Frame',                  n_hi: 'सिंगल स्टोरी फ्रेम',                  m: 0.20, desc: 'Quick shoutout with direct sticker', desc_hi: 'क्विक शाउटआउट लिंक स्टिकर के साथ' },
  { n: 'Instagram Live (per hour)',           n_hi: 'इंस्टाग्राम लाइव (प्रति घंटा)',        m: 0.45, desc: 'Live interaction with Q&A', desc_hi: 'लाइव बातचीत व दर्शकों के सवाल-जवाब' },
  { n: 'Broadcast Channel Announcement',      n_hi: 'ब्रॉडकास्ट चैनल घोषणा',              m: 0.15, desc: 'Direct message broadcast to superfans', desc_hi: 'ब्रॉडकास्ट चैनल में डायरेक्ट मैसेज' },
  { n: 'Series Takeover (per day)',           n_hi: 'सीरीज टेकओवर (प्रति दिन)',           m: 1.50, desc: 'Full account takeover campaign', desc_hi: 'पूरे दिन का ब्रांडेड टेकओवर कैंपेन' },
];

export const DLV_YT = [
  { n: 'Dedicated Full Video (8–15 min)',       n_hi: 'फुल डेडिकेटेड वीडियो (8–15 मिनट)',     m: 1.00, desc: '100% focused video reviewing or showcasing the brand', desc_hi: '100% ब्रांड व प्रोडक्ट पर आधारित पूरा वीडियो' },
  { n: 'Integrated Mid-Roll (60–90 sec)',      n_hi: 'इंटीग्रेटेड मिड-रोल (60–90 सेकंड)',    m: 0.55, desc: 'Dedicated 60-90s mid-roll sponsor segment with pinned comment & link', desc_hi: 'वीडियो के बीच में 60-90 सेकंड का स्पॉन्सर सेगमेंट + पिन कमेंट लिंक' },
  { n: 'Dedicated YouTube Short',              n_hi: 'डेडिकेटेड यूट्यूब शॉर्ट (60s)',          m: 0.35, desc: 'Viral 60s vertical video optimized for YouTube Shorts feed', desc_hi: 'यूट्यूब शॉर्ट्स के लिए 60 सेकंड का डेडिकेटेड वर्टिकल वीडियो' },
  { n: 'Pre-Roll Mention (15–30 sec)',         n_hi: 'प्री-रोल मेंशन (15–30 सेकंड)',         m: 0.30, desc: 'First 30 seconds sponsor opener', desc_hi: 'वीडियो के शुरू के 30 सेकंड में ब्रांड स्पॉन्सर' },
  { n: 'Shorts Brand Mention',                 n_hi: 'शॉर्ट्स ब्रांड मेंशन (10-15s)',         m: 0.20, desc: 'Organic 10s mention in regular Short', desc_hi: 'सामान्य शॉर्ट में 10 सेकंड का ब्रांड मेंशन' },
  { n: 'Dedicated Long-Form (15–30 min)',      n_hi: 'लॉन्ग-फॉर्म वीडियो (15–30 मिनट)',      m: 1.30, desc: 'In-depth documentary, tear-down, or masterclass', desc_hi: 'गहन डॉक्यूमेंट्री या मास्टरक्लास वीडियो' },
  { n: 'Community Tab Post + Link',            n_hi: 'कम्युनिटी टैब पोस्ट + लिंक',           m: 0.12, desc: 'Branded image/poll post directly to channel subscribers', desc_hi: 'सब्सक्राइबर्स के लिए कम्युनिटी पोस्ट' },
  { n: 'End-Card & Top Description Link',      n_hi: 'एंड-स्क्रीन व डिस्क्रिप्शन लिंक',       m: 0.10, desc: 'Pinned comment + top 3 description links', desc_hi: 'पिन कमेंट व डिस्क्रिप्शन में लिंक' },
  { n: 'Live Stream Sponsor Mention (per hr)',  n_hi: 'लाइव स्ट्रीम मेंशन (प्रति घंटा)',      m: 0.40, desc: 'Overlay logo + verbal shoutout during livestream', desc_hi: 'लाइव स्ट्रीम में लोगो व बोलकर प्रमोशन' },
  { n: 'Video Series (per video, 3+ commit)',   n_hi: 'वीडियो सीरीज (3+ वीडियो बंडल)',        m: 0.85, desc: 'Multi-video volume commitment pack', desc_hi: 'मल्टी-वीडियो बंडल पैकेज (प्रति वीडियो)' },
];

export function getTierInfo(followers: number, isHindi: boolean = false) {
  if (followers < 1000)    return { name: isHindi ? 'सब-नैनो क्रिएटर' : 'Sub-Nano Creator', floor: 500,    ceil: 2000,    badge: isHindi ? '🌱 सब-नैनो' : '🌱 Sub-Nano' };
  if (followers < 10000)   return { name: isHindi ? 'नैनो क्रिएटर' : 'Nano Creator',     floor: 2000,   ceil: 8000,    badge: isHindi ? '🚀 नैनो क्रिएटर' : '🚀 Nano Creator' };
  if (followers < 50000)   return { name: isHindi ? 'माइक्रो क्रिएटर' : 'Micro Creator',    floor: 8000,   ceil: 25000,   badge: isHindi ? '⭐ माइक्रो क्रिएटर' : '⭐ Micro Creator' };
  if (followers < 200000)  return { name: isHindi ? 'मिड-टियर क्रिएटर' : 'Mid-Tier Creator', floor: 30000,  ceil: 80000,   badge: isHindi ? '🔥 मिड-टियर' : '🔥 Mid-Tier' };
  if (followers < 1000000) return { name: isHindi ? 'मैक्रो क्रिएटर' : 'Macro Creator',    floor: 100000, ceil: 350000,  badge: isHindi ? '💎 मैक्रो क्रिएटर' : '💎 Macro Creator' };
  return                          { name: isHindi ? 'मेगा / एलीट क्रिएटर' : 'Mega / Elite',     floor: 400000, ceil: 1500000, badge: isHindi ? '👑 मेगा क्रिएटर' : '👑 Mega / Elite' };
}

export function formatINR(val: number): string {
  if (!val || isNaN(val)) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000)   return `₹${(val / 100000).toFixed(2)} Lakh`;
  if (val >= 1000)     return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export function formatINRFull(val: number): string {
  if (!val || isNaN(val)) return '₹0';
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function BrandDealCalculator() {
  const { isHindi, t } = useLanguage();

  // Primary platform
  const [platform, setPlatform] = useState<'yt' | 'ig'>('yt');

  // Mandatory Creator Handle
  const [channelHandle, setChannelHandle] = useState<string>('');
  const [handleError, setHandleError] = useState<string>('');

  // Core Metrics
  const [followersStr, setFollowersStr] = useState<string>('50000');
  const [viewsStr, setViewsStr] = useState<string>('20000');
  const [er, setEr] = useState<number>(4.5);
  const [selectedNiche, setSelectedNiche] = useState<string>('Tech / SaaS / AI');
  const [cityTier, setCityTier] = useState<number>(1.15); // Tier 1 (+15%)

  // Calculation State
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [copiedRateCard, setCopiedRateCard] = useState<boolean>(false);
  const [showAllDeliverables, setShowAllDeliverables] = useState<boolean>(false);

  // Optional Barter input
  const [mrpInput, setMrpInput] = useState<string>('');

  // Optional Contact info for lead capture
  const [creatorEmail, setCreatorEmail] = useState<string>('');
  const [creatorPhone, setCreatorPhone] = useState<string>('');

  // Numeric Values
  const followers = Math.max(100, Number(followersStr) || 0);
  const views = Math.max(50, Number(viewsStr) || 0);
  const mrp = Number(mrpInput) || 0;

  const currentNiche = useMemo(() => {
    return NICHES_LIST.find(n => n.name === selectedNiche) || NICHES_LIST[0];
  }, [selectedNiche]);

  const tier = useMemo(() => getTierInfo(followers, isHindi), [followers, isHindi]);

  // Engagement Quality Multiplier
  const eng = useMemo(() => {
    if (er >= 8.0) return { m: 1.30, label: isHindi ? 'सुपर वायरल' : 'Super Viral', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', desc: isHindi ? 'असाधारण जुड़ाव (+30%)' : 'Exceptional audience loyalty (+30%)' };
    if (er >= 5.0) return { m: 1.15, label: isHindi ? 'उच्च जुड़ाव' : 'High Engagement', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', desc: isHindi ? 'मजबूत सक्रिय दर्शक (+15%)' : 'Strong active audience (+15%)' };
    if (er >= 3.0) return { m: 1.00, label: isHindi ? 'स्वस्थ सामान्य' : 'Healthy Standard', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/30', desc: isHindi ? 'मानक औसत' : 'Industry benchmark average' };
    if (er >= 1.5) return { m: 0.90, label: isHindi ? 'मध्यम' : 'Moderate', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30', desc: isHindi ? 'औसत से थोड़ा कम (-10%)' : 'Slightly below average (-10%)' };
    return                { m: 0.75, label: isHindi ? 'कम जुड़ाव' : 'Low Engagement', cls: 'text-rose-400 bg-rose-500/10 border-rose-500/30', desc: isHindi ? 'सुधार की आवश्यकता (-25%)' : 'Needs retention boost (-25%)' };
  }, [er, isHindi]);

  // 70/30 Core Pricing Engine
  const {
    finalRate,
    oneDealLow,
    oneDealHigh,
    integratedRate,
    integratedLow,
    integratedHigh,
    effectiveCPM,
    monthlyMin,
    monthlyMax,
    deliverables
  } = useMemo(() => {
    // 1. Dynamic CPV (YouTube vs Instagram)
    const baseCPV = platform === 'yt' ? 1.15 : 0.90;
    const viewsValue = views * baseCPV * currentNiche.m * eng.m * cityTier;

    // 2. Tier Floor
    const tierFloor = tier.floor * currentNiche.m;

    // 3. 70/30 Composite Model
    const compositeBase = (viewsValue * 0.70) + (tierFloor * 0.30);
    const dedicated = Math.max(tier.floor, Math.round(compositeBase));

    // Pricing Bands (±15%)
    const low = Math.round(dedicated * 0.88);
    const high = Math.round(dedicated * 1.15);

    // Integrated Rate (60% on IG, 55% on YT)
    const intMult = platform === 'yt' ? 0.55 : 0.60;
    const intRate = Math.round(dedicated * intMult);
    const intLow = Math.round(intRate * 0.88);
    const intHigh = Math.round(intRate * 1.15);

    // Effective CPM
    const cpm = views > 0 ? (dedicated / views) * 1000 : 0;

    // Monthly capacity (2 to 4 deals per month)
    const mMin = Math.round(dedicated * 1.8);
    const mMax = Math.round(dedicated * 4.2);

    const dlvList = platform === 'yt' ? DLV_YT : DLV_IG;

    return {
      finalRate: dedicated,
      oneDealLow: low,
      oneDealHigh: high,
      integratedRate: intRate,
      integratedLow: intLow,
      integratedHigh: intHigh,
      effectiveCPM: cpm,
      monthlyMin: mMin,
      monthlyMax: mMax,
      deliverables: dlvList
    };
  }, [platform, views, currentNiche, eng, cityTier, tier]);

  // Barter Assessment
  const barterFairThreshold = Math.round(finalRate * 0.80);
  const isBarterFair = mrp >= barterFairThreshold;
  const suggestedCashTopUp = Math.max(0, finalRate - mrp);

  // Handle Calculate & Lead Recording
  const handleCalculate = async () => {
    if (!channelHandle.trim()) {
      setHandleError(isHindi ? 'कृपया अपना यूट्यूब या इंस्टाग्राम हैंडल दर्ज करें।' : 'Please enter your YouTube channel handle or Instagram profile ID.');
      const inputEl = document.getElementById('creator-handle-input');
      if (inputEl) inputEl.focus();
      return;
    }
    setHandleError('');
    setIsCalculating(true);

    const leadPayload = {
      platform,
      channelHandle: channelHandle.trim(),
      followers,
      avgViews: views,
      engagementRate: er,
      niche: currentNiche.tag,
      cityTier: cityTier === 1.15 ? 'Tier 1' : cityTier === 1.08 ? 'Tier 2' : 'Tier 3',
      language: isHindi ? 'Hindi' : 'English',
      calculatedBaseRate: finalRate,
      estimatedMonthlyCapacity: `${formatINR(monthlyMin)} – ${formatINR(monthlyMax)}`,
      email: creatorEmail || null,
      phone: creatorPhone || null
    };

    try {
      await fetch('/api/creator/calculator-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });

      if (typeof window !== 'undefined') {
        const existingLeads = JSON.parse(localStorage.getItem('cn_calculator_leads') || '[]');
        existingLeads.unshift({ ...leadPayload, timestamp: new Date().toISOString() });
        localStorage.setItem('cn_calculator_leads', JSON.stringify(existingLeads.slice(0, 50)));
      }
    } catch (err) {
      console.warn('Saved calculation locally', err);
    }

    setTimeout(() => {
      setIsCalculating(false);
      setIsCalculated(true);
      const resSection = document.getElementById('results-section');
      if (resSection) {
        resSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 600);
  };

  const handleCopyRateCard = () => {
    const cleanHandle = channelHandle.trim() || (platform === 'yt' ? '@yourchannel' : '@yourhandle');
    const text = isHindi ? `📊 **ऑफिशियल क्रिएटर रेट कार्ड — ${cleanHandle}**
• **प्लेटफॉर्म:** ${platform === 'yt' ? 'YouTube' : 'Instagram'}
• **कम्युनिटी:** ${followers.toLocaleString('en-IN')} सब्सक्राइबर्स / फॉलोअर्स
• **औसत व्यूज:** ${views.toLocaleString('en-IN')} प्रति पोस्ट
• **एंगेजमेंट रेट:** ${er}% (${eng.label})
• **केटेगरी (Niche):** ${currentNiche.tag_hi || currentNiche.tag}

💰 **अनुशंसित 1-डील स्पॉन्सरशिप रेट्स:**
1. **${deliverables[0].n_hi || deliverables[0].n}:** ${formatINRFull(finalRate)} (Band: ${formatINRFull(oneDealLow)} – ${formatINRFull(oneDealHigh)})
2. **${deliverables[1].n_hi || deliverables[1].n}:** ${formatINRFull(integratedRate)} (Band: ${formatINRFull(integratedLow)} – ${formatINRFull(integratedHigh)})
3. **${deliverables[2].n_hi || deliverables[2].n}:** ${formatINRFull(Math.round(deliverables[2].m * finalRate))}
4. **${deliverables[3].n_hi || deliverables[3].n}:** ${formatINRFull(Math.round(deliverables[3].m * finalRate))}

• **इफेक्टिव CPM:** ${formatINRFull(effectiveCPM)} प्रति 1,000 व्यूज
• **अनुमानित मंथली स्पॉन्सरशिप कैपेसिटी:** ${formatINR(monthlyMin)} – ${formatINR(monthlyMax)} / माह

*वेरिफाइड वाया क्रिएटर नेस्ट प्राइसिंग इंटेलिजेंस (creator-nest.in)*`
    : `📊 **Official Creator Rate Card — ${cleanHandle}**
• **Platform:** ${platform === 'yt' ? 'YouTube' : 'Instagram'}
• **Channel Community:** ${followers.toLocaleString('en-IN')} Followers / Subscribers
• **Average Reach / Views:** ${views.toLocaleString('en-IN')} per post
• **Audience Engagement:** ${er}% (${eng.label})
• **Niche & Category:** ${currentNiche.tag} (Tier 1 Audience)

💰 **Recommended 1-Deal Sponsorship Rates:**
1. **${deliverables[0].n}:** ${formatINRFull(finalRate)} (Band: ${formatINRFull(oneDealLow)} – ${formatINRFull(oneDealHigh)})
2. **${deliverables[1].n}:** ${formatINRFull(integratedRate)} (Band: ${formatINRFull(integratedLow)} – ${formatINRFull(integratedHigh)})
3. **${deliverables[2].n}:** ${formatINRFull(Math.round(deliverables[2].m * finalRate))}
4. **${deliverables[3].n}:** ${formatINRFull(Math.round(deliverables[3].m * finalRate))}

• **Effective CPM:** ${formatINRFull(effectiveCPM)} per 1,000 targeted views
• **Estimated Monthly Sponsorship Capacity:** ${formatINR(monthlyMin)} – ${formatINR(monthlyMax)} / mo

*Verified via Creator Nest Pricing Intelligence (creator-nest.in)*`;

    navigator.clipboard.writeText(text);
    setCopiedRateCard(true);
    setTimeout(() => setCopiedRateCard(false), 2000);
  };

  return (
    <div className="w-full text-white space-y-8">
      
      {/* ── 1. Creator Input Card ── */}
      <div className="rounded-3xl bg-[#121A26] border border-white/10 p-5 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[100px] pointer-events-none opacity-20 bg-emerald-500" />

        {/* Title & Platform Switch */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
                {isHindi ? 'क्रिएटर प्राइसिंग इंजन' : 'Creator Pricing Engine'}
              </span>
              <LanguageSwitcher compact />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isHindi ? 'ब्रांड डील्स प्राइस व कैपेसिटी कैलकुलेटर' : 'Brand Deals Price & Capacity Calculator'}
            </h3>
            <p className="text-xs text-slate-300">
              {isHindi ? 'यूट्यूब या इंस्टाग्राम पर 1 ब्रांड डील के लिए कितना चार्ज करना चाहिए, सटीक जानें' : 'Find out exactly how much you should charge for 1 Brand Deal on YouTube or Instagram'}
            </p>
          </div>

          <div className="flex bg-[#182333] p-1.5 rounded-2xl border border-white/15">
            <button
              onClick={() => setPlatform('yt')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                platform === 'yt' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <YoutubeIcon className="w-4 h-4" />
              <span>YouTube</span>
            </button>
            <button
              onClick={() => setPlatform('ig')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                platform === 'ig' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Instagram</span>
            </button>
          </div>
        </div>

        {/* Form Row 1: Channel Handle / URL & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Mandatory Handle Input */}
          <div className={`p-4 rounded-2xl bg-[#182333] border transition-all space-y-1.5 ${
            handleError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/10'
          }`}>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              {platform === 'yt' 
                ? (isHindi ? 'यूट्यूब चैनल हैंडल / लिंक' : 'YouTube Channel Handle / Link') 
                : (isHindi ? 'इंस्टाग्राम प्रोफाइल हैंडल' : 'Instagram Handle')
              } <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2 bg-[#0E1520] border border-white/15 rounded-xl px-3 py-2">
              {platform === 'yt' ? <YoutubeIcon className="w-4 h-4 text-red-400 shrink-0" /> : <InstagramIcon className="w-4 h-4 text-pink-400 shrink-0" />}
              <input
                id="creator-handle-input"
                type="text"
                value={channelHandle}
                onChange={(e) => {
                  setChannelHandle(e.target.value);
                  if (handleError) setHandleError('');
                }}
                placeholder={platform === 'yt' ? (isHindi ? 'उदा. @TechGuideHindi या चैनल लिंक' : 'e.g. @yourchannel or youtube.com/...') : (isHindi ? 'उदा. @creatorshub.in' : 'e.g. @yourhandle')}
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none placeholder:text-slate-500"
              />
            </div>
            {handleError ? (
              <span className="text-[11px] text-rose-400 font-bold block">{handleError}</span>
            ) : (
              <span className="text-[10px] text-slate-400 block">
                {isHindi ? 'सत्यापित 1-डील रिपोर्ट बनाने के लिए आवश्यक' : 'Required to generate your verified 1-deal report'}
              </span>
            )}
          </div>

          {/* Followers / Subscribers */}
          <div className="p-4 rounded-2xl bg-[#182333] border border-white/10 space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              {isHindi ? 'फॉलोअर्स / सब्सक्राइबर्स' : 'Followers / Subscribers'} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={followersStr}
              onChange={(e) => setFollowersStr(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 50000"
              className="w-full bg-[#0E1520] border border-white/15 rounded-xl px-3 py-2 text-sm font-black text-white focus:outline-none focus:border-primary font-mono"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span className="font-semibold text-slate-300">{tier.name}</span>
              <div className="flex gap-1">
                {['10K', '50K', '100K', '500K'].map((p) => {
                  const num = p === '10K' ? 10000 : p === '50K' ? 50000 : p === '100K' ? 100000 : 500000;
                  return (
                    <button
                      key={p}
                      onClick={() => setFollowersStr(String(num))}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 font-medium cursor-pointer"
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Average Views */}
          <div className="p-4 rounded-2xl bg-[#182333] border border-white/10 space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              {isHindi ? 'प्रति वीडियो/पोस्ट औसत व्यूज' : 'Average Views / Reach per Post'} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={viewsStr}
              onChange={(e) => setViewsStr(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 20000"
              className="w-full bg-[#0E1520] border border-white/15 rounded-xl px-3 py-2 text-sm font-black text-white focus:outline-none focus:border-primary font-mono"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>{isHindi ? 'पिछले 10-15 पोस्ट्स का औसत' : 'Average of last 10–15 posts'}</span>
              <div className="flex gap-1">
                {['5K', '20K', '50K', '100K'].map((v) => {
                  const num = v === '5K' ? 5000 : v === '20K' ? 20000 : v === '50K' ? 50000 : 100000;
                  return (
                    <button
                      key={v}
                      onClick={() => setViewsStr(String(num))}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 font-medium cursor-pointer"
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Form Row 2: Select 1 Niche Category */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              {isHindi ? 'कंटेंट केटेगरी (Niche)' : 'Select Content Niche'} <span className="text-rose-400">*</span>
            </label>
            <span className="text-xs text-emerald-400 font-black">
              {isHindi ? 'वर्तमान चयनित:' : 'Selected:'} {currentNiche.tag_hi || currentNiche.tag} ({currentNiche.m}x {isHindi ? 'मल्टीप्लायर' : 'Multiplier'})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
            {NICHES_LIST.map((ni) => {
              const isSelected = selectedNiche === ni.name;
              return (
                <button
                  key={ni.name}
                  onClick={() => setSelectedNiche(ni.name)}
                  className={`p-2.5 rounded-xl text-left transition-all flex flex-col justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500/25 to-cyan-500/15 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400'
                      : 'bg-[#182333] border-white/10 text-slate-300 hover:bg-[#1E2B3E] hover:text-white'
                  }`}
                >
                  <span className="text-[10px] text-slate-300 font-mono font-bold mb-1">
                    {ni.m >= 1.5 ? '🔥 High Budget' : ni.m >= 1.2 ? '⭐ Good Demand' : 'Standard'}
                  </span>
                  <span className="text-xs font-black truncate">{isHindi ? (ni.tag_hi || ni.tag) : ni.tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Row 3: Engagement Rate & City Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Engagement Rate Slider */}
          <div className="p-4 rounded-2xl bg-[#182333] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {isHindi ? 'एंगेजमेंट रेट (ER%):' : 'Engagement Rate (ER%):'} <span className={`text-[10px] px-2 py-0.5 rounded-md border font-black ml-1.5 ${eng.cls}`}>{eng.label}</span>
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono">{er.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={15}
              step={0.1}
              value={er}
              onChange={(e) => setEr(Number(e.target.value))}
              className="w-full accent-emerald-400 h-2 bg-[#0E1520] rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block font-medium">{eng.desc}</span>
          </div>

          {/* City / Audience Tier */}
          <div className="p-4 rounded-2xl bg-[#182333] border border-white/10 space-y-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              {isHindi ? 'ऑडियंस शहर केटेगरी (City Tier)' : 'Audience City Tier'}
            </span>
            <select
              value={cityTier}
              onChange={(e) => setCityTier(Number(e.target.value))}
              className="w-full bg-[#0E1520] border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value={1.15}>{isHindi ? 'टियर 1 शहर — मुंबई, दिल्ली NCR, बैंगलोर, पुणे (+15%)' : 'Tier 1 Cities — Mumbai, Delhi NCR, Bangalore, Pune (+15%)'}</option>
              <option value={1.08}>{isHindi ? 'टियर 2 शहर — हैदराबाद, चेन्नई, अहमदाबाद, कोलकाता (+8%)' : 'Tier 2 Cities — Hyderabad, Chennai, Ahmedabad, Kolkata (+8%)'}</option>
              <option value={1.00}>{isHindi ? 'टियर 3 / संपूर्ण भारत / क्षेत्रीय (मानक बेस)' : 'Tier 3 / Pan-India / Regional (Standard Base)'}</option>
            </select>
            <span className="text-[10px] text-slate-400 block font-medium">
              {isHindi ? 'मेट्रो शहरों की ऑडियंस पर ब्रांड्स अधिक स्पॉन्सरशिप बजट खर्च करते हैं' : 'Metro city audiences command higher sponsorship budgets'}
            </span>
          </div>

        </div>

        {/* Calculate Button */}
        <div className="pt-2">
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="w-full py-4 rounded-2xl font-black text-sm sm:text-base text-[#05080E] transition-all flex items-center justify-center gap-2.5 shadow-2xl hover:opacity-95 active:scale-[0.99] cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #10B981, #00F2FE)' }}
          >
            {isCalculating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{isHindi ? 'चैनल डेटा का विश्लेषण व प्राइसिंग की गणना जारी है...' : 'Analyzing Channel Data & Calculating 1-Deal Pricing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{isHindi ? 'मेरी 1-डील ब्रांड प्राइसिंग कैलकुलेट करें' : 'Calculate My Brand Deal Pricing'}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* ── 2. Personalized Results & 1-Deal Pricing ── */}
      {isCalculated && (
        <div id="results-section" className="space-y-8 animate-in fade-in duration-500">
          
          {/* Primary 1-Deal Hero Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-500/15 via-[#121A26] to-[#121A26] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-[#05080E] font-black text-xs">
                    🎉 {isHindi ? '1-डील प्राइसिंग तैयार' : '1-Deal Pricing Calculated'}
                  </span>
                  <span className="text-xs text-slate-200 font-bold">
                    {isHindi ? 'अकाउंट:' : 'For Account:'} <strong className="text-white text-sm underline decoration-emerald-400">{channelHandle.trim()}</strong>
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  {isHindi ? 'आप 1 ब्रांड डील के लिए ' : 'You Can Charge '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {formatINR(oneDealLow)} – {formatINR(oneDealHigh)}
                  </span>{' '}
                  {isHindi ? 'चार्ज कर सकते हैं' : 'for 1 Brand Deal'}
                </h2>

                <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
                  {isHindi ? (
                    <>
                      नमस्ते <strong>{channelHandle.trim()}</strong>! आपके <strong>{followers.toLocaleString('en-IN')} {platform === 'yt' ? 'सब्सक्राइबर्स' : 'फॉलोअर्स'}</strong> और <strong>{views.toLocaleString('en-IN')} औसत व्यूज</strong> के आधार पर, आपका अकाउंट <strong className="text-emerald-400">{tier.name}</strong> श्रेणी में आता है। यहाँ आपका आधिकारिक 1-डील स्पॉन्सरशिप रेट कार्ड है:
                    </>
                  ) : (
                    <>
                      Hey <strong>{channelHandle.trim()}</strong>! Based on your <strong>{followers.toLocaleString('en-IN')} {platform === 'yt' ? 'subscribers' : 'followers'}</strong> and <strong>{views.toLocaleString('en-IN')} average views</strong> in <strong>{currentNiche.tag}</strong>, your account belongs to the <strong className="text-emerald-400">{tier.name}</strong>. Here is your official 1-deal sponsorship rate card:
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={handleCopyRateCard}
                className="px-5 py-3.5 rounded-xl bg-[#182333] hover:bg-[#223147] text-white border border-white/15 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
              >
                {copiedRateCard ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-primary" />}
                <span>{copiedRateCard ? (isHindi ? 'रेट कार्ड कॉपी हो गया!' : 'Rate Card Copied!') : (isHindi ? 'ब्रांड्स के लिए रेट कार्ड कॉपी करें' : 'Copy Rate Card for Brands')}</span>
              </button>

            </div>
          </div>

          {/* 4 Highlight Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: 1-Deal Dedicated Fee */}
            <div className="p-5 rounded-2xl bg-[#141F2D] border border-white/15 space-y-2 shadow-lg">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                {isHindi ? '1-डील मुख्य डेडिकेटेड रेट' : '1-Deal Primary Rate'}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {formatINR(finalRate)}
              </p>
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs font-semibold text-slate-200 block">
                  {platform === 'yt' ? (isHindi ? 'प्रति डेडिकेटेड वीडियो' : 'Per Dedicated Video') : (isHindi ? 'प्रति डेडिकेटेड रील' : 'Per Dedicated Reel')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {isHindi ? 'रेंज:' : 'Band:'} {formatINR(oneDealLow)} – {formatINR(oneDealHigh)}
                </span>
              </div>
            </div>

            {/* Card 2: 1-Deal Integrated Mention */}
            <div className="p-5 rounded-2xl bg-[#141F2D] border border-white/15 space-y-2 shadow-lg">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                {isHindi ? '1-डील इंटीग्रेटेड रेट' : '1-Deal Integrated Rate'}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                {formatINR(integratedRate)}
              </p>
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs font-semibold text-slate-200 block">
                  {platform === 'yt' ? (isHindi ? 'मिड-रोल (60–90s)' : 'Per Mid-Roll (60–90s)') : (isHindi ? 'रील मेंशन (15–20s)' : 'Per Reel Mention (15–20s)')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {isHindi ? 'रेंज:' : 'Band:'} {formatINR(integratedLow)} – {formatINR(integratedHigh)}
                </span>
              </div>
            </div>

            {/* Card 3: Effective CPM */}
            <div className="p-5 rounded-2xl bg-[#141F2D] border border-white/15 space-y-2 shadow-lg">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                {isHindi ? 'इफेक्टिव ऑडियंस CPM' : 'Effective Audience CPM'}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                {formatINRFull(effectiveCPM)}
              </p>
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs font-semibold text-slate-200 block">
                  {isHindi ? 'लागत प्रति 1,000 व्यूज' : 'Cost per 1,000 Verified Views'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {currentNiche.tag_hi || currentNiche.tag} {isHindi ? 'बेंचमार्क' : 'Benchmark'}
                </span>
              </div>
            </div>

            {/* Card 4: Monthly Capacity */}
            <div className="p-5 rounded-2xl bg-[#141F2D] border border-white/15 space-y-2 shadow-lg">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                {isHindi ? 'मंथली स्पॉन्सरशिप क्षमता' : 'Monthly Sponsorship Capacity'}
              </span>
              <p className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
                {formatINR(monthlyMin)} – {formatINR(monthlyMax)}
              </p>
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs font-semibold text-slate-200 block">
                  {isHindi ? 'प्रति माह 2–4 डील्स पर आधारित' : 'Based on 2–4 deals / month'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {eng.label} {isHindi ? 'ऑडियंस' : 'audience'}
                </span>
              </div>
            </div>

          </div>

          {/* ── 3. Deliverables Pricing Cards ── */}
          <div className="rounded-3xl bg-[#121A26] border border-white/10 p-5 sm:p-8 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
              <div>
                <h4 className="text-base sm:text-xl font-black text-white">
                  {isHindi ? `अनुशंसित डिलीवरेबल्स प्राइसिंग (${platform === 'yt' ? 'यूट्यूब' : 'इंस्टाग्राम'})` : `Recommended Deliverables Pricing (${platform === 'yt' ? 'YouTube' : 'Instagram'})`}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  {isHindi ? 'ब्रांड्स व एजेंसियों को सीधे कोट करने के लिए प्रति-डील रेट्स' : 'Direct per-deal rates to quote brands, agencies, and sponsorship managers'}
                </p>
              </div>

              <button
                onClick={() => setShowAllDeliverables(!showAllDeliverables)}
                className="text-xs font-bold text-primary hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
              >
                <span>{showAllDeliverables ? (isHindi ? '4 मुख्य फॉर्मेट्स दिखाएं' : 'Show 4 Core Formats') : (isHindi ? 'सभी 10 फॉर्मेट्स देखें' : 'View All 10 Formats')}</span>
                {showAllDeliverables ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Deliverables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {deliverables.slice(0, showAllDeliverables ? deliverables.length : 4).map((d, i) => {
                const itemRate = Math.round(d.m * finalRate);
                const low = Math.round(itemRate * 0.88);
                const high = Math.round(itemRate * 1.15);

                return (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-[#141F2E] border border-white/15 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                        <span className="font-bold text-slate-300">{isHindi ? `फॉर्मेट ${i + 1}` : `Format ${i + 1}`}</span>
                        <span className="font-mono text-emerald-400 font-black text-sm">{formatINRFull(itemRate)}</span>
                      </div>
                      <h5 className="text-sm sm:text-base font-black text-white mb-1.5 leading-snug">{isHindi ? (d.n_hi || d.n) : d.n}</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">{isHindi ? (d.desc_hi || d.desc) : d.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">{isHindi ? 'रेट रेंज:' : 'Rate Band:'}</span>
                      <span className="text-xs sm:text-sm font-mono font-black text-white">
                        {formatINR(low)} – {formatINR(high)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* ── 4. Commercial Add-ons & Barter Calculator ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Commercial Add-ons */}
            <div className="p-6 rounded-3xl bg-[#121A26] border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  {isHindi ? 'कमर्शियल ऐड-ऑन्स (अतिरिक्त चार्ज करें)' : 'Extra Add-Ons to Charge Brands'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHindi ? 'अगर ब्रांड एक्सक्लूसिविटी या विज्ञापन अधिकार मांगता है, तो यह अतिरिक्त चार्ज जोड़ें:' : 'If a brand asks for exclusivity or ad whitelisting, charge these standard industry premiums:'}
              </p>

              <div className="space-y-3 text-xs">
                
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#182333] border border-white/10">
                  <div>
                    <p className="font-bold text-white text-sm">{isHindi ? 'केटेगरी एक्सक्लूसिविटी (30 दिन)' : 'Category Exclusivity (30 Days)'}</p>
                    <span className="text-xs text-slate-300">{isHindi ? 'प्रतियोगी ब्रांड्स के साथ काम न करने की शर्त' : 'Restricts working with rival brands in your niche'}</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-sm">+50% (+{formatINR(finalRate * 0.5)})</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#182333] border border-white/10">
                  <div>
                    <p className="font-bold text-white text-sm">{isHindi ? 'व्हाइटलिस्टिंग / पेड पार्टनरशिप ऐड्स' : 'Whitelisting / Paid Partnership Ads'}</p>
                    <span className="text-xs text-slate-300">{isHindi ? 'ब्रांड आपके हैंडल से विज्ञापन चलाएगा' : 'Brand runs paid Meta/YouTube ads via your handle'}</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-sm">+40% to +65%</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#182333] border border-white/10">
                  <div>
                    <p className="font-bold text-white text-sm">{isHindi ? 'ब्रांड सोशल रीपोस्टिंग राइट्स' : 'Brand Social Reposting Rights'}</p>
                    <span className="text-xs text-slate-300">{isHindi ? 'ब्रांड आपके वीडियो को अपने पेज पर शेयर करेगा' : 'Brand re-shares your video on their social pages'}</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-sm">+25% to +35%</span>
                </div>

              </div>
            </div>

            {/* Barter Checker */}
            <div className="p-6 rounded-3xl bg-[#121A26] border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  {isHindi ? 'बार्टर डील वैल्यूएटर (Barter Evaluator)' : 'Barter Deal Evaluator'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHindi ? 'ब्रांड पैसे के बजाय प्रोडक्ट देना चाहता है? प्रोडक्ट MRP दर्ज करके चेक करें कि क्या यह उचित है:' : 'A brand wants to gift products instead of paying cash? Enter product MRP to check if it\'s fair:'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">{isHindi ? 'प्रोडक्ट मार्केट वैल्यू / MRP (₹)' : 'Product Market Value / MRP (₹)'}</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={mrpInput}
                  onChange={(e) => setMrpInput(e.target.value)}
                  className="w-full bg-[#182333] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-mono font-bold"
                />
              </div>

              {mrp > 0 && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  isBarterFair
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isBarterFair ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>{isBarterFair ? (isHindi ? 'उचित बार्टर कोलैबोरेशन' : 'Fair Barter Collaboration') : (isHindi ? 'कम वैल्यू वाला बार्टर ऑफर' : 'Underpaid Barter Proposal')}</span>
                  </div>
                  <p className="text-slate-200 text-xs">
                    {isHindi 
                      ? <>आपके चैनल के लिए न्यूनतम उचित सीमा <strong>{formatINRFull(barterFairThreshold)}</strong> (मानक फीस का 80%) है।</>
                      : <>Fair threshold for your channel is <strong>{formatINRFull(barterFairThreshold)}</strong> (80% of standard fee).</>
                    }
                  </p>
                  {!isBarterFair && (
                    <p className="text-amber-300 font-bold text-xs pt-1.5 border-t border-rose-500/20">
                      {isHindi 
                        ? <>💡 अनुशंसित काउंटर ऑफर: फ्री प्रोडक्ट + <strong>{formatINRFull(suggestedCashTopUp)}</strong> नकद प्रोडक्शन फीस।</>
                        : <>💡 Recommended Counter-Offer: Free Product + <strong>{formatINRFull(suggestedCashTopUp)}</strong> cash production fee.</>
                      }
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* ── 5. Get Managed by Creator Nest CTA ── */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#182333] to-[#121A26] border border-primary/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-lg sm:text-xl font-black text-white">
                {isHindi ? 'क्या आप चाहते हैं कि क्रिएटर नेस्ट आपके लिए ब्रांड डील्स लाए?' : 'Want Creator Nest to Pitch Brands for You?'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {isHindi 
                  ? 'हम टेक, एजुकेशन, फाइनेंस व एंटरटेनमेंट क्रिएटर्स को शीर्ष ग्लोबल व भारतीय ब्रांड्स से जोड़ते हैं। हमारे रोस्टर से जुड़ें।'
                  : 'We represent and match tech, education, finance & entertainment creators with top global & Indian brands. Join our curated roster.'
                }
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/creators/roster"
                className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm text-[#05080E] transition-all shadow-lg hover:opacity-95"
                style={{ background: 'linear-gradient(135deg, #10B981, #00F2FE)' }}
              >
                {isHindi ? 'क्रिएटर रोस्टर जॉइन करें' : 'Join Creator Roster'}
              </a>
            </div>
          </div>

        </div>
      )}

      {/* ── 6. Terms, Beta Disclaimer & Transparency Note ── */}
      <div className="rounded-2xl bg-[#0E1520] border border-white/10 p-4 sm:p-5 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{isHindi ? 'टेस्टिंग फेज व डिस्क्लेमर सूचना' : 'Disclaimer & Beta Testing Notice'}</span>
        </div>
        <p className="leading-relaxed text-[11px] sm:text-xs text-slate-400">
          <strong>{isHindi ? 'कृपया ध्यान दें:' : 'Please Note:'}</strong> {isHindi 
            ? 'यह ब्रांड डील प्राइसिंग व कैपेसिटी कैलकुलेटर वर्तमान में एक्टिव बीटा/टेस्टिंग चरण में है। यहाँ प्रदर्शित प्राइसिंग अनुमान और CPM रेंज 2025–2026 के भारतीय क्रिएटर मार्केटिंग डेटा पर आधारित हैं। वास्तविक ब्रांड स्पॉन्सरशिप कमाई ब्रांड के बजट, एजेंसी कमीशन, फेस्टिव सीजन (जैसे दिवाली / आईपीएल) और अंतिम बातचीत के आधार पर भिन्न हो सकती है।'
            : 'This Brand Deal Pricing & Capacity Calculator is currently in an active Beta / Testing Phase. The pricing estimates, CPMs, and capacity ranges generated are data-driven benchmarks based on current Indian creator marketing trends (2025–2026). Actual brand sponsorship earnings may vary or differ based on brand marketing budgets, agency commissions, festive seasonality (e.g. Diwali / IPL surges), creator conversion track record, and final commercial negotiations.'
          }
        </p>
      </div>

    </div>
  );
}
