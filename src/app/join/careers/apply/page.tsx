'use client';
import { Suspense, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Link2, Send, CheckCircle2, X, FileText } from 'lucide-react';
import { api } from '@/lib/api';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Valid role IDs (must mirror the API route whitelist)
const VALID_ROLE_IDS = new Set([
  'video-editor','motion-graphics','graphic-designer','thumbnail-designer',
  'dop','director','camera-operator','camera-assistant','lighting-tech','set-coordinator',
  'voice-artist','show-anchor','script-reader','audio-engineer',
  'content-strategist','content-analyst','script-writer',
  'social-media-mgr','team-manager','organizer','talent-manager',
]);

function ApplyForm() {
  const searchParams = useSearchParams();
  const roleId    = searchParams.get('role') ?? '';
  const roleTitle = searchParams.get('title') ?? 'This Role';

  // Validate role from URL
  const isValidRole = VALID_ROLE_IDS.has(roleId);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      setErrorMsg('File exceeds 20MB limit. Please choose a smaller file.');
      e.target.value = '';
      return;
    }
    setFileName(f.name);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Honeypot
    if ((form.elements.namedItem('_honey') as HTMLInputElement).value) return;

    const portfolioUrl = (form.elements.namedItem('portfolio') as HTMLInputElement).value;
    const fileInput = fileRef.current;
    if (!portfolioUrl && (!fileInput || !fileInput.files?.length)) {
      setErrorMsg('Please provide at least one: Portfolio URL or Work Sample file.');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const details = {
      name:       (form.elements.namedItem('name')       as HTMLInputElement).value,
      email:      (form.elements.namedItem('email')      as HTMLInputElement).value,
      phone:      (form.elements.namedItem('phone')      as HTMLInputElement).value,
      city:       (form.elements.namedItem('city')       as HTMLInputElement).value,
      experience: (form.elements.namedItem('experience') as HTMLSelectElement).value,
      workType:   (form.elements.namedItem('workType')   as HTMLSelectElement).value,
      rate:       (form.elements.namedItem('rate')       as HTMLInputElement).value,
      portfolio:  portfolioUrl,
      bestWork:   (form.elements.namedItem('bestWork')   as HTMLTextAreaElement).value,
    };

    try {
      await api.post('/tasks/', {
        title: `Job Application: ${roleTitle}`,
        description: `Applicant: ${details.name}\nEmail: ${details.email}\nPhone: ${details.phone}\nLocation: ${details.city}\nExperience: ${details.experience}\nWork Type: ${details.workType}\nRate: ${details.rate}\nPortfolio: ${details.portfolio}\n\nBest Work: ${details.bestWork}`,
        task_type: 'other',
        priority: 'medium',
      });
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };


  if (!isValidRole) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-24 text-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Invalid Role</h2>
          <p className="text-gray-400">This role doesn&apos;t exist. Please browse our open positions.</p>
          <Link href="/join" className="inline-flex items-center space-x-2 text-primary font-bold hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Roles</span>
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-primary/20 rounded-3xl p-12 text-center max-w-lg w-full space-y-6"
        >
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <CheckCircle2 className="w-12 h-12 text-primary relative z-10" />
          </div>
          <h2 className="text-3xl font-bold">Application Received!</h2>
          <p className="text-gray-400 leading-relaxed">
            We&apos;ve received your application for{' '}
            <span className="text-primary font-semibold">{roleTitle}</span>.
            Our team reviews every portfolio personally and will reach out within{' '}
            <span className="text-white font-bold">5 business days</span>.
          </p>
          <Link
            href="/join"
            className="inline-flex items-center space-x-2 text-primary font-bold hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse More Roles</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <Link href="/join" className="inline-flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors mb-10 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Roles</span>
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">Join The Nest</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Apply for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white italic">
              {roleTitle}
            </span>
          </h1>
          <p className="text-gray-400 mb-10 leading-relaxed">
            We review every application personally. Show us your best work — quality over quantity.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6 bg-surface/50 border border-white/5 backdrop-blur-sm p-8 md:p-10 rounded-3xl"
        >
          {/* Anti-spam honeypot */}
          <input type="text" name="_honey" className="hidden" autoComplete="off" tabIndex={-1} />

          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Full Name *</label>
              <input required type="text" name="name" placeholder="Your full name"
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Email Address *</label>
              <input required type="email" name="email" placeholder="you@email.com"
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
          </div>

          {/* Phone + City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">WhatsApp / Phone *</label>
              <input required type="tel" name="phone" placeholder="+91 98765 43210"
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">City / Location *</label>
              <input required type="text" name="city" placeholder="Mumbai, Delhi, Bangalore..."
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
          </div>

          {/* Experience + Work Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Years of Experience</label>
              <select name="experience" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors">
                <option value="less-than-1">Less than 1 year</option>
                <option value="1-2">1 – 2 years</option>
                <option value="3-5">3 – 5 years</option>
                <option value="5-plus">5+ years</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Preferred Work Type</label>
              <select name="workType" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors">
                <option value="freelance">Freelance</option>
                <option value="part-time">Part-Time</option>
                <option value="full-time">Full-Time</option>
              </select>
            </div>
          </div>

          {/* Rate */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Rate Expectation <span className="text-gray-600">(optional)</span></label>
            <input type="text" name="rate" placeholder="e.g. ₹5,000 per Reel · ₹35,000/month · Open to discuss"
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors" />
          </div>

          {/* Portfolio URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1 flex items-center space-x-2">
              <Link2 className="w-4 h-4" />
              <span>Portfolio / Work URL</span>
            </label>
            <input type="url" name="portfolio" placeholder="Behance, YouTube, Drive, Instagram, personal site..."
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors" />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1 flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Work Sample</span>
              <span className="text-gray-600 font-normal text-xs">(PDF, image or video · max 20MB)</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full bg-background border-2 border-dashed border-white/10 hover:border-primary/40 rounded-xl px-4 py-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              {fileName ? (
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-white text-sm font-medium">{fileName}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFileName(null); if (fileRef.current) fileRef.current.value = ''; }}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-600 group-hover:text-primary transition-colors mb-2" />
                  <span className="text-gray-500 text-sm group-hover:text-gray-300 transition-colors">Click to upload or drag and drop</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov,.avi" onChange={handleFile} className="hidden" />
            <p className="text-xs text-gray-600 ml-1">Provide at least one: Portfolio URL or Work Sample</p>
          </div>

          {/* Best Work */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Tell Us About Your Best Work *</label>
            <textarea required rows={4} name="bestWork"
              placeholder="Describe your most impressive project — what it was, your exact role, and the measurable result. Be specific."
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors resize-none" />
          </div>

          {errorMsg && (
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
          )}

          {/* Submit */}
          <button
            disabled={status === 'submitting'}
            className="w-full bg-primary/80 hover:bg-primary text-background font-black py-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50 shadow-[0_0_20px_rgba(0,242,254,0.2)] hover:shadow-[0_0_30px_rgba(0,242,254,0.4)]"
          >
            {status === 'submitting' ? (
              <div className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Submit Application</span>
                <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ApplyForm />
      </Suspense>
      <Footer />
    </main>
  );
}
