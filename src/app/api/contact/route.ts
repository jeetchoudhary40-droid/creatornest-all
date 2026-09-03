import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, message, _honey } = body;

    // Anti-spam honeypot check
    if (_honey) {
      return NextResponse.json({ ok: true }); // silently ignore bots
    }

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // ── Persist to JSON log (replace with DB/email service in production) ──
    const entry = {
      id: Date.now(),
      type: 'contact',
      name,
      email,
      role: role ?? 'unknown',
      message,
      submittedAt: new Date().toISOString(),
    };

    // Log to console (visible in Next.js server terminal)
    console.log('[CONTACT FORM]', JSON.stringify(entry, null, 2));

    // TODO: Replace with your email service (Resend, SendGrid, Nodemailer, etc.)
    // await sendEmail({ to: 'hello@creatornest.in', subject: `New Contact: ${name}`, body: message });

    // TODO: Replace with your DB (Supabase, Firebase, PlanetScale, etc.)
    // await db.insert('contacts', entry);

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (err) {
    console.error('[CONTACT API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
