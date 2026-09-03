'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Sparkles, MessageSquare, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

const budgetOptions = [
  { value: 'under-1l', label: '< ₹1 Lakh', desc: 'Starter test' },
  { value: '1l-5l', label: '₹1L – ₹5L', desc: 'Growth campaigns', popular: true },
  { value: '5l-20l', label: '₹5L – ₹20L', desc: 'Multi-creator blitz' },
  { value: '20l-plus', label: '₹20L+', desc: 'Scale & enterprise' },
];

const goalOptions = [
  { value: 'brand-awareness', label: '📢 Brand Awareness', desc: 'High reach & views' },
  { value: 'lead-generation', label: '🎯 Lead Gen & Sales', desc: 'Direct conversions' },
  { value: 'app-installs', label: '📱 App Installs', desc: 'High-intent installs' },
  { value: 'creator-roster', label: '✨ Creator Roster', desc: 'Exclusive talent match' },
];

export default function BrandForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    budget: '1l-5l',
    goal: 'brand-awareness',
    requirements: '',
    _honey: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData._honey) return; // Anti-spam

    setStatus('submitting');
    setErrorMessage('');

    try {
      const budgetLabel = budgetOptions.find(b => b.value === formData.budget)?.label || formData.budget;
      const goalLabel = goalOptions.find(g => g.value === formData.goal)?.label || formData.goal;

      const payload = {
        source: 'Brand Landing Page - Strategy Request',
        role: 'Brand',
        applicantName: formData.name,
        applicantEmail: formData.email,
        data: {
          'Full Name': formData.name,
          'Company / Brand Name': formData.company,
          'Business Email': formData.email,
          'Phone / WhatsApp': formData.phone || 'Not provided',
          'Estimated Budget': budgetLabel,
          'Campaign Goal': goalLabel,
          'Brief / Requirements': formData.requirements || 'Standard Strategy Call Request',
        },
      };

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit request');
      }

      setStatus('success');
    } catch (err: any) {
      console.error('Brand form error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again or reach out on WhatsApp.');
    }
  };

  if (status === 'success') {
    const waText = encodeURIComponent(
      `Hi Creator Nest team! I just requested a campaign strategy for *${formData.company || formData.name}* (Budget: ${budgetOptions.find(b => b.value === formData.budget)?.label || formData.budget}). Looking forward to connecting!`
    );

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface/80 p-8 md:p-12 rounded-3xl border border-secondary/30 text-center space-y-6 max-w-2xl mx-auto shadow-[0_0_60px_rgba(255,81,47,0.15)] backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-orange-400 to-secondary" />
        <div className="w-20 h-20 bg-secondary/15 border border-secondary/30 rounded-full flex items-center justify-center mx-auto text-secondary shadow-[0_0_30px_rgba(255,81,47,0.3)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-xs font-bold uppercase tracking-wider">
            Strategy Request Received
          </span>
          <h3 className="text-3xl font-extrabold text-white">We're on it!</h3>
          <p className="text-gray-300 max-w-md mx-auto text-sm leading-relaxed">
            Thank you, <strong className="text-white">{formData.name}</strong>. Our campaign strategy team will review your brief for <strong className="text-secondary">{formData.company}</strong> and deliver a customized creator shortlist <strong className="text-white">shortly</strong>.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/919876543210?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            <MessageSquare className="w-4 h-4" />
            Fast-Track via WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setStatus('idle');
              setFormData({
                name: '',
                company: '',
                email: '',
                phone: '',
                budget: '1l-5l',
                goal: 'brand-awareness',
                requirements: '',
                _honey: '',
              });
            }}
            className="w-full sm:w-auto px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-sm transition-all"
          >
            Submit Another Inquiry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div id="brand-form" className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">Free Campaign Strategy & Roster Match</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black mb-3 text-white tracking-tight">
          Ready to Launch Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-orange-400 to-amber-300">
            Next Campaign?
          </span>
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
          Share a few details below — our influencer strategists will craft a tailored creator proposal shortly.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-surface/70 p-6 sm:p-10 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-secondary/70 to-transparent" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot for Anti-Spam */}
          <input
            type="text"
            name="_honey"
            value={formData._honey}
            onChange={e => setFormData({ ...formData, _honey: e.target.value })}
            className="hidden"
            autoComplete="off"
            tabIndex={-1}
          />

          {/* Row 1: Name & Business Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
                Your Name <span className="text-secondary">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-secondary/60 focus:ring-1 focus:ring-secondary/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
                Business Email <span className="text-secondary">*</span>
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="rahul@company.com"
                className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-secondary/60 focus:ring-1 focus:ring-secondary/40 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Brand / Company Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
                Brand / Company Name <span className="text-secondary">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Swiggy, Zepto, or Stealth AI"
                className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-secondary/60 focus:ring-1 focus:ring-secondary/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
                Phone / WhatsApp <span className="text-secondary">*</span>
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-secondary/60 focus:ring-1 focus:ring-secondary/40 transition-all"
              />
            </div>
          </div>

          {/* Row 3: Estimated Monthly Budget Selection Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
              Estimated Campaign Budget <span className="text-secondary">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {budgetOptions.map(b => {
                const selected = formData.budget === b.value;
                return (
                  <button
                    type="button"
                    key={b.value}
                    onClick={() => setFormData({ ...formData, budget: b.value })}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      selected
                        ? 'bg-secondary/15 border-secondary text-white shadow-[0_0_15px_rgba(255,81,47,0.2)]'
                        : 'bg-background/50 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {b.popular && (
                      <span className="absolute -top-2 right-2 text-[9px] font-black uppercase tracking-wider bg-secondary text-white px-1.5 py-0.2 rounded-full">
                        Popular
                      </span>
                    )}
                    <p className={`text-xs font-bold ${selected ? 'text-secondary' : 'text-white'}`}>{b.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{b.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Campaign Objective Selection Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
              Primary Goal <span className="text-secondary">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {goalOptions.map(g => {
                const selected = formData.goal === g.value;
                return (
                  <button
                    type="button"
                    key={g.value}
                    onClick={() => setFormData({ ...formData, goal: g.value })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? 'bg-secondary/15 border-secondary text-white shadow-[0_0_15px_rgba(255,81,47,0.2)]'
                        : 'bg-background/50 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <p className={`text-xs font-bold ${selected ? 'text-secondary' : 'text-white'}`}>{g.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Optional Brief / Notes */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Brief / Target Audience <span className="text-gray-500 text-[11px] lowercase">(optional)</span>
              </label>
              <span className="text-[11px] text-gray-500">e.g. Tech buyers, Developers, Gen-Z</span>
            </div>
            <textarea
              rows={2}
              value={formData.requirements}
              onChange={e => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Tell us what product you're promoting or specific creators you want to target..."
              className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-secondary/60 focus:ring-1 focus:ring-secondary/40 transition-all resize-none"
            />
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-xs font-medium text-center bg-red-500/10 border border-red-500/20 py-2.5 rounded-xl">
              {errorMessage}
            </p>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-gradient-to-r from-secondary via-orange-500 to-secondary hover:brightness-110 text-white font-extrabold py-4 rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(255,81,47,0.35)] hover:shadow-[0_0_40px_rgba(255,81,47,0.5)] transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {status === 'submitting' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Get Free Strategy & Creator Pitch</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-secondary" />
              24-Hour Proposal Turnaround
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              100% Vetted Tech Creators
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              No Upfront Retainer
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
