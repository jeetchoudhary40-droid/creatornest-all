import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
          error: 'User ID or Email not found. Accounts are created and issued by the Administrator. Please apply on the Join page.',
        },
        { status: 401 }
      );
    }

    // Verify Password
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

    // Create session token
    const token = `tok_${user.numeric_id || user.id}_${Date.now()}`;
    const refreshToken = `ref_${user.numeric_id || user.id}_${Date.now()}`;

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

    return NextResponse.json({
      success: true,
      access_token: token,
      refresh_token: refreshToken,
      user: userData,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
