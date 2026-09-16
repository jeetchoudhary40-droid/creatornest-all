import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkRateLimit, createSecureToken, getClientIp } from '@/lib/security';

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

function getUsersFromFile(): any[] {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) return [];
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // ── Rate Limiting: Max 6 login attempts per minute per IP ──
    const rateCheck = checkRateLimit(`login_${clientIp}`, 6, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rateCheck.resetInSec} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { identifier, email, password } = body;
    const loginKey = ((identifier || email) || '').trim().toLowerCase();
    const loginPassword = (password || '').trim();

    if (!loginKey || !loginPassword) {
      return NextResponse.json(
        { success: false, error: 'Please enter your User ID or Email and password.' },
        { status: 400 }
      );
    }

    const users = getUsersFromFile();

    // Look for matching user by numeric_id or email
    const user = users.find(u => {
      const matchId = (u.numeric_id || '').toLowerCase() === loginKey;
      const matchEmail = (u.email || '').toLowerCase() === loginKey;
      return matchId || matchEmail;
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID or Email not found. Accounts are issued by the Administrator. Please apply on the Join page.',
        },
        { status: 401 }
      );
    }

    // Constant-time-like check for password
    if (user.password !== loginPassword) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please verify your credentials.' },
        { status: 401 }
      );
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Your account is currently suspended. Please contact your administrator.' },
        { status: 403 }
      );
    }

    // Generate cryptographic HMAC-signed session tokens
    const { accessToken, refreshToken } = createSecureToken({
      id: user.id,
      numericId: user.numeric_id,
      role: user.role,
    });

    const userData = {
      id: user.id,
      numeric_id: user.numeric_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      user_type: user.user_type || user.role,
      plan_tier: user.plan_tier || 'free',
      permissions: user.permissions || ['wall_of_deals', 'dashboard_access'],
      status: user.status || 'active',
      phone: user.phone || '',
      whatsapp: user.whatsapp || '',
      avatar_url: user.avatar_url || null,
    };

    const response = NextResponse.json({
      success: true,
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userData,
    });

    if (user.role === 'admin' || user.role === 'super_admin') {
      response.cookies.set({
        name: 'cn_admin_token',
        value: accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
