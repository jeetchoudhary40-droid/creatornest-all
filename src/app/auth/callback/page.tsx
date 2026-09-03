'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Check for OAuth errors from provider
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          console.error('OAuth provider error:', errorParam, errorDescription);
          router.push(`/login?error=${encodeURIComponent(errorDescription || errorParam)}`);
          return;
        }

        // ── Strategy 1: Wait for Supabase to auto-detect session from URL ─
        // Works for both PKCE (code in URL) and implicit (token in hash)
        // The supabase client with detectSessionInUrl:true handles this automatically
        let session = null;

        // Give Supabase client time to detect and parse the session from URL
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          session = initialSession;
        } else {
          // ── Strategy 2: Try to manually exchange code if present ─────────
          const code = searchParams.get('code');
          if (code) {
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              console.error('Code exchange failed:', exchangeError.message);
              // Show a helpful error about Google credentials
              router.push('/login?error=' + encodeURIComponent(
                'Google sign-in failed. Please ensure Google OAuth is configured in Supabase dashboard.'
              ));
              return;
            }
            session = exchangeData.session;
          }

          // ── Strategy 3: Listen for auth state change ──────────────────────
          if (!session) {
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Auth timeout')), 8000);
              const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
                if (s) {
                  session = s;
                  clearTimeout(timeout);
                  subscription.unsubscribe();
                  resolve();
                }
              });
            }).catch(() => {});
          }
        }

        if (!session) {
          console.error('No session after all strategies');
          router.push('/login?error=no_session');
          return;
        }

        const { user } = session;

        // Extract all info Google provides
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User';
        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null;

        // Upsert profile — DB trigger already created it, this refreshes avatar/name
        await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              email: user.email!,
              full_name: fullName,
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id', ignoreDuplicates: false }
          );

        // Read fresh profile for authoritative role
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const userType = profile?.user_type || 'user';
        const planTier = profile?.plan_tier || 'free';
        const permissions = Array.isArray(profile?.permissions) ? profile.permissions : [];
        const isNewUser = profile?.created_at
          ? new Date().getTime() - new Date(profile.created_at).getTime() < 60_000
          : true;

        login(session.access_token, session.refresh_token ?? '', {
          id: user.id,
          email: user.email!,
          full_name: profile?.full_name || fullName,
          role: userType,
          user_type: userType,
          permissions,
          plan_tier: planTier as any,
          avatar_url: profile?.avatar_url || avatarUrl,
        });

        // Route based on role
        const next = searchParams.get('next');
        if (next) {
          router.push(decodeURIComponent(next));
        } else if (userType === 'creator') {
          router.push('/dashboard/creator');
        } else if (userType === 'brand') {
          router.push('/dashboard/brand');
        } else if (userType === 'admin' || userType === 'super_admin') {
          router.push('/admin/dashboard');
        } else {
          router.push(isNewUser ? '/dashboard/user?welcome=true' : '/dashboard/user');
        }

      } catch (err: any) {
        console.error('Unexpected auth error:', err);
        router.push('/login?error=' + encodeURIComponent(err?.message || 'unexpected_error'));
      }
    };

    handleAuth();
  }, [router, login, searchParams]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#0B0F14' }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,242,254,0.06) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 relative z-10"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl mb-2"
          style={{ background: 'linear-gradient(135deg, #00F2FE 0%, #00d5e0 100%)', color: '#0B0F14' }}
        >
          N
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00F2FE' }} />
          <p className="text-white font-semibold text-lg">Setting up your account…</p>
          <p className="text-gray-500 text-sm">Just a moment, creating your Creator Nest profile</p>
        </div>

        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: '#00F2FE' }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F14' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00F2FE' }} />
        </div>
      }
    >
      <AuthCallback />
    </Suspense>
  );
}
