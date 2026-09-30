'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, DollarSign, Calendar, Settings, LogOut, Bell,
  Video, Star, Sparkles, ShieldCheck, CheckCircle2, Clock, ExternalLink,
  Lock, Key, RefreshCw, Copy, Check, MapPin, Users, BarChart3, PieChart,
  Zap, Calculator, FileText, ChevronRight, AlertTriangle, X, Eye, EyeOff,
  Briefcase, Award, ArrowUpRight, BadgeCheck, Globe
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export default function CreatorDashboardPage() {
  const { user, logout, isLoading, updateUser } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [submittingPw, setSubmittingPw] = useState(false);

  // Password Reset Request State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Active Deals Tab ('all' | 'completed' | 'active')
  const [dealsTab, setDealsTab] = useState<'all' | 'completed' | 'active'>('all');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login?next=/dashboard/creator');
      } else if (user.role !== 'creator' && user.role !== 'admin' && user.role !== 'super_admin') {
        router.push('/profile');
      }
    }
  }, [user, isLoading, router]);

  // Load Creator Full Profile
  useEffect(() => {
    async function fetchCreatorProfile() {
      if (!user) return;
      setLoadingProfile(true);
      try {
        const identifier = user.numeric_id || user.id || user.email;
        const res = await fetch(`/api/creator/profile?identifier=${encodeURIComponent(identifier)}`, {
          headers: {
            Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setProfileData(data);
          // If first login, automatically pop up the password change modal
          if (data.user_account?.must_change_password || user.must_change_password) {
            setShowPasswordModal(true);
          }
        }
      } catch (err) {
        console.error('Failed to load creator profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    }

    if (user) {
      fetchCreatorProfile();
    }
  }, [user]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Submit Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    setSubmittingPw(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({
          identifier: user?.numeric_id || user?.email,
          currentPassword: currentPassword || 'Creator@123',
          newPassword,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to update password.');
      }

      setPwSuccess('Your password has been updated successfully! Your account is now secured.');
      updateUser({ must_change_password: false });
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1800);
    } catch (err: any) {
      setPwError(err.message || 'Error updating password.');
    } finally {
      setSubmittingPw(false);
    }
  };

  // Request Password Reset
  const handleRequestPasswordReset = async () => {
    setResetLoading(true);
    setResetStatus(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          identifier: user?.numeric_id || user?.email,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setResetStatus(json.message || 'Password reset request generated.');
      } else {
        setResetStatus(json.error || 'Failed to request reset.');
      }
    } catch (err: any) {
      setResetStatus(err.message || 'Network error.');
    } finally {
      setResetLoading(false);
    }
  };

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070A] text-white">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-bold tracking-wide">Loading your Creator Nest portal…</p>
      </div>
    );
  }

  const creator = profileData?.creator;
  const userAccount = profileData?.user_account || user;
  const deals = profileData?.deals;
  const freeTools = profileData?.free_tools || [];

  const completedDeals = deals?.completed || [];
  const activeDeals = deals?.active || [];
  const displayedDeals = dealsTab === 'completed'
    ? completedDeals
    : dealsTab === 'active'
    ? activeDeals
    : [...completedDeals, ...activeDeals];

  const mustChangePassword = userAccount?.must_change_password || user?.must_change_password;

  return (
    <div className="flex min-h-screen bg-[#05070A] text-gray-200 font-sans selection:bg-cyan-500/20">
      
      {/* ── Sidebar Navigation ── */}
      <aside className="w-64 border-r border-white/5 bg-[#080B10] flex flex-col hidden lg:flex shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {/* Creator Mini Identity Card */}
          <div className="flex items-center space-x-3 mb-6 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 shrink-0 border border-cyan-400/30">
              {creator?.img ? (
                <img src={creator.img} alt={creator.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-black text-lg">
                  {user?.full_name?.charAt(0) || 'C'}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm truncate">{creator?.name || user?.full_name}</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {userAccount?.numeric_id || 'CR-102'}
                </span>
                <span className="text-[11px] text-gray-400 capitalize">{creator?.creator_tier || 'Creator'}</span>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            <a
              href="#overview"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold text-sm border border-cyan-500/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Creator Overview</span>
            </a>
            <a
              href="#brand-deals"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span>Brand Deals ({completedDeals.length + activeDeals.length})</span>
            </a>
            <a
              href="#free-tools"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Free Growth Tools (4)</span>
            </a>
            <a
              href="#audience"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              <PieChart className="w-4 h-4" />
              <span>Audience Demographics</span>
            </a>
            <Link
              href="/profile"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span>Public Media Kit View</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5 w-full transition-colors font-medium"
          >
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Change Password</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 w-full transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Dashboard Workspace ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b border-white/5 bg-[#080B10]/80 sticky top-0 z-30 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg lg:text-xl font-black text-white">Creator Partner Hub</h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified Creator</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 border border-white/10 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Password & Security</span>
            </button>

            <Link
              href="/tools/media-kit-builder"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Live Media Kit</span>
            </Link>
          </div>
        </header>

        {/* ── First-Time Login Alert Banner ── */}
        <AnimatePresence>
          {mustChangePassword && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-b border-amber-500/30 p-4 px-6 lg:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">
                    First-Time Login: Please update your default password!
                  </p>
                  <p className="text-xs text-amber-200/80">
                    Your account is currently using the system temporary password. Set your personal secure password now to protect your deals and profile.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shrink-0 shadow-lg shadow-amber-400/20 transition-all flex items-center space-x-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Change Default Password</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Content Container ── */}
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10">

          {/* 1. Creator Hero Profile Card */}
          <div id="overview" className="bg-[#0C121B] border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 lg:gap-8">
              
              {/* Profile Picture Created/Set by Admin */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-cyan-400/40 shadow-2xl bg-[#141A24]">
                  {creator?.img ? (
                    <img src={creator.img} alt={creator.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-3xl text-cyan-400 bg-gradient-to-br from-cyan-950 to-[#0C121B]">
                      {creator?.name?.slice(0, 2).toUpperCase() || 'CR'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-cyan-400 text-black p-1 rounded-lg shadow-lg border-2 border-[#0C121B]" title="Admin Verified Picture">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              </div>

              {/* Creator Metadata */}
              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {creator?.name || user?.full_name}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                    ID: {userAccount?.numeric_id || 'CR-102'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 font-bold border border-white/10 uppercase tracking-wider">
                    {creator?.creator_tier || 'Micro'} Tier
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
                  <span className="font-semibold text-gray-300">{creator?.channelName || '@creator'}</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{creator?.location || 'India'}</span>
                  </span>
                  <span>•</span>
                  <span className="text-cyan-400 font-bold">{creator?.niche || 'Tech & AI'}</span>
                  <span>•</span>
                  <span className="text-gray-400 font-mono">{userAccount?.email}</span>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
                  {creator?.bio || 'Verified Exclusive Creator managed by Creator Nest. Specializes in in-depth tech and digital tools showcases with high audience engagement.'}
                </p>

                {/* Niches and Platforms */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {(creator?.niches || [creator?.niche]).filter(Boolean).map((n: string) => (
                    <span key={n} className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 border border-white/10 font-medium">
                      {n}
                    </span>
                  ))}
                  {creator?.social_links?.youtube && (
                    <a
                      href={creator.social_links.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold flex items-center space-x-1 hover:bg-rose-500/20"
                    >
                      <Video className="w-3 h-3" />
                      <span>YouTube Channel</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                    </a>
                  )}
                  {creator?.social_links?.instagram && (
                    <a
                      href={creator.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold flex items-center space-x-1 hover:bg-pink-500/20"
                    >
                      <span>Instagram</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Creator Score Badge */}
              <div className="bg-[#141A24] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center shrink-0 min-w-[130px]">
                <div className="w-14 h-14 rounded-full border-4 border-cyan-400 flex items-center justify-center mb-2 shadow-lg shadow-cyan-400/20">
                  <span className="text-xl font-black text-white">{creator?.creator_score || 85}</span>
                </div>
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Creator Score</span>
                <span className="text-[10px] text-gray-400">High Brand Loyalty</span>
              </div>
            </div>
          </div>

          {/* 2. Key Performance & Commercial Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0C121B] border border-white/5 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">YouTube Reach</span>
              <p className="text-2xl font-black text-white">{creator?.youtube || '0'}</p>
              <p className="text-[11px] text-gray-500">Avg {creator?.avgViewsLast10 ? `${(Number(creator.avgViewsLast10)/1000).toFixed(0)}K` : '50K'} Views / video</p>
            </div>

            <div className="bg-[#0C121B] border border-white/5 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Engagement Rate</span>
              <p className="text-2xl font-black text-emerald-400">{creator?.engagementRate || 4.2}%</p>
              <p className="text-[11px] text-gray-500">Benchmark: Top 10% in Niche</p>
            </div>

            <div className="bg-[#0C121B] border border-white/5 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Completed Deals</span>
              <p className="text-2xl font-black text-cyan-400">{completedDeals.length}</p>
              <p className="text-[11px] text-gray-500">{activeDeals.length} active in production</p>
            </div>

            <div className="bg-[#0C121B] border border-white/5 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Deal Value Earned</span>
              <p className="text-2xl font-black text-amber-400">
                ₹{((deals?.total_earnings || 670000) / 100000).toFixed(1)}L
              </p>
              <p className="text-[11px] text-gray-500">Verified brand payouts</p>
            </div>
          </div>

          {/* 3. Completed Brand Deals & Commercial Pipeline */}
          <div id="brand-deals" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-white flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                  <span>Brand Deals & Sponsorships</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Track executed brand deals, sponsored campaigns, and active brand pipelines handled through Creator Nest.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 p-1 bg-white/5 rounded-xl border border-white/5 text-xs font-bold">
                <button
                  onClick={() => setDealsTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${dealsTab === 'all' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  All ({completedDeals.length + activeDeals.length})
                </button>
                <button
                  onClick={() => setDealsTab('completed')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${dealsTab === 'completed' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  Completed ({completedDeals.length})
                </button>
                <button
                  onClick={() => setDealsTab('active')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${dealsTab === 'active' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  Active ({activeDeals.length})
                </button>
              </div>
            </div>

            {/* Deals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedDeals.map((deal: any, i: number) => {
                const isCompleted = deal.status === 'Completed';
                return (
                  <div
                    key={deal.id || i}
                    className="bg-[#0C121B] border border-white/5 rounded-2xl p-5 space-y-4 hover:border-cyan-500/20 transition-all shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center font-black text-cyan-400 shrink-0">
                          {deal.brand_logo ? (
                            <img src={deal.brand_logo} alt={deal.brand_name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{deal.brand_name?.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">{deal.brand_name}</h4>
                          <p className="text-xs text-gray-400">{deal.campaign_name || 'Direct Brand Collaboration'}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {deal.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-gray-400">
                        <span>Deliverables:</span>
                        <span className="text-white font-medium text-right max-w-[200px] truncate">{deal.deliverables}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span>Timeline:</span>
                        <span className="text-gray-300 font-medium">{deal.timeline}</span>
                      </div>
                      {deal.payment_status && (
                        <div className="flex items-center justify-between text-gray-400">
                          <span>Payment Status:</span>
                          <span className="text-emerald-400 font-bold">{deal.payment_status}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">Deal Value</span>
                        <p className="text-lg font-black text-white">₹{Number(deal.deal_value || 0).toLocaleString('en-IN')}</p>
                      </div>

                      {deal.script_approved && (
                        <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Script Verified</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Commercial Rates Card */}
            <div className="bg-gradient-to-r from-cyan-950/30 to-[#0C121B] border border-cyan-500/20 rounded-2xl p-5 lg:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Your Official Deal Pricing</span>
                <p className="text-xs text-gray-400">Standard rates set in your Creator Nest media kit:</p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-200 border border-white/10 font-bold">
                    Dedicated Video: <strong className="text-white">₹{(creator?.commercials?.dedicated_min || 80000).toLocaleString('en-IN')} - ₹{(creator?.commercials?.dedicated_max || 150000).toLocaleString('en-IN')}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-200 border border-white/10 font-bold">
                    Integration: <strong className="text-white">₹{(creator?.commercials?.integration_min || 40000).toLocaleString('en-IN')} - ₹{(creator?.commercials?.integration_max || 75000).toLocaleString('en-IN')}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-200 border border-white/10 font-bold">
                    YouTube Short: <strong className="text-white">₹{(creator?.commercials?.short_min || 25000).toLocaleString('en-IN')} - ₹{(creator?.commercials?.short_max || 45000).toLocaleString('en-IN')}</strong>
                  </span>
                </div>
              </div>

              <Link
                href="/tools/brand-deal-calculator"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all shrink-0 flex items-center space-x-1.5"
              >
                <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                <span>Adjust in Rate Calculator →</span>
              </Link>
            </div>
          </div>

          {/* 4. Free Tools for Creators (100% Free Forever) */}
          <div id="free-tools" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-black text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Creator Nest Free Tools & Growth Suite</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Every creator onboarded with Creator Nest receives lifetime complimentary access to our full suite of professional commercial and analytics tools.
                </p>
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20 self-start sm:self-auto">
                100% Free For All Creators
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {freeTools.map((tool: any) => (
                <div
                  key={tool.id}
                  className="bg-[#0C121B] border border-white/5 hover:border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group shadow-xl hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/20 group-hover:scale-110 transition-transform">
                        {tool.icon === 'Sparkles' && <Sparkles className="w-5 h-5" />}
                        {tool.icon === 'Video' && <Video className="w-5 h-5" />}
                        {tool.icon === 'Calculator' && <Calculator className="w-5 h-5" />}
                        {tool.icon === 'Zap' && <Zap className="w-5 h-5" />}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tool.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                        {tool.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-3">
                        {tool.description}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="space-y-1 pt-1">
                      {tool.features?.map((f: string, idx: number) => (
                        <div key={idx} className="flex items-center space-x-1.5 text-[11px] text-gray-400">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={tool.link}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-black text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-white/10 transition-all text-center"
                  >
                    <span>Launch Free Tool</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Audience Intelligence & Geographic Demographics */}
          <div id="audience" className="bg-[#0C121B] border border-white/5 rounded-3xl p-6 lg:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-black text-white flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                <span>Audience Demographics & Intelligence</span>
              </h3>
              <p className="text-xs text-gray-400">
                Audience data auto-analyzed from your channel to help brands evaluate direct customer alignment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Age Split */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold uppercase text-gray-400">Age Distribution</span>
                <div className="space-y-2 text-xs">
                  {Object.entries(creator?.audience?.age_splits || { '18-24': 52, '25-34': 30, '35-44': 7, '13-17': 8, '45+': 3 }).map(([age, pct]: any) => (
                    <div key={age} className="space-y-1">
                      <div className="flex justify-between text-gray-300">
                        <span>{age} yrs</span>
                        <span className="font-bold text-white">{pct}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender & Income */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <span className="text-xs font-bold uppercase text-gray-400">Gender & Economic Bracket</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Male: <strong>{creator?.audience?.gender_male || 75}%</strong></span>
                    <span>Female: <strong>{creator?.audience?.gender_female || 25}%</strong></span>
                  </div>
                  <div className="w-full h-3 bg-pink-500 rounded-full overflow-hidden flex">
                    <div className="bg-cyan-400 h-full" style={{ width: `${creator?.audience?.gender_male || 75}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1">
                  <span className="text-[11px] text-gray-400">Purchasing Power Index</span>
                  <p className="text-base font-bold text-white">{creator?.audience?.income_segment || 'Upper-Middle'} Segment</p>
                  <p className="text-[11px] text-gray-500">High propensity for D2C, gadgets, and subscription apps.</p>
                </div>
              </div>

              {/* Geographic Reach */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold uppercase text-gray-400">Top Audience Cities & India Share</span>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-black text-cyan-400">{creator?.audience?.india_pct || 86}%</span>
                  <span className="text-xs text-gray-400">Domestic Indian Viewers ({creator?.audience?.tier1_city_pct || 60}% Tier-1 Metros)</span>
                </div>
                <div className="space-y-1.5 pt-2">
                  {(creator?.audience?.top_cities || ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune']).map((city: string, idx: number) => (
                    <div key={city} className="flex items-center justify-between text-xs text-gray-300">
                      <span className="flex items-center space-x-1.5">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{city}</span>
                      </span>
                      <span className="text-gray-500 font-mono">Rank #{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 6. Account Details & Password Security Section */}
          <div className="bg-[#0C121B] border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Account Credentials & Security</span>
              </h3>
              <p className="text-xs text-gray-400">
                Creator Login ID: <strong className="text-white font-mono">{userAccount?.numeric_id || 'CR-102'}</strong> • Registered Email: <strong className="text-white font-mono">{userAccount?.email}</strong>
              </p>
              <p className="text-[11px] text-gray-500">
                You can change your password at any time, or request an official reset if you ever lose your credentials.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>

              <button
                onClick={() => setResetModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs border border-white/10 transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Request Reset</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Password Change Modal ── */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#12141A] border border-cyan-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center space-x-2">
                    <Key className="w-4 h-4 text-cyan-400" />
                    <span>{mustChangePassword ? 'First-Time Password Setup' : 'Change Account Password'}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {mustChangePassword ? 'Replace temporary default password with your own secure password.' : 'Enter your current password and choose a new one.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                {pwError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                    {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    {pwSuccess}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-400">
                    Current Password {mustChangePassword && '(Default: Creator@123)'}
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={mustChangePassword ? 'Creator@123' : 'Enter current password'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-400">New Password (Min 6 chars)</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new secret password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 mt-1 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-400">Confirm New Password</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 mt-1 focus:border-cyan-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPw}
                    className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs shadow-lg shadow-cyan-400/20 disabled:opacity-50"
                  >
                    {submittingPw ? 'Updating…' : 'Save New Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Password Reset Request Modal ── */}
      <AnimatePresence>
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#12141A] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <span>Request Password Reset</span>
                </h3>
                <button onClick={() => setResetModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                If you ever forget your password, you can generate a reset verification token for your ID <strong className="text-white">{userAccount?.numeric_id}</strong> or email <strong className="text-white">{userAccount?.email}</strong>.
              </p>

              {resetStatus && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-cyan-300">
                  {resetStatus}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs font-bold text-gray-400"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={resetLoading}
                  onClick={handleRequestPasswordReset}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs"
                >
                  {resetLoading ? 'Requesting…' : 'Generate Reset Token'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
