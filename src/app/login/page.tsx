'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, User, Lock, Eye, EyeOff, LogIn, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
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
              <Link href="/contact" className="text-xs text-primary/80 hover:text-primary transition-colors">
                Need Help?
              </Link>
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
