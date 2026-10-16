'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Sparkles, Loader2, ArrowLeft, ArrowRight,
  CheckCircle2, XCircle, AlertTriangle, HelpCircle, DollarSign,
  Star, AlertCircle, Copy, Check, ChevronDown, ChevronUp,
  RefreshCw, Shield, Target, ExternalLink, Bot, Zap, Info,
  Mail, Download, Send, TrendingUp, Users, ShoppingBag, Phone, Globe
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';

const YoutubeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

function ChannelAvatar({
  avatarUrl,
  title,
  className = "w-20 h-20 rounded-2xl",
  initialsClassName = "text-2xl font-black text-white"
}: {
  avatarUrl?: string;
  title: string;
  className?: string;
  initialsClassName?: string;
}) {
  const [hasError, setHasError] = useState(false);

  const getInitials = (str: string) => {
    if (!str) return 'YT';
    const words = str.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(title);

  if (!avatarUrl || hasError) {
    return (
      <div className={`relative ${className} bg-gradient-to-br from-red-600 via-rose-500 to-amber-500 border-2 border-white/20 shadow-xl flex items-center justify-center overflow-hidden shrink-0 select-none`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/25 via-transparent to-black/30 pointer-events-none" />
        <span className={`${initialsClassName} tracking-wider drop-shadow-md`}>{initials}</span>
        <div className="absolute -bottom-1 -right-1 bg-black/85 border border-white/20 rounded-full p-1 shadow-lg">
          <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} shrink-0`}>
      <img
        src={avatarUrl}
        alt={title}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
        className={`${className} border-2 border-white/20 object-cover shadow-xl`}
      />
      <div className="absolute -bottom-1 -right-1 bg-black/85 border border-white/20 rounded-full p-1 shadow-lg">
        <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
      </div>
    </div>
  );
}

function translateToHindi(text: string): string {
  if (!text) return '';
  // If text already has Devanagari characters, return directly
  if (/[\u0900-\u097F]/.test(text)) return text;

  const DICT: Record<string, string> = {
    'Subscriber threshold is comfortably met.': '1,000 सब्सक्राइबर्स की पात्रता सीमा सफलतापूर्वक पूरी हो गई है।',
    'Channel is significantly short on valid public watch hours for long-form content and far from the Shorts view threshold.': 'चैनल को मोनेटाइजेशन के लिए आवश्यक 4,000 सार्वजनिक वॉच आवर्स पूरे करने बाकी हैं।',
    'No duplicate titles or repetitious content flags detected; content appears original.': 'कोई डुप्लीकेट या रिपीटिशियस शीर्षक नहीं मिला; सभी सामग्री मौलिक प्रतीत होती है।',
    'Clean metadata with 100% unique titles, indicating good content organization.': '100% अद्वितीय वीडियो शीर्षकों के साथ साफ और पारदर्शी मेटाडेटा।',
    'Strong subscriber base exceeding YPP threshold.': 'मजबूत सब्सक्राइबर बेस जो YPP की 1,000 न्यूनतम सीमा से अधिक है।',
    'Significant deficit in valid public watch hours for YPP eligibility.': 'YPP पात्रता के लिए वैध सार्वजनिक वॉच आवर्स में कमी।',
    'Low audience retention and minimal subscribed watch time.': 'कम ऑडियंस रिटेंशन (AVD) और दर्शकों का कम जुड़ाव समय।',
    'One active Community Guidelines warning on channel.': 'चैनल पर एक सक्रिय कम्युनिटी गाइडलाइन्स चेतावनी मौजूद है।',
    'Achieve 4,000 valid public watch hours within the next 365 days by improving content engagement and consistency.': 'कंटेंट एंगेजमेंट और निरंतरता बढ़ाकर अगले 365 दिनों में 4,000 वैध वॉच आवर्स हासिल करें।',
    'Verified in Studio': 'स्टूडियो में सत्यापित',
    'Pass': 'सफल (Pass)',
    'Fail': 'अपूर्ण (Fail)',
    'Warning': 'चेतावनी (Warning)',
    'Unknown': 'अज्ञात (Unknown)',
    '1,000 subscribers minimum': 'न्यूनतम 1,000 सब्सक्राइबर्स',
    '4,000 public watch hours or 10M valid Shorts views in 90 days': '4,000 सार्वजनिक वॉच आवर्स या 90 दिनों में 10M शॉर्ट्स व्यूज',
    'Original commentary and unique titles with zero duplicate or spammy titles across uploads': 'मौलिक कमेंट्री और अद्वितीय शीर्षक (कोई डुप्लीकेट या स्पैम टाइटल नहीं)',
    'Zero active strikes on record': 'शून्य सक्रिय स्ट्राइक्स या नीति उल्लंघन',
    'Active 2FA on Google Account and Advanced Channel Features unlocked': 'सक्रिय 2FA और उन्नत चैनल सुविधाएं अनलॉक',
    'Healthy engagement indicating active human viewership': 'सक्रिय दर्शक जुड़ाव और स्वस्थ व्यू-टू-सब अनुपात',
    'Regular publishing schedule in the last 90 days': 'पिछले 90 दिनों में नियमित वीडियो अपलोड',
    'Brand-safe themes with high advertiser demand': 'ब्रांड-सुरक्षित विषय और उच्च विज्ञापन मांग',
    'Distinctive thumbnail branding and non-misleading titles': 'आकर्षक थंबनेल और प्रामाणिक गैर-भ्रामक शीर्षक',
    'Using Shorts to drive long-form watch time conversion': 'शॉर्ट्स दर्शकों को लॉन्ग-फॉर्म वॉच टाइम में बदलना',
    'Multi-stream monetization (sponsorships, digital products, affiliate)': 'मल्टी-स्ट्रीम कमाई (स्पॉन्सरशिप, डिजिटल प्रोडक्ट्स, एफिलिएट)',
    'Optimized channel tags, playlist architecture, and descriptions': 'अनुकूलित चैनल टैग्स, प्लेलिस्ट और विवरण',
    'YouTube Partner Program (AdSense)': 'यूट्यूब पार्टनर प्रोग्राम (Google AdSense)',
    'Brand Sponsorships & Integrations': 'ब्रांड स्पॉन्सरशिप व पेड इंटीग्रेशन',
    'Super Thanks & Channel Memberships': 'चैनल मेंबरशिप व सुपर थैंक्स',
    'Affiliate Marketing & Tools': 'एफिलिएट मार्केटिंग व टूल्स प्रमोशन',
    'Digital Products, Courses & Consultations': 'डिजिटल प्रोडक्ट्स, कोर्स व कंसल्टेशन'
  };

  for (const [en, hi] of Object.entries(DICT)) {
    if (text.includes(en)) {
      return text.replace(en, hi);
    }
  }

  return text;
}

export const MASTER_ASK_STUDIO_PROMPT = `Please generate a comprehensive, factual channel audit telemetry summary for my channel. Output the exact numbers and statuses using this structured format:

[1. YPP MONETIZATION & WATCH HOURS]
- Subscribers Count: [exact count / 1,000 requirement]
- Valid Public Watch Hours (Past 365 Days): [exact hours / 4,000 requirement]
- Valid Public Shorts Views (Past 90 Days): [exact views / 10M requirement]
- 2-Step Verification: [Turned On / Required]
- Advanced Features Status: [Unlocked / Pending]
- Linked Google AdSense Account: [Approved & Linked / Pending / Not Linked]

[2. COPYRIGHT, STRIKES & POLICY COMPLIANCE]
- Active Community Guidelines Strikes: [0 or list active strikes with reason]
- Active Copyright Strikes: [0 or list active strikes]
- Active Community Guidelines Warnings: [0 or details]
- Videos with Content ID Claims / Revenue Sharing: [None or count/titles]
- Videos with Limited Ads / Yellow Dollar Sign: [None or count]
- Reused / Repetitious Content Flags: [None or details]

[3. AUDIENCE RETENTION & ENGAGEMENT QUALITY]
- Average View Duration (AVD) on Long-Form: [minutes/seconds]
- Average Percentage Viewed (APV): [percentage %]
- Returning Viewers vs New Viewers (Last 90 Days): [% returning / % new]

[4. TRAFFIC SOURCES & DISCOVERABILITY]
- Browse Features: [%]
- Suggested Videos: [%]
- YouTube Search: [%]
- Shorts Feed: [%]
- External Sources: [%]

[5. CLICK-THROUGH RATE & PACKAGING]
- Total Impressions (Last 28-90 Days): [count]
- Impressions Click-Through Rate (CTR): [%]

[6. REVENUE, RPM & CPM METRICS]
- Playback-based CPM (Last 90 Days): [amount with currency]
- Channel RPM (Last 90 Days): [amount with currency]
- Estimated Monthly Revenue: [amount with currency]
- Primary Revenue Streams: [e.g., 85% AdSense, 10% Memberships, 5% Super Thanks]

[7. AUDIENCE & GEOGRAPHIC REACH]
- Top 5 Countries by Watch Time: [e.g., India X%, United States Y%, UK Z%]
- Subscribed vs Unsubscribed Watch Time: [% subscribed / % unsubscribed]`;

export const MASTER_ASK_STUDIO_PROMPT_HI = `कृपया मेरे यूट्यूब चैनल के लिए विस्तृत और तथ्यपरक चैनल ऑडिट टेलीमेट्री सारांश तैयार करें। दिए गए प्रारूप के अनुसार सही आंकड़े और स्थितियां प्रदान करें:

[1. YPP मोनेटाइजेशन और वॉच आवर्स]
- सब्सक्राइबर्स संख्या: [सटीक संख्या / 1,000 की आवश्यकता]
- वैध सार्वजनिक वॉच आवर्स (पिछले 365 दिन): [सटीक घंटे / 4,000 की आवश्यकता]
- वैध सार्वजनिक शॉर्ट्स व्यूज (पिछले 90 दिन): [सटीक व्यूज / 10M की आवश्यकता]
- 2-स्टेप वेरिफिकेशन: [चालू है / आवश्यक है]
- एडवांस्ड फीचर्स स्थिति: [अनलॉक / लंबित]
- लिंक किया गया गूगल एडसेंस खाता: [स्वीकृत और लिंक / लंबित / लिंक नहीं]

[2. कॉपीराइट, स्ट्राइक्स और पॉलिसी अनुपालन]
- एक्टिव कम्युनिटी गाइडलाइन्स स्ट्राइक्स: [0 या कारण सहित विवरण]
- एक्टिव कॉपीराइट स्ट्राइक्स: [0 या विवरण]
- एक्टिव कम्युनिटी गाइडलाइन्स चेतावनियां: [0 या विवरण]
- कंटेंट आईडी क्लेम्स / रेवेन्यू शेयरिंग वाले वीडियो: [कोई नहीं या संख्या/शीर्षक]
- लिमिटेड ऐड्स / पीला डॉलर चिह्न वाले वीडियो: [कोई नहीं या संख्या]
- रीयूज्ड / रिपीटिशियस कंटेंट फ्लैग्स: [कोई नहीं या विवरण]

[3. ऑडियंस रिटेंशन और एंगेजमेंट क्वालिटी]
- लॉन्ग-फॉर्म वीडियो पर औसत व्यू ड्यूरेशन (AVD): [मिनट/सेकंड]
- औसत देखा गया प्रतिशत (APV): [प्रतिशत %]
- पुराने बनाम नए दर्शक (पिछले 90 दिन): [% पुराने / % नए]

[4. ट्रैफिक सोर्स और डिस्कवरेबिलिटी]
- ब्राउज़ फीचर्स: [%]
- सजेस्टेड वीडियो: [%]
- यूट्यूब सर्च: [%]
- शॉर्ट्स फीड: [%]
- बाहरी स्रोत: [%]

[5. क्लिक-थ्रू रेट (CTR) और पैकेजिंग]
- कुल इम्प्रेशंस (पिछले 90 दिन): [संख्या]
- इम्प्रेशंस क्लिक-थ्रू रेट (CTR): [%]

[6. रेवेन्यू, RPM और CPM मेट्रिक्स]
- प्लेबैक-बेस्ड CPM (पिछले 90 दिन): [मुद्रा सहित राशि]
- चैनल RPM (पिछले 90 दिन): [मुद्रा सहित राशि]
- अनुमानित मासिक रेवेन्यू: [मुद्रा सहित राशि]
- प्राथमिक रेवेन्यू स्रोत: [जैसे 85% एडसेंस, 10% मेंबरशिप, 5% सुपर थैंक्स]

[7. ऑडियंस और भौगोलिक पहुंच]
- वॉच टाइम अनुसार शीर्ष 5 देश: [जैसे भारत 70%, अमेरिका 15%, आदि]
- सब्सक्राइब बनाम नॉन-सब्सक्राइब वॉच टाइम: [% सब्सक्राइब / % नॉन-सब्सक्राइब]`;

const SAMPLE_STUDIO_TELEMETRY = `[1. YPP MONETIZATION & WATCH HOURS]
- Subscribers Count: 18,400 / 1,000 (Completed)
- Valid Public Watch Hours (Past 365 Days): 5,120 / 4,000 (Completed)
- Valid Public Shorts Views (Past 90 Days): 920,000 / 10M
- 2-Step Verification: Turned On
- Advanced Features Status: Unlocked
- Linked Google AdSense Account: Approved & Linked

[2. COPYRIGHT, STRIKES & POLICY COMPLIANCE]
- Active Community Guidelines Strikes: 0
- Active Copyright Strikes: 0
- Active Community Guidelines Warnings: 0
- Videos with Content ID Claims: None
- Videos with Limited Ads (Yellow Icon): 1 video flagged for background audio
- Reused / Repetitious Content Flags: None

[3. AUDIENCE RETENTION & ENGAGEMENT QUALITY]
- Average View Duration (AVD) on Long-Form: 5 minutes 12 seconds
- Average Percentage Viewed (APV): 44.8%
- Returning Viewers vs New Viewers: 42% returning / 58% new

[4. TRAFFIC SOURCES & DISCOVERABILITY]
- Browse Features: 48%
- Suggested Videos: 29%
- YouTube Search: 17%
- External Sources: 6%

[5. CLICK-THROUGH RATE & PACKAGING]
- Total Impressions (Last 90 Days): 1,640,000
- Impressions Click-Through Rate (CTR): 7.2%

[6. REVENUE, RPM & CPM METRICS]
- Playback-based CPM (Last 90 Days): ₹410
- Channel RPM (Last 90 Days): ₹220
- Estimated Monthly Revenue: ₹48,500
- Primary Revenue Streams: 90% AdSense, 6% Memberships, 4% Super Thanks

[7. AUDIENCE & GEOGRAPHIC REACH]
- Top 5 Countries by Watch Time: India 68%, United States 14%, UK 6%, Canada 4%, Australia 2%
- Subscribed vs Unsubscribed Watch Time: 22% subscribed / 78% unsubscribed`;

interface AuditMatrixRow {
  auditPoint: string;
  requirement: string;
  currentStatus: string;
  status: 'Pass' | 'Fail' | 'Warning' | 'Unknown';
  recommendedSolution: string;
}

interface RevenueStream {
  stream: string;
  eligible: boolean;
  estimatedMonthlyMin: number;
  estimatedMonthlyMax: number;
  currency: string;
  note: string;
}

interface ActionItem {
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  timeframe: string;
  impact: string;
}

interface YppEligibility {
  subscriberCheck: { required: number; current: number; pass: boolean; note: string };
  watchHoursCheck: { required: number; current: number | null; pass: boolean | null; note: string };
  contentPolicyCheck: { pass: boolean; note: string };
  communityGuidelinesCheck: { pass: boolean; note: string };
}

interface AuditResult {
  overallScore: number;
  monetizationStatus: 'Eligible' | 'Near Eligible' | 'Not Eligible';
  primaryNeed?: string;
  yppEligibility: YppEligibility;
  auditMatrix: AuditMatrixRow[];
  revenueStreams: RevenueStream[];
  topStrengths: string[];
  criticalIssues: string[];
  actionPlan: ActionItem[];
  estimatedMonthlyAdRevenue: { min: number; max: number; currency: string; basis: string };
  channelHealthSummary: string;
  nextMilestone: string;
}

interface ChannelProfile {
  title: string;
  handle: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  avatarUrl?: string;
  bannerUrl?: string;
  country?: string;
  detectedNiche?: { name: string; confidence: number };
  metrics?: {
    sampleSize: number;
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    trueEngagementRate: number;
    likeToViewRatio: number;
  };
  analyzedVideos?: Array<{
    title: string;
    views: number;
    erPct: number;
    isShort?: boolean;
  }>;
}

const fmt = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
};

const fmtINR = (n: number) => {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + ' Lakh';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + Math.round(n).toLocaleString('en-IN');
};

const STATUS_COLOR = (status: string) => {
  switch (status) {
    case 'Pass': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'Fail': return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'Warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
};

const STATUS_ICON = (status: string) => {
  switch (status) {
    case 'Pass': return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    case 'Fail': return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
    case 'Warning': return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    default: return <HelpCircle className="w-4 h-4 text-gray-400 shrink-0" />;
  }
};

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return { text: 'text-emerald-400', stroke: '#10B981', bg: 'from-emerald-500/20 to-emerald-500/5' };
  if (score >= 60) return { text: 'text-amber-400', stroke: '#F59E0B', bg: 'from-amber-500/20 to-amber-500/5' };
  return { text: 'text-red-400', stroke: '#EF4444', bg: 'from-red-500/20 to-red-500/5' };
};

const PRIORITY_COLOR = (priority: string) => {
  switch (priority) {
    case 'High': return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'Medium': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    default: return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  }
};

const PRESET_CHANNELS = [
  { handle: '@TechWithTim', label: 'Tech & Code' },
  { handle: '@MrBeast', label: 'Entertainment' },
  { handle: '@freeCodeCamp', label: 'Education' },
  { handle: '@HarkiratSingh', label: 'Dev / Indian Creator' },
];

export default function YouTubeMonetizationAuditPage() {
  const { isHindi, setLanguage } = useLanguage();
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [isAuditing, setIsAuditing] = useState(false);
  const [channelHandle, setChannelHandle] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [askStudioText, setAskStudioText] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [promptLanguage, setPromptLanguage] = useState<'en' | 'hi'>('en');
  const [error, setError] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [result, setResult] = useState<{ channelProfile: ChannelProfile; audit: AuditResult; generatedAt: string } | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([0, 1, 2]));
  const [activeTab, setActiveTab] = useState<'matrix' | 'revenue' | 'action'>('matrix');
  const [postLeadEmail, setPostLeadEmail] = useState('');
  const [leadSavedAlert, setLeadSavedAlert] = useState(false);

  const activePromptText = promptLanguage === 'hi' ? MASTER_ASK_STUDIO_PROMPT_HI : MASTER_ASK_STUDIO_PROMPT;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(activePromptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleFillSample = () => {
    setAskStudioText(SAMPLE_STUDIO_TELEMETRY);
    if (!channelHandle) {
      setChannelHandle('@TechWithTim');
    }
  };

  const handleSubmit = async () => {
    if (!channelHandle.trim()) {
      setError(isHindi ? 'कृपया मान्य यूट्यूब चैनल हैंडल या URL दर्ज करें।' : 'Please enter a YouTube channel handle or URL.');
      setFormStep(1);
      return;
    }
    setError('');
    setIsAuditing(true);
    try {
      const res = await fetch('/api/youtube/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelHandle: channelHandle.trim(),
          askStudioText: askStudioText.trim(),
          language: isHindi ? 'hi' : 'en'
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isHindi ? 'चैनल ऑडिट विफल रहा। कृपया हैंडल जांचें और पुनः प्रयास करें।' : 'Channel audit failed. Please verify the handle and try again.'));
      }
      setResult(data);

      // Client-side fallback sync to universal tool leads
      if (data?.channelProfile && data?.audit) {
        fetch('/api/tools/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool_id: 'youtube-monetization-audit',
            tool_name: 'YouTube Monetization Channel Audit',
            handle: data.channelProfile.handle || channelHandle.trim(),
            channel_title: data.channelProfile.title,
            email: userEmail.trim() || null,
            phone: userPhone.trim() || null,
            subscribers: data.channelProfile.subscribers,
            total_views: data.channelProfile.totalViews,
            video_count: data.channelProfile.videoCount,
            niche: data.channelProfile.detectedNiche?.name || 'General',
            country: data.channelProfile.country || 'India',
            overall_score: data.audit.overallScore,
            monetization_status: data.audit.monetizationStatus,
            primary_need: data.audit.primaryNeed || (data.audit.overallScore < 70 ? 'Watch Hours & Policy Compliance' : 'Brand Deals & Multi-Stream Scaling'),
            estimated_monthly_revenue: `₹${Number(data.audit.estimatedMonthlyAdRevenue?.min || 0).toLocaleString('en-IN')} - ₹${Number(data.audit.estimatedMonthlyAdRevenue?.max || 0).toLocaleString('en-IN')}`,
            language: isHindi ? 'hi' : 'en',
            metadata: {
              topStrengths: data.audit.topStrengths || [],
              criticalIssues: data.audit.criticalIssues || [],
              auditLanguage: isHindi ? 'Hindi' : 'English'
            }
          }),
        }).catch(err => console.warn('Lead capture client err:', err));
      }
    } catch (err: any) {
      setError(err.message || (isHindi ? 'ऑडिट में अनपेक्षित त्रुटि हुई।' : 'Audit encountered an unexpected error.'));
    } finally {
      setIsAuditing(false);
    }
  };

  const handlePostAuditLeadSubmit = async () => {
    if (!postLeadEmail || !postLeadEmail.includes('@')) {
      alert(isHindi ? 'कृपया मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }
    try {
      await fetch('/api/tools/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: 'youtube-monetization-audit',
          tool_name: 'YouTube Monetization Channel Audit',
          handle: result?.channelProfile.handle || channelHandle,
          channel_title: result?.channelProfile.title,
          email: postLeadEmail.trim(),
          phone: userPhone.trim() || null,
          subscribers: result?.channelProfile.subscribers || 0,
          total_views: result?.channelProfile.totalViews || 0,
          video_count: result?.channelProfile.videoCount || 0,
          niche: result?.channelProfile.detectedNiche?.name || 'General',
          overall_score: result?.audit.overallScore || 0,
          monetization_status: result?.audit.monetizationStatus || 'Pending',
          primary_need: result?.audit.primaryNeed || 'Direct Creator Strategy Session Requested',
          language: isHindi ? 'hi' : 'en',
          notes: isHindi
            ? 'क्रिएटर ने ऑडिट रिजल्ट पेज से फॉलो-अप कंसल्टेशन रिक्वेस्ट किया।'
            : 'Creator requested follow-up consultation from audit results page.',
          metadata: {
            topStrengths: result?.audit.topStrengths || [],
            criticalIssues: result?.audit.criticalIssues || [],
            auditLanguage: isHindi ? 'Hindi' : 'English'
          }
        }),
      });
      setLeadSavedAlert(true);
      setTimeout(() => setLeadSavedAlert(false), 4000);
    } catch (e) {
      console.warn('Post-audit lead update err:', e);
    }
  };

  const toggleRow = (i: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleReset = () => {
    setResult(null);
    setFormStep(1);
    setError('');
    setChannelHandle('');
    setUserEmail('');
    setUserPhone('');
    setAskStudioText('');
  };

  const handleCopySummary = () => {
    if (!result) return;
    const text = isHindi ? `यूट्यूब चैनल मोनेटाइजेशन ऑडिट: ${result.channelProfile.title} (${result.channelProfile.handle})
हेल्थ स्कोर: ${result.audit.overallScore}/100 | YPP स्थिति: ${result.audit.monetizationStatus}
सब्सक्राइबर्स: ${result.channelProfile.subscribers.toLocaleString('en-IN')}
अनुमानित एडसेंस कमाई: ${fmtINR(result.audit.estimatedMonthlyAdRevenue.min)} - ${fmtINR(result.audit.estimatedMonthlyAdRevenue.max)} /माह
शीर्ष मजबूती:
${result.audit.topStrengths.map(s => `- ${translateToHindi(s)}`).join('\n')}
प्रमुख नीति चेतावनियां:
${result.audit.criticalIssues.map(c => `- ${translateToHindi(c)}`).join('\n')}
ऑडिटेड बाय: Creator Nest AI (creatornest.in/tools/youtube-monetization-audit)`
    : `YouTube Monetization Audit: ${result.channelProfile.title} (${result.channelProfile.handle})
Score: ${result.audit.overallScore}/100 | Status: ${result.audit.monetizationStatus}
Subscribers: ${result.channelProfile.subscribers.toLocaleString()}
Estimated Ad Revenue: ${fmtINR(result.audit.estimatedMonthlyAdRevenue.min)} - ${fmtINR(result.audit.estimatedMonthlyAdRevenue.max)} /mo
Top Strengths:
${result.audit.topStrengths.map(s => `- ${s}`).join('\n')}
Critical Issues:
${result.audit.criticalIssues.map(c => `- ${c}`).join('\n')}
Audited by Creator Nest AI (creatornest.in/tools/youtube-monetization-audit)`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Loading Screen
  if (isAuditing) {
    return (
      <main className="min-h-screen bg-[#070B11] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-28 relative">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00F2FE]/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-[#00F2FE] border-r-red-500 rounded-full animate-spin" />
            <YoutubeIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-red-500 animate-pulse" />
          </div>
          <div className="text-center max-w-md relative z-10">
            <h2 className="text-2xl font-black text-white mb-2">
              {isHindi ? 'चैनल मोनेटाइजेशन का विश्लेषण जारी है...' : 'Analyzing Channel Health & Monetization...'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isHindi 
                ? 'यूट्यूब डेटा एपीआई, आस्क स्टूडियो निजी टेलीमेट्री और 12-पॉइंट वाईपीपी नीति मैट्रिक्स का समन्वय किया जा रहा है।'
                : 'Synthesizing YouTube Data API v3 public metrics, Ask Studio telemetry, and YPP monetization benchmarks.'
              }
            </p>
          </div>
          <div className="flex flex-col gap-2.5 w-full max-w-sm relative z-10">
            {(isHindi ? [
              'चैनल डेटा और वीडियो कैटलॉग की जांच की जा रही है...',
              'आस्क स्टूडियो टेलीमेट्री और वॉच आवर्स का सत्यापन जारी...',
              '12-पॉइंट मोनेटाइजेशन व कॉपीराइट मैट्रिक्स का विश्लेषण...',
              'भारतीय नीश CPM अनुसार मासिक एडसेंस रेवेन्यू (₹) गणना...',
              'उच्च-प्रभावित 30-दिवसीय क्रिएटर एक्शन प्लान तैयार किया जा रहा है...',
            ] : [
              'Querying YouTube Data API v3 for channel catalog...',
              'Parsing Ask Studio private telemetry & watch hours...',
              'Auditing 12-point policy compliance matrix...',
              'Projecting Indian niche CPM and revenue streams in ₹ INR...',
              'Formulating high-impact creator action plan...',
            ]).map((stepMsg, i) => (
              <motion.div
                key={stepMsg}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.4 }}
                className="flex items-center gap-2.5 text-xs text-gray-300 bg-white/5 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400 shrink-0" />
                {stepMsg}
              </motion.div>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Results View
  if (result) {
    const { channelProfile: cp, audit, generatedAt } = result;
    const scoreColor = SCORE_COLOR(audit.overallScore);
    const statusBadge = {
      'Eligible': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      'Near Eligible': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      'Not Eligible': 'bg-red-500/20 text-red-300 border-red-500/40',
    }[audit.monetizationStatus] || 'bg-gray-500/20 text-gray-300 border-gray-500/40';

    const localizedStatusText = isHindi ? {
      'Eligible': 'पात्र (Eligible)',
      'Near Eligible': 'पात्रता के करीब (Near Eligible)',
      'Not Eligible': 'अपात्र (Not Eligible)',
    }[audit.monetizationStatus] || audit.monetizationStatus : audit.monetizationStatus;

    return (
      <main className="min-h-screen bg-[#070B11] text-white flex flex-col">
        <Navbar />
        <div className="relative overflow-hidden flex-1">
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10">
            {/* Top Navigation Bar with Language Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {isHindi ? 'नया चैनल ऑडिट' : 'New Channel Audit'}
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Language Toggle Pill */}
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      !isHindi ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      isHindi ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>

                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSummary ? (isHindi ? 'कॉपी हो गया!' : 'Copied!') : (isHindi ? 'सारांश कॉपी करें' : 'Copy Summary')}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isHindi ? 'प्रिंट / सेव रिपोर्ट' : 'Save / Print Report'}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#00F2FE] to-[#0093E9] hover:from-[#00d5e0] hover:to-[#0081cc] text-[#0B0F14] font-bold transition-all shadow-lg shadow-[#00F2FE]/20 hover:shadow-[#00F2FE]/30 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> {isHindi ? 'पुनः रन करें' : 'Run Again'}
                </button>
              </div>
            </div>

            {/* Auto-Fix & Policy Compliance Banner */}
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-rose-950/60 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">Need to auto-fix these policy violations & SEO tags?</h3>
                  <p className="text-xs text-slate-300">Launch the AI Channel Optimizer with Human Review Queue and 1-Click Rollback.</p>
                </div>
              </div>
              <Link
                href="/tools/youtube-channel-optimizer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 shrink-0"
              >
                <span>Launch Optimizer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Channel Profile Banner */}
            <div className="bg-[#0B1017] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl mb-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                <ChannelAvatar avatarUrl={cp.avatarUrl} title={cp.title} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-white">{cp.title}</h1>
                    <span className="text-sm font-semibold text-gray-400">{cp.handle}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusBadge}`}>
                      {localizedStatusText}
                    </span>
                    {cp.detectedNiche && (
                      <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-full">
                        {cp.detectedNiche.name}
                      </span>
                    )}
                  </div>

                  {audit.primaryNeed && (
                    <div className="mb-3 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 font-medium inline-flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span><strong>{isHindi ? 'प्राथमिक आवश्यकता:' : 'Primary Need:'}</strong> {isHindi ? translateToHindi(audit.primaryNeed) : audit.primaryNeed}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-white/10">
                    <div>
                      <div className="text-xs text-gray-400">{isHindi ? 'सब्सक्राइबर्स' : 'Subscribers'}</div>
                      <div className="text-lg font-bold text-white">{fmt(cp.subscribers)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{isHindi ? 'कुल व्यूज' : 'Total Views'}</div>
                      <div className="text-lg font-bold text-white">{fmt(cp.totalViews)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{isHindi ? 'अपलोड वीडियो' : 'Videos Uploaded'}</div>
                      <div className="text-lg font-bold text-white">{cp.videoCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{isHindi ? 'एंगेजमेंट दर' : 'True Engagement'}</div>
                      <div className="text-lg font-bold text-emerald-400">{cp.metrics?.trueEngagementRate || 0}%</div>
                    </div>
                  </div>
                </div>

                {/* Overall Score Circle */}
                <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-5 min-w-[140px] text-center">
                  <div className="text-3xl sm:text-4xl font-black text-white">{audit.overallScore}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">
                    {isHindi ? 'हेल्थ स्कोर' : 'Health Score'}
                  </div>
                  <div className={`text-xs font-bold mt-2 ${scoreColor.text}`}>
                    {audit.overallScore >= 80 ? (isHindi ? 'ग्रेड ए (उत्कृष्ट)' : 'Grade A') : audit.overallScore >= 60 ? (isHindi ? 'ग्रेड बी (सामान्य)' : 'Grade B') : (isHindi ? 'सुधार आवश्यक' : 'Needs Work')}
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Point YPP Qualification Cards */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                {isHindi ? 'यूट्यूब पार्टनर प्रोग्राम (YPP) पात्रता चेकलिस्ट' : 'YouTube Partner Program (YPP) Checklist'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Subscribers */}
                <div className="bg-[#0B1017] border border-white/10 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase">{isHindi ? '1. सब्सक्राइबर्स' : '1. Subscribers'}</span>
                    {audit.yppEligibility.subscriberCheck.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="text-xl font-bold text-white mb-1">
                    {fmt(audit.yppEligibility.subscriberCheck.current)} / 1,000
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isHindi ? translateToHindi(audit.yppEligibility.subscriberCheck.note) : audit.yppEligibility.subscriberCheck.note}
                  </p>
                </div>

                {/* 2. Watch Hours */}
                <div className="bg-[#0B1017] border border-white/10 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase">{isHindi ? '2. वॉच आवर्स (365d)' : '2. Watch Hours'}</span>
                    {audit.yppEligibility.watchHoursCheck.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : audit.yppEligibility.watchHoursCheck.pass === false ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="text-xl font-bold text-white mb-1">
                    {audit.yppEligibility.watchHoursCheck.current != null ? fmt(audit.yppEligibility.watchHoursCheck.current) : (isHindi ? 'सत्यापित' : 'Verified')} / 4,000 hrs
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isHindi ? translateToHindi(audit.yppEligibility.watchHoursCheck.note) : audit.yppEligibility.watchHoursCheck.note}
                  </p>
                </div>

                {/* 3. Content Policy */}
                <div className="bg-[#0B1017] border border-white/10 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase">{isHindi ? '3. कंटेंट पॉलिसी' : '3. Content Policy'}</span>
                    {audit.yppEligibility.contentPolicyCheck.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="text-sm font-bold text-white mb-1">
                    {audit.yppEligibility.contentPolicyCheck.pass ? (isHindi ? 'रीयूज्ड कंटेंट मुक्त' : 'Clean & Original') : (isHindi ? 'पॉलिसी समीक्षा आवश्यक' : 'Review Required')}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isHindi ? translateToHindi(audit.yppEligibility.contentPolicyCheck.note) : audit.yppEligibility.contentPolicyCheck.note}
                  </p>
                </div>

                {/* 4. Community Guidelines */}
                <div className="bg-[#0B1017] border border-white/10 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase">{isHindi ? '4. स्ट्राइक्स व 2FA' : '4. Guidelines & Strikes'}</span>
                    {audit.yppEligibility.communityGuidelinesCheck.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="text-sm font-bold text-white mb-1">
                    {audit.yppEligibility.communityGuidelinesCheck.pass ? (isHindi ? 'शून्य एक्टिव स्ट्राइक्स' : '0 Active Strikes') : (isHindi ? 'स्ट्राइक पाई गई' : 'Strike Present')}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isHindi ? translateToHindi(audit.yppEligibility.communityGuidelinesCheck.note) : audit.yppEligibility.communityGuidelinesCheck.note}
                  </p>
                </div>
              </div>
            </div>

            {/* Strengths & Critical Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Strengths */}
              <div className="bg-[#0B1017] border border-emerald-500/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {isHindi ? 'शीर्ष चैनल मजबूती (Top Strengths)' : 'Top Channel Strengths'}
                </h3>
                <ul className="space-y-2">
                  {audit.topStrengths?.map((str, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{isHindi ? translateToHindi(str) : str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Critical Issues */}
              <div className="bg-[#0B1017] border border-red-500/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {isHindi ? 'गंभीर चेतावनियां व नीति जोखिम (Critical Issues)' : 'Critical Policy & Growth Issues'}
                </h3>
                <ul className="space-y-2">
                  {audit.criticalIssues?.map((issue, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <span>{isHindi ? translateToHindi(issue) : issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modern Vibrant Revenue Projection Section */}
            <div className="relative rounded-3xl p-6 sm:p-8 mb-10 overflow-hidden bg-gradient-to-br from-[#071714] via-[#09151A] to-[#080C14] border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Section Header with Glowing Pill Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-500/10">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isHindi ? 'अनुमानित एडसेंस व चैनल कमाई क्षमता' : 'Projected AdSense & Channel Revenue Potential'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      🇮🇳 {isHindi ? 'मुद्रा: भारतीय रुपया (₹ INR)' : 'Currency: INR (₹)'}
                    </span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {isHindi ? 'सटीक फोरकास्ट' : 'Live Forecast'}
                    </span>
                  </div>
                </div>

                {/* Main Revenue Numbers & Milestone Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left 7 cols: Big Revenue Projection */}
                  <div className="lg:col-span-7 flex flex-col justify-between bg-black/40 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
                    
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 block mb-1.5">
                        {isHindi ? 'मासिक एडसेंस कमाई रेंज (Estimated Monthly AdSense)' : 'Estimated Monthly AdSense Revenue'}
                      </span>
                      <div className="flex flex-wrap items-baseline gap-2 mb-3">
                        <span className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm">
                          {fmtINR(audit.estimatedMonthlyAdRevenue.min)} – {fmtINR(audit.estimatedMonthlyAdRevenue.max)}
                        </span>
                        <span className="text-sm font-semibold text-gray-400">
                          / {isHindi ? 'प्रति माह' : 'month'}
                        </span>
                      </div>

                      {/* Metric mini pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-white/10">
                        <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold block">{isHindi ? 'वार्षिक अनुमान' : 'Annual Run-Rate'}</span>
                          <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">
                            {fmtINR(audit.estimatedMonthlyAdRevenue.min * 12)} – {fmtINR(audit.estimatedMonthlyAdRevenue.max * 12)}
                          </span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold block">{isHindi ? 'नीश अनुमानित CPM' : 'Niche CPM Benchmark'}</span>
                          <span className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 block">
                            ₹150 – ₹600 / 1K
                          </span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold block">{isHindi ? 'YPP स्थिति' : 'YPP Readiness'}</span>
                          <span className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5 block truncate">
                            {localizedStatusText}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Basis Note with High Contrast and Readability */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                        {isHindi ? translateToHindi(audit.estimatedMonthlyAdRevenue.basis) : audit.estimatedMonthlyAdRevenue.basis}
                      </p>
                    </div>
                  </div>

                  {/* Right 5 cols: Strategic Milestone Card */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-[#121A26] to-[#0A1017] border border-amber-500/25 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-amber-400" />
                          {isHindi ? 'अगला रणनीतिक मील का पत्थर' : 'Next Strategic Milestone'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          30-90 DAYS
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-white leading-snug mb-3">
                        {isHindi ? translateToHindi(audit.nextMilestone) : audit.nextMilestone}
                      </h4>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 mt-4">
                      <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 mb-1.5">
                        <span>{isHindi ? 'वाईपीपी वॉच आवर्स प्रगति' : 'Watch Hours Progress'}</span>
                        <span className="text-white font-bold">
                          {audit.yppEligibility.watchHoursCheck.current != null ? fmt(audit.yppEligibility.watchHoursCheck.current) : (isHindi ? 'सत्यापित' : 'Verified')} / 4,000 hrs
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(100, Math.round(((audit.yppEligibility.watchHoursCheck.current || 0) / 4000) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Tabbed Detail Section */}
            <div className="bg-[#0B1017] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl mb-10 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
                {[
                  { id: 'matrix', label: isHindi ? '12-पॉइंट विस्तृत मैट्रिक्स' : '12-Point Audit Matrix' },
                  { id: 'revenue', label: isHindi ? 'रेवेन्यू विविधीकरण (कमाई स्रोत)' : 'Revenue Diversification' },
                  { id: 'action', label: isHindi ? '30-दिन एक्शन प्लान' : '30-Day Action Plan' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === t.id
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-lg shadow-red-500/10'
                        : 'text-gray-400 hover:text-white bg-white/3 hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: 12-Point Matrix */}
              {activeTab === 'matrix' && (
                <div className="space-y-3">
                  {audit.auditMatrix?.map((row, idx) => {
                    const isExpanded = expandedRows.has(idx);
                    return (
                      <div
                        key={idx}
                        className="bg-white/3 border border-white/10 rounded-xl p-4 transition-colors hover:border-white/20"
                      >
                        <div
                          className="flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                          onClick={() => toggleRow(idx)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {STATUS_ICON(row.status)}
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">
                                {isHindi ? translateToHindi(row.auditPoint) : row.auditPoint}
                              </h4>
                              <p className="text-xs text-gray-400 truncate">
                                {isHindi ? translateToHindi(row.requirement) : row.requirement}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${STATUS_COLOR(row.status)}`}>
                              {isHindi ? (row.status === 'Pass' ? 'सफल' : row.status === 'Fail' ? 'अपूर्ण' : row.status === 'Warning' ? 'चेतावनी' : 'अज्ञात') : row.status}
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="bg-[#141C28] p-3 rounded-lg border border-white/5">
                              <span className="font-semibold text-gray-400 block mb-1">
                                {isHindi ? 'वर्तमान चैनल स्थिति:' : 'Current Status:'}
                              </span>
                              <p className="text-gray-200 leading-relaxed">
                                {isHindi ? translateToHindi(row.currentStatus) : row.currentStatus}
                              </p>
                            </div>
                            <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/15">
                              <span className="font-semibold text-emerald-400 block mb-1">
                                {isHindi ? 'अनुशंसित समाधान व रणनीति:' : 'Recommended Action:'}
                              </span>
                              <p className="text-emerald-200 leading-relaxed">
                                {isHindi ? translateToHindi(row.recommendedSolution) : row.recommendedSolution}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: Revenue Streams */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-5 mb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">
                        {isHindi ? 'मल्टी-स्ट्रीम मोनेटाइजेशन रणनीति (केवल एडसेंस पर निर्भर न रहें)' : 'Multi-Stream Monetization Strategy (Diversify Beyond AdSense)'}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {isHindi
                        ? 'शीर्ष भारतीय क्रिएटर्स अपनी 70% आय ब्रांड डील्स, मर्चेंडाइज, एफिलिएट और डिजिटल प्रोडक्ट्स से कमाते हैं। नीचे आपके चैनल के आकार और नीश के अनुसार 5 प्रमुख कमाई स्रोतों का विस्तृत विश्लेषण दिया गया है।'
                        : 'Top YouTube creators generate up to 70% of their total income from brand partnerships, sponsorships, memberships, and digital products. Below is your tailored 5-stream monetization potential in INR.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {audit.revenueStreams?.map((stream, idx) => {
                      const STREAM_THEMES = [
                        { icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', border: 'hover:border-emerald-500/40' },
                        { icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', border: 'hover:border-amber-500/40' },
                        { icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', border: 'hover:border-purple-500/40' },
                        { icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', border: 'hover:border-cyan-500/40' },
                        { icon: Target, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', border: 'hover:border-rose-500/40' },
                      ];
                      const theme = STREAM_THEMES[idx % STREAM_THEMES.length];
                      const IconComponent = theme.icon;

                      return (
                        <div
                          key={idx}
                          className={`bg-[#0F1622] border border-white/10 rounded-2xl p-5 shadow-xl transition-all duration-200 ${theme.border} hover:bg-[#121B2B] hover:shadow-2xl flex flex-col justify-between`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-9 h-9 rounded-xl ${theme.bg} border flex items-center justify-center shrink-0`}>
                                  <IconComponent className={`w-4 h-4 ${theme.color}`} />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white">
                                    {isHindi ? translateToHindi(stream.stream) : stream.stream}
                                  </h4>
                                  <span className="text-[10px] text-gray-400">
                                    {isHindi ? 'अनुमानित आय स्रोत' : 'Estimated Revenue Stream'}
                                  </span>
                                </div>
                              </div>

                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                                stream.eligible
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              }`}>
                                {stream.eligible ? (isHindi ? '✓ पात्र (Unlocked)' : '✓ Eligible') : (isHindi ? '🔒 अनलॉक बाकी' : '🔒 Action Required')}
                              </span>
                            </div>

                            <div className="bg-black/35 border border-white/5 rounded-xl p-3.5 my-3">
                              <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                                {isHindi ? 'मासिक कमाई क्षमता (INR)' : 'Monthly Potential (INR)'}
                              </div>
                              <div className="text-xl sm:text-2xl font-black text-white">
                                {fmtINR(stream.estimatedMonthlyMin)} – {fmtINR(stream.estimatedMonthlyMax)}
                                <span className="text-xs font-normal text-gray-400 ml-1.5">/ {isHindi ? 'माह' : 'mo'}</span>
                              </div>
                              <div className="text-[11px] text-gray-400 mt-1">
                                {isHindi ? 'वार्षिक क्षमता:' : 'Annualized:'}{' '}
                                <strong className="text-white font-semibold">
                                  {fmtINR(stream.estimatedMonthlyMin * 12)} – {fmtINR(stream.estimatedMonthlyMax * 12)}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-gray-300 leading-relaxed bg-white/2 rounded-lg p-2.5 border border-white/5 mt-2">
                            {isHindi ? translateToHindi(stream.note) : stream.note}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Action Plan */}
              {activeTab === 'action' && (
                <div className="space-y-4">
                  {audit.actionPlan?.map((item, idx) => (
                    <div key={idx} className="bg-white/3 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${PRIORITY_COLOR(item.priority)}`}>
                            {item.priority} {isHindi ? 'प्राथमिकता' : 'Priority'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {isHindi ? 'समयसीमा:' : 'Timeframe:'} {isHindi ? translateToHindi(item.timeframe) : item.timeframe}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white">
                          {isHindi ? translateToHindi(item.action) : item.action}
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-right shrink-0">
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">{isHindi ? 'अपेक्षित प्रभाव' : 'Expected Impact'}</div>
                        <div className="text-xs font-bold text-emerald-400">
                          {isHindi ? translateToHindi(item.impact) : item.impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Executive Summary */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {isHindi ? 'ऑडिटर निष्कर्ष सारांश (Executive Summary)' : 'Auditor Executive Summary'}
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {isHindi ? translateToHindi(audit.channelHealthSummary) : audit.channelHealthSummary}
                </p>
                <div className="mt-4 text-[11px] text-gray-500">
                  {isHindi ? 'रिपोर्ट जनरेट की गई:' : 'Report generated on'} {new Date(generatedAt).toLocaleString('en-IN')} · Creator Nest AI Engine
                </div>
              </div>
            </div>

            {/* Post-Audit Lead Consultation Catch-Up Box */}
            <div className="bg-gradient-to-r from-[#00F2FE]/15 via-[#0093E9]/10 to-[#070B11] border border-[#00F2FE]/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F2FE]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F2FE]/15 text-[#00F2FE] text-xs font-bold mb-3 border border-[#00F2FE]/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isHindi ? '1-ऑन-1 क्रिएटर सपोर्ट व स्पॉन्सरशिप' : '1-on-1 Creator Support & Brand Sponsorships'}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {isHindi ? 'क्या आप इन कमियों को दूर कर चैनल की कमाई 3x करना चाहते हैं?' : 'Want our team to help fix these issues and scale your revenue?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
                    {isHindi
                      ? 'Creator Nest की टीम आपको वाईपीपी अप्रूवल, स्पॉन्सरशिप डील्स और हाई-सीपीएम वीडियो स्ट्रेटेजी में सीधे मदद करती है। अपनी ईमेल दर्ज करें और निःशुल्क परामर्श सत्र बुक करें।'
                      : 'The Creator Nest agency team works directly with creators on YPP approval, brand deals, and high-CPM channel packaging. Drop your email to book a free strategy session.'}
                  </p>
                </div>

                <div className="w-full md:w-80 space-y-2.5">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={postLeadEmail}
                      onChange={e => setPostLeadEmail(e.target.value)}
                      placeholder={isHindi ? 'आपका ईमेल पता' : 'Your work email'}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-xl pl-10 pr-3 py-3 text-xs text-white placeholder-gray-500 outline-none focus:border-[#00F2FE]"
                    />
                  </div>
                  <button
                    onClick={handlePostAuditLeadSubmit}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#00d5e0] to-[#0093E9] hover:from-[#00F2FE] hover:to-[#00b5c9] font-bold text-xs text-[#0B0F14] shadow-xl shadow-[#00F2FE]/25 hover:shadow-[#00F2FE]/40 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isHindi ? 'रणनीति सत्र का अनुरोध करें' : 'Request Strategy Session'}
                  </button>
                  {leadSavedAlert && (
                    <p className="text-xs text-emerald-400 font-bold text-center">
                      {isHindi ? 'धन्यवाद! हमारी टीम शीघ्र ही आपसे संपर्क करेगी।' : 'Thank you! Our team will reach out shortly.'}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // 2-Step Form Workflow
  return (
    <main className="min-h-screen bg-[#070B11] text-white flex flex-col">
      <Navbar />
      <div className="relative overflow-hidden flex-1">
        {/* Animated dynamic background orbs — CN brand palette */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F2FE]/8 rounded-full blur-[140px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-red-600/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-[#FF512F]/6 rounded-full blur-[100px] pointer-events-none" />

        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
          {/* Breadcrumb & Language Switcher Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Link href="/marketplace" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" /> {isHindi ? 'मार्केटप्लेस' : 'Marketplace'}
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-primary font-bold">
                {isHindi ? 'यूट्यूब मोनेटाइजेशन ऑडिट' : 'YouTube Monetization Audit'}
              </span>
            </div>

            {/* Language Switcher Button */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 shadow-lg">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  !isHindi ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  isHindi ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00F2FE]/15 via-[#00d5e0]/10 to-[#0093E9]/15 border border-[#00F2FE]/30 text-[#00F2FE] text-xs font-bold mb-4 mx-auto shadow-lg shadow-[#00F2FE]/10">
              <Sparkles className="w-3.5 h-3.5 text-[#00F2FE] animate-spin" style={{ animationDuration: '4s' }} />
              {isHindi ? '✨ Creator Nest — 100% स्क्रीनशॉट-मुक्त AI ऑडिट टूल' : '✨ Creator Nest — 100% Screenshot-Free AI Audit Tool'}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              {isHindi ? (
                <>
                  यूट्यूब मोनेटाइजेशन <br />
                  <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                    चैनल हेल्थ व पॉलिसी ऑडिट
                  </span>
                </>
              ) : (
                <>
                  YouTube Monetization <br />
                  <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                    Channel Health Audit
                  </span>
                </>
              )}
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              {isHindi
                ? 'स्क्रीनशॉट की कोई आवश्यकता नहीं। पब्लिक यूट्यूब एपीआई डेटा को यूट्यूब आस्क स्टूडियो की प्राइवेट टेलीमेट्री के साथ जोड़कर 12-पॉइंट पॉलिसी ऑडिट और ₹ INR में सटीक रेवेन्यू विश्लेषण प्राप्त करें।'
                : 'No screenshots needed. Combine public YouTube API data with private Ask Studio telemetry for a 12-point policy audit and revenue forecast in ₹ INR.'}
            </p>
          </div>

          {/* Futuristic Modern Interactive Stepper (1 and 2) */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
              {/* Step 1 Card */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormStep(1)}
                className={`relative p-4 rounded-2xl border transition-all text-left cursor-pointer overflow-hidden backdrop-blur-xl ${
                  formStep === 1
                    ? 'bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent border-red-500/50 shadow-xl shadow-red-500/20 ring-1 ring-red-500/30'
                    : 'bg-white/3 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                      formStep === 1
                        ? 'bg-gradient-to-br from-red-500 to-amber-500 text-white shadow-lg shadow-red-500/40 ring-2 ring-red-400/50'
                        : channelHandle.trim()
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-gray-400'
                    }`}>
                      {channelHandle.trim() && formStep === 2 ? <Check className="w-4 h-4" /> : '01'}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 block">
                        {isHindi ? 'चरण 01' : 'STEP 01'}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {isHindi ? 'चैनल पहचान' : 'Channel Identity'}
                      </span>
                    </div>
                  </div>
                  {formStep === 1 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                      {isHindi ? 'सक्रिय' : 'Active'}
                    </span>
                  )}
                  {formStep === 2 && channelHandle.trim() && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      {isHindi ? 'तैयार' : 'Ready'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate pl-1">
                  {channelHandle ? channelHandle : (isHindi ? 'हैंडल या लिंक दर्ज करें' : 'Enter handle or channel URL')}
                </p>
                {formStep === 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-400" />
                )}
              </motion.button>

              {/* Step 2 Card */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!channelHandle.trim()) {
                    setError(isHindi ? 'कृपया पहले चैनल हैंडल दर्ज करें।' : 'Please enter a channel handle first.');
                    return;
                  }
                  setError('');
                  setFormStep(2);
                }}
                className={`relative p-4 rounded-2xl border transition-all text-left cursor-pointer overflow-hidden backdrop-blur-xl ${
                  formStep === 2
                    ? 'bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent border-purple-500/50 shadow-xl shadow-purple-500/20 ring-1 ring-purple-500/30'
                    : 'bg-white/3 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                      formStep === 2
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/50'
                        : 'bg-white/10 text-gray-400'
                    }`}>
                      02
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block">
                        {isHindi ? 'चरण 02' : 'STEP 02'}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {isHindi ? 'आस्क स्टूडियो टेलीमेट्री' : 'Ask Studio Telemetry'}
                      </span>
                    </div>
                  </div>
                  {formStep === 2 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      {isHindi ? 'सुपरचार्ज्ड' : 'Supercharged'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate pl-1">
                  {askStudioText ? (isHindi ? 'प्राइवेट टेलीमेट्री उपलब्ध' : 'Private telemetry added') : (isHindi ? '1-क्लिक प्रॉम्प्ट या वैकल्पिक' : '1-Click Prompt (Optional)')}
                </p>
                {formStep === 2 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {/* Step 1: Channel Handle + Lead Capture */}
            {formStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <div className="bg-[#0B1017] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                      <YoutubeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {isHindi ? 'चरण 1: चैनल विवरण और संपर्क' : 'Step 1: Channel Details & Contact'}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {isHindi
                          ? 'अपने चैनल का हैंडल (@) दर्ज करें और अपनी रिपोर्ट प्राप्त करने के लिए संपर्क जानकारी दें।'
                          : 'Enter your channel handle and contact info to receive your personalized audit report.'}
                      </p>
                    </div>
                  </div>

                  {/* Channel Handle Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      {isHindi ? 'यूट्यूब चैनल हैंडल या लिंक *' : 'YouTube Channel Handle or URL *'}
                    </label>
                    <div className="relative">
                      <YoutubeIcon className="w-4 h-4 text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={channelHandle}
                        onChange={e => setChannelHandle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            if (!channelHandle.trim()) setError(isHindi ? 'कृपया चैनल हैंडल दर्ज करें।' : 'Please enter a channel handle.');
                            else { setError(''); setFormStep(2); }
                          }
                        }}
                        placeholder="e.g. @TechWithTim or https://youtube.com/@channel"
                        className="w-full bg-[#141C28] border border-white/15 focus:border-[#00F2FE] rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-500 text-sm focus:outline-none transition-colors shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Email + Phone side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                        {isHindi ? 'ईमेल पता (रिपोर्ट प्राप्त करें)' : 'Email Address (Get Report)'}
                        <span className="ml-1 text-[#00F2FE]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#00F2FE]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={userEmail}
                          onChange={e => setUserEmail(e.target.value)}
                          placeholder={isHindi ? 'आपका ईमेल पता' : 'your@email.com'}
                          className="w-full bg-[#141C28] border border-white/15 focus:border-[#00F2FE] rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-500 text-sm focus:outline-none transition-colors shadow-inner"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                        {isHindi ? 'व्हाट्सएप / फोन (वैकल्पिक)' : 'WhatsApp / Phone (Optional)'}
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={userPhone}
                          onChange={e => setUserPhone(e.target.value)}
                          placeholder={isHindi ? '+91 98765 43210' : '+91 98765 43210'}
                          className="w-full bg-[#141C28] border border-white/15 focus:border-[#00F2FE] rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-500 text-sm focus:outline-none transition-colors shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Privacy note */}
                  <div className="flex items-start gap-2 text-[11px] text-gray-500 bg-white/3 border border-white/5 rounded-xl p-3">
                    <Shield className="w-3.5 h-3.5 text-[#00F2FE]/50 shrink-0 mt-0.5" />
                    <span>
                      {isHindi
                        ? 'आपकी संपर्क जानकारी पूरी तरह सुरक्षित है। Creator Nest केवल व्यक्तिगत चैनल रणनीति और ब्रांड डील के लिए संपर्क करेगा।'
                        : 'Your contact info is private and secure. Creator Nest may reach out only about personalized channel strategy & brand deal opportunities.'}
                    </span>
                  </div>

                  {/* Preset quick test buttons */}
                  <div>
                    <div className="text-xs text-gray-400 font-semibold mb-2">
                      {isHindi ? 'या इन सैम्पल चैनलों से टेस्ट करें:' : 'Or test with a sample channel:'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_CHANNELS.map(p => (
                        <button
                          key={p.handle}
                          type="button"
                          onClick={() => setChannelHandle(p.handle)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            channelHandle === p.handle
                              ? 'bg-[#00F2FE]/15 border-[#00F2FE]/40 text-[#00F2FE]'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {p.handle} <span className="text-[10px] text-gray-500 ml-1">({p.label})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!channelHandle.trim()) {
                          setError(isHindi ? 'कृपया चैनल हैंडल दर्ज करें।' : 'Please enter a channel handle.');
                          return;
                        }
                        setError('');
                        setFormStep(2);
                      }}
                      className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#00d5e0] to-[#0093E9] hover:from-[#00F2FE] hover:to-[#00b5c9] font-bold text-sm text-[#0B0F14] transition-all shadow-xl shadow-[#00F2FE]/20 hover:shadow-[#00F2FE]/30 hover:-translate-y-0.5 cursor-pointer"
                    >
                      {isHindi ? 'चरण 2 पर आगे बढ़ें' : 'Continue to Step 2'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Ask Studio Master Prompt & Telemetry */}
            {formStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <div className="space-y-6">
                  {/* Step 2A: Copy Master Extraction Prompt Card */}
                  <div className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            {isHindi ? 'भाग A: मास्टर एक्सट्रैक्शन प्रॉम्प्ट कॉपी करें' : 'Part A: Copy Master Extraction Prompt'}
                          </h3>
                          <p className="text-[11px] text-gray-400">
                            {isHindi
                              ? 'इस प्रॉम्प्ट को यूट्यूब स्टूडियो के एआई असिस्टेंट (Ask Studio) में पेस्ट करें।'
                              : "Paste this prompt into YouTube Studio's internal AI assistant ('Ask Studio')."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Prompt Language toggle */}
                        <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setPromptLanguage('en')}
                            className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                              promptLanguage === 'en' ? 'bg-purple-600 text-white' : 'text-gray-400'
                            }`}
                          >
                            EN
                          </button>
                          <button
                            type="button"
                            onClick={() => setPromptLanguage('hi')}
                            className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                              promptLanguage === 'hi' ? 'bg-purple-600 text-white' : 'text-gray-400'
                            }`}
                          >
                            हिन्दी
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyPrompt}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
                            copiedPrompt
                              ? 'bg-emerald-500 text-white'
                              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
                          }`}
                        >
                          {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedPrompt ? (isHindi ? 'प्रॉम्प्ट कॉपी हुआ!' : 'Copied Prompt!') : (isHindi ? 'मास्टर प्रॉम्प्ट कॉपी करें' : 'Copy Master Prompt')}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#080C12] border border-white/10 rounded-xl p-3 text-xs text-gray-400 font-mono">
                      <div className="flex items-center justify-between mb-1 text-[10px] text-gray-500 uppercase tracking-wider font-sans">
                        <span>
                          {isHindi ? 'शामिल: 365 दिन वॉच आवर्स, स्ट्राइक्स, रिटेंशन (AVD), सीटीआर व आरपीएम' : 'Includes: 365d Watch Hours, Strikes, Retention (AVD), CTR, RPM & Geographies'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPromptPreview(!showPromptPreview)}
                          className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {showPromptPreview ? (isHindi ? 'छिपाएं' : 'Hide') : (isHindi ? 'पूरा प्रॉम्प्ट देखें' : 'Preview Full Prompt')}
                          {showPromptPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                      {showPromptPreview && (
                        <pre className="text-[11px] text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto mt-2 p-2 bg-black/40 rounded border border-white/5 custom-scrollbar">
                          {activePromptText}
                        </pre>
                      )}
                    </div>
                  </div>

                  {/* Step 2B: Paste Structured Output */}
                  <div className="bg-[#0B1017] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-red-400" />
                        </div>
                        <h3 className="text-base font-bold text-white">
                          {isHindi ? 'भाग B: आस्क स्टूडियो से प्राप्त परिणाम पेस्ट करें' : 'Part B: Paste Ask Studio Structured Output'}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={handleFillSample}
                        className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
                      >
                        <Zap className="w-3 h-3" /> {isHindi ? 'सैम्पल डेटा भरें' : 'Fill Sample Telemetry'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      {isHindi
                        ? 'आस्क स्टूडियो द्वारा लौटाया गया संरचित उत्तर यहां पेस्ट करें। हमारा एआई सिस्टम सभी आंकड़े पढ़कर सही ऑडिट रिपोर्ट तैयार करेगा।'
                        : 'Paste the structured answer returned by Ask Studio. Our AI engine will ingest every metric directly to verify YPP thresholds, analyze audience retention, and calculate RPM.'}
                    </p>

                    <textarea
                      value={askStudioText}
                      onChange={e => setAskStudioText(e.target.value)}
                      placeholder={isHindi ? `आस्क स्टूडियो से मिला उत्तर यहां पेस्ट करें...\n\nउदाहरण:\n[1. YPP मोनेटाइजेशन और वॉच आवर्स]\n- सब्सक्राइबर्स संख्या: 18,400 / 1,000\n- वैध सार्वजनिक वॉच आवर्स: 5,120 / 4,000\n- कम्युनिटी गाइडलाइन्स स्ट्राइक्स: 0\n- AVD: 5m 12s\n- CTR: 7.2%\n- RPM: ₹220` : `Paste Ask Studio response here...\n\nExample:\n[1. YPP MONETIZATION & WATCH HOURS]\n- Subscribers: 18,400 / 1,000\n- Valid Public Watch Hours: 5,120 / 4,000\n- Community Guidelines Strikes: 0\n- Average View Duration: 5m 12s\n- Impressions CTR: 7.2%\n- RPM: ₹220`}
                      className="w-full h-48 bg-[#141C28] border border-white/10 focus:border-red-500 rounded-xl p-4 text-white text-xs font-mono placeholder:text-gray-600 focus:outline-none transition-colors resize-none mb-4 custom-scrollbar"
                    />

                    {/* Channel & Audit Badges */}
                    <div className="bg-white/3 border border-white/10 rounded-xl p-3.5 mb-5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-300 border border-red-500/20 px-2.5 py-1 rounded-full">
                          <YoutubeIcon className="w-3.5 h-3.5 text-red-400" />
                          {channelHandle || (isHindi ? 'कोई हैंडल नहीं' : 'No handle set')}
                        </div>
                        {askStudioText.trim() ? (
                          <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {isHindi ? `स्टूडियो टेलीमेट्री उपलब्ध (${askStudioText.length} वर्ण)` : `Studio Telemetry Provided (${askStudioText.length} chars)`}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2.5 py-1 rounded-full">
                            <Info className="w-3.5 h-3.5" />
                            {isHindi ? 'पब्लिक यूट्यूब एपीआई मोड' : 'Public YouTube API Mode'}
                          </div>
                        )}
                      </div>
                      {askStudioText && (
                        <button
                          type="button"
                          onClick={() => setAskStudioText('')}
                          className="text-[11px] text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {isHindi ? 'टेक्स्ट हटाएं' : 'Clear Text'}
                        </button>
                      )}
                    </div>

                    {error && (
                      <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-bold transition-all cursor-pointer"
                      >
                        {isHindi ? 'वापस' : 'Back'}
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#00d5e0] to-[#0093E9] hover:from-[#00F2FE] hover:to-[#00b5c9] text-[#0B0F14] font-bold text-sm transition-all shadow-xl shadow-[#00F2FE]/25 hover:shadow-[#00F2FE]/40 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        {isHindi ? 'Creator Nest AI ऑडिट शुरू करें' : 'Run Creator Nest AI Audit'}
                      </button>
                    </div>

                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline cursor-pointer"
                      >
                        {isHindi 
                          ? 'या आस्क स्टूडियो स्किप करें और केवल पब्लिक एपीआई से ऑडिट करें →'
                          : 'Or skip Ask Studio & audit with public YouTube Data API only →'
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {[
              {
                icon: Shield,
                title: isHindi ? 'YPP नीति चेकलिस्ट' : 'YPP Policy Checklist',
                desc: isHindi ? '1,000 सब्सक्राइबर्स, 4,000 वॉच आवर्स, 2FA और कम्युनिटी स्ट्राइक्स ऑडिट।' : 'Audits 1,000 subs, 4,000 watch hours, 2FA, and community strikes.',
                color: 'text-red-400',
              },
              {
                icon: DollarSign,
                title: isHindi ? 'भारतीय CPM व ₹ में रेवेन्यू' : 'Indian CPM & Revenue in ₹',
                desc: isHindi ? 'अनुमानित मासिक एडसेंस और 6+ विविधीकृत कमाई स्रोत।' : 'Projected monthly AdSense and 6+ monetization streams in INR.',
                color: 'text-emerald-400',
              },
              {
                icon: Target,
                title: isHindi ? '12-पॉइंट एक्शन मैट्रिक्स' : '12-Point Action Matrix',
                desc: isHindi ? 'उच्च, मध्यम और सामान्य प्राथमिकताओं के साथ स्पष्ट समाधान।' : 'Actionable solutions with High, Medium, and Low priorities.',
                color: 'text-amber-400',
              },
            ].map((f, i) => (
              <div key={i} className="bg-[#0B1017] border border-white/10 rounded-xl p-4 shadow-lg">
                <f.icon className={`w-5 h-5 ${f.color} mb-2`} />
                <div className="text-sm font-bold text-white mb-1">{f.title}</div>
                <div className="text-xs text-gray-400">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
