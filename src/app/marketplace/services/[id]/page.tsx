'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, CheckCircle2, Star, ArrowLeft, Clock, RefreshCw,
  Users, Shield, ChevronDown, ChevronUp, MessageCircle, Zap,
  X, Send, Check, Sparkles, Building2, User, Phone, Mail, Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ITEMS } from '@/app/marketplace/marketData';
import { ServiceDetails, PricingPackage } from '@/app/marketplace/marketData';
import { supabase } from '@/lib/supabase';
import * as Lucide from 'lucide-react';
import { getUUIDFromStaticId } from '@/lib/uuidHelper';

const getLucideIcon = (iconName: string) => {
  if (!iconName) return Lucide.Scissors;
  return (Lucide as any)[iconName] || Lucide.Scissors;
};

// ── Pricing Package Card ──────────────────────────────────────────────────────
function PackageCard({
  pkg,
  accent,
  isPopular,
  onSelect
}: {
  pkg: PricingPackage;
  accent: string;
  isPopular: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative rounded-2xl p-6 border transition-all flex flex-col"
      style={{
        background: isPopular ? `${accent}08` : 'rgba(255,255,255,0.02)',
        borderColor: isPopular ? `${accent}50` : 'rgba(255,255,255,0.08)',
        boxShadow: isPopular ? `0 0 40px ${accent}15` : 'none',
      }}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full" style={{ background: accent, color: '#0B0F14' }}>
          MOST POPULAR
        </div>
      )}

      <h3 className="text-lg font-black text-white mb-1">{pkg.name}</h3>

      <div className="flex items-end gap-1 mb-4">
        <span className="text-3xl font-black" style={{ color: isPopular ? accent : '#ffffff' }}>
          {pkg.price === 0 ? 'Free' : `₹${pkg.price.toLocaleString('en-IN')}`}
        </span>
        {pkg.price > 0 && <span className="text-xs text-gray-500 mb-1.5">one-time</span>}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-5 pb-4 border-b border-white/5">
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pkg.delivery}</span>
        <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" />{pkg.revisions} revisions</span>
      </div>

      <ul className="space-y-2.5 flex-1 mb-6">
        {pkg.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: isPopular ? accent : '#6B7280' }} />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.01] cursor-pointer"
        style={
          isPopular
            ? { background: accent, color: '#0B0F14' }
            : { background: 'rgba(255,255,255,0.06)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)' }
        }
      >
        <span>Choose {pkg.name}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
function FAQItem({ q, a, accent }: { q: string; a: string; accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border rounded-xl overflow-hidden cursor-pointer transition-all"
      style={{ borderColor: open ? `${accent}30` : 'rgba(255,255,255,0.06)', background: open ? `${accent}06` : 'rgba(255,255,255,0.02)' }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-4">
        <p className="text-sm font-semibold text-white pr-4">{q}</p>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Booking Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<PricingPackage | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formChannel, setFormChannel] = useState('');
  const [formBrief, setFormBrief] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let foundService = null;
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cn_market_items');
      if (cached) {
        const parsed = JSON.parse(cached);
        const localItem = parsed.find((item: any) => String(item.id) === String(id) || getUUIDFromStaticId(String(item.id)) === getUUIDFromStaticId(String(id)));
        if (localItem) {
          foundService = {
            id: localItem.id,
            type: localItem.item_type,
            title: localItem.title,
            desc: localItem.short_desc,
            short_desc: localItem.short_desc,
            long_desc: localItem.long_desc,
            category: localItem.category,
            icon: getLucideIcon(localItem.icon),
            accent: localItem.accent,
            plan: localItem.plan,
            price: localItem.price,
            rating: localItem.rating,
            thumbnail_url: localItem.thumbnail_url,
            file_url: localItem.file_url,
            external_url: localItem.external_url,
            tags: localItem.tags || [],
            badge: localItem.features?.badge || localItem.tags?.[0] || '',
            details: {
              provider: localItem.features?.provider || 'Creator Nest',
              delivery_time: localItem.features?.delivery_time || '3-5 Days',
              revisions: localItem.features?.revisions || 3,
              features: localItem.features?.features || [],
              packages: localItem.features?.packages || [],
              faqs: localItem.features?.faqs || []
            }
          };
        }
      }
    }

    if (!foundService) {
      const staticService = ITEMS.find((item) => String(item.id) === String(id) && item.type === 'service');
      if (staticService) {
        foundService = staticService;
      }
    }

    if (foundService) {
      setService(foundService);
      setLoading(false);
    } else {
      setLoading(true);
    }

    async function fetchService() {
      try {
        const { data, error } = await supabase
          .from('market_items')
          .select('*')
          .eq('id', getUUIDFromStaticId(id))
          .eq('item_type', 'service')
          .single();

        if (!error && data) {
          const isJsonFeatures = data.features && typeof data.features === 'object' && !Array.isArray(data.features);
          const mapped = {
            id: data.id,
            type: data.item_type,
            title: data.title,
            desc: data.short_desc,
            short_desc: data.short_desc,
            long_desc: data.long_desc,
            category: data.category,
            icon: getLucideIcon(data.icon),
            accent: data.accent,
            plan: data.plan,
            price: data.price,
            rating: data.rating,
            thumbnail_url: data.thumbnail_url,
            file_url: data.file_url,
            external_url: data.external_url,
            tags: data.tags || [],
            badge: data.features?.badge || data.tags?.[0] || '',
            details: {
              provider: isJsonFeatures ? (data.features.provider || 'Creator Nest') : 'Creator Nest',
              delivery_time: isJsonFeatures ? (data.features.delivery_time || '3-5 Days') : '3-5 Days',
              revisions: isJsonFeatures ? (data.features.revisions || 3) : 3,
              features: isJsonFeatures ? (data.features.features || []) : (Array.isArray(data.features) ? data.features : []),
              packages: isJsonFeatures ? (data.features.packages || []) : [],
              faqs: isJsonFeatures ? (data.features.faqs || []) : []
            }
          };
          setService(mapped);
        }
      } catch (err) {
        console.error("Error background loading service details", err);
      }
      setLoading(false);
    }
    fetchService();
  }, [id]);

  const handleOpenBooking = (pkg?: PricingPackage) => {
    setSelectedPkg(pkg || service?.details?.packages?.[0] || null);
    setSubmitted(false);
    setIsModalOpen(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  if (loading && !service) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <main className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Service Not Found</h1>
            <Link href="/marketplace" className="text-primary hover:text-primary/80">← Back to Marketplace</Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const Icon = service.icon;
  const details = service.details as ServiceDetails;
  const packages = details?.packages ?? [];
  const popularIdx = packages.length === 3 ? 1 : 0; // Middle package = popular

  // Related services
  const related = ITEMS.filter((i) => i.type === 'service' && String(i.id) !== String(service.id)).slice(0, 3);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-0 relative overflow-hidden bg-background">
        <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[160px]" style={{ background: `radial-gradient(ellipse, ${service.accent}12 0%, transparent 70%)` }} />
        </div>
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,242,254,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-8 pt-2">
            <Link href="/marketplace" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Marketplace
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-400">Services</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{service.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-16">

            {/* Left: Main Content */}
            <div className="lg:col-span-2 space-y-10">

              {/* Title block */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: `${service.accent}18`, border: `1px solid ${service.accent}30` }}>
                    <Icon className="w-8 h-8" style={{ color: service.accent }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/8 text-white">{service.category}</span>
                      {service.badge && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full text-[#0B0F14]" style={{ background: service.accent }}>
                          {service.badge}
                        </span>
                      )}
                      {service.rating && (
                        <span className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-yellow-400" />{service.rating}
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{service.title}</h1>
                  </div>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed">{service.desc}</p>

                {/* Key metadata pills */}
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Delivered in <strong>{details?.delivery_time ?? '48 Hours'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <span><strong>{details?.revisions ?? 3} revisions</strong> included</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-primary" />
                    <span>By <strong>{details?.provider ?? 'Creator Nest'}</strong></span>
                  </div>
                </div>
              </motion.div>

              {/* About */}
              {details?.longDesc && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h2 className="text-xl font-bold text-white mb-4">About This Service</h2>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <p className="text-gray-400 leading-relaxed whitespace-pre-line">{details.longDesc}</p>
                  </div>
                </motion.div>
              )}

              {/* Features */}
              {details?.features && details.features.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <h2 className="text-xl font-bold text-white mb-4">What's Included</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {details.features.map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: service.accent }} />
                        <span className="text-sm text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Pricing Packages */}
              {packages.length > 0 && (
                <motion.div id="packages" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-xl font-bold text-white mb-6">Choose Your Package</h2>
                  <div className={`grid gap-5 ${packages.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : packages.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-sm'}`}>
                    {packages.map((pkg, i) => (
                      <PackageCard
                        key={i}
                        pkg={pkg}
                        accent={service.accent}
                        isPopular={i === popularIdx}
                        onSelect={() => handleOpenBooking(pkg)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* FAQs */}
              {details?.faqs && details.faqs.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {details.faqs.map((faq: { q: string; a: string }, i: number) => (
                      <FAQItem key={i} q={faq.q} a={faq.a} accent={service.accent} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right: Sticky sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-4">

                {/* Custom Order Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  className="rounded-3xl overflow-hidden border border-white/10 relative"
                  style={{ background: 'rgba(21,26,34,0.95)', backdropFilter: 'blur(20px)' }}
                >
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-15" style={{ background: service.accent }} />

                  <div className="p-6 relative z-10">
                    <h3 className="text-lg font-black text-white mb-1">Ready to Get Started?</h3>
                    <p className="text-xs text-gray-500 mb-5">Join 500+ creators who've trusted Creator Nest.</p>

                    <div className="mb-5">
                      <p className="text-2xl font-black" style={{ color: service.accent }}>{service.meta}</p>
                      <p className="text-xs text-gray-500 mt-1">Pricing varies by package selected above</p>
                    </div>

                    <button
                      onClick={() => handleOpenBooking()}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm mb-3 transition-all hover:opacity-90 hover:scale-[1.01] cursor-pointer"
                      style={{ background: service.accent, color: '#0B0F14' }}>
                      <Zap className="w-4 h-4" />
                      Book This Service
                    </button>

                    <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/10 border border-white/10 text-gray-300">
                      <MessageCircle className="w-4 h-4" />
                      Chat on WhatsApp
                    </a>

                    <div className="mt-5 pt-5 border-t border-white/5 space-y-3">
                      {[
                        { icon: Shield,    label: 'Secure booking' },
                        { icon: RefreshCw, label: `${details?.revisions ?? 3} free revisions` },
                        { icon: Clock,     label: `Delivered in ${details?.delivery_time ?? '48 hours'}` },
                        { icon: Users,     label: 'Dedicated account manager' },
                      ].map(({ icon: I, label }) => (
                        <div key={label} className="flex items-center gap-2.5 text-xs text-gray-400">
                          <I className="w-3.5 h-3.5 flex-shrink-0" style={{ color: service.accent }} />
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Related Services */}
                {related.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"
                  >
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Other Services</h4>
                    <div className="space-y-3">
                      {related.map((r) => {
                        const RelIcon = r.icon;
                        return (
                          <Link key={r.id} href={r.href} className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${r.accent}18` }}>
                              <RelIcon className="w-4 h-4" style={{ color: r.accent }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white group-hover:text-white transition-colors leading-tight line-clamp-1">{r.title}</p>
                              <p className="text-[10px] text-gray-500">{r.meta}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Back */}
                <Link href="/marketplace" className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-white transition-colors py-2">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Booking & Project Brief Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121A26] border border-white/15 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {submitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-white">Project Brief Submitted!</h3>
                  <p className="text-xs sm:text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
                    Our production team has received your request for <strong>{service.title}</strong> ({selectedPkg?.name || 'Custom Package'}). We will review your brief and reach out via WhatsApp/Email within 2 hours.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://wa.me/919999999999"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#05080E] font-black text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" /> Message Production Lead
                    </a>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${service.accent}20`, color: service.accent }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">{service.title}</h3>
                      <p className="text-xs text-primary font-bold">
                        {selectedPkg ? `${selectedPkg.name} Package — ₹${selectedPkg.price.toLocaleString('en-IN')}` : service.meta}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Alex Sharma"
                      className="w-full bg-[#182333] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full bg-[#182333] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">WhatsApp / Phone</label>
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#182333] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Channel or Portfolio Link</label>
                    <input
                      type="url"
                      value={formChannel}
                      onChange={(e) => setFormChannel(e.target.value)}
                      placeholder="youtube.com/@yourchannel or instagram.com/..."
                      className="w-full bg-[#182333] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Project Brief / Specific Requirements</label>
                    <textarea
                      rows={3}
                      required
                      value={formBrief}
                      onChange={(e) => setFormBrief(e.target.value)}
                      placeholder="Describe your video style, reference links, deadline, or raw footage details..."
                      className="w-full bg-[#182333] border border-white/15 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm text-[#05080E] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:opacity-95"
                    style={{ background: service.accent }}
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Confirm & Submit Project Brief</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
