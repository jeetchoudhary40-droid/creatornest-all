'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, User, Lock, Eye, EyeOff, LogIn, ArrowRight, ShieldAlert, Sparkles, CheckCircle2, Key, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState(''); // User ID or Email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password / Reset Access Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');
  const [resetToken, setResetToken] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetErr, setResetErr] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const next = searchParams.get('next');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your User ID / Email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    const cleanIdentifier = identifier.trim();

    try {
      // 1. Authenticate via Next.js internal auth API (checking data/users.json)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanIdentifier, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid User ID or password.');
      }

      const userData = data.user;
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;

      // Save user session via context
      login(accessToken, refreshToken, userData);

      // Auto-route by detected user role
      if (next) {
        router.push(decodeURIComponent(next));
      } else if (userData.role === 'admin' || userData.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else if (userData.role === 'creator') {
        router.push('/dashboard/creator');
      } else if (userData.role === 'brand') {
        router.push('/dashboard/brand');
      } else if (userData.role === 'team_member' || userData.role === 'team') {
        router.push('/profile');
      } else {
        router.push('/profile');
      }

    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      setResetErr('Please enter your Creator ID or Email.');
      return;
    }
    setResetSubmitting(true);
    setResetErr('');
    setResetMsg('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', identifier: resetIdentifier.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to request reset.');
      }
      setResetToken(data.token);
      setResetMsg(`Reset authorized for ${data.user?.full_name} (${data.user?.numeric_id}). Please enter your new password below.`);
      setResetStep('confirm');
    } catch (err: any) {
      setResetErr(err.message || 'Request failed.');
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResetPassword || newResetPassword.length < 6) {
      setResetErr('New password must be at least 6 characters.');
      return;
    }
    setResetSubmitting(true);
    setResetErr('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm', token: resetToken, newPassword: newResetPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to reset password.');
      }
      setResetMsg('Password reset successfully! You can now log in with your new password.');
      setTimeout(() => {
        setResetModalOpen(false);
        setResetStep('request');
        setResetIdentifier('');
        setNewResetPassword('');
        setResetMsg('');
      }, 2000);
    } catch (err: any) {
      setResetErr(err.message || 'Failed to reset.');
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden bg-background"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(0,242,254,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.6) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div
        className="absolute top-[-180px] left-[-180px] w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,242,254,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }}
      />
      <div
        className="absolute bottom-[-200px] right-[-200px] w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,81,47,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10 bg-surface/90 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl p-8 sm:p-10 overflow-hidden"
      >
        {/* Subtle Top Glowing Neon Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Header with Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="mb-4 inline-block hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Portal Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Sign In</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xs">
            Enter your assigned User ID or Email to access your portal.
          </p>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3.5 flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs leading-relaxed overflow-hidden"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* User ID or Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
              User ID / Email Address
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                autoComplete="username"
                placeholder="e.g. CR-108 or you@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-background/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1 ml-1">Your role (Creator, Brand, Team) is detected automatically.</p>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetIdentifier(identifier);
                  setResetModalOpen(true);
                  setResetStep('request');
                  setResetErr('');
                  setResetMsg('');
                }}
                className="text-xs text-primary/90 hover:text-primary transition-colors font-semibold"
              >
                Forgot / Reset Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background/80 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 ml-1">
              Onboarded creators: Enter your assigned ID (e.g. <span className="text-primary font-mono font-bold">CR-102</span>) & default password.
            </p>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-cyan-400 hover:from-primary hover:to-cyan-300 text-background flex items-center justify-center space-x-2 transition-all duration-300 shadow-[0_0_25px_rgba(0,242,254,0.25)] hover:shadow-[0_0_35px_rgba(0,242,254,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-background" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Access Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info: Apply / Join */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-2">
          <p className="text-xs text-gray-400">
            Don&apos;t have an assigned User ID yet?
          </p>
          <Link
            href="/join"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <span>Apply to Join Creator Nest</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </motion.div>

      {/* ── Password Reset Modal ── */}
      <AnimatePresence>
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-white/10 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-white">Reset Account Access</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {resetErr && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  {resetErr}
                </div>
              )}

              {resetMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                  {resetMsg}
                </div>
              )}

              {resetStep === 'request' ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Enter your assigned Creator ID (e.g. <strong className="text-white">CR-102</strong>) or registered business email to verify your identity.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                      Creator ID or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="e.g. CR-103 or you@creatornest.in"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setResetModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-background font-bold text-xs shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {resetSubmitting ? 'Verifying…' : 'Continue →'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleConfirmReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                      New Secret Password (min 6 chars)
                    </label>
                    <input
                      type="password"
                      required
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setResetStep('request')}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={resetSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-background font-bold text-xs shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {resetSubmitting ? 'Updating…' : 'Set New Password'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
