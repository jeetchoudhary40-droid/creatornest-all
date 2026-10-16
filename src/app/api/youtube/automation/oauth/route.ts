import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/youtube/automation/oauth/callback`;

    if (!clientId) {
      return NextResponse.json({
        configured: false,
        message: 'GOOGLE_CLIENT_ID is not configured in .env.local yet. To enable direct OAuth channel editing, add your Google OAuth Client ID & Secret in Google Cloud Console with "YouTube Data API v3" and scopes: youtube.force-ssl, youtube.readonly.',
        sampleConsentUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly')}&access_type=offline&prompt=consent`
      });
    }

    const scopes = [
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;

    return NextResponse.json({
      configured: true,
      authUrl,
      redirectUri,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/youtube/automation/oauth/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Google OAuth Client ID or Secret is not configured in .env.local' }, { status: 400 });
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error_description || 'Failed to exchange OAuth code for tokens.');
    }

    return NextResponse.json({
      success: true,
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
      message: 'Channel successfully connected with official YouTube OAuth.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
