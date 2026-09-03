'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Sparkles, MessageSquare, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

const platformOptions = [
  { value: 'youtube', label: '▶️ YouTube', desc: 'Long-form & Shorts' },
  { value: 'instagram', label: '📸 Instagram', desc: 'Reels & Community' },
  { value: 'both', label: '🔥 Both YT + Insta', desc: 'Multi-platform' },
  { value: 'other', label: '💼 LinkedIn / X / Podcast', desc: 'B2B & Tech' },
];

const followersOptions = [
  { value: '10k-50k', label: '10K – 50K', desc: 'Rising Micro' },
  { value: '50k-200k', label: '50K – 200K', desc: 'High Engagement' },
  { value: '200k-1m', label: '200K – 1M', desc: 'Established Star' },
  { value: '1m-plus', label: '1M+', desc: 'Top Tier' },
];

export default function OnboardingForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    channelUrl: '',
    platform: 'youtube',
    followers: '50k-200k',
    niche: '',
    goals: '',
    _honey: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData._honey) return; // Anti-spam

    setStatus('submitting');
    setErrorMessage('');

    try {
      const platformLabel = platformOptions.find(p => p.value === formData.platform)?.label || formData.platform;
      const followersLabel = followersOptions.find(f => f.value === formData.followers)?.label || formData.followers;

      const payload = {
        source: 'Creator Join - Roster Application',
        role: 'Creator',
        applicantName: formData.name,
        applicantEmail: formData.email,
        data: {
          'Full Name': formData.name,
          'Email Address': formData.email,
          'Phone / WhatsApp': formData.phone || 'Not provided',
          'Channel / Profile URL': formData.channelUrl || 'Not provided',
          'Primary Platform': platformLabel,
          'Followers / Audience Size': followersLabel,
          'Niche / Category': formData.niche || 'Education, Tech & Entertainment',
          'Goals / What you need help with': formData.goals || 'Brand Deals, Production & Growth Scaling',
        },
      };

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit application');
      }

      setStatus('success');
    } catch (err: any) {
      console.error('Creator onboarding error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again or reach out on WhatsApp.');
    }
  };

  if (status === 'success') {
    const waText = encodeURIComponent(
      `Hi Creator Nest! I just applied to join the creator roster (Name: *${formData.name}*, Platform: ${formData.platform}, Followers: ${formData.followers}). Excited to connect!`
    );

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface/80 p-8 md:p-12 rounded-3xl border border-primary/30 text-center space-y-6 max-w-2xl mx-auto shadow-[0_0_60px_rgba(0,242,254,0.15)] backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
        <div className="w-20 h-20 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center mx-auto text-primary shadow-[0_0_30px_rgba(0,242,254,0.3)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
            Application Received
          </span>
          <h3 className="text-3xl font-extrabold text-white">Welcome to the Nest!</h3>
          <p className="text-gray-300 max-w-md mx-auto text-sm leading-relaxed">
            Thank you, <strong className="text-white">{formData.name}</strong>. Our creator talent team is reviewing your profile and will reach out <strong className="text-primary">shortly</strong> with your growth & brand monetization roadmap.
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
            Connect via WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setStatus('idle');
              setFormData({
                name: '',
                email: '',
                phone: '',
                channelUrl: '',
                platform: 'youtube',
                followers: '50k-200k',
                niche: '',
                goals: '',
                _honey: '',
              });
            }}
            className="w-full sm:w-auto px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-sm transition-all"
          >
            Submit Another Application
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div id="onboarding" className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-3.5 py-1 sm:px-4 sm:py-1.5 mb-3 sm:mb-4">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">Creator Roster Application</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 text-white tracking-tight leading-[1.15]">
          Ready to Scale Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-white">
            Creator Brand?
          </span>
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Join India's top tech, AI & SaaS creator management network. High-ticket brand sponsorships, editing & team support.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-surface/70 p-5 sm:p-8 md:p-10 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <input
            type="text"
            name="_honey"
            value={formData._honey}
            onChange={e => setFormData({ ...formData, _honey: e.target.value })}
            className="hidden"
            autoComplete="off"
            tabIndex={-1}
          />

          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
                Full Name <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aman Verma"
                className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
                Email Address <span className="text-primary">*</span>
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="aman@example.com"
                className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Phone & Channel URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
                Phone / WhatsApp <span className="text-primary">*</span>
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
                Channel / Instagram Link <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.channelUrl}
                onChange={e => setFormData({ ...formData, channelUrl: e.target.value })}
                placeholder="youtube.com/@channel or @handle"
                className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
          </div>

          {/* Row 3: Platform Selection Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
              Primary Platform <span className="text-primary">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {platformOptions.map(p => {
                const selected = formData.platform === p.value;
                return (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => setFormData({ ...formData, platform: p.value })}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                      selected
                        ? 'bg-primary/15 border-primary text-white shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                        : 'bg-background/50 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <p className={`text-xs font-bold ${selected ? 'text-primary' : 'text-white'}`}>{p.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Audience Size Selection Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
              Followers / Subscriber Base <span className="text-primary">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {followersOptions.map(f => {
                const selected = formData.followers === f.value;
                return (
                  <button
                    type="button"
                    key={f.value}
                    onClick={() => setFormData({ ...formData, followers: f.value })}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                      selected
                        ? 'bg-primary/15 border-primary text-white shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                        : 'bg-background/50 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <p className={`text-xs font-bold ${selected ? 'text-primary' : 'text-white'}`}>{f.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{f.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Niche & Goals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
                Content Niche <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.niche}
                onChange={e => setFormData({ ...formData, niche: e.target.value })}
                placeholder="e.g. Education, Tech, Comedy, Lifestyle, Gaming"
                className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
                Primary Goal / Scaling Needs
              </label>
              <input
                type="text"
                value={formData.goals}
                onChange={e => setFormData({ ...formData, goals: e.target.value })}
                placeholder="e.g. More brand deals, video editing, brand launch"
                className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
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
              className="w-full bg-gradient-to-r from-primary via-cyan-400 to-primary hover:brightness-110 text-background font-black py-3.5 sm:py-4 rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(0,242,254,0.35)] hover:shadow-[0_0_40px_rgba(0,242,254,0.5)] transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer text-sm sm:text-base"
            >
              {status === 'submitting' ? (
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Apply to Join Creator Nest</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Prompt Response Guaranteed
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              100% Channel & IP Ownership Retained
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              ₹0 Upfront Joining Fee
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
