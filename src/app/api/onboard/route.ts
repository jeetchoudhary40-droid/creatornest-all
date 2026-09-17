import { NextRequest, NextResponse } from 'next/server';
import { saveSubmission } from '@/lib/submissions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, platform, followers, niche, goals, _honey } = body;

    // Anti-spam honeypot
    if (_honey) return NextResponse.json({ ok: true });

    if (!name || !email || !goals) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const savedRecord = saveSubmission({
      source: 'Creator Onboarding Form',
      role: 'creator',
      applicantName: name,
      applicantEmail: email,
      subject: `🎬 [Creator Onboarding] ${name} (${platform || 'Creator'})`,
      isRead: false,
      status: 'pending',
      data: {
        'Full Name': name,
        'Email': email,
        'Platform': platform ?? 'unknown',
        'Followers / Audience Size': followers ?? 'unknown',
        'Niche / Category': niche ?? 'unknown',
        'Growth Goals': goals,
      },
    });

    console.log('[CREATOR ONBOARDING SAVED]', savedRecord.id);

    return NextResponse.json({ ok: true, id: savedRecord.id });
  } catch (err) {
    console.error('[ONBOARD API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
