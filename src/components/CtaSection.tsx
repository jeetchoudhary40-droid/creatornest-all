'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Link2, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  Mail, 
  User, 
  MessageSquare,
  ShieldCheck,
  Zap 
} from 'lucide-react';
import { api } from '@/lib/api';

export default function CtaSection() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Anti-spam honeypot check
    if ((form.elements.namedItem('_honey') as HTMLInputElement)?.value) return;

    setStatus('submitting');
    const role = (form.elements.namedItem('role') as HTMLSelectElement).value;
    const niche = (form.elements.namedItem('niche') as HTMLSelectElement)?.value || 'Education';
    const formData = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      niche: niche,
      platformLink: (form.elements.namedItem('platformLink') as HTMLInputElement).value,
      followersRange: (form.elements.namedItem('followersRange') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    const roleLabel: Record<string, string> = {
      creator: 'Creator / Influencer (All Categories)',
      brand: 'Brand / Agency / Founder',
      team: 'Team / Creative Talent',
      other: 'Other',
    };

    const emailData: Record<string, string> = {
      'Name': formData.name,
      'Email': formData.email,
      'Contact Number / WhatsApp': formData.phone,
      'I am a': roleLabel[role] || role,
      'Creator Category / Niche': formData.niche,
      'Followers / Audience Size': formData.followersRange || 'Not specified',
      'Profile / Platform Link': formData.platformLink || 'Not provided',
      'Message / Growth Goals': formData.message || 'None provided',
    };

    try {
      // Send email notification
      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          source: 'Homepage CTA', 
          role: role,
          applicantName: formData.name,
          applicantEmail: formData.email,
          data: emailData 
        }),
      });

      if (!emailRes.ok) {
        const err = await emailRes.json().catch(() => ({}));
        console.warn('Email API response warning:', err);
      }

      // Also save to backend (non-critical)
      try {
        if (role === 'creator') {
          await api.post('/creators/', {
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            bio: formData.message,
            primary_platform: formData.platformLink,
            creator_type: 'other',
          });
        } else if (role === 'brand') {
          await api.post('/brands/', {
            company_name: formData.name,
            brand_name: formData.name,
            phone: formData.phone,
            industry: 'other',
            description: formData.message,
          });
        }
      } catch (_) { /* non-critical */ }

      setStatus('success');
    } catch (err: any) {
      console.error('CTA submission failed:', err);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-background">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column Text & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="lg:col-span-5 flex flex-col space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 w-fit">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Creator Growth Engine</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight">
              Ready to turn your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-white">talent into income?</span>
            </h2>

            <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
              Whether you&apos;re starting from zero or scaling fast — we build your foundation for a predictable, high-earning creator business.
            </p>

            <div className="pt-4 space-y-4">
              <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="w-1.5 h-12 bg-primary rounded-full shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-base">Campaign & Growth Estimator</h4>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5 leading-relaxed">
                    Get an instant review of your channel reach and earning potential. Our talent directors will respond shortly with your custom roadmap.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="lg:col-span-7 bg-surface/60 backdrop-blur-2xl border border-white/10 p-5 sm:p-8 lg:p-10 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            {/* Top Glowing Edge */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 space-y-5 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                    Application Received
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Application Received!</h3>
                </div>
                <p className="text-gray-300 max-w-sm text-xs sm:text-base leading-relaxed">
                  Thank you for sharing your details. Our talent desk will review your profile and reach out via WhatsApp & Email shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-semibold transition-all border border-white/10 cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4 sm:space-y-5">
                {/* Anti-spam honeypot */}
                <input type="text" name="_honey" className="hidden" autoComplete="off" tabIndex={-1} />

                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="cta-name" className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span>Name <span className="text-red-400">*</span></span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      id="cta-name" 
                      name="name" 
                      className="bg-background/90 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all" 
                      placeholder="Your Full Name" 
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="cta-email" className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Email <span className="text-red-400">*</span></span>
                    </label>
                    <input 
                      required 
                      type="email" 
                      id="cta-email" 
                      name="email" 
                      className="bg-background/90 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all" 
                      placeholder="you@example.com" 
                    />
                  </div>
                </div>

                {/* Row 2: Contact Number & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="cta-phone" className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Contact / WhatsApp <span className="text-red-400">*</span></span>
                    </label>
                    <input 
                      required 
                      type="tel" 
                      id="cta-phone" 
                      name="phone" 
                      className="bg-background/90 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all" 
                      placeholder="+91 98765 43210" 
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="cta-role" className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>I am a... <span className="text-red-400">*</span></span>
                    </label>
                    <select 
                      id="cta-role" 
                      name="role" 
                      defaultValue="creator"
                      className="bg-background/90 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer"
                    >
                      <option value="creator" className="bg-[#0B0F17] text-white">Creator / Influencer</option>
                      <option value="brand" className="bg-[#0B0F17] text-white">Brand / Agency</option>
                      <option value="team" className="bg-[#0B0F17] text-white">Team / Freelancer</option>
                      <option value="other" className="bg-[#0B0F17] text-white">Other</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Category & Followers Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="cta-niche" className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>Creator Category / Niche <span className="text-red-400">*</span></span>
                    </label>
                    <select 
                      id="cta-niche" 
                      name="niche" 
                      defaultValue="Education & Upskilling"
                      className="bg-background/90 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer"
                    >
                      <option value="Education & Upskilling" className="bg-[#0B0F17] text-white">Education & Upskilling</option>
                      <option value="Tech, AI & Gadgets" className="bg-[#0B0F17] text-white">Tech, AI & Gadgets</option>
                      <option value="Entertainment & Comedy" className="bg-[#0B0F17] text-white">Entertainment & Comedy</option>
                      <option value="Lifestyle & Fashion" className="bg-[#0B0F17] text-white">Lifestyle & Fashion</option>
                      <option value="Gaming & Esports" className="bg-[#0B0F17] text-white">Gaming & Esports</option>
                      <option value="Finance & Business" className="bg-[#0B0F17] text-white">Finance & Business</option>
                      <option value="Podcasting & Interviews" className="bg-[#0B0F17] text-white">Podcasting & Interviews</option>
                      <option value="Fitness & Health" className="bg-[#0B0F17] text-white">Fitness & Health</option>
                      <option value="Other Category" className="bg-[#0B0F17] text-white">Other Category</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="cta-followers" className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Audience / Follower Size <span className="text-red-400">*</span></span>
                    </label>
                    <select 
                      id="cta-followers" 
                      name="followersRange" 
                      defaultValue="0 - 50K"
                      className="bg-background/90 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer"
                    >
                      <option value="0 - 50K" className="bg-[#0B0F17] text-white">0 - 50K (Starting / Nano)</option>
                      <option value="50K - 100K" className="bg-[#0B0F17] text-white">50K - 100K (Micro)</option>
                      <option value="100K - 500K" className="bg-[#0B0F17] text-white">100K - 500K (Mid-Tier)</option>
                      <option value="500K - 1M" className="bg-[#0B0F17] text-white">500K - 1M (Macro)</option>
                      <option value="1M+" className="bg-[#0B0F17] text-white">1M+ (Star / Mega)</option>
                      <option value="Brand Budget ₹2L-₹10L" className="bg-[#0B0F17] text-white">Brand Campaign Budget: ₹2L - ₹10L</option>
                      <option value="Brand Budget ₹10L+" className="bg-[#0B0F17] text-white">Brand Campaign Budget: ₹10L+</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Platform Link */}
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="cta-platformLink" className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                    <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Website / Profile / Platform Link <span className="text-red-400">*</span></span>
                  </label>
                  <input 
                    required
                    type="text" 
                    id="cta-platformLink" 
                    name="platformLink" 
                    className="bg-background/90 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all" 
                    placeholder="e.g. yourcompany.com, youtube.com/@channel, or product link" 
                  />
                </div>

                {/* Row 5: Message */}
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="cta-message" className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    <span>Message / Growth Goals</span>
                  </label>
                  <textarea 
                    id="cta-message" 
                    name="message" 
                    rows={3} 
                    className="bg-background/90 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all resize-none" 
                    placeholder="Tell us about your current content bottlenecks, brand deal goals, or campaign plans..." 
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-400 text-xs font-medium text-center">
                    Something went wrong. Please check your connection or reach out on WhatsApp.
                  </p>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-gradient-to-r from-secondary to-[#ff6b4a] hover:opacity-95 text-white font-bold py-3.5 sm:py-4 rounded-xl transition-all duration-300 shadow-[0_0_25px_rgba(255,81,47,0.35)] hover:shadow-[0_0_35px_rgba(255,81,47,0.55)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base cursor-pointer"
                >
                  {status === 'submitting' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Start Your Growth Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Trust & Guarantee Badges */}
                <div className="flex items-center justify-center space-x-4 text-[11px] text-gray-500 pt-1">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>100% Confidential</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span>Response in 24h</span>
                  </span>
                </div>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
