'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, User, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const IS_DEV = process.env.NODE_ENV !== 'production';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Try real backend authentication first
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.role === 'admin' || meData.role === 'super_admin') {
            if (typeof window !== 'undefined') {
              localStorage.setItem('access_token', data.access_token);
              localStorage.setItem('refresh_token', data.refresh_token);
              localStorage.setItem('user', JSON.stringify({
                id: meData.id,
                email: meData.email,
                full_name: meData.full_name,
                role: meData.role,
                user_type: meData.role
              }));
            }
            router.push('/admin/dashboard');
            return;
          } else {
            throw new Error('Access denied. Admin role required.');
          }
        }
      }
      
      // If backend call failed, fall back to mock check in non-production environments
      if (IS_DEV && email === 'admin@creatornest.in' && password === 'admin1234') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', 'mock_access_token_admin');
          localStorage.setItem('refresh_token', 'mock_refresh_token');
          localStorage.setItem('user', JSON.stringify({
            id: 'admin-1',
            email: 'admin@creatornest.in',
            full_name: 'Super Admin',
            role: 'super_admin'
          }));
        }
        router.push('/admin/dashboard');
      } else {
        setError('Invalid credentials. Use admin@creatornest.in / admin1234 for testing in development.');
      }
    } catch (err: any) {
      // Check dev fallback if API is offline
      if (IS_DEV && email === 'admin@creatornest.in' && password === 'admin1234') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', 'mock_access_token_admin');
          localStorage.setItem('refresh_token', 'mock_refresh_token');
          localStorage.setItem('user', JSON.stringify({
            id: 'admin-1',
            email: 'admin@creatornest.in',
            full_name: 'Super Admin',
            role: 'super_admin'
          }));
        }
        router.push('/admin/dashboard');
      } else {
        setError(err.message || 'Login failed. Ensure API server is online.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestMode = () => {
    if (!IS_DEV) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', 'mock_access_token_admin');
      localStorage.setItem('refresh_token', 'mock_refresh_token');
      localStorage.setItem('user', JSON.stringify({
        id: 'admin-1',
        email: 'admin@creatornest.in',
        full_name: 'Super Admin',
        role: 'super_admin'
      }));
    }
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(0,242,254,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.6) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="max-w-md w-full bg-surface border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Logo />
          <h1 className="text-2xl font-bold mt-6">Internal Admin Portal</h1>
          <p className="text-gray-400 text-sm">Authorized personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                required
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@creatornest.in"
                className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
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
                className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-background font-black py-4 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              'Enter Secure Portal'
            )}
          </button>
        </form>
        
        {IS_DEV && (
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <button 
              onClick={handleTestMode}
              type="button"
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Skip Login (Test Mode) 🚀
            </button>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
            ← Back to Public Website
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
