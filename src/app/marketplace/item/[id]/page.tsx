'use client';

import { useState, useEffect, use, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Star, ChevronRight, CheckCircle2,
  Users, ArrowLeft, Zap, Crown, Download, Share2,
  Brain, Target, TrendingUp, Palette, BarChart3, ShoppingCart, ExternalLink,
  Copy, Check, FileText, Sparkles, Tv, MapPin, BadgeCheck, Shield, ChevronDown, ChevronUp, Layers, Eye, IndianRupee, Printer,
  Camera, Upload, ImageIcon, Lock, ShieldCheck, Mail, Phone, Award, Globe, Flame, Play, HelpCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { ITEMS } from '@/app/marketplace/marketData';
import { getUUIDFromStaticId } from '@/lib/uuidHelper';

const PLAN_ORDER = { free: 0, silver: 1, gold: 2, platinum: 3 };
const PLAN_COLORS: Record<string, string> = { free: '#6B7280', silver: '#C0C0C0', gold: '#F59E0B', platinum: '#00F2FE' };

export default function MarketItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // ── Customizable State for Creator Media Kit Studio (tp1) ──
  const [kitName, setKitName] = useState('Jeet Choudhary');
  const [kitHandle, setKitHandle] = useState('@ElectionGuide');
  const [kitNiche, setKitNiche] = useState('EdTech & App Reviews');
  const [kitLocation, setKitLocation] = useState('Delhi, India');
  const [kitYtSubs, setKitYtSubs] = useState('110K');
  const [kitIgFollowers, setKitIgFollowers] = useState('45K');
  const [kitAvgViews, setKitAvgViews] = useState('40,000');
  const [kitER, setKitER] = useState('6.4%');
  const [kitAVD, setKitAVD] = useState('82%');
  const [kitEmail, setKitEmail] = useState('collabs@creatornest.in');
  const [kitPhone, setKitPhone] = useState('+91 98765 43200');
  const [kitImg, setKitImg] = useState('/images/creators/1787833535582-creator-profile.jpg');
  
  // Deliverable Rates
  const [rateDedicated, setRateDedicated] = useState('75,000');
  const [rateIntegrated, setRateIntegrated] = useState('35,000');
  const [rateReel, setRateReel] = useState('28,000');
  const [rateShorts, setRateShorts] = useState('22,000');
  const [rateStory, setRateStory] = useState('12,000');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-sync logged-in creator details if available
  useEffect(() => {
    if (user?.full_name) {
      setKitName(user.full_name);
      if (user.email) setKitEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    let foundItem = null;
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cn_market_items');
      if (cached) {
        const parsed = JSON.parse(cached);
        const localItem = parsed.find((item: any) => String(item.id) === String(id) || getUUIDFromStaticId(String(item.id)) === getUUIDFromStaticId(String(id)));
        if (localItem) {
          foundItem = {
            id: localItem.id,
            item_type: localItem.item_type,
            title: localItem.title,
            short_desc: localItem.short_desc,
            long_desc: localItem.long_desc,
            category: localItem.category,
            icon: localItem.icon,
            accent: localItem.accent,
            plan: localItem.plan,
            price: localItem.price,
            rating: localItem.rating,
            thumbnail_url: localItem.thumbnail_url,
            file_url: localItem.file_url,
            external_url: localItem.external_url,
            tags: localItem.tags || [],
            features: localItem.features?.features || []
          };
        }
      }
    }

    if (!foundItem) {
      const staticItem = ITEMS.find(i => String(i.id) === String(id));
      if (staticItem) {
        const mappedStatic = {
          id: staticItem.id,
          item_type: staticItem.type,
          title: staticItem.title,
          short_desc: staticItem.desc,
          long_desc: staticItem.details?.longDesc || staticItem.desc,
          category: staticItem.category,
          icon: staticItem.icon?.name || staticItem.icon?.displayName || 'Sparkles',
          accent: staticItem.accent,
          plan: staticItem.plan,
          price: 0,
          rating: staticItem.rating || 5.0,
          thumbnail_url: staticItem.thumbnailUrl || '',
          file_url: '',
          external_url: staticItem.href || '',
          tags: staticItem.tags || [],
          features: staticItem.details?.features || []
        };

        if (staticItem.meta && staticItem.meta.includes('₹')) {
          const numStr = staticItem.meta.replace(/[^0-9]/g, '');
          if (numStr) mappedStatic.price = parseInt(numStr, 10);
        }

        foundItem = mappedStatic;
      }
    }

    if (foundItem) {
      setItem(foundItem);
      setLoading(false);
    } else {
      setLoading(true);
    }

    async function fetchItem() {
      const { data } = await supabase.from('market_items').select('*').eq('id', getUUIDFromStaticId(id)).single();
      if (data) {
        setItem(data);
      }
      setLoading(false);
    }
    fetchItem();
  }, [id]);

  // Handle local image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setKitImg(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Silent Background Sync to Admin for Telemetry / Lead Record
  const syncLeadToAdmin = (actionName: string) => {
    try {
      fetch('/api/creator/media-kit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: kitName,
          handle: kitHandle,
          niche: kitNiche,
          location: kitLocation,
          ytSubs: kitYtSubs,
          igFollowers: kitIgFollowers,
          avgViews: kitAvgViews,
          er: kitER,
          avd: kitAVD,
          email: kitEmail,
          phone: kitPhone,
          imgUrl: kitImg.length > 200 ? 'Uploaded Image' : kitImg,
          rateDedicated,
          rateIntegrated,
          rateReel,
          rateShorts,
          rateStory,
          actionTriggered: actionName
        })
      }).catch(() => {});
    } catch {
      // Silent catch
    }
  };

  // Generate Notion-Optimized Markdown representation of the Media Kit
  const notionMarkdown = useMemo(() => {
    return `# 📁 [Official Media Kit 2026] ${kitName} (${kitHandle})
> **Managed Exclusively by Creator Nest Talent Agency**
> 📩 Commercial Inquiries: ${kitEmail} • 📍 Location: ${kitLocation} • 🎯 Category: ${kitNiche}

---

## 🌟 Channel Mission & Creator Bio
Founder of ${kitHandle}. Premium creator producing high-retention content in **${kitNiche}**. Specializing in in-depth product walkthroughs, software reviews, tutorials, and authentic consumer tech storytelling.

---

## 📊 Verified Audience Demographics & Reach

| Metric | YouTube Channel | Instagram Community | Total Ecosystem |
| :--- | :--- | :--- | :--- |
| **Audience Size** | ${kitYtSubs} Subscribers | ${kitIgFollowers} Followers | ~155K+ Total Reach |
| **Average Views** | ${kitAvgViews} / Video | 35,000 / Reel | 40,000+ Average Views |
| **Audience Retention (AVD)**| ${kitAVD} Average View Duration | 4.8s Story Retention | Top 5% Industry Retention |
| **Engagement Rate (ER%)** | ${kitER} Active Engagement | 5.2% Reel Engagement | 2.5x Market Average |

### 🌍 Geographic & Audience Demographic Breakdown
- **Geographic Distribution:** India (88%), USA (6%), UAE & Middle East (4%), Others (2%)
- **Top Indian Cities:** Delhi NCR (32%), Mumbai (24%), Bengaluru (18%), Pune (12%), Tier 2/3 Hubs (14%)
- **Age Demographics:** 18–24 yrs (42%), 25–34 yrs (38%), 35+ yrs (20%)
- **Audience Gender Ratio:** Male 68% • Female 32%
- **Audience Interests:** Tech & Gadgets, AI Tools, EdTech, Coding, Productivity & Digital Services

---

## 💰 2026 Commercial Deliverable Rate Card (in ₹ INR)

| Deliverable Format | Scope & Description | Commercial Rate (₹) |
| :--- | :--- | :--- |
| 🎬 **YouTube Dedicated Video** | Full 8–12 min video focused on product/brand | ₹${rateDedicated} |
| ⚡ **YouTube 60s Integration** | High-energy mid-roll organic sponsorship integration | ₹${rateIntegrated} |
| 📱 **Instagram Dedicated Reel** | 9:16 high-conversion vertical video + caption CTA | ₹${rateReel} |
| 🚀 **YouTube Shorts (60s)** | Fast-paced vertical Short with pinned comment link | ₹${rateShorts} |
| 📸 **Instagram Story Set (3 Frames)** | Sequence of 3 stories with active Swipe-Up link sticker | ₹${rateStory} |
| 📦 **360° Omnichannel Blitz** | 1 Dedicated Video + 2 Reels + 1 YouTube Short + Story Set | ₹1,20,000 |

---

## 📜 Commercial Terms & Legal Policies

1. **Payment Terms:** 50% advance on brief approval; remaining 50% within Net-15 days of live video delivery.
2. **Category Exclusivity:** Available at +25% per 30 days of exclusive sponsorship.
3. **Paid Ad Whitelisting & Spark Ads:** 30-day ad usage rights available at +30% of base deliverable fee.
4. **Script & Video Revisions:** Up to 2 standard revisions within original campaign brief scope.
5. **Brand Safety & Compliance:** 100% ASCI compliant with '#Ad / #Sponsored' disclosures.

---

## 📩 Commercial Booking Protocol
All brand inquiries and sponsor contracts are vetted and processed through our agency talent management desk.

- **Direct Booking Desk:** ${kitEmail}
- **WhatsApp Agency Hotline:** ${kitPhone}
- **Agency:** Creator Nest Talent Management (https://creatornest.in)
`;
  }, [kitName, kitHandle, kitNiche, kitLocation, kitYtSubs, kitIgFollowers, kitAvgViews, kitER, kitAVD, kitEmail, kitPhone, rateDedicated, rateIntegrated, rateReel, rateShorts, rateStory]);

  const copyNotionMarkdown = () => {
    navigator.clipboard.writeText(notionMarkdown);
    setCopied(true);
    syncLeadToAdmin('COPY_NOTION_MARKDOWN');
    setTimeout(() => setCopied(false), 2500);
  };

  const copyPitchSnippet = () => {
    const pitch = `Hi Team,\n\nPlease find attached the official 2026 Media Kit for ${kitName} (${kitHandle}).\n\n- YouTube Subscribers: ${kitYtSubs}\n- Instagram Followers: ${kitIgFollowers}\n- Average Views per Video: ${kitAvgViews} (${kitAVD} AVD)\n- Core Niche: ${kitNiche}\n- Deliverable Rates: Dedicated Video ₹${rateDedicated} | 60s Integration ₹${rateIntegrated} | Reel ₹${rateReel}\n\nFor bookings & campaign briefs, feel free to contact our agency at ${kitEmail}.\n\nBest regards,\nCreator Nest Talent Management`;
    navigator.clipboard.writeText(pitch);
    setCopiedSnippet(true);
    syncLeadToAdmin('COPY_PITCH_SNIPPET');
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  const downloadMarkdownFile = () => {
    syncLeadToAdmin('DOWNLOAD_MD');
    const blob = new Blob([notionMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Media_Kit_${kitName.replace(/\s+/g, '_')}_2026.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Direct High-Resolution PDF & Image Generator using html-to-image
  // html-to-image handles Tailwind CSS variables, SVG icons and modern CSS
  // far better than html2canvas. It renders via SVG foreignObject internally.
  const downloadPDFDocument = async () => {
    syncLeadToAdmin('DOWNLOAD_PDF');
    const canvasEl = document.getElementById('media-kit-canvas');
    if (!canvasEl) return;

    setDownloadingPdf(true);
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      // Capture the live element as a high-res PNG data URL
      const dataUrl = await toPng(canvasEl, {
        quality: 1.0,
        pixelRatio: 2.5,               // High-res for crisp A4 print
        backgroundColor: '#0F1622',
        cacheBust: true,
        skipAutoScale: true,
        filter: (node: HTMLElement) => {
          // Skip the interactive action buttons inside the titlebar from PDF
          if (node?.classList?.contains?.('pdf-hide')) return false;
          return true;
        },
      });

      // Create an Image to get dimensions
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      // Build A4 PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();      // 210mm
      const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const imgAspect = img.height / img.width;
      const scaledHeight = pdfWidth * imgAspect;

      if (scaledHeight <= pdfPageHeight) {
        // Fits on one page
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, scaledHeight);
      } else {
        // Multi-page: slice the image into A4-height chunks via an offscreen canvas
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = img.width;
        srcCanvas.height = img.height;
        const srcCtx = srcCanvas.getContext('2d')!;
        srcCtx.drawImage(img, 0, 0);

        const pageCanvasHeight = Math.floor(img.width * (pdfPageHeight / pdfWidth));
        let srcY = 0;
        let pageNum = 0;

        while (srcY < img.height) {
          const sliceH = Math.min(pageCanvasHeight, img.height - srcY);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = img.width;
          sliceCanvas.height = sliceH;
          const sliceCtx = sliceCanvas.getContext('2d')!;
          sliceCtx.drawImage(srcCanvas, 0, srcY, img.width, sliceH, 0, 0, img.width, sliceH);

          const sliceData = sliceCanvas.toDataURL('image/png');
          const sliceHeightMm = (sliceH / img.width) * pdfWidth;

          if (pageNum > 0) pdf.addPage();
          pdf.addImage(sliceData, 'PNG', 0, 0, pdfWidth, sliceHeightMm);

          srcY += sliceH;
          pageNum++;
        }
      }

      // Watermark on every page
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(7);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Generated on CreatorNest.in', pdfWidth / 2, pdfPageHeight - 4, { align: 'center' });
      }

      pdf.save(`Media_Kit_${kitName.replace(/[^a-zA-Z0-9]/g, '_')}_2026.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback: download the element as a high-res PNG image
      try {
        const { toPng } = await import('html-to-image');
        const canvasEl2 = document.getElementById('media-kit-canvas');
        if (canvasEl2) {
          const pngUrl = await toPng(canvasEl2, {
            quality: 1.0,
            pixelRatio: 2,
            backgroundColor: '#0F1622',
            cacheBust: true,
          });
          const link = document.createElement('a');
          link.download = `Media_Kit_${kitName.replace(/[^a-zA-Z0-9]/g, '_')}_2026.png`;
          link.href = pngUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (e2) {
        console.error('PNG fallback also failed:', e2);
        alert('Download failed. Please try again or use Ctrl+P to save as PDF.');
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B11] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold text-sm">Loading media kit workspace...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#070B11] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
        <Link href="/marketplace" className="text-cyan-400 hover:underline">Return to Marketplace</Link>
      </div>
    );
  }

  const isMediaKitTemplate = String(item.id) === 'tp1' || item.title.toLowerCase().includes('media kit');

  return (
    <main className="min-h-screen bg-[#070B11] text-white flex flex-col">
      
      <Navbar />

      {/* Header Breadcrumbs */}
      <div className="pt-24 pb-5 border-b border-white/10 bg-[#0A1019]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/templates" className="inline-flex items-center text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 text-cyan-400" />
            Back to Templates & Marketplace
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              Notion 2026 Standard
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        
        {/* Top Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#101A27] via-[#0C121B] to-[#070B11] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Official Notion Deck
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  100% Free Creator Tool
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                {item.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {item.short_desc}
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              
              <button
                onClick={downloadPDFDocument}
                disabled={downloadingPdf}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-black" />
                    <span>Download PDF Rate Card</span>
                  </>
                )}
              </button>

              <button
                onClick={copyNotionMarkdown}
                className="px-4 py-3 rounded-xl bg-cyan-500 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:bg-cyan-400 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
                <span>{copied ? 'Copied Notion Markdown!' : 'Copy Notion Markdown'}</span>
              </button>

              <button
                onClick={downloadMarkdownFile}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export .MD</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── NOTION MEDIA KIT INTERACTIVE WORKSPACE STUDIO ── */}
        {isMediaKitTemplate ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Live Customizer Panel (4 Cols) */}
            <div className="lg:col-span-4 bg-[#0C121B] border border-white/10 rounded-3xl p-6 space-y-6 shadow-xl sticky top-28">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">Media Kit Customizer</h3>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Live Sync
                </span>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Creator Image Option Input */}
                <div>
                  <label className="text-slate-400 font-bold block mb-1.5 flex items-center justify-between">
                    <span>Creator Avatar / Photo</span>
                    <span className="text-[10px] text-cyan-400">JPG, PNG or URL</span>
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <img
                      src={kitImg || '/images/default-avatar.png'}
                      alt="Creator"
                      className="w-12 h-12 rounded-xl object-cover border border-cyan-400/40 shadow-md shrink-0"
                    />
                    
                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Upload Photo</span>
                      </button>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={kitImg.startsWith('data:') ? 'Custom Uploaded Photo' : kitImg}
                    onChange={(e) => setKitImg(e.target.value)}
                    placeholder="Or paste image URL"
                    className="w-full mt-2 bg-[#121924] border border-white/10 rounded-xl px-3 py-1.5 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Creator / Full Name</label>
                  <input
                    type="text"
                    value={kitName}
                    onChange={(e) => setKitName(e.target.value)}
                    className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Primary Channel Handle</label>
                  <input
                    type="text"
                    value={kitHandle}
                    onChange={(e) => setKitHandle(e.target.value)}
                    className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-cyan-400 font-mono font-medium focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">YouTube Subs</label>
                    <input
                      type="text"
                      value={kitYtSubs}
                      onChange={(e) => setKitYtSubs(e.target.value)}
                      className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-red-400 font-mono font-bold focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Instagram</label>
                    <input
                      type="text"
                      value={kitIgFollowers}
                      onChange={(e) => setKitIgFollowers(e.target.value)}
                      className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-pink-400 font-mono font-bold focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Avg Views (10)</label>
                    <input
                      type="text"
                      value={kitAvgViews}
                      onChange={(e) => setKitAvgViews(e.target.value)}
                      className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Retention (AVD)</label>
                    <input
                      type="text"
                      value={kitAVD}
                      onChange={(e) => setKitAVD(e.target.value)}
                      className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Content Niche / Category</label>
                  <input
                    type="text"
                    value={kitNiche}
                    onChange={(e) => setKitNiche(e.target.value)}
                    className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-purple-300 font-medium focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Booking Contact Email</label>
                  <input
                    type="text"
                    value={kitEmail}
                    onChange={(e) => setKitEmail(e.target.value)}
                    className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Rate Card Customizer Section */}
                <div className="pt-3 border-t border-white/10 space-y-2.5">
                  <div className="flex items-center gap-1 text-white text-xs font-black uppercase tracking-wider">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deliverable Rates (₹ INR)</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Dedicated Video:</span>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                      <input
                        type="text"
                        value={rateDedicated}
                        onChange={(e) => setRateDedicated(e.target.value)}
                        className="w-full bg-[#121924] border border-white/10 rounded-lg pl-5 pr-2 py-1 text-emerald-400 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">60s Integration:</span>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                      <input
                        type="text"
                        value={rateIntegrated}
                        onChange={(e) => setRateIntegrated(e.target.value)}
                        className="w-full bg-[#121924] border border-white/10 rounded-lg pl-5 pr-2 py-1 text-emerald-400 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Dedicated Reel:</span>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                      <input
                        type="text"
                        value={rateReel}
                        onChange={(e) => setRateReel(e.target.value)}
                        className="w-full bg-[#121924] border border-white/10 rounded-lg pl-5 pr-2 py-1 text-emerald-400 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Snippet Pitch Button */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <button
                    onClick={copyPitchSnippet}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copiedSnippet ? 'Pitch Snippet Copied!' : 'Copy Brand Pitch Email Snippet'}</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Right Column: Live Notion Page Workspace Preview Canvas (8 Cols) */}
            <div 
              id="media-kit-canvas"
              className="lg:col-span-8 rounded-3xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: '#0F1622', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              
              {/* Notion Window Titlebar */}
              <div className="px-5 py-3.5 flex items-center justify-between text-xs" style={{ backgroundColor: '#172130', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.8)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(234,179,8,0.8)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.8)' }} />
                  </div>
                  <span className="font-mono ml-2" style={{ color: '#cbd5e1' }}>Notion Workspace • {kitName} Media Kit 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadPDFDocument}
                    disabled={downloadingPdf}
                    className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold flex items-center gap-1 border border-emerald-500/40 cursor-pointer"
                  >
                    {downloadingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                    <span>{downloadingPdf ? 'Saving PDF...' : 'Download PDF'}</span>
                  </button>
                  <button
                    onClick={copyNotionMarkdown}
                    className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-cyan-400" />
                    <span>Copy Markdown</span>
                  </button>
                </div>
              </div>

              {/* Notion Cover Header with Creator Photo (4:3 Card) */}
              <div className="w-full relative overflow-hidden flex items-end" style={{ backgroundColor: '#0d2137' }}>
                {/* Background gradient band */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0e3d5e 0%, #122240 40%, #1a1040 100%)' }} />
                
                <div className="relative z-10 flex items-stretch gap-5 p-5 sm:p-6 w-full">
                  {/* Creator Photo — 4:3 Card Ratio */}
                  <div className="relative shrink-0" style={{ width: '120px', aspectRatio: '3/4' }}>
                    <img
                      src={kitImg || '/images/default-avatar.png'}
                      alt={kitName}
                      className="w-full h-full object-cover shadow-2xl"
                      style={{ borderRadius: '16px', border: '2.5px solid rgba(0,242,254,0.5)', backgroundColor: '#0F1622' }}
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center shadow-md" style={{ backgroundColor: '#00F2FE' }}>
                      <BadgeCheck className="w-4 h-4 text-black" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black" style={{ color: '#ffffff' }}>{kitName}</h2>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(0,242,254,0.15)', color: '#67e8f9', border: '1px solid rgba(0,242,254,0.3)' }}>
                        Verified 2026
                      </span>
                    </div>
                    <p className="text-xs font-mono flex items-center gap-1" style={{ color: '#67e8f9' }}>
                      <Tv className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
                      <span>{kitHandle} • Official Media Kit</span>
                    </p>
                    <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: '#94a3b8' }}>
                      <MapPin className="w-3 h-3" style={{ color: '#a78bfa' }} />
                      <span>{kitLocation}</span>
                      <span className="mx-1">•</span>
                      <span style={{ color: '#c4b5fd' }}>{kitNiche}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Notion Body Content */}
              <div className="p-6 sm:p-8 space-y-6 text-slate-200 text-xs sm:text-sm">
                
                {/* Agency Representation Callout Block */}
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">Represented Exclusively by Creator Nest Agency</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      All brand contracts, deliverable escrow protection, and Net-15 invoicing are governed under official agency representation. Direct commercial desk: <strong className="text-cyan-300 font-mono">{kitEmail}</strong> • WhatsApp: <strong className="text-emerald-400 font-mono">{kitPhone}</strong>
                    </p>
                  </div>
                </div>

                {/* Section Divider 1 */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

                {/* Creator Bio Section */}
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Creator Overview & Channel Focus</span>
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Founder of <strong className="text-white">{kitHandle}</strong>. Recognized leader in <span className="text-purple-300 font-bold">{kitNiche}</span>, based out of {kitLocation}. We create high-retention video breakdowns, hands-on tutorials, and trusted software/app reviews with a focus on real viewer utility and commercial conversion.
                  </p>
                </div>

                {/* Section Divider 2 */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

                {/* Verified Audience Metrics Grid */}
                <div className="space-y-3">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Verified Audience Reach & Retention Benchmarks</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#141C2B] border border-white/10 text-center">
                      <p className="text-[11px] text-slate-400 font-bold mb-1">YouTube Subs</p>
                      <p className="text-xl font-black text-red-400 font-mono">{kitYtSubs}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#141C2B] border border-white/10 text-center">
                      <p className="text-[11px] text-slate-400 font-bold mb-1">Instagram</p>
                      <p className="text-xl font-black text-pink-400 font-mono">{kitIgFollowers}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#141C2B] border border-white/10 text-center">
                      <p className="text-[11px] text-slate-400 font-bold mb-1">Avg Views / Video</p>
                      <p className="text-xl font-black text-emerald-400 font-mono">{kitAvgViews}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#141C2B] border border-white/10 text-center">
                      <p className="text-[11px] text-slate-400 font-bold mb-1">Audience AVD</p>
                      <p className="text-xl font-black text-cyan-300 font-mono">{kitAVD}</p>
                    </div>
                  </div>
                </div>

                {/* Demographics & Geographic Split */}
                <div className="p-5 rounded-2xl bg-[#141C2B] border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Audience Demographics & City Tiers</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-medium">Core Age Distribution:</p>
                      <p className="text-white font-bold mt-0.5">18–24 yrs (42%) • 25–34 yrs (38%)</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Audience Geography:</p>
                      <p className="text-white font-bold mt-0.5">India (88%) • Tier 1 Hubs (65%)</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Audience Gender:</p>
                      <p className="text-white font-bold mt-0.5">Male 68% • Female 32%</p>
                    </div>
                  </div>
                </div>

                {/* Section Divider 3 */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

                {/* Deliverable Rate Card Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-emerald-400" />
                      <span>2026 Commercial Deliverables & Rate Card</span>
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Standard Pricing in ₹
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121927]">
                    <table className="w-full text-left text-xs min-w-[500px]">
                      <thead className="bg-[#1A2436] border-b border-white/10 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3">Deliverable Format</th>
                          <th className="px-4 py-3">Scope & Platform</th>
                          <th className="px-4 py-3 text-right">Standard Rate (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium">
                        <tr className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                            <Tv className="w-4 h-4 text-red-400" />
                            <span>YouTube Dedicated Video</span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">8–12 min standalone product breakdown</td>
                          <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">₹{rateDedicated}</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span>YouTube 60s Integration</span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">Organic mid-roll sponsor segment</td>
                          <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">₹{rateIntegrated}</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                            <Camera className="w-4 h-4 text-pink-400" />
                            <span>Instagram Dedicated Reel</span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">9:16 vertical video + caption link sticker</td>
                          <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">₹{rateReel}</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span>YouTube Shorts (60s)</span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">Vertical Short with pinned comment CTA</td>
                          <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">₹{rateShorts}</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <span>Instagram Story Sequence</span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">3 frames with direct brand link sticker</td>
                          <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">₹{rateStory}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section Divider 4 */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

                {/* Commercial Add-ons & Exclusivity */}
                <div className="p-5 rounded-2xl bg-[#141C2B] border border-white/10 space-y-2 text-xs">
                  <h4 className="font-bold text-white uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Commercial Terms & Add-On Multipliers</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                    <li><strong>Category Exclusivity:</strong> +25% per 30 days of exclusive sponsorship.</li>
                    <li><strong>Meta Spark Ads & Whitelisting:</strong> +30% for 30-day paid advertising access.</li>
                    <li><strong>Payment Milestones:</strong> 50% advance on brief approval; remaining 50% Net-15 days.</li>
                    <li><strong>Script Revisions:</strong> Up to 2 standard cut revisions included within brief scope.</li>
                  </ul>
                </div>

                {/* Small Discreet Footer Watermark */}
                <div className="pt-4 pb-1 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                  <span>⚡ Verified 2026 Commercial Media Kit</span>
                  <span className="text-cyan-400/80 font-bold">Generated on CreatorNest.in</span>
                  <span>Ref: CN-MK-2026</span>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* Standard Layout for other non-Media Kit items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                <p className="leading-relaxed whitespace-pre-wrap">{item.long_desc || item.short_desc}</p>
              </div>
            </div>
          </div>
        )}

      </div>

      <Footer />
    </main>
  );
}
