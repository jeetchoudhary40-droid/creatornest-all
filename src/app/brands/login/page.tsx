'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Briefcase } from 'lucide-react';
import Logo from '@/components/Logo';

export default function BrandLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock Login for Testing (Bypass Backend)
    setTimeout(() => {
      if (email === 'test@brand.com' && password === 'test1234') {
        router.push('/brands/dashboard');
      } else {
        setError('Invalid credentials. Use test@brand.com / test1234 for testing.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
            <Briefcase className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold">Brand Partner Portal</h1>
          <p className="text-gray-400 text-sm mt-2 text-center">Login to discover vetted creators and launch campaigns.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="bg-secondary/10 border border-secondary/20 p-3 rounded-lg text-secondary text-xs text-center font-medium">
            Test Account: test@brand.com / test1234
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                required
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@brand.com"
                className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-secondary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                required
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-secondary/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/90 text-background font-black py-4 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              'Access Marketplace'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center space-y-4">
          <p className="text-sm text-gray-500">
            Don't have an account? <Link href="/brands" className="text-secondary hover:underline">Apply here</Link>
          </p>
          <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors inline-block">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
