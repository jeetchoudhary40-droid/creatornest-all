'use client';

import { useState, useEffect, use, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Star, ChevronRight, CheckCircle2,
  Users, ArrowLeft, Zap, Crown, Download, Share2,
  Brain, Target, TrendingUp, Palette, BarChart3, ShoppingCart, ExternalLink,
  Copy, Check, FileText, Sparkles, Tv, MapPin, BadgeCheck, Shield, ChevronDown, ChevronUp, Layers, Eye, IndianRupee, Printer,
  Camera, Upload, ImageIcon, Lock, ShieldCheck, Mail, Phone, Award, Globe, Flame, Play, HelpCircle, Loader2,
  CheckCircle, ArrowRight, CreditCard, Smartphone, AlertCircle, RefreshCw, X, RotateCcw, Sliders, PlusCircle, FilePlus
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { ITEMS } from '@/app/marketplace/marketData';
import { getUUIDFromStaticId } from '@/lib/uuidHelper';

const PLAN_ORDER = { free: 0, silver: 1, gold: 2, platinum: 3 };
const PLAN_COLORS: Record<string, string> = { free: '#10B981', silver: '#C0C0C0', gold: '#F59E0B', platinum: '#00F2FE' };

export default function MarketItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // ── Checkout & Payment States ──
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [simulatedPaymentOrder, setSimulatedPaymentOrder] = useState<any>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<any>(null);

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
  const [kitPhone, setKitPhone] = useState('+91 9460990011');
  const [kitImg, setKitImg] = useState('/images/creators/1787833535582-creator-profile.jpg');
  
  // Deliverable Rates
  const [rateDedicated, setRateDedicated] = useState('75,000');
  const [rateIntegrated, setRateIntegrated] = useState('35,000');
  const [rateReel, setRateReel] = useState('28,000');
  const [rateShorts, setRateShorts] = useState('22,000');
  const [rateStory, setRateStory] = useState('12,000');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Preset Templates & Start New Kit Logic ──
  const [showNewKitModal, setShowNewKitModal] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const applyPreset = (preset: {
    name: string;
    handle: string;
    niche: string;
    location: string;
    ytSubs: string;
    igFollowers: string;
    avgViews: string;
    er: string;
    avd: string;
    email: string;
    phone: string;
    img: string;
    rateDedicated: string;
    rateIntegrated: string;
    rateReel: string;
    rateShorts: string;
    rateStory: string;
  }, label: string) => {
    setKitName(preset.name);
    setKitHandle(preset.handle);
    setKitNiche(preset.niche);
    setKitLocation(preset.location);
    setKitYtSubs(preset.ytSubs);
    setKitIgFollowers(preset.igFollowers);
    setKitAvgViews(preset.avgViews);
    setKitER(preset.er);
    setKitAVD(preset.avd);
    setKitEmail(preset.email);
    setKitPhone(preset.phone);
    setKitImg(preset.img);
    setRateDedicated(preset.rateDedicated);
    setRateIntegrated(preset.rateIntegrated);
    setRateReel(preset.rateReel);
    setRateShorts(preset.rateShorts);
    setRateStory(preset.rateStory);
    setShowNewKitModal(false);
    setResetSuccessMessage(label);
    setTimeout(() => setResetSuccessMessage(null), 3500);
  };

  const handleStartBlankKit = () => {
    applyPreset({
      name: '',
      handle: '@',
      niche: '',
      location: 'India',
      ytSubs: '',
      igFollowers: '',
      avgViews: '',
      er: '',
      avd: '',
      email: user?.email || '',
      phone: '+91 9460990011',
      img: '',
      rateDedicated: '',
      rateIntegrated: '',
      rateReel: '',
      rateShorts: '',
      rateStory: ''
    }, '✨ New blank media kit started! Ready for your custom details.');
  };

  const handleLoadSampleKit = () => {
    applyPreset({
      name: 'Jeet Choudhary',
      handle: '@ElectionGuide',
      niche: 'EdTech & App Reviews',
      location: 'Delhi, India',
      ytSubs: '110K',
      igFollowers: '45K',
      avgViews: '40,000',
      er: '6.4%',
      avd: '82%',
      email: 'collabs@creatornest.in',
      phone: '+91 9460990011',
      img: '/images/creators/1787833535582-creator-profile.jpg',
      rateDedicated: '75,000',
      rateIntegrated: '35,000',
      rateReel: '28,000',
      rateShorts: '22,000',
      rateStory: '12,000'
    }, '📋 Sample demo template loaded.');
  };

  const handleLoadMyProfile = () => {
    applyPreset({
      name: user?.full_name || '',
      handle: user?.user_metadata?.handle || '@creator',
      niche: user?.user_metadata?.niche || 'Content Creation',
      location: user?.user_metadata?.location || 'India',
      ytSubs: user?.user_metadata?.ytSubs || '',
      igFollowers: user?.user_metadata?.igFollowers || '',
      avgViews: '',
      er: '',
      avd: '',
      email: user?.email || '',
      phone: '+91 9460990011',
      img: user?.avatar_url || user?.user_metadata?.avatar_url || '',
      rateDedicated: '50,000',
      rateIntegrated: '25,000',
      rateReel: '20,000',
      rateShorts: '15,000',
      rateStory: '10,000'
    }, '👤 Loaded your logged-in profile data.');
  };

  const handleLoadTechPreset = () => {
    applyPreset({
      name: 'Tech Horizon',
      handle: '@TechHorizonIndia',
      niche: 'Tech, AI Tools & Gadgets',
      location: 'Bengaluru, India',
      ytSubs: '250K',
      igFollowers: '80K',
      avgViews: '95,000',
      er: '7.1%',
      avd: '85%',
      email: 'collabs@creatornest.in',
      phone: '+91 9460990011',
      img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
      rateDedicated: '1,20,000',
      rateIntegrated: '55,000',
      rateReel: '40,000',
      rateShorts: '35,000',
      rateStory: '18,000'
    }, '💻 Tech & Gadgets preset applied.');
  };

  const handleLoadLifestylePreset = () => {
    applyPreset({
      name: 'Aanya Sharma',
      handle: '@aanya_vogue',
      niche: 'Lifestyle, Fashion & Travel',
      location: 'Mumbai, India',
      ytSubs: '90K',
      igFollowers: '185K',
      avgViews: '65,000',
      er: '8.2%',
      avd: '78%',
      email: 'collabs@creatornest.in',
      phone: '+91 9460990011',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      rateDedicated: '85,000',
      rateIntegrated: '42,000',
      rateReel: '50,000',
      rateShorts: '28,000',
      rateStory: '22,000'
    }, '👗 Lifestyle & Fashion preset applied.');
  };

  // Auto-sync logged-in creator details if available
  useEffect(() => {
    if (user?.full_name) {
      setKitName(user.full_name);
      setCustomerName(user.full_name);
    }
    if (user?.email) {
      setKitEmail(user.email);
      setCustomerEmail(user.email);
    }
  }, [user]);

  // Load Item logic
  useEffect(() => {
    async function loadItemData() {
      setLoading(true);

      // 1. Try fetching from public server API first
      try {
        const res = await fetch(`/api/tools?id=${encodeURIComponent(id)}`);
        const json = await res.json();
        if (json.success && json.tool) {
          setItem(json.tool);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('API fetch tool failed, falling back', err);
      }

      // 2. Try localStorage cache
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
              features: Array.isArray(localItem.features) ? localItem.features : (localItem.features?.features || [])
            };
          }
        }
      }

      // 3. Try static ITEMS
      if (!foundItem) {
        const staticItem = ITEMS.find(i => String(i.id) === String(id));
        if (staticItem) {
          let priceVal = 0;
          if (staticItem.meta && staticItem.meta.includes('₹')) {
            const numStr = staticItem.meta.replace(/[^0-9]/g, '');
            if (numStr) priceVal = parseInt(numStr, 10);
          }

          foundItem = {
            id: staticItem.id,
            item_type: staticItem.type,
            title: staticItem.title,
            short_desc: staticItem.desc,
            long_desc: staticItem.details?.longDesc || staticItem.desc,
            category: staticItem.category,
            icon: staticItem.icon?.name || staticItem.icon?.displayName || 'Sparkles',
            accent: staticItem.accent,
            plan: staticItem.plan,
            price: priceVal,
            rating: staticItem.rating || 5.0,
            thumbnail_url: staticItem.thumbnailUrl || '',
            file_url: '',
            external_url: staticItem.href || '',
            tags: staticItem.tags || [],
            features: staticItem.details?.features || []
          };
        }
      }

      if (foundItem) {
        setItem(foundItem);
      }
      setLoading(false);
    }

    loadItemData();
  }, [id]);

  // Check URL params for post-payment return
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order_id');
      const paymentStatus = params.get('payment');
      if (orderId && paymentStatus === 'complete') {
        verifyOrderAndDownload(orderId);
      }
    }
  }, []);

  // ── Automatic File Download Helper ──
  const triggerAutoDownload = (downloadUrl: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('Auto download error', e);
    }
  };

  // ── Load Cashfree SDK v3 Script ──
  const loadCashfreeSdk = async (): Promise<any> => {
    if (typeof window !== 'undefined' && (window as any).Cashfree) {
      return (window as any).Cashfree;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      script.onload = () => resolve((window as any).Cashfree);
      script.onerror = () => reject(new Error('Failed to load Cashfree checkout SDK.'));
      document.body.appendChild(script);
    });
  };

  // ── Initiate Purchase Flow ──
  const handleInitiatePurchase = () => {
    setPaymentError('');
    setShowCheckoutModal(true);
  };

  // ── Submit & Pay via Cashfree ──
  const handleProceedToCashfree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim()) {
      setPaymentError('Please enter a valid email address to receive your download link.');
      return;
    }
    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      const res = await fetch('/api/payments/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: item.id,
          customerName: customerName || 'Creator',
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim() || '9999999999'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment session.');
      }

      // If Free Tool: Instant Download!
      if (data.isFree) {
        triggerAutoDownload(data.downloadUrl, `${(item.title || 'tool').replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`);
        setPurchaseSuccess({
          orderId: data.orderId,
          downloadUrl: data.downloadUrl,
          toolTitle: item.title,
          isFree: true
        });
        setShowCheckoutModal(false);
        setIsProcessingPayment(false);
        return;
      }

      // If Simulation Sandbox Mode (Instant Test without real keys)
      if (data.isSimulation) {
        setSimulatedPaymentOrder(data);
        setIsProcessingPayment(false);
        return;
      }

      // Live Cashfree Modal Checkout
      const CashfreeSdk = await loadCashfreeSdk();
      const cashfree = CashfreeSdk({ mode: (process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT || 'sandbox').toLowerCase() });
      setShowCheckoutModal(false);

      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: '_modal'
      }).then((result: any) => {
        if (result.error) {
          setPaymentError(result.error.message || 'Payment was cancelled or failed.');
          setShowCheckoutModal(true);
        }
        if (result.paymentDetails) {
          verifyOrderAndDownload(data.orderId);
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to initiate checkout.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // ── Verify Order & Execute Automatic Download ──
  const verifyOrderAndDownload = async (orderId: string, isSimulated = false) => {
    setIsProcessingPayment(true);
    try {
      const res = await fetch('/api/payments/cashfree/verify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, isSimulatedSuccess: isSimulated })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment verification failed.');
      }

      // ⚡ TRIGGER AUTOMATIC INSTANT DOWNLOAD ON DEVICE!
      const targetFilename = data.fileName || `${(item?.title || 'CreatorNest_Tool').replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;
      triggerAutoDownload(data.downloadUrl, targetFilename);

      setPurchaseSuccess({
        orderId: data.orderId,
        downloadUrl: data.downloadUrl,
        fileName: targetFilename,
        toolTitle: data.toolTitle || item?.title,
        amount: data.amount
      });

      setShowCheckoutModal(false);
      setSimulatedPaymentOrder(null);
    } catch (err: any) {
      alert('Verification Error: ' + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Media kit image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') setKitImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Notion-Optimized Markdown representation of the Media Kit
  const notionMarkdown = useMemo(() => {
    return `# 📁 [Official Media Kit 2026] ${kitName || 'Creator'} (${kitHandle || '@channel'})
> **Managed Exclusively by Creator Nest Talent Agency**
> 📩 Commercial Inquiries: ${kitEmail || 'collabs@creatornest.in'} • 📍 Location: ${kitLocation || 'India'} • 🎯 Category: ${kitNiche || 'Content Creation'}

---

## 🌟 Channel Mission & Creator Bio
Founder of ${kitHandle || '@channel'}. Premium creator producing high-retention content in **${kitNiche || 'Digital Media'}**. Specializing in in-depth product walkthroughs, software reviews, tutorials, and authentic consumer storytelling.

---

## 📊 Verified Audience Demographics & Reach

| Metric | YouTube Channel | Instagram Community | Total Ecosystem |
| :--- | :--- | :--- | :--- |
| **Audience Size** | ${kitYtSubs || '0'} Subscribers | ${kitIgFollowers || '0'} Followers | Active Audience Reach |
| **Average Views** | ${kitAvgViews || '0'} / Video | High-Reach Reels | Verified Average Views |
| **Audience Retention (AVD)**| ${kitAVD || 'N/A'} Average View Duration | Top Industry Retention |
| **Engagement Rate (ER%)** | ${kitER || 'N/A'} Active Engagement | Real Creator ROI |

---

## 💰 2026 Commercial Deliverable Rate Card (in ₹ INR)

| Deliverable Format | Scope & Description | Commercial Rate (₹) |
| :--- | :--- | :--- |
| 🎬 **YouTube Dedicated Video** | Full 8–12 min video focused on product/brand | ₹${rateDedicated || '0'} |
| ⚡ **YouTube 60s Integration** | High-energy mid-roll organic sponsorship integration | ₹${rateIntegrated || '0'} |
| 📱 **Instagram Dedicated Reel** | 9:16 high-conversion vertical video + caption CTA | ₹${rateReel || '0'} |
| 🚀 **YouTube Shorts (60s)** | Fast-paced vertical Short with pinned comment link | ₹${rateShorts || '0'} |
| 📸 **Instagram Story Set (3 Frames)** | Sequence of 3 stories with active Swipe-Up link sticker | ₹${rateStory || '0'} |

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

- **Direct Booking Desk:** ${kitEmail || 'collabs@creatornest.in'}
- **WhatsApp Agency Hotline:** ${kitPhone || '+91 9460990011'}
- **Agency:** Creator Nest Talent Management (https://creatornest.in)
`;
  }, [kitName, kitHandle, kitNiche, kitLocation, kitYtSubs, kitIgFollowers, kitAvgViews, kitER, kitAVD, kitEmail, kitPhone, rateDedicated, rateIntegrated, rateReel, rateShorts, rateStory]);

  const copyNotionMarkdown = () => {
    navigator.clipboard.writeText(notionMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyPitchSnippet = () => {
    const pitch = `Hi Team,\n\nPlease find attached the official 2026 Media Kit for ${kitName || 'Creator'} (${kitHandle || '@channel'}).\n\n- YouTube Subscribers: ${kitYtSubs || '0'}\n- Instagram Followers: ${kitIgFollowers || '0'}\n- Average Views per Video: ${kitAvgViews || '0'} (${kitAVD || ''} AVD)\n- Core Niche: ${kitNiche || 'Content Creation'}\n- Deliverable Rates: Dedicated Video ₹${rateDedicated || '0'} | 60s Integration ₹${rateIntegrated || '0'} | Reel ₹${rateReel || '0'}\n\nFor bookings & campaign briefs, feel free to contact our agency at ${kitEmail || 'collabs@creatornest.in'}.\n\nBest regards,\nCreator Nest Talent Management`;
    navigator.clipboard.writeText(pitch);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  const downloadMarkdownFile = () => {
    const blob = new Blob([notionMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Media_Kit_${(kitName || 'Creator').replace(/\s+/g, '_')}_2026.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDFDocument = async () => {
    const canvasEl = document.getElementById('media-kit-canvas');
    if (!canvasEl) return;

    setDownloadingPdf(true);
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const dataUrl = await toPng(canvasEl, {
        quality: 1.0,
        pixelRatio: 2.5,
        backgroundColor: '#0F1622',
        cacheBust: true,
        skipAutoScale: true,
        filter: (node: HTMLElement) => {
          if (node?.classList?.contains?.('pdf-hide')) return false;
          return true;
        },
      });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const imgAspect = img.height / img.width;
      const scaledHeight = pdfWidth * imgAspect;

      if (scaledHeight <= pdfPageHeight) {
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, scaledHeight);
      } else {
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

      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(7);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Generated on CreatorNest.in', pdfWidth / 2, pdfPageHeight - 4, { align: 'center' });
      }

      pdf.save(`Media_Kit_${(kitName || 'Creator').replace(/[^a-zA-Z0-9]/g, '_')}_2026.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
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
          link.download = `Media_Kit_${(kitName || 'Creator').replace(/[^a-zA-Z0-9]/g, '_')}_2026.png`;
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
      <div className="min-h-screen bg-[#070B11] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-400 font-bold text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#070B11] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
        <Link href="/marketplace?tab=tools" className="text-cyan-400 hover:underline">Return to Marketplace AI Tools</Link>
      </div>
    );
  }

  const isMediaKitTemplate = String(item.id) === 'tp1' || item.title?.toLowerCase().includes('media kit') && String(item.id) !== 'tool-creator-sponsorship-pitch-kit';
  const price = parseFloat(String(item.price)) || 0;
  const isFree = price <= 0 || item.plan === 'free';
  const featuresList = Array.isArray(item.features) ? item.features : (item.features?.features || []);

  return (
    <main className="min-h-screen bg-[#070B11] text-white flex flex-col">
      <Navbar />

      {/* Header Breadcrumbs */}
      <div className="pt-24 pb-5 border-b border-white/10 bg-[#0A1019]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/marketplace?tab=tools" className="inline-flex items-center text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 text-cyan-400" />
            Back to Marketplace AI Tools
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {item.category || 'AI Tools'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        
        {isMediaKitTemplate ? (
          /* ── Full Interactive Media Kit Template Studio View ── */
          <div className="space-y-8">
            
            {/* Top Studio Hero Banner & Global Action Bar */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#101A27] via-[#0C121B] to-[#070B11] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                      Official Notion & Rate Card Studio
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
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {/* Start New Kit CTA */}
                  <button
                    onClick={() => setShowNewKitModal(true)}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-black" />
                    <span>Start Again for New Kit</span>
                  </button>

                  {/* Start Blank Kit CTA */}
                  <button
                    onClick={handleStartBlankKit}
                    className="px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                    title="Clear all fields and start a fresh blank kit"
                  >
                    <FilePlus className="w-4 h-4 text-cyan-400" />
                    <span>Start Blank</span>
                  </button>
                  
                  {/* Download PDF Rate Card */}
                  <button
                    onClick={downloadPDFDocument}
                    disabled={downloadingPdf}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer"
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

                  {/* Copy Notion Markdown */}
                  <button
                    onClick={copyNotionMarkdown}
                    className="px-3.5 py-3 rounded-xl bg-cyan-500 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:bg-cyan-400 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
                    <span>{copied ? 'Copied Notion Markdown!' : 'Copy Markdown'}</span>
                  </button>

                  {/* Export MD */}
                  <button
                    onClick={downloadMarkdownFile}
                    className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                    title="Export markdown file"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>.MD</span>
                  </button>

                  {/* Link to Full Web App */}
                  <Link
                    href="/tools/media-kit-builder"
                    className="px-3 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                    <span>Full Web App</span>
                  </Link>
                </div>
              </div>

              {/* Toast / Notification Banner */}
              {resetSuccessMessage && (
                <div className="mt-4 p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>{resetSuccessMessage}</span>
                  </div>
                  <button onClick={() => setResetSuccessMessage(null)} className="text-slate-400 hover:text-white p-1">
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* ── NOTION MEDIA KIT INTERACTIVE WORKSPACE STUDIO ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Live Customizer Panel (4 Cols) */}
              <div className="lg:col-span-4 bg-[#0C121B] border border-white/10 rounded-3xl p-6 space-y-6 shadow-xl sticky top-28">
                
                {/* Customizer Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-white text-sm">Media Kit Customizer</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowNewKitModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Start a new kit or pick a preset"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>New Kit</span>
                    </button>
                    <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      Live Sync
                    </span>
                  </div>
                </div>

                {/* Quick Presets Bar */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets</span>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={handleStartBlankKit}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 font-bold transition-colors cursor-pointer"
                    >
                      ✨ Blank Kit
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSampleKit}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold transition-colors cursor-pointer"
                    >
                      📋 Demo Sample
                    </button>
                    {user && (
                      <button
                        type="button"
                        onClick={handleLoadMyProfile}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold transition-colors cursor-pointer"
                      >
                        👤 My Profile
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleLoadTechPreset}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold transition-colors cursor-pointer"
                    >
                      💻 Tech
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadLifestylePreset}
                      className="px-2.5 py-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 font-bold transition-colors cursor-pointer"
                    >
                      👗 Lifestyle
                    </button>
                  </div>
                </div>

                {/* Avatar Photo Upload & URL */}
                <div className="space-y-2">
                  <label className="text-slate-400 font-bold text-xs flex items-center justify-between">
                    <span>Creator Avatar / Photo</span>
                    <span className="text-[10px] text-cyan-400">JPG, PNG or URL</span>
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <img
                      src={kitImg || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'}
                      alt="Creator"
                      className="w-12 h-12 rounded-xl object-cover border border-cyan-400/40 shadow-md shrink-0 bg-[#0F1622]"
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

                {/* Creator Name */}
                <div>
                  <label className="text-slate-400 font-bold text-xs block mb-1">Creator / Full Name</label>
                  <input
                    type="text"
                    value={kitName}
                    onChange={(e) => setKitName(e.target.value)}
                    placeholder="e.g. Jeet Choudhary"
                    className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-white font-medium text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Channel Handle */}
                <div>
                  <label className="text-slate-400 font-bold text-xs block mb-1">Primary Channel Handle</label>
                  <input
                    type="text"
                    value={kitHandle}
                    onChange={(e) => setKitHandle(e.target.value)}
                    placeholder="e.g. @ElectionGuide"
                    className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-cyan-400 font-mono font-medium text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Content Niche */}
                <div>
                  <label className="text-slate-400 font-bold text-xs block mb-1">Content Niche / Category</label>
                  <input
                    type="text"
                    value={kitNiche}
                    onChange={(e) => setKitNiche(e.target.value)}
                    placeholder="e.g. Tech, EdTech & Gadgets"
                    className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-purple-300 font-medium text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-slate-400 font-bold text-xs block mb-1">Location</label>
                  <input
                    type="text"
                    value={kitLocation}
                    onChange={(e) => setKitLocation(e.target.value)}
                    placeholder="e.g. Delhi, India"
                    className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Audience Numbers Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-bold text-xs block mb-1">YouTube Subs</label>
                    <input
                      type="text"
                      value={kitYtSubs}
                      onChange={(e) => setKitYtSubs(e.target.value)}
                      placeholder="e.g. 110K"
                      className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-red-400 font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold text-xs block mb-1">Instagram</label>
                    <input
                      type="text"
                      value={kitIgFollowers}
                      onChange={(e) => setKitIgFollowers(e.target.value)}
                      placeholder="e.g. 45K"
                      className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-pink-400 font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-bold text-xs block mb-1">Avg Views</label>
                    <input
                      type="text"
                      value={kitAvgViews}
                      onChange={(e) => setKitAvgViews(e.target.value)}
                      placeholder="e.g. 40,000"
                      className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold text-xs block mb-1">Retention (AVD)</label>
                    <input
                      type="text"
                      value={kitAVD}
                      onChange={(e) => setKitAVD(e.target.value)}
                      placeholder="e.g. 82%"
                      className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Engagement Rate */}
                <div>
                  <label className="text-slate-400 font-bold text-xs block mb-1">Engagement Rate (ER%)</label>
                  <input
                    type="text"
                    value={kitER}
                    onChange={(e) => setKitER(e.target.value)}
                    placeholder="e.g. 6.4%"
                    className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Contact Email & Phone */}
                <div>
                  <label className="text-slate-400 font-bold text-xs block mb-1">Booking Contact Email</label>
                  <input
                    type="text"
                    value={kitEmail}
                    onChange={(e) => setKitEmail(e.target.value)}
                    placeholder="e.g. collabs@creatornest.in"
                    className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold text-xs block mb-1">Agency WhatsApp Hotline</label>
                  <input
                    type="text"
                    value={kitPhone}
                    onChange={(e) => setKitPhone(e.target.value)}
                    placeholder="+91 9460990011"
                    className="w-full bg-[#121924] border border-white/10 rounded-xl px-3 py-2 text-emerald-400 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Rate Card Customizer Section */}
                <div className="pt-3 border-t border-white/10 space-y-2.5">
                  <div className="flex items-center gap-1 text-white text-xs font-black uppercase tracking-wider">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deliverable Rates (₹ INR)</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 text-xs">Dedicated Video:</span>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₹</span>
                      <input
                        type="text"
                        value={rateDedicated}
                        onChange={(e) => setRateDedicated(e.target.value)}
                        placeholder="75,000"
                        className="w-full bg-[#121924] border border-white/10 rounded-lg pl-5 pr-2 py-1 text-emerald-400 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 text-xs">60s Integration:</span>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₹</span>
                      <input
                        type="text"
                        value={rateIntegrated}
                        onChange={(e) => setRateIntegrated(e.target.value)}
                        placeholder="35,000"
                        className="w-full bg-[#121924] border border-white/10 rounded-lg pl-5 pr-2 py-1 text-emerald-400 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 text-xs">Instagram Reel:</span>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₹</span>
                      <input
                        type="text"
                        value={rateReel}
                        onChange={(e) => setRateReel(e.target.value)}
                        placeholder="28,000"
                        className="w-full bg-[#121924] border border-white/10 rounded-lg pl-5 pr-2 py-1 text-emerald-400 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 text-xs">YouTube Shorts:</span>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₹</span>
                      <input
                        type="text"
                        value={rateShorts}
                        onChange={(e) => setRateShorts(e.target.value)}
                        placeholder="22,000"
                        className="w-full bg-[#121924] border border-white/10 rounded-lg pl-5 pr-2 py-1 text-emerald-400 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 text-xs">Story Set (3x):</span>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₹</span>
                      <input
                        type="text"
                        value={rateStory}
                        onChange={(e) => setRateStory(e.target.value)}
                        placeholder="12,000"
                        className="w-full bg-[#121924] border border-white/10 rounded-lg pl-5 pr-2 py-1 text-emerald-400 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Pitch Snippet Generator */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={copyPitchSnippet}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copiedSnippet ? 'Copied Pitch Snippet!' : 'Copy Brand Pitch Snippet'}</span>
                  </button>
                </div>

              </div>

              {/* Right Column: Live Rendered Notion Canvas (8 Cols) */}
              <div
                id="media-kit-canvas"
                className="lg:col-span-8 rounded-3xl border border-white/15 overflow-hidden shadow-2xl relative"
                style={{ backgroundColor: '#0B111A' }}
              >
                
                {/* Notion Window Titlebar */}
                <div
                  className="px-6 py-3.5 flex items-center justify-between border-b border-white/10 pdf-hide"
                  style={{ backgroundColor: '#070C12' }}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
                    </div>
                    <span className="font-mono ml-2 text-slate-300">
                      Notion Workspace • {kitName || 'Creator'} Media Kit 2026
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowNewKitModal(true)}
                      className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 border border-amber-500/40 cursor-pointer transition-colors"
                      title="Start a new kit"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Start New Kit</span>
                    </button>
                    <button
                      onClick={downloadPDFDocument}
                      disabled={downloadingPdf}
                      className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 border border-emerald-500/40 cursor-pointer transition-colors"
                    >
                      {downloadingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                      <span>{downloadingPdf ? 'Saving PDF...' : 'Download PDF'}</span>
                    </button>
                    <button
                      onClick={copyNotionMarkdown}
                      className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>Copy Markdown</span>
                    </button>
                  </div>
                </div>

                {/* Notion Cover Header with Creator Photo (3:4 Card) */}
                <div className="w-full relative overflow-hidden flex items-end" style={{ backgroundColor: '#0d2137' }}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0e3d5e 0%, #122240 40%, #1a1040 100%)' }} />
                  
                  <div className="relative z-10 flex items-stretch gap-5 p-5 sm:p-6 w-full">
                    {/* Creator Photo — 3:4 Card Ratio */}
                    <div className="relative shrink-0" style={{ width: '120px', aspectRatio: '3/4' }}>
                      <img
                        src={kitImg || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'}
                        alt={kitName || 'Creator'}
                        className="w-full h-full object-cover shadow-2xl"
                        style={{ borderRadius: '16px', border: '2.5px solid rgba(0,242,254,0.5)', backgroundColor: '#0F1622' }}
                      />
                      <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center shadow-md" style={{ backgroundColor: '#00F2FE' }}>
                        <BadgeCheck className="w-4 h-4 text-black" />
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-black text-white">{kitName || 'Creator Profile'}</h2>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          Verified 2026
                        </span>
                      </div>
                      <p className="text-xs font-mono flex items-center gap-1 text-cyan-300">
                        <Tv className="w-3.5 h-3.5 text-red-400" />
                        <span>{kitHandle || '@channel'} • Official Media Kit</span>
                      </p>
                      <p className="text-[11px] mt-0.5 flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3 text-purple-400" />
                        <span>{kitLocation || 'India'}</span>
                        <span className="mx-1">•</span>
                        <span className="text-purple-300">{kitNiche || 'Content Creator'}</span>
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
                        All brand contracts, deliverable escrow protection, and Net-15 invoicing are governed under official agency representation. Direct commercial desk: <strong className="text-cyan-300 font-mono">{kitEmail || 'collabs@creatornest.in'}</strong> • WhatsApp: <strong className="text-emerald-400 font-mono">{kitPhone || '+91 9460990011'}</strong>
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
                      Founder of <strong className="text-white">{kitHandle || '@channel'}</strong>. Recognized creator in <span className="text-purple-300 font-bold">{kitNiche || 'Content Creation'}</span>, based out of {kitLocation || 'India'}. We create high-retention video breakdowns, hands-on tutorials, and trusted software/app reviews with a focus on real viewer utility and commercial conversion.
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
                        <p className="text-xl font-black text-red-400 font-mono">{kitYtSubs || '0'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#141C2B] border border-white/10 text-center">
                        <p className="text-[11px] text-slate-400 font-bold mb-1">Instagram</p>
                        <p className="text-xl font-black text-pink-400 font-mono">{kitIgFollowers || '0'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#141C2B] border border-white/10 text-center">
                        <p className="text-[11px] text-slate-400 font-bold mb-1">Avg Views / Video</p>
                        <p className="text-xl font-black text-emerald-400 font-mono">{kitAvgViews || '0'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#141C2B] border border-white/10 text-center">
                        <p className="text-[11px] text-slate-400 font-bold mb-1">Audience AVD</p>
                        <p className="text-xl font-black text-cyan-300 font-mono">{kitAVD || 'N/A'}</p>
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
                            <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">₹{rateDedicated || '0'}</td>
                          </tr>
                          <tr className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-400" />
                              <span>YouTube 60s Integration</span>
                            </td>
                            <td className="px-4 py-3 text-slate-300">Organic mid-roll sponsor segment</td>
                            <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">₹{rateIntegrated || '0'}</td>
                          </tr>
                          <tr className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                              <Camera className="w-4 h-4 text-pink-400" />
                              <span>Instagram Dedicated Reel</span>
                            </td>
                            <td className="px-4 py-3 text-slate-300">9:16 vertical video + caption link sticker</td>
                            <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">₹{rateReel || '0'}</td>
                          </tr>
                          <tr className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                              <Flame className="w-4 h-4 text-orange-400" />
                              <span>YouTube Shorts (60s)</span>
                            </td>
                            <td className="px-4 py-3 text-slate-300">Vertical Short with pinned comment CTA</td>
                            <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">₹{rateShorts || '0'}</td>
                          </tr>
                          <tr className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                              <Layers className="w-4 h-4 text-cyan-400" />
                              <span>Instagram Story Sequence</span>
                            </td>
                            <td className="px-4 py-3 text-slate-300">3 frames with direct brand link sticker</td>
                            <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">₹{rateStory || '0'}</td>
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

          </div>
        ) : (
          /* ── Standard AI Tool Product Showcase & Cashfree Checkout View ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Left 2 Columns: Product Overview & Capabilities */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Product Hero Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border"
                    style={{ background: `${PLAN_COLORS[item.plan || 'free']}20`, color: PLAN_COLORS[item.plan || 'free'], borderColor: `${PLAN_COLORS[item.plan || 'free']}40` }}
                  >
                    {(item.plan || 'free').toUpperCase()} PLAN
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
                    {item.category || 'AI Tool'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold ml-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    <span>{item.rating || '5.0'} Verified</span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {item.title}
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                  {item.short_desc}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.tags.map((t: string) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Visual / Media Banner */}
              <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 bg-[#121A26] relative shadow-2xl group">
                <img 
                  src={item.thumbnail_url || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop'} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070B11] via-transparent to-transparent opacity-80" />
                
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Instant Digital Delivery via Cashfree</span>
                  </div>
                </div>
              </div>

              {/* Long Description & About */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#121A26] border border-white/10 space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>About This Product & Software Package</span>
                </h3>
                <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {item.long_desc || item.short_desc}
                </div>
              </div>

              {/* What's Included / Features Breakdown */}
              {featuresList.length > 0 && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#121A26] border border-white/10 space-y-5">
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Included Assets & Deliverables</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {featuresList.map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#172232] border border-white/5">
                        <Check className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                        <span className="text-xs sm:text-sm text-slate-200 font-medium">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instant Automated Delivery Guarantee */}
              <div className="p-6 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-4">
                <ShieldCheck className="w-7 h-7 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">Automated Delivery & Guarantee</h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Once payment is confirmed via Cashfree Payment Gateway, your tool file will download <strong>automatically</strong> to your device. You will also receive an email confirmation and can re-download anytime.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Pricing & Cashfree Checkout Card */}
            <div className="space-y-6 lg:sticky lg:top-36">
              
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121A26] via-[#101824] to-[#0A0F17] border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(0,242,254,0.1)] relative overflow-hidden space-y-6">
                
                {/* Glow behind card */}
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] bg-cyan-500/15 pointer-events-none" />

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-3">
                    {isFree ? (
                      <span className="text-4xl font-black text-green-400">FREE</span>
                    ) : (
                      <>
                        <span className="text-4xl sm:text-5xl font-black text-white font-mono">₹{price}</span>
                        <span className="text-lg text-slate-500 line-through font-mono">₹{price * 2}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">50% OFF</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {isFree ? '100% Free Creator Tool • Instant Download' : 'One-time payment • Lifetime access • Free updates'}
                  </p>
                </div>

                {/* Action CTA Button */}
                <button
                  onClick={handleInitiatePurchase}
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm text-[#05080E] transition-all flex items-center justify-center gap-2 shadow-2xl hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #00F2FE 0%, #00c8d8 100%)' }}
                >
                  {isFree ? (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Download Free Now</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Buy Now & Download (₹{price})</span>
                    </>
                  )}
                </button>

                {item.external_url && (
                  <Link
                    href={item.external_url}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch Interactive Web App</span>
                  </Link>
                )}

                {/* Cashfree Payment Methods Supported */}
                <div className="pt-2 border-t border-white/10 space-y-3">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                    Accepted Payment Methods
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-300 flex-wrap">
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Google Pay</span>
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">PhonePe</span>
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Paytm / UPI</span>
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Cards / NetBanking</span>
                  </div>
                </div>

                {/* Trust Points */}
                <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant automatic download on payment</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Secured with Cashfree 256-bit encryption</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Full commercial creator license included</span>
                  </div>
                </div>

                {/* Direct Helpdesk */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-400 text-center">
                  Need help before purchasing? <br />
                  <a href="https://wa.me/919460990011" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-bold hover:underline">
                    Chat with Creator Nest Desk on WhatsApp
                  </a>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* ── Cashfree Checkout Modal ── */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0D1520] border border-cyan-500/30 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{isFree ? 'Free Download' : 'Secure Checkout'}</h3>
                    <p className="text-xs text-gray-400">Powered by Cashfree Payments</p>
                  </div>
                </div>
                <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Product</p>
                  <p className="text-sm font-bold text-white truncate max-w-[200px]">{item.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total Price</p>
                  <p className="text-base font-black text-emerald-400 font-mono">
                    {isFree ? 'FREE' : `₹${price}`}
                  </p>
                </div>
              </div>

              {/* Customer Input Form */}
              <form onSubmit={handleProceedToCashfree} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#141F2D] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Email Address (For file receipt)
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#141F2D] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[#141F2D] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {paymentError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-4 rounded-2xl font-black text-sm text-[#05080E] transition-all flex items-center justify-center gap-2 shadow-xl hover:opacity-95 disabled:opacity-50 cursor-pointer mt-2"
                  style={{ background: 'linear-gradient(135deg, #00F2FE 0%, #00c8d8 100%)' }}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting to Cashfree...</span>
                    </>
                  ) : isFree ? (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Confirm & Download Free</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pay ₹{price} via Cashfree</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-gray-500 text-center">
                Instant delivery. As soon as payment completes, the file downloads to your device automatically.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Cashfree Simulation Test Modal (When live keys are in sandbox) ── */}
      <AnimatePresence>
        {simulatedPaymentOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1722] border border-cyan-500/40 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white">Cashfree PG Sandbox Simulator</h3>
                <p className="text-xs text-gray-400">
                  Testing Order: <span className="text-cyan-400 font-mono">{simulatedPaymentOrder.orderId}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Product:</span>
                  <span className="font-bold text-white">{item.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-bold text-emerald-400 font-mono">₹{price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gateway:</span>
                  <span className="text-cyan-300 font-medium">Cashfree Payment Gateway</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => verifyOrderAndDownload(simulatedPaymentOrder.orderId, true)}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 rounded-xl font-black text-sm bg-emerald-400 text-black hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {isProcessingPayment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Simulate Payment Success (UPI / Card)</span>
                </button>

                <button
                  onClick={() => setSimulatedPaymentOrder(null)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Celebratory Purchase & Download Success Modal ── */}
      <AnimatePresence>
        {purchaseSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0C141F] border-2 border-emerald-500/40 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl text-center relative overflow-hidden"
            >
              {/* Confetti glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] bg-emerald-500/20 pointer-events-none" />

              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Payment Confirmed!</h3>
                <p className="text-emerald-400 text-sm font-bold flex items-center justify-center gap-1.5">
                  <Download className="w-4 h-4 animate-bounce" />
                  <span>Your file is downloading automatically on your device!</span>
                </p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Thank you for your purchase. We have delivered <strong className="text-white">{purchaseSuccess.toolTitle}</strong> directly to your browser.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="font-mono font-bold text-cyan-400">{purchaseSuccess.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="font-bold text-emerald-400">COMPLETED / PAID</span>
                </div>
                {purchaseSuccess.amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount Paid:</span>
                    <span className="font-mono font-bold text-white">₹{purchaseSuccess.amount}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <a
                  href={purchaseSuccess.downloadUrl}
                  download
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Click here to re-download if it didn't start automatically</span>
                </a>

                <button
                  onClick={() => setPurchaseSuccess(null)}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-primary text-background hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Start Again for New Kit / Preset Selector Modal ── */}
      <AnimatePresence>
        {showNewKitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0C141F] border border-cyan-500/40 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[90px] bg-cyan-500/15 pointer-events-none" />

              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                      <RotateCcw className="w-4 h-4" />
                    </span>
                    <h3 className="text-xl font-black text-white">Start Again for a New Kit</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Choose how you want to start: start fresh with a clean blank canvas, load your own profile, or pick a preset template.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewKitModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preset Cards Selection */}
              <div className="space-y-3">
                {/* 1. Blank Kit */}
                <button
                  onClick={handleStartBlankKit}
                  className="w-full p-4 rounded-2xl bg-[#121B28] hover:bg-[#162232] border border-cyan-500/30 hover:border-cyan-400/60 text-left transition-all flex items-start gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                    <FilePlus className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        ✨ Start Fresh (Blank Canvas)
                      </h4>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Clears all sample name, metrics, and deliverable rates so you can type your channel details immediately.
                    </p>
                  </div>
                </button>

                {/* 2. My Profile (if logged in) */}
                {user && (
                  <button
                    onClick={handleLoadMyProfile}
                    className="w-full p-4 rounded-2xl bg-[#121B28] hover:bg-[#162232] border border-emerald-500/30 hover:border-emerald-400/60 text-left transition-all flex items-start gap-4 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        👤 Load My Account Profile
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Pulls your verified name ({user.full_name || user.email}) and contact email automatically.
                      </p>
                    </div>
                  </button>
                )}

                {/* 3. Tech & Gadgets Preset */}
                <button
                  onClick={handleLoadTechPreset}
                  className="w-full p-3.5 rounded-2xl bg-[#121B28] hover:bg-[#162232] border border-white/10 hover:border-purple-400/50 text-left transition-all flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <Tv className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      💻 Tech, AI Tools & Gadgets Preset
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      250K YouTube channel template with ₹1.2L dedicated video pricing & software review rates.
                    </p>
                  </div>
                </button>

                {/* 4. Lifestyle & Fashion Preset */}
                <button
                  onClick={handleLoadLifestylePreset}
                  className="w-full p-3.5 rounded-2xl bg-[#121B28] hover:bg-[#162232] border border-white/10 hover:border-pink-400/50 text-left transition-all flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center shrink-0 border border-pink-500/30">
                    <Camera className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                      👗 Lifestyle, Fashion & Reel Preset
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      185K Instagram focused creator template with viral Reel & Story sequence deliverables.
                    </p>
                  </div>
                </button>

                {/* 5. Demo Template */}
                <button
                  onClick={handleLoadSampleKit}
                  className="w-full p-3.5 rounded-2xl bg-[#121B28] hover:bg-[#162232] border border-white/10 hover:border-white/20 text-left transition-all flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/10 text-slate-300 flex items-center justify-center shrink-0 border border-white/15">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-slate-200 transition-colors">
                      📋 Sample Demo Template (Election Guide / Jeet)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Restore the sample showcase media kit with full demo figures.
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  onClick={() => setShowNewKitModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel & Keep Current Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
