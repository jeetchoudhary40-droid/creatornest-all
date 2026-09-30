import { NextRequest, NextResponse } from 'next/server';
import { verifySecureToken } from '@/lib/security';
import { changeUserPassword } from '@/lib/creatorAuthService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, currentPassword, newPassword, force } = body;

    // Check auth session
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim() ||
      req.cookies.get('cn_admin_token')?.value ||
      req.cookies.get('access_token')?.value;

    let targetUser = identifier;
    let isSuperAdmin = false;

    if (token) {
      const verification = verifySecureToken(token);
      if (verification.valid && verification.payload) {
        if (!targetUser) {
          targetUser = verification.payload.numericId || verification.payload.id;
        }
        if (verification.payload.role === 'admin' || verification.payload.role === 'super_admin') {
          isSuperAdmin = true;
        }
      }
    }

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User identifier (Creator ID or Email) is required.' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const result = await changeUserPassword(
      targetUser,
      currentPassword || '',
      newPassword,
      Boolean(force && isSuperAdmin)
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Password changed successfully! You can now log in with your new password.',
    });
  } catch (err: any) {
    console.error('POST /api/auth/change-password error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to change password.' },
      { status: 500 }
    );
  }
}
