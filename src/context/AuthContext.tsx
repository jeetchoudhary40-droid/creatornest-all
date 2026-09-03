'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  permissions: string[];
  plan_tier?: 'free' | 'silver' | 'gold' | 'platinum';
  user_type?: string;
  apply_status?: 'none' | 'pending' | 'approved' | 'rejected';
  avatar_url?: string | null;
  onboarding_data?: Record<string, any>;
  social_links?: Record<string, string>;
  phone?: string;
  is_active?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (access_token: string, refresh_token: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getLS(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch { return null; }
}
function setLS(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, value); } catch {}
}
function removeLS(...keys: string[]) {
  if (typeof window === 'undefined') return;
  keys.forEach(k => { try { localStorage.removeItem(k); } catch {} });
}

async function validateFastAPIToken(token: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      id: d.id,
      email: d.email,
      full_name: d.full_name,
      role: d.role,
      user_type: d.role,
      permissions: d.permissions || [],
      plan_tier: 'free',
      avatar_url: d.avatar_url || null,
    };
  } catch {
    return null;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ── INSTANT init: read localStorage synchronously — ZERO delay ──
  const [user, setUser] = useState<User | null>(() => {
    const raw = getLS('user');
    if (!raw) return null;
    try { return JSON.parse(raw) as User; } catch { return null; }
  });
  // Start as NOT loading since we already have a value from localStorage
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback((access_token: string, refresh_token: string, userData: User) => {
    setLS('access_token', access_token);
    setLS('refresh_token', refresh_token);
    setLS('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      setLS('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(async () => {
    const token = getLS('access_token');
    const refresh = getLS('refresh_token');

    // Fire-and-forget FastAPI logout (don't await — don't block UI)
    if (token && refresh) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      }).catch(() => {});
    }

    removeLS('access_token', 'refresh_token', 'user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  // ── Background token validation — runs AFTER paint, non-blocking ──
  const checkAuth = useCallback(async () => {
    const token = getLS('access_token');
    const cachedRaw = getLS('user');

    if (!token) {
      // No token at all — definitely logged out
      if (user !== null) setUser(null);
      return;
    }

    // Validate token against FastAPI in the background
    setIsLoading(true);
    try {
      const freshUser = await validateFastAPIToken(token);
      if (freshUser) {
        setUser(freshUser);
        setLS('user', JSON.stringify(freshUser));
      } else {
        // Token expired/invalid — clear session
        removeLS('access_token', 'refresh_token', 'user');
        setUser(null);
      }
    } catch {
      // Network error — keep whatever we loaded from localStorage
      if (cachedRaw) {
        try { setUser(JSON.parse(cachedRaw)); } catch { setUser(null); }
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    const token = getLS('access_token');
    if (!token) return;
    const freshUser = await validateFastAPIToken(token);
    if (freshUser) {
      setUser(freshUser);
      setLS('user', JSON.stringify(freshUser));
    }
  }, []);

  // ── On mount: validate token in background (non-blocking) ──
  useEffect(() => {
    const token = getLS('access_token');
    if (!token) {
      // No token — clear any stale user data
      removeLS('user');
      setUser(null);
      return;
    }
    // Run validation after first paint — page is already shown
    const timer = setTimeout(() => {
      checkAuth();
    }, 100); // 100ms delay ensures paint happens first
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth, updateUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
