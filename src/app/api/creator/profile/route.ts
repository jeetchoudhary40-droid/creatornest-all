import { NextRequest, NextResponse } from 'next/server';
import { verifySecureToken } from '@/lib/security';
import { getCreatorFullProfile, syncAllRosterCreatorAccounts } from '@/lib/creatorAuthService';

export async function GET(req: NextRequest) {
  try {
    // 1. Ensure any missing creator accounts from roster are synchronized
    await syncAllRosterCreatorAccounts();

    const url = new URL(req.url);
    const queryIdentifier = url.searchParams.get('id') || url.searchParams.get('identifier') || url.searchParams.get('email');

    // 2. Identify requesting user from auth header or cookie
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim() ||
      req.cookies.get('cn_admin_token')?.value ||
      req.cookies.get('access_token')?.value;

    let targetIdentifier = queryIdentifier;

    if (!targetIdentifier && token) {
      const verification = verifySecureToken(token);
      if (verification.valid && verification.payload) {
        targetIdentifier = verification.payload.numericId || verification.payload.id || verification.payload.email;
      }
    }

    // Default fallback to first active creator (CR-102 / Jeet) if no specific target
    if (!targetIdentifier) {
      targetIdentifier = 'CR-102';
    }

    const profileData = getCreatorFullProfile(targetIdentifier);

    return NextResponse.json({
      success: true,
      ...profileData,
    });
  } catch (err: any) {
    console.error('GET /api/creator/profile error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch creator profile.' },
      { status: 500 }
    );
  }
}
