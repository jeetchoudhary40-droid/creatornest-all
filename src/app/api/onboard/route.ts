import { NextRequest, NextResponse } from 'next/server';

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

    const entry = {
      id: Date.now(),
      type: 'creator-onboarding',
      name,
      email,
      platform: platform ?? 'unknown',
      followers: followers ?? 'unknown',
      niche: niche ?? 'unknown',
      goals,
      submittedAt: new Date().toISOString(),
    };

    console.log('[CREATOR ONBOARDING]', JSON.stringify(entry, null, 2));

    // TODO: Save to database
    // await db.insert('creator_applications', entry);

    // TODO: Send confirmation email to creator + internal notification
    // await sendEmail({ to: email, subject: 'Application Received – Creator Nest', ... });

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (err) {
    console.error('[ONBOARD API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
