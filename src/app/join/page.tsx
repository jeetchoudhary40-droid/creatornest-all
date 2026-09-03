'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Video, 
  Briefcase, 
  Users, 
  Send, 
  CheckCircle2, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  DollarSign, 
  Layers, 
  Award, 
  Check, 
  TrendingUp,
  Flame,
  ArrowRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type RoleType = 'creator' | 'brand' | 'career';

const FOLLOWER_PRESETS = ['10K', '25K', '50K', '100K', '250K', '500K', '1M', '2.5M', '5M+'];
const BUDGET_PRESETS = ['₹50K - ₹2L', '₹2L - ₹5L', '₹5L - ₹15L', '₹15L - ₹50L', '₹50L+'];
const EXPERIENCE_PRESETS = ['< 1 Year (Fresher)', '1 - 2 Years', '3 - 5 Years', '5+ Years (Expert)'];

// Clean Custom Brand SVGs
const YoutubeIcon = () => (
  <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-3.5 h-3.5 text-pink-500 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function JoinGatewayPage() {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<RoleType>('creator');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);

  // Follower count state
  const [followerPreset, setFollowerPreset] = useState<string>('100K');
  const [customFollowerNum, setCustomFollowerNum] = useState<string>('100');
  const [followerUnit, setFollowerUnit] = useState<'K' | 'M'>('K');

  // Creator form state
  const [creatorData, setCreatorData] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    primaryPlatform: 'YouTube',
    youtubeUrl: '',
    instagramUrl: '',
    portfolioUrl: '',
    category: 'Technology & Gadgets',
    avgViews: '50K - 200K',
    needs: [] as string[],
    message: '',
  });

  // Brand form state
  const [brandData, setBrandData] = useState({
    companyName: '',
    website: '',
    industry: 'Technology / SaaS',
    contactPerson: '',
    workEmail: '',
    phone: '',
    whatsapp: '',
    location: '',
    campaignType: 'Influencer Marketing',
    budget: '₹2L - ₹5L',
    targetTier: 'Micro (50K - 250K)',
    targetNiches: '',
    campaignDetails: '',
  });

  // Team / Freelancer form state
  const [careerData, setCareerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    roleApplied: 'Video Editor',
    experience: '1 - 2 Years',
    workType: 'Full-Time Remote',
    expectedRate: '',
    portfolioUrl: '',
    toolsUsed: [] as string[],
    bestWorkSummary: '',
  });

  const handleRoleSelect = (role: RoleType) => {
    setActiveRole(role);
    setStatus('idle');
    setErrorMessage('');
  };

  const toggleCreatorNeed = (need: string) => {
    setCreatorData(prev => ({
      ...prev,
      needs: prev.needs.includes(need) 
        ? prev.needs.filter(n => n !== need) 
        : [...prev.needs, need]
    }));
  };

  const toggleTool = (tool: string) => {
    setCareerData(prev => ({
      ...prev,
      toolsUsed: prev.toolsUsed.includes(tool)
        ? prev.toolsUsed.filter(t => t !== tool)
        : [...prev.toolsUsed, tool]
    }));
  };

  const getComputedFollowers = () => {
    if (followerPreset) return followerPreset;
    if (customFollowerNum) return `${customFollowerNum}${followerUnit}`;
    return '100K';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      let formattedData: Record<string, any> = {};
      let applicantName = '';
      let applicantEmail = '';
      let sourceName = '';

      if (activeRole === 'creator') {
        const phone = creatorData.phone.trim();
        const whatsapp = sameAsPhone ? phone : creatorData.whatsapp.trim();
        const followers = getComputedFollowers();

        applicantName = creatorData.fullName;
        applicantEmail = creatorData.email;
        sourceName = 'Join Page - Creator';

        formattedData = {
          'Role / Category': 'Creator',
          'Full Name': creatorData.fullName,
          'Email': creatorData.email,
          'Phone': phone,
          'WhatsApp': whatsapp,
          'City / Country': creatorData.location,
          'Primary Platform': creatorData.primaryPlatform,
          'Followers / Audience Size': followers,
          'Content Niche / Category': creatorData.category,
          'Average Views / Reach': creatorData.avgViews,
          'YouTube Link': creatorData.youtubeUrl || 'None provided',
          'Instagram Link': creatorData.instagramUrl || 'None provided',
          'Portfolio / Other Link': creatorData.portfolioUrl || 'None provided',
          'Support / Services Needed': creatorData.needs.length > 0 ? creatorData.needs.join(', ') : 'All Growth Services',
          'Creator Vision / Notes': creatorData.message || 'Ready to scale with Creator Net',
        };
      } else if (activeRole === 'brand') {
        const phone = brandData.phone.trim();
        const whatsapp = sameAsPhone ? phone : brandData.whatsapp.trim();

        applicantName = brandData.contactPerson || brandData.companyName;
        applicantEmail = brandData.workEmail;
        sourceName = 'Join Page - Brand';

        formattedData = {
          'Role / Category': 'Brand Partner',
          'Company / Brand Name': brandData.companyName,
          'Website': brandData.website || 'Not specified',
          'Industry Niche': brandData.industry,
          'Contact Person': brandData.contactPerson,
          'Work Email': brandData.workEmail,
          'Phone Number': phone,
          'WhatsApp': whatsapp,
          'City / Country': brandData.location,
          'Campaign Type': brandData.campaignType,
          'Estimated Budget': brandData.budget,
          'Target Creator Tier': brandData.targetTier,
          'Target Audience / Niches': brandData.targetNiches || 'All matching niches',
          'Campaign Brief / Details': brandData.campaignDetails || 'Interested in creator collaborations',
        };
      } else {
        const phone = careerData.phone.trim();
        const whatsapp = sameAsPhone ? phone : careerData.whatsapp.trim();

        applicantName = careerData.fullName;
        applicantEmail = careerData.email;
        sourceName = 'Join Page - Team / Freelancer';

        formattedData = {
          'Role / Category': 'Team Member / Freelancer',
          'Full Name': careerData.fullName,
          'Email': careerData.email,
          'Phone Number': phone,
          'WhatsApp': whatsapp,
          'City / Country': careerData.location,
          'Applied Position': careerData.roleApplied,
          'Years of Experience': careerData.experience,
          'Work Availability': careerData.workType,
          'Expected Compensation': careerData.expectedRate || 'Negotiable',
          'Portfolio / Showreel URL': careerData.portfolioUrl,
          'Software & Tools Mastery': careerData.toolsUsed.length > 0 ? careerData.toolsUsed.join(', ') : 'Industry standard tools',
          'Best Work Summary / Pitch': careerData.bestWorkSummary || 'Looking forward to working with Creator Net team',
        };
      }

      // 1. Dispatch Email Forwarding to hellocreatornet@gmail.com
      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: sourceName,
          role: activeRole,
          data: formattedData,
          applicantName,
          applicantEmail,
        }),
      });

      if (!emailRes.ok) {
        const errJson = await emailRes.json().catch(() => ({}));
        console.warn('Email forward non-fatal status:', errJson);
      }

      // 2. If user is logged in, save application to Supabase profiles
      if (user) {
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('onboarding_data')
            .eq('id', user.id)
            .single();

          const currentData = existingProfile?.onboarding_data || {};

          await supabase
            .from('profiles')
            .update({
              onboarding_data: {
                ...currentData,
                apply_status: 'pending',
                application: {
                  requested_role: activeRole === 'career' ? 'team_member' : activeRole,
                  ...formattedData,
                  submitted_at: new Date().toISOString(),
                }
              }
            })
            .eq('id', user.id);
        } catch (dbErr) {
          console.warn('Profile update warning:', dbErr);
        }
      }

      setStatus('success');
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit your application. Please check your connection.');
      setStatus('error');
    }
  };

  const renderSuccessModal = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-surface/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-primary/30 text-center space-y-6 max-w-xl mx-auto shadow-[0_0_80px_rgba(0,242,254,0.15)]"
    >
      <div className="w-20 h-20 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-10 h-10 text-primary animate-pulse" />
      </div>

      <div>
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
          Application Forwarded
        </span>
        <h3 className="text-3xl font-extrabold text-white">Application Received!</h3>
      </div>

      <p className="text-gray-300 text-sm md:text-base leading-relaxed">
        Thank you for submitting your details. Your application has been logged and sent directly to our creator management desk at <strong className="text-primary font-medium">hellocreatornest@gmail.com</strong>.
      </p>

      <div className="bg-background/60 p-4 rounded-2xl border border-white/5 text-left text-xs text-gray-400 space-y-2">
        <div className="flex items-center justify-between">
          <span>Target Review Window:</span>
          <span className="text-white font-semibold">Shortly</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Notification Channel:</span>
          <span className="text-primary font-semibold">WhatsApp & Email</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button 
          onClick={() => {
            setStatus('idle');
            setErrorMessage('');
          }}
          className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl text-white font-semibold transition-all border border-white/10"
        >
          Submit Another
        </button>
        <a 
          href="/"
          className="flex-1 px-6 py-3.5 bg-primary text-background hover:bg-primary/90 font-bold rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center space-x-2"
        >
          <span>Explore Creator Net</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );

  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/30 selection:text-white">
      <Navbar />

      <section className="pt-32 pb-24 relative overflow-hidden flex-1 flex flex-col justify-center">
        {/* Background Glowing Ambient Orbs */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(0,242,254,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.6) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/5 w-[450px] h-[450px] bg-secondary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          
          {/* Header Title */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center mb-10"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-4 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>India&apos;s Creator Growth Ecosystem</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-white">Ecosystem.</span>
            </h1>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Partner with Creator Net. Whether you are a creator aiming for scale, a brand wanting high-converting campaigns, or a talent ready to build the next media wave.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              renderSuccessModal()
            ) : (
              <motion.div 
                key="form-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full bg-surface/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
              >
                {/* Top Subtle Neon Edge */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                {/* Role Switcher Tabs */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 p-1.5 bg-black/40 rounded-2xl border border-white/5 mb-8">
                  <button 
                    type="button"
                    onClick={() => handleRoleSelect('creator')} 
                    className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                      activeRole === 'creator' 
                        ? 'bg-primary text-background shadow-lg shadow-primary/25 scale-[1.02]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Creator</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleRoleSelect('brand')} 
                    className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                      activeRole === 'brand' 
                        ? 'bg-secondary text-white shadow-lg shadow-secondary/25 scale-[1.02]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Brand</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleRoleSelect('career')} 
                    className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                      activeRole === 'career' 
                        ? 'bg-white text-background shadow-lg shadow-white/20 scale-[1.02]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Team / Freelancer</span>
                    <span className="sm:hidden">Team</span>
                  </button>
                </div>

                {/* Dynamic Form Header */}
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
                    <span>
                      {activeRole === 'creator' && '🚀 Apply as a Creator'}
                      {activeRole === 'brand' && '🏢 Partner as a Brand'}
                      {activeRole === 'career' && '💼 Join Our Production & Creative Team'}
                    </span>
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    {activeRole === 'creator' && 'Fill your channel stats and audience reach. Our talent managers will audit your profile.'}
                    {activeRole === 'brand' && 'Tell us your campaign goals and target audience. We match you with vetted top creators.'}
                    {activeRole === 'career' && 'Share your portfolio and core creative tools. We hire top editors, designers & managers.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* ========================================================================= */}
                  {/* ROLE: CREATOR FORM */}
                  {/* ========================================================================= */}
                  {activeRole === 'creator' && (
                    <div className="space-y-6">
                      
                      {/* Basic Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Creator / Real Name</label>
                          <input 
                            type="text" 
                            value={creatorData.fullName} 
                            onChange={e => setCreatorData({...creatorData, fullName: e.target.value})}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Email Address</label>
                          <input 
                            type="text" 
                            value={creatorData.email} 
                            onChange={e => setCreatorData({...creatorData, email: e.target.value})}
                            placeholder="rahul@gmail.com"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Phone Number</label>
                          <input 
                            type="text" 
                            value={creatorData.phone} 
                            onChange={e => setCreatorData({...creatorData, phone: e.target.value})}
                            placeholder="+91 9876543210"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold uppercase text-gray-400 ml-1">WhatsApp Number</label>
                            <label className="flex items-center space-x-1.5 text-xs text-primary cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={sameAsPhone}
                                onChange={e => setSameAsPhone(e.target.checked)}
                                className="rounded bg-black border-white/20 text-primary focus:ring-0 w-3.5 h-3.5"
                              />
                              <span>Same as Phone</span>
                            </label>
                          </div>
                          <input 
                            type="text" 
                            disabled={sameAsPhone}
                            value={sameAsPhone ? creatorData.phone : creatorData.whatsapp} 
                            onChange={e => setCreatorData({...creatorData, whatsapp: e.target.value})}
                            placeholder="+91 9876543210"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-all placeholder:text-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">City & State / Country</label>
                          <input 
                            type="text" 
                            value={creatorData.location} 
                            onChange={e => setCreatorData({...creatorData, location: e.target.value})}
                            placeholder="e.g. Mumbai, Maharashtra, India"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                      </div>

                      {/* FOLLOWER COUNT SELECTOR & BUTTONS */}
                      <div className="p-5 bg-black/30 rounded-2xl border border-primary/20 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <label className="block text-xs font-bold uppercase text-primary tracking-wider flex items-center space-x-1.5">
                              <Flame className="w-3.5 h-3.5 text-primary" />
                              <span>Follower Count / Audience Size</span>
                            </label>
                            <span className="text-[11px] text-gray-400">Click a quick preset or type custom count (e.g. 100K, 250K)</span>
                          </div>
                          
                          {/* Current Selected Badge */}
                          <div className="self-start sm:self-auto px-3.5 py-1 bg-primary/15 border border-primary/40 rounded-full text-primary font-bold text-xs">
                            Selected: {getComputedFollowers()}
                          </div>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {FOLLOWER_PRESETS.map((preset) => {
                            const isSelected = followerPreset === preset;
                            return (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  setFollowerPreset(preset);
                                  const num = preset.replace(/[^0-9.]/g, '');
                                  setCustomFollowerNum(num);
                                  setFollowerUnit(preset.includes('M') ? 'M' : 'K');
                                }}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  isSelected 
                                    ? 'bg-primary text-background border-primary shadow-md shadow-primary/30 scale-105'
                                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`}
                              >
                                {preset}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Input with K/M Switcher */}
                        <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
                          <span className="text-xs text-gray-400 whitespace-nowrap">Or Custom Count:</span>
                          <div className="flex items-center gap-2 flex-1">
                            <input 
                              type="number"
                              min="1"
                              step="any"
                              value={customFollowerNum}
                              onChange={(e) => {
                                setCustomFollowerNum(e.target.value);
                                setFollowerPreset('');
                              }}
                              placeholder="e.g. 150"
                              className="w-full bg-background border border-white/15 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-primary/60 transition-all placeholder:text-gray-600"
                            />
                            
                            {/* K / M Unit Toggles */}
                            <div className="flex bg-black/60 p-1 rounded-xl border border-white/10">
                              <button
                                type="button"
                                onClick={() => {
                                  setFollowerUnit('K');
                                  setFollowerPreset('');
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  followerUnit === 'K' && !followerPreset ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                K
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFollowerUnit('M');
                                  setFollowerPreset('');
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  followerUnit === 'M' && !followerPreset ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                M
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Primary Platform & Niche */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Primary Platform</label>
                          <select 
                            value={creatorData.primaryPlatform}
                            onChange={e => setCreatorData({...creatorData, primaryPlatform: e.target.value})}
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-all"
                          >
                            <option value="YouTube">YouTube</option>
                            <option value="Instagram">Instagram</option>
                            <option value="X / Twitter">X / Twitter</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Podcast">Podcast / Audio</option>
                            <option value="Multi-Platform">Multi-Platform</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Content Category / Niche</label>
                          <select 
                            value={creatorData.category}
                            onChange={e => setCreatorData({...creatorData, category: e.target.value})}
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-all cursor-pointer"
                          >
                            <option value="AI & Automation">AI & Automation</option>
                            <option value="Mobile Apps Review">Mobile Apps Review</option>
                            <option value="SaaS & Cloud Tools">SaaS & Cloud Tools</option>
                            <option value="Full-Stack & DevOps">Full-Stack & DevOps</option>
                            <option value="Tech & Gadgets">Tech & Gadgets</option>
                            <option value="FinTech & Business Tech">FinTech & Business Tech</option>
                            <option value="Cybersecurity & Data">Cybersecurity & Data</option>
                            <option value="Other Tech">Other Tech</option>
                          </select>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1 flex items-center space-x-1.5">
                            <YoutubeIcon />
                            <span>YouTube Channel URL / Handle</span>
                          </label>
                          <input 
                            type="text" 
                            value={creatorData.youtubeUrl} 
                            onChange={e => setCreatorData({...creatorData, youtubeUrl: e.target.value})}
                            placeholder="e.g. youtube.com/@channel or @channel"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1 flex items-center space-x-1.5">
                            <InstagramIcon />
                            <span>Instagram Profile URL / Handle</span>
                          </label>
                          <input 
                            type="text" 
                            value={creatorData.instagramUrl} 
                            onChange={e => setCreatorData({...creatorData, instagramUrl: e.target.value})}
                            placeholder="e.g. instagram.com/profile or @username"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1 flex items-center space-x-1.5">
                            <Globe className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Portfolio / Website / Linktree (Optional)</span>
                          </label>
                          <input 
                            type="text" 
                            value={creatorData.portfolioUrl} 
                            onChange={e => setCreatorData({...creatorData, portfolioUrl: e.target.value})}
                            placeholder="e.g. linktr.ee/yourname or yourwebsite.com"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                      </div>

                      {/* What Support Do You Need */}
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400 mb-2 ml-1">What Support Are You Looking For? (Select all that apply)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            'High-Paying Brand Deals',
                            'Video Editing & Thumbnails',
                            'Scriptwriting & Strategy',
                            'Full Creator Management',
                            'AI Content Tools & Workflows',
                            'Monetization & Courses'
                          ].map((item) => {
                            const isChecked = creatorData.needs.includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => toggleCreatorNeed(item)}
                                className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between ${
                                  isChecked 
                                    ? 'bg-primary/15 border-primary text-white' 
                                    : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20'
                                }`}
                              >
                                <span className="truncate pr-1">{item}</span>
                                {isChecked && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Tell us about your goals (Optional)</label>
                        <textarea 
                          rows={3}
                          value={creatorData.message}
                          onChange={e => setCreatorData({...creatorData, message: e.target.value})}
                          placeholder="What is your biggest bottleneck right now? (e.g. Editing takes too much time, want more brand deals...)"
                          className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-all placeholder:text-gray-600 resize-none"
                        />
                      </div>

                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* ROLE: BRAND FORM */}
                  {/* ========================================================================= */}
                  {activeRole === 'brand' && (
                    <div className="space-y-6">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Company / Brand Name</label>
                          <input 
                            type="text" 
                            value={brandData.companyName} 
                            onChange={e => setBrandData({...brandData, companyName: e.target.value})}
                            placeholder="e.g. Nexus Tech"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Website URL</label>
                          <input 
                            type="text" 
                            value={brandData.website} 
                            onChange={e => setBrandData({...brandData, website: e.target.value})}
                            placeholder="e.g. nexus.com or https://nexus.com"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Contact Person Name</label>
                          <input 
                            type="text" 
                            value={brandData.contactPerson} 
                            onChange={e => setBrandData({...brandData, contactPerson: e.target.value})}
                            placeholder="Ananya Verma"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Work Email Address</label>
                          <input 
                            type="text" 
                            value={brandData.workEmail} 
                            onChange={e => setBrandData({...brandData, workEmail: e.target.value})}
                            placeholder="ananya@nexus.com"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Phone Number</label>
                          <input 
                            type="text" 
                            value={brandData.phone} 
                            onChange={e => setBrandData({...brandData, phone: e.target.value})}
                            placeholder="+91 9876543210"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary/60 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold uppercase text-gray-400 ml-1">WhatsApp Number</label>
                            <label className="flex items-center space-x-1.5 text-xs text-secondary cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={sameAsPhone}
                                onChange={e => setSameAsPhone(e.target.checked)}
                                className="rounded bg-black border-white/20 text-secondary focus:ring-0 w-3.5 h-3.5"
                              />
                              <span>Same as Phone</span>
                            </label>
                          </div>
                          <input 
                            type="text" 
                            disabled={sameAsPhone}
                            value={sameAsPhone ? brandData.phone : brandData.whatsapp} 
                            onChange={e => setBrandData({...brandData, whatsapp: e.target.value})}
                            placeholder="+91 9876543210"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary/60 transition-all placeholder:text-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Campaign Budget Presets */}
                      <div className="p-5 bg-black/30 rounded-2xl border border-secondary/20 space-y-3">
                        <label className="block text-xs font-bold uppercase text-secondary tracking-wider flex items-center space-x-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-secondary" />
                          <span>Estimated Campaign Budget</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {BUDGET_PRESETS.map((preset) => {
                            const isSelected = brandData.budget === preset;
                            return (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setBrandData({...brandData, budget: preset})}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  isSelected 
                                    ? 'bg-secondary text-white border-secondary shadow-md shadow-secondary/30 scale-105'
                                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`}
                              >
                                {preset}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Campaign Goals & Tiers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Campaign Type</label>
                          <select 
                            value={brandData.campaignType}
                            onChange={e => setBrandData({...brandData, campaignType: e.target.value})}
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary/60 transition-all"
                          >
                            <option value="Influencer Marketing">Influencer Marketing</option>
                            <option value="Product Launch">Product Launch</option>
                            <option value="UGC Video Ads Creation">UGC Video Ads Creation</option>
                            <option value="Dedicated Sponsorships">Dedicated Sponsorships</option>
                            <option value="Brand Ambassadorship">Brand Ambassadorship</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Desired Creator Tier</label>
                          <select 
                            value={brandData.targetTier}
                            onChange={e => setBrandData({...brandData, targetTier: e.target.value})}
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary/60 transition-all"
                          >
                            <option value="Micro (50K - 250K)">Micro Creators (50K - 250K)</option>
                            <option value="Nano (10K - 50K)">Nano Creators (10K - 50K)</option>
                            <option value="Macro (250K - 1M)">Macro Creators (250K - 1M)</option>
                            <option value="Mega / Celebrity (1M+)">Mega / Celebrities (1M+)</option>
                            <option value="All Tiers Combined">All Tiers Combined</option>
                          </select>
                        </div>
                      </div>

                      {/* Brief */}
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Campaign Brief / Requirements (Optional)</label>
                        <textarea 
                          rows={3}
                          value={brandData.campaignDetails}
                          onChange={e => setBrandData({...brandData, campaignDetails: e.target.value})}
                          placeholder="Tell us about the product/service, target audience, deliverables (e.g. 5 YouTube Dedicated Videos + 10 Instagram Reels)..."
                          className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary/60 transition-all placeholder:text-gray-600 resize-none"
                        />
                      </div>

                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* ROLE: TEAM / FREELANCER FORM */}
                  {/* ========================================================================= */}
                  {activeRole === 'career' && (
                    <div className="space-y-6">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Full Name</label>
                          <input 
                            type="text" 
                            value={careerData.fullName} 
                            onChange={e => setCareerData({...careerData, fullName: e.target.value})}
                            placeholder="e.g. Vikram Joshi"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Email Address</label>
                          <input 
                            type="text" 
                            value={careerData.email} 
                            onChange={e => setCareerData({...careerData, email: e.target.value})}
                            placeholder="vikram@gmail.com"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Phone Number</label>
                          <input 
                            type="text" 
                            value={careerData.phone} 
                            onChange={e => setCareerData({...careerData, phone: e.target.value})}
                            placeholder="+91 9876543210"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold uppercase text-gray-400 ml-1">WhatsApp Number</label>
                            <label className="flex items-center space-x-1.5 text-xs text-cyan-300 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={sameAsPhone}
                                onChange={e => setSameAsPhone(e.target.checked)}
                                className="rounded bg-black border-white/20 text-cyan-300 focus:ring-0 w-3.5 h-3.5"
                              />
                              <span>Same as Phone</span>
                            </label>
                          </div>
                          <input 
                            type="text" 
                            disabled={sameAsPhone}
                            value={sameAsPhone ? careerData.phone : careerData.whatsapp} 
                            onChange={e => setCareerData({...careerData, whatsapp: e.target.value})}
                            placeholder="+91 9876543210"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-all placeholder:text-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">City & Country</label>
                          <input 
                            type="text" 
                            value={careerData.location} 
                            onChange={e => setCareerData({...careerData, location: e.target.value})}
                            placeholder="e.g. Bengaluru, Karnataka, India"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-all placeholder:text-gray-600"
                          />
                        </div>
                      </div>

                      {/* Desired Position */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Role / Position</label>
                          <select 
                            value={careerData.roleApplied}
                            onChange={e => setCareerData({...careerData, roleApplied: e.target.value})}
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-all"
                          >
                            <optgroup label="Top In-Demand Roles">
                              <option value="Video Editor">Video Editor</option>
                              <option value="Thumbnail Designer">Thumbnail Designer</option>
                              <option value="Motion Graphics Artist">Motion Graphics Artist</option>
                              <option value="Script Writer & Researcher">Script Writer & Researcher</option>
                              <option value="AI Content & Video Specialist">AI Content & Video Specialist</option>
                            </optgroup>
                            <optgroup label="Production & Studio">
                              <option value="Director of Photography (DOP)">Director of Photography (DOP)</option>
                              <option value="Creative Director / Showrunner">Creative Director / Showrunner</option>
                              <option value="Camera Operator">Camera Operator</option>
                              <option value="Sound Engineer & Audio Editor">Sound Engineer & Audio Editor</option>
                              <option value="Lighting Technician">Lighting Technician</option>
                            </optgroup>
                            <optgroup label="On-Camera & Talent">
                              <option value="Show Anchor / Host">Show Anchor / Host</option>
                              <option value="Voiceover Artist">Voiceover Artist</option>
                              <option value="Teleprompter & Script Presenter">Teleprompter & Script Presenter</option>
                            </optgroup>
                            <optgroup label="Strategy & Management">
                              <option value="Creator Talent Manager">Creator Talent Manager</option>
                              <option value="Social Media & Community Manager">Social Media & Community Manager</option>
                              <option value="Content Strategist">Content Strategist</option>
                            </optgroup>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Experience Level</label>
                          <select 
                            value={careerData.experience}
                            onChange={e => setCareerData({...careerData, experience: e.target.value})}
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-all"
                          >
                            {EXPERIENCE_PRESETS.map(exp => (
                              <option key={exp} value={exp}>{exp}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Portfolio / Showreel */}
                      <div>
                        <label className="block text-xs font-semibold uppercase text-cyan-300 mb-1.5 ml-1 flex items-center space-x-1.5">
                          <Globe className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Portfolio / Google Drive / Behance / Showreel URL (Optional)</span>
                        </label>
                        <input 
                          type="text" 
                          value={careerData.portfolioUrl} 
                          onChange={e => setCareerData({...careerData, portfolioUrl: e.target.value})}
                          placeholder="e.g. drive.google.com/... or behance.net/..."
                          className="w-full bg-background/80 border border-cyan-400/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all placeholder:text-gray-600"
                        />
                        <span className="text-[11px] text-gray-400 ml-1 mt-1 block">Make sure link permissions are set to &quot;Anyone with the link can view&quot;.</span>
                      </div>

                      {/* Expected Rate & Availability */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Expected Rate / Compensation</label>
                          <input 
                            type="text" 
                            value={careerData.expectedRate} 
                            onChange={e => setCareerData({...careerData, expectedRate: e.target.value})}
                            placeholder="e.g. ₹35,000/mo or ₹3,000/video"
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Work Availability</label>
                          <select 
                            value={careerData.workType}
                            onChange={e => setCareerData({...careerData, workType: e.target.value})}
                            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-all"
                          >
                            <option value="Full-Time Remote">Full-Time Remote</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Per Project / Per Video">Per Project / Per Video</option>
                            <option value="On-Site / Studio (Mumbai/Delhi)">On-Site / Studio</option>
                          </select>
                        </div>
                      </div>

                      {/* Tools & Software */}
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400 mb-2 ml-1">Tools & Software You Master (Select all that apply)</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'Premiere Pro',
                            'After Effects',
                            'DaVinci Resolve',
                            'Photoshop',
                            'CapCut Pro',
                            'Midjourney / AI Art',
                            'ElevenLabs / AI Voice',
                            'Runway / Luma AI',
                            'Blender / 3D',
                            'Figma'
                          ].map(tool => {
                            const isSelected = careerData.toolsUsed.includes(tool);
                            return (
                              <button
                                key={tool}
                                type="button"
                                onClick={() => toggleTool(tool)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                                  isSelected 
                                    ? 'bg-white text-background border-white font-bold' 
                                    : 'bg-black/30 text-gray-400 border-white/10 hover:border-white/25'
                                }`}
                              >
                                {tool}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Summary / Pitch */}
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5 ml-1">Summary of Your Best Work / Quick Pitch (Optional)</label>
                        <textarea 
                          rows={3}
                          value={careerData.bestWorkSummary}
                          onChange={e => setCareerData({...careerData, bestWorkSummary: e.target.value})}
                          placeholder="Briefly describe 1 or 2 projects you are most proud of (e.g. Edited for a 1M subscriber channel, boosted retention by 25%)..."
                          className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-all placeholder:text-gray-600 resize-none"
                        />
                      </div>

                    </div>
                  )}

                  {/* Error Notification */}
                  {status === 'error' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start space-x-3">
                      <div className="text-red-400 text-xs mt-0.5">⚠️</div>
                      <div>
                        <p className="text-red-400 text-sm font-semibold">Submission failed</p>
                        <p className="text-red-300 text-xs mt-0.5">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={status === 'submitting'}
                    className={`w-full font-extrabold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 text-base shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeRole === 'creator' 
                        ? 'bg-primary text-background hover:bg-primary/90 shadow-primary/25' :
                      activeRole === 'brand' 
                        ? 'bg-secondary text-white hover:bg-secondary/90 shadow-secondary/25' :
                        'bg-white text-background hover:bg-gray-200 shadow-white/20'
                    }`}
                  >
                    {status === 'submitting' ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Forwarding Application...</span>
                      </div>
                    ) : (
                      <>
                        <span>
                          {activeRole === 'creator' && 'Submit Creator Application'}
                          {activeRole === 'brand' && 'Send Brand Partnership Inquiry'}
                          {activeRole === 'career' && 'Submit Team Application'}
                        </span>
                        <Send className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-gray-500">
                    🔒 All submissions are securely forwarded to <span className="text-gray-400 font-medium">hellocreatornest@gmail.com</span>. We never share your data with third parties.
                  </p>
                </form>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      <Footer />
    </main>
  );
}
