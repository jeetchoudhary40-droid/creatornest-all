import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset, resetPasswordWithToken } from '@/lib/creatorAuthService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, identifier, token, newPassword } = body;

    // Mode 1: Request Password Reset
    if (action === 'request' || !token) {
      if (!identifier || !identifier.trim()) {
        return NextResponse.json(
          { success: false, error: 'Please enter your Creator ID (e.g. CR-102) or registered email address.' },
          { status: 400 }
        );
      }

      const res = await requestPasswordReset(identifier);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: res.message,
        token: res.token,
        user: res.user,
      });
    }

    // Mode 2: Confirm Password Reset with Token
    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const resetRes = await resetPasswordWithToken(token, newPassword);
    if (!resetRes.success) {
      return NextResponse.json({ success: false, error: resetRes.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: resetRes.message,
    });
  } catch (err: any) {
    console.error('POST /api/auth/reset-password error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process password reset.' },
      { status: 500 }
    );
  }
}
