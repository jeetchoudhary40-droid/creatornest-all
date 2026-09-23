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
  CheckCircle, ArrowRight, CreditCard, Smartphone, AlertCircle, RefreshCw, X
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
  const [kitPhone, setKitPhone] = useState('+91 8766077505');
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
          /* ── Media Kit Template Studio View ── */
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#101A27] via-[#0C121B] to-[#070B11] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <h1 className="text-3xl font-black">{item.title}</h1>
              <p className="text-slate-300 text-sm">{item.short_desc}</p>
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm">
                This template is ready for immediate live customization and PDF export.
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
                  <a href="https://wa.me/918766077505" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-bold hover:underline">
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

      <Footer />
    </main>
  );
}
