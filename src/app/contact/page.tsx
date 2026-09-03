'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Briefcase, 
  Building2, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Users, 
  Zap, 
  ChevronDown,
  ShieldCheck,
  Globe2,
  Lock,
  Send
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const contactChannels = [
  {
    icon: Mail,
    label: 'General & Talent Desk',
    value: 'hellocreatornest@gmail.com',
    href: 'mailto:hellocreatornest@gmail.com',
    color: 'from-primary/15 via-cyan-950/20 to-surface/40',
    border: 'border-primary/25',
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
    desc: 'Talent representation, onboarding & press',
  },
  {
    icon: Briefcase,
    label: 'Brand & Sponsorships',
    value: 'collabs@creatornest.in',
    href: 'mailto:collabs@creatornest.in',
    color: 'from-secondary/15 via-orange-950/20 to-surface/40',
    border: 'border-secondary/25',
    iconBg: 'bg-secondary/15',
    iconColor: 'text-secondary',
    desc: 'Custom rate cards, briefs & SaaS campaigns',
  },
  {
    icon: Building2,
    label: 'Headquarters & Operations',
    value: 'India (Remote-First)',
    href: '#',
    color: 'from-purple-500/15 via-purple-950/20 to-surface/40',
    border: 'border-purple-500/25',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    desc: 'Delhi NCR • Bengaluru • Global Coverage',
  },
];

const socialLinks = [
  { label: 'LinkedIn', handle: 'Creator Nest', href: 'https://linkedin.com/company/creatornest', color: 'hover:text-blue-400', bg: 'hover:bg-blue-500/10', emoji: '💼' },
  { label: 'YouTube', handle: '@CreatorNestMedia', href: 'https://www.youtube.com/@CreatorNestMedia', color: 'hover:text-red-400', bg: 'hover:bg-red-500/10', emoji: '▶️' },
  { label: 'Instagram', handle: '@creatornestmedia', href: 'https://www.instagram.com/creatornestmedia/', color: 'hover:text-pink-400', bg: 'hover:bg-pink-500/10', emoji: '📸' },
  { label: 'Twitter / X', handle: '@creatornest', href: 'https://twitter.com/creatornest', color: 'hover:text-sky-400', bg: 'hover:bg-sky-500/10', emoji: '𝕏' },
];

const inquiryTypes = [
  { value: 'brand', label: '🏢  Brand / Agency — Sponsor or Hire Tech Creators' },
  { value: 'creator', label: '🎬  Creator — Apply for Exclusive Talent Representation' },
  { value: 'production', label: '⚡  Production & Scaling — Video Editing, Thumbnails & Scripts' },
  { value: 'lms', label: '🎓  Digital Products — Launch Courses & Toolkits' },
  { value: 'partnership', label: '🤝  Enterprise Strategic Partnership / Joint Venture' },
  { value: 'general', label: '💬  General Inquiry / Media Interview' },
];

const budgetRanges = [
  { value: 'tier-under-1l', label: 'Under ₹1,00,000' },
  { value: 'tier-1l-3l', label: '₹1,00,000 – ₹3,00,000' },
  { value: 'tier-3l-10l', label: '₹3,00,000 – ₹10,00,000' },
  { value: 'tier-10l-plus', label: '₹10,00,000+ (Multi-Creator Campaign)' },
  { value: 'creator-apply', label: 'N/A (Creator Representation)' },
];

const executiveStats = [
  { icon: Clock, label: 'Response Protocol', value: 'Prompt SLA' },
  { icon: Users, label: 'Managed Network Reach', value: '10M+ Tech Audience' },
  { icon: Zap, label: 'Campaign Value Facilitated', value: '₹5Cr+ Closed' },
];

const faqs = [
  {
    q: 'How does Creator Nest evaluate creators for representation?',
    a: 'We evaluate technical authority, audience retention metrics (AVD 75%+), upload consistency, and engagement authenticity across Tech, AI, Coding, and SaaS niches.'
  },
  {
    q: 'How quickly will our brand receive custom proposals and rate cards?',
    a: 'Our campaign strategists review your target KPIs and deliver a vetted creator shortlist with standardized rate cards promptly.'
  },
  {
    q: 'Do creators retain 100% IP and channel ownership?',
    a: 'Yes, absolutely. You retain 100% full ownership of your channel, content, and trademarks. Creator Nest operates strictly as your strategic growth and commercial management partner.'
  },
  {
    q: 'What brand categories do you specialize in?',
    a: 'We specialize in B2B SaaS, Developer Toolkits, AI Applications, Consumer Electronics, Mobile Apps, Cloud Infrastructure, and EdTech platforms.'
  },
];

function ContactContent() {
  const searchParams = useSearchParams();
  const creatorParam = searchParams.get('creator') || searchParams.get('c') || '';

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Honeypot
    if ((form.elements.namedItem('_honey') as HTMLInputElement)?.value) return;

    setStatus('submitting');

    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const organization = (form.elements.namedItem('organization') as HTMLInputElement).value;
    const inquiryType = (form.elements.namedItem('inquiryType') as HTMLSelectElement).value;
    const budget = (form.elements.namedItem('budget') as HTMLSelectElement).value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;

    const data: Record<string, string> = {
      'Full Name': name,
      'Work Email': email,
      'Phone / Direct Line': phone || 'Not provided',
      'Organization / Channel': organization || 'Not specified',
      'Inquiry Category': inquiryTypes.find(t => t.value === inquiryType)?.label || inquiryType,
      'Budget / Scale': budgetRanges.find(b => b.value === budget)?.label || budget || 'Not specified',
      'Referenced Creator': creatorParam || 'None',
      'Message Details': message,
    };

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Contact Page (Executive Inbound)',
          role: inquiryType,
          applicantName: name,
          applicantEmail: email,
          data,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn('Contact form warning:', err);
      }

      setStatus('success');
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-[#070B11] text-white">

      {/* ─── Hero Section ─────────────────────────────── */}
      <section className="relative pt-28 pb-14 overflow-hidden border-b border-white/5">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-secondary/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 mb-5 shadow-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Executive & Inbound Desk
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-5">
              Let&apos;s Build High-Impact <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-white">
                Tech Partnerships.
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Direct access to CreatorNest&apos;s talent management team and brand partnership directors. Whether you represent a B2B SaaS brand or lead an established tech channel, we look forward to collaborating.
            </p>

            {/* Targeted Creator Inbound Banner */}
            {creatorParam && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 inline-flex items-center space-x-2.5 bg-primary/10 border border-primary/30 rounded-2xl px-5 py-2.5 shadow-lg backdrop-blur-md"
              >
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                <span className="text-xs sm:text-sm font-semibold text-white">
                  Direct Inbound Regarding: <strong className="text-primary font-bold">{creatorParam}</strong>
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-10"
          >
            {executiveStats.map((stat, i) => (
              <div 
                key={i} 
                className="flex items-center space-x-3 px-5 py-3 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-md shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-white font-bold text-xs sm:text-sm">{stat.value}</p>
                  <p className="text-gray-400 text-[11px]">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 3 Executive Channel Cards ─────────────────────────── */}
      <section className="py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {contactChannels.map((ch, i) => (
              <motion.a
                key={i}
                href={ch.href}
                target={ch.href.startsWith('http') ? '_blank' : undefined}
                rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-gradient-to-br ${ch.color} border ${ch.border} backdrop-blur-md hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${ch.iconBg} border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <ch.icon className={`w-6 h-6 ${ch.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      Direct Channel
                    </span>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{ch.label}</p>
                  <p className="text-white font-extrabold text-base sm:text-lg break-all group-hover:text-primary transition-colors">
                    {ch.value}
                  </p>
                </div>

                <p className="text-gray-400 text-xs mt-4 pt-4 border-t border-white/5">
                  {ch.desc}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Main Form & Executive Sidebar ─────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Left: Executive Brief Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <div className="relative bg-surface/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
                {/* Accent edge line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-14 text-center space-y-5"
                  >
                    <div className="w-20 h-20 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <span className="inline-block px-3.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                        Inquiry Dispatched
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Inquiry Received Successfully</h3>
                    </div>
                    <p className="text-gray-300 max-w-sm text-sm sm:text-base leading-relaxed">
                      Thank you for contacting Creator Nest. Our leadership team has received your brief and will review your requirements promptly.
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-4 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white">Submit Partnership Brief</h2>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        Please outline your requirements below. All submissions are treated with complete commercial confidentiality.
                      </p>
                    </div>

                    <form id="contact-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                      {/* Honeypot for spam bots */}
                      <input type="text" name="_honey" className="hidden" autoComplete="off" tabIndex={-1} />

                      {/* Row 1: Full Name & Business Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                            Full Name <span className="text-primary">*</span>
                          </label>
                          <input
                            required
                            type="text"
                            id="contact-name"
                            name="name"
                            placeholder="e.g. Alex Sharma"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                            Work / Business Email <span className="text-primary">*</span>
                          </label>
                          <input
                            required
                            type="email"
                            id="contact-email"
                            name="email"
                            placeholder="alex@company.com"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 2: Organization / Channel & Direct Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="contact-org" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                            Organization / Channel Name
                          </label>
                          <input
                            type="text"
                            id="contact-org"
                            name="organization"
                            defaultValue={creatorParam ? `Inquiring for ${creatorParam}` : ''}
                            placeholder="e.g. Acme SaaS / @TechChannel"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="contact-phone" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                            Phone / Direct Line <span className="text-gray-500 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="tel"
                            id="contact-phone"
                            name="phone"
                            placeholder="+91 98765 43210"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 3: Inquiry Category & Budget Tier */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="contact-type" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                            Inquiry Category <span className="text-primary">*</span>
                          </label>
                          <select
                            required
                            id="contact-type"
                            name="inquiryType"
                            defaultValue={creatorParam ? 'brand' : ''}
                            className="w-full bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
                          >
                            <option value="" disabled className="text-gray-500">Select Category...</option>
                            {inquiryTypes.map(t => (
                              <option key={t.value} value={t.value} className="bg-[#0B0F17] text-white">
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="contact-budget" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                            Estimated Scope / Budget
                          </label>
                          <select
                            id="contact-budget"
                            name="budget"
                            defaultValue=""
                            className="w-full bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
                          >
                            <option value="" className="text-gray-500">Select Estimated Range...</option>
                            {budgetRanges.map(b => (
                              <option key={b.value} value={b.value} className="bg-[#0B0F17] text-white">
                                {b.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                          Project Scope & Message <span className="text-primary">*</span>
                        </label>
                        <textarea
                          required
                          id="contact-message"
                          name="message"
                          rows={4}
                          defaultValue={creatorParam ? `Hi Creator Nest team, we are interested in collaborating with ${creatorParam}. Here are our campaign goals and timeline:\n\n` : ''}
                          placeholder="Provide details on your product, target launch timeline, deliverables, or creator representation goals..."
                          className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                        />
                      </div>

                      {status === 'error' && (
                        <p className="text-red-400 text-xs font-medium text-center">
                          Failed to send message. Please reach out directly to collabs@creatornest.in
                        </p>
                      )}

                      <button
                        type="submit"
                        id="contact-submit-btn"
                        disabled={status === 'submitting'}
                        className="w-full bg-gradient-to-r from-primary via-cyan-400 to-primary hover:opacity-95 text-background font-extrabold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.005] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base cursor-pointer"
                      >
                        {status === 'submitting' ? (
                          <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Transmit Partnership Brief</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center space-x-2 pt-2 text-[11px] text-gray-400">
                        <Lock className="w-3.5 h-3.5 text-primary" />
                        <span>Non-Disclosure & Enterprise Confidentiality Assured</span>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </motion.div>

            {/* Right: Executive Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-5 flex flex-col space-y-6"
            >
              {/* Partner Focus Area */}
              <div className="bg-surface/40 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-md">
                <div className="flex items-center space-x-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="text-white font-bold text-base sm:text-lg">Commercial Standards</h3>
                </div>

                <div className="space-y-3.5 text-xs text-gray-300">
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="font-bold text-white mb-0.5">High-Intent Tech Audiences</p>
                    <p className="text-gray-400 leading-relaxed">
                      Zero lifestyle spam. We place products before developers, AI practitioners, CTOs, and digital builders.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="font-bold text-white mb-0.5">Transparent & Standardized Pricing</p>
                    <p className="text-gray-400 leading-relaxed">
                      Standard rate cards, verified audience retention metrics, and guaranteed deliverables.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="font-bold text-white mb-0.5">Dedicated Talent Management</p>
                    <p className="text-gray-400 leading-relaxed">
                      Full-service script reviews, high-CTR packaging, and end-to-end campaign coordination.
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Social Presence */}
              <div className="bg-surface/40 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-md">
                <div className="flex items-center space-x-2 mb-4">
                  <Globe2 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-bold text-base">Official Media Channels</h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {socialLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-gray-400 ${link.color} ${link.bg} hover:border-white/20 transition-all duration-200`}
                    >
                      <span className="text-sm font-bold">{link.emoji}</span>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{link.label}</p>
                        <p className="text-[10px] text-gray-400 truncate">{link.handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Direct Enterprise Priority Box */}
              <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-primary/10 via-surface/60 to-cyan-950/20 border border-primary/20 backdrop-blur-md relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                    Priority Channel
                  </span>
                  <h4 className="text-base font-extrabold text-white mb-1">Direct RFP & Sponsorship Briefs</h4>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4">
                    For agency tenders, custom creator roster matchmaking, or immediate brand briefs:
                  </p>
                  <a
                    href="mailto:collabs@creatornest.in"
                    className="inline-flex items-center space-x-2 text-xs sm:text-sm font-extrabold text-primary hover:underline"
                  >
                    <span>collabs@creatornest.in</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── FAQ Section ───────────────────────────────── */}
      <section className="py-16 border-t border-white/5 bg-[#05080E]/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Frequently Addressed <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300">Inquiries</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              Standard commercial & representation guidelines.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-surface/40 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/25 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left focus:outline-none cursor-pointer"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-bold text-white text-xs sm:text-sm">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-primary flex-shrink-0 ml-3 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 sm:px-6 pb-5 text-gray-400 text-xs sm:text-sm leading-relaxed border-t border-white/5 pt-3.5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-[#070B11] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ContactContent />
      </Suspense>
      <Footer />
    </>
  );
}
