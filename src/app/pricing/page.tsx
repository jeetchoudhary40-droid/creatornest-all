'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Crown, Star, Zap, Shield, CheckCircle2, X, ArrowRight,
  Sparkles, Brain, BookOpen, Wrench, Users, MessageCircle, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

// ── Plan Data ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    icon: Zap,
    color: '#6B7280',
    bg: 'rgba(107,114,128,0.08)',
    border: 'rgba(107,114,128,0.2)',
    monthlyPrice: 0,
    annualPrice: 0,
    target: 'For curious creators just starting out',
    cta: 'Get Started Free',
    ctaHref: '/login',
    popular: false,
    features: [
      { label: 'Google Sign-In access', included: true },
      { label: '3 AI tool uses per day', included: true },
      { label: 'Course previews (all)', included: true },
      { label: '5 template downloads/mo', included: true },
      { label: 'Community read access', included: true },
      { label: 'Full courses', included: false },
      { label: 'Unlimited AI tools', included: false },
      { label: 'Professional services', included: false },
      { label: 'Priority support', included: false },
      { label: 'Dedicated manager', included: false },
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: Star,
    color: '#C0C0C0',
    bg: 'rgba(192,192,192,0.08)',
    border: 'rgba(192,192,192,0.25)',
    monthlyPrice: 299,
    annualPrice: 249,
    target: 'For beginner creators building momentum',
    cta: 'Start Silver',
    ctaHref: '/login',
    popular: false,
    features: [
      { label: 'Everything in Free', included: true },
      { label: '20 AI tool uses per day', included: true },
      { label: '5 premium courses', included: true },
      { label: '20 template downloads/mo', included: true },
      { label: 'Community full access', included: true },
      { label: 'All premium courses', included: false },
      { label: 'Unlimited AI tools', included: false },
      { label: '1 service booking/month', included: false },
      { label: 'Priority support', included: false },
      { label: 'Dedicated manager', included: false },
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: Crown,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
    monthlyPrice: 799,
    annualPrice: 666,
    target: 'For growing creators serious about monetization',
    cta: 'Go Gold',
    ctaHref: '/login',
    popular: true,
    features: [
      { label: 'Everything in Silver', included: true },
      { label: 'Unlimited AI tool uses', included: true },
      { label: 'All courses (16+)', included: true },
      { label: 'All templates (unlimited)', included: true },
      { label: '1 service booking/month', included: true },
      { label: 'Priority email support', included: true },
      { label: 'Creator community VIP', included: true },
      { label: 'Monthly strategy session', included: false },
      { label: 'Dedicated manager', included: false },
      { label: 'White-label tools', included: false },
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: Shield,
    color: '#00F2FE',
    bg: 'rgba(0,242,254,0.06)',
    border: 'rgba(0,242,254,0.25)',
    monthlyPrice: 1499,
    annualPrice: 1249,
    target: 'For professional creators & team members scaling fast',
    cta: 'Go Platinum',
    ctaHref: '/login',
    popular: false,
    features: [
      { label: 'Everything in Gold', included: true },
      { label: 'Unlimited service bookings', included: true },
      { label: 'Monthly 1-on-1 strategy call', included: true },
      { label: 'Dedicated creator manager', included: true },
      { label: 'White-label AI tools', included: true },
      { label: 'Early access to new features', included: true },
      { label: 'Brand deal introductions', included: true },
      { label: 'Priority 2hr support SLA', included: true },
      { label: 'Custom content calendar', included: true },
      { label: 'Analytics dashboard', included: true },
    ],
  },
];

// ── Feature Comparison ─────────────────────────────────────────────────────────
const COMPARISON_ROWS = [
  { label: 'AI Tool Uses/Day', free: '3', silver: '20', gold: 'Unlimited', platinum: 'Unlimited' },
  { label: 'Courses', free: 'Previews only', silver: '5 courses', gold: 'All 16+', platinum: 'All + Early access' },
  { label: 'Template Downloads/mo', free: '5', silver: '20', gold: 'Unlimited', platinum: 'Unlimited' },
  { label: 'Service Bookings/mo', free: '—', silver: '—', gold: '1', platinum: 'Unlimited' },
  { label: 'Community Access', free: 'Read only', silver: 'Full', gold: 'VIP', platinum: 'VIP + Curated' },
  { label: 'Support', free: 'Self-serve', silver: 'Email', gold: 'Priority email', platinum: '2hr SLA' },
  { label: 'Strategy Call', free: '—', silver: '—', gold: '—', platinum: 'Monthly 1-on-1' },
  { label: 'Dedicated Manager', free: '—', silver: '—', gold: '—', platinum: '✓' },
  { label: 'Brand Deal Intros', free: '—', silver: '—', gold: '—', platinum: '✓' },
];

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes! No lock-ins. Cancel your subscription anytime from your profile settings. You will retain access until the end of your billing period.' },
  { q: 'Are the AI tools really unlimited on Gold?', a: 'Absolutely. Gold and Platinum members have no daily cap on AI tool usage — script generators, caption writers, SEO tools and more.' },
  { q: 'What payment methods are accepted?', a: 'We accept UPI, debit/credit cards, net banking and wallets via Razorpay. Fully secure and India-first.' },
  { q: 'What counts as a "service booking"?', a: 'Services include video editing, thumbnail design, script writing, channel audits and social media management. Gold includes 1 booking/month, Platinum is unlimited.' },
  { q: 'Can I upgrade mid-cycle?', a: 'Yes! You can upgrade at any time. You will be charged a prorated amount for the remaining days in your billing cycle.' },
  { q: 'Is there a student discount?', a: 'Yes! Students with a valid ID get 30% off any plan. Reach out to us at hellocreatornest@gmail.com.' },
];

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 py-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 text-left">
        <span className="text-white font-medium text-sm leading-relaxed">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-gray-400 text-sm leading-relaxed mt-3 pr-8">{a}</p>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const { user } = useAuth();
  const [annual, setAnnual] = useState(false);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(0,242,254,0.05) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-sm font-semibold" style={{ background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.2)', color: '#00F2FE' }}>
            <Sparkles className="w-4 h-4" />
            Membership Plans
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl md:text-5xl font-black text-white mb-4">
            Invest in Your<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #F59E0B, #00F2FE)' }}>Creator Career</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-400 text-lg mb-8">
            Start free. Upgrade when you're ready. Cancel anytime.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="inline-flex items-center gap-3 p-1.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${!annual ? 'bg-white text-background' : 'text-gray-400 hover:text-white'}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${annual ? 'bg-white text-background' : 'text-gray-400 hover:text-white'}`}>
              Annual
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#10B981', color: 'white' }}>Save 17%</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon;
              const price = annual ? plan.annualPrice : plan.monthlyPrice;
              const isCurrent = user?.plan_tier === plan.id;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative rounded-3xl p-6 flex flex-col ${plan.popular ? 'ring-1' : ''}`}
                  style={{
                    background: plan.bg,
                    border: `1px solid ${plan.border}`,
                    ...(plan.popular ? { boxShadow: `0 0 40px ${plan.color}15` } : {})
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-background" style={{ background: `linear-gradient(90deg, ${plan.color}, #F97316)` }}>
                      Most Popular
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${plan.color}20`, color: plan.color }}>
                      Current
                    </div>
                  )}

                  {/* Icon + Name */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: plan.color }} />
                    </div>
                    <span className="font-bold text-white">{plan.name}</span>
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    {price === 0 ? (
                      <div className="text-4xl font-black text-white">Free</div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-500">₹</span>
                        <span className="text-4xl font-black text-white">{price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">/mo</span>
                      </div>
                    )}
                  </div>
                  {annual && price > 0 && (
                    <p className="text-xs text-gray-500 mb-1">₹{(price * 12).toLocaleString()}/year · billed annually</p>
                  )}
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">{plan.target}</p>

                  {/* CTA */}
                  {price === 0 ? (
                    <Link
                      href={plan.ctaHref}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all mb-6"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all mb-6 cursor-not-allowed opacity-80"
                      style={plan.popular
                        ? { background: `linear-gradient(135deg, ${plan.color}, #F97316)`, color: '#0B0F14' }
                        : { background: `${plan.color}20`, color: plan.color, border: `1px solid ${plan.color}30` }
                      }
                    >
                      {plan.cta} — Coming Soon
                    </button>
                  )}

                  {/* Features */}
                  <div className="space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <div key={f.label} className={`flex items-center gap-2.5 text-xs ${f.included ? 'text-gray-300' : 'text-gray-600'}`}>
                        {f.included
                          ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.color }} />
                          : <X className="w-3.5 h-3.5 flex-shrink-0 text-gray-700" />
                        }
                        {f.label}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Full Feature Comparison</h2>
          <div className="rounded-2xl overflow-hidden border border-white/8">
            {/* Header */}
            <div className="grid grid-cols-5 bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="p-4 col-span-1">Feature</div>
              {['Free', 'Silver', 'Gold', 'Platinum'].map((p) => (
                <div key={p} className="p-4 text-center">{p}</div>
              ))}
            </div>
            {/* Rows */}
            {COMPARISON_ROWS.map((row, i) => (
              <div key={i} className={`grid grid-cols-5 text-xs border-t border-white/5 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                <div className="p-4 text-gray-400 font-medium">{row.label}</div>
                {[row.free, row.silver, row.gold, row.platinum].map((val, j) => (
                  <div key={j} className="p-4 text-center text-gray-300">
                    {val === '—' ? <span className="text-gray-700">—</span> : val}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights strip */}
      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Brain, label: 'AI Tools', desc: '6+ tools', color: '#00F2FE' },
              { icon: BookOpen, label: 'Courses', desc: '16 courses', color: '#8B5CF6' },
              { icon: Wrench, label: 'Services', desc: '8 services', color: '#F59E0B' },
              { icon: Users, label: 'Community', desc: '2,500+ creators', color: '#10B981' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-6">
            {FAQS.map((faq) => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="relative rounded-3xl p-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,242,254,0.06) 0%, rgba(139,92,246,0.06) 100%)', border: '1px solid rgba(0,242,254,0.15)' }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px]" style={{ background: 'rgba(0,242,254,0.1)' }} />
            </div>
            <div className="relative z-10">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-primary" />
              <h2 className="text-xl font-bold text-white mb-2">Not Sure Which Plan?</h2>
              <p className="text-gray-400 text-sm mb-5">Start with Free and upgrade anytime. Or chat with us — we'll recommend the right plan for your goals.</p>
              <a href="mailto:hellocreatornest@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all" style={{ background: 'rgba(0,242,254,0.15)', color: '#00F2FE', border: '1px solid rgba(0,242,254,0.3)' }}>
                <MessageCircle className="w-4 h-4" />
                Chat with our Team
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
