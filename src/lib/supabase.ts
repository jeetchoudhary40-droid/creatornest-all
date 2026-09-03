import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Supabase client — configured with minimal reconnect behavior.
 * When the Supabase project is paused, all calls will fail fast
 * because we don't rely on this client for auth anymore (FastAPI handles that).
 * This client is kept for any legacy data queries that still reference it.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
    autoRefreshToken: false,   // disable — we use FastAPI tokens now
    detectSessionInUrl: false, // disable — reduces startup overhead
    persistSession: false,     // disable — we manage sessions via localStorage ourselves
  },
  global: {
    fetch: (url: RequestInfo | URL, options?: RequestInit) => {
      // Add a 5-second timeout to ALL Supabase fetch calls so they fail fast
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(id));
    },
  },
});
