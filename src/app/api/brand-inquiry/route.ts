import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, email, budget, goal, requirements, _honey } = body;

    // Anti-spam honeypot
    if (_honey) return NextResponse.json({ ok: true });

    if (!name || !email || !requirements) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const entry = {
      id: Date.now(),
      type: 'brand-inquiry',
      name,
      company: company ?? 'unknown',
      email,
      budget: budget ?? 'unknown',
      goal: goal ?? 'unknown',
      requirements,
      submittedAt: new Date().toISOString(),
    };

    console.log('[BRAND INQUIRY]', JSON.stringify(entry, null, 2));

    // TODO: Save to database
    // await db.insert('brand_inquiries', entry);

    // TODO: Send notification to sales team + confirmation to brand
    // await sendEmail({ to: 'brands@creatornest.in', subject: `New Brand Inquiry: ${company}`, ... });

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (err) {
    console.error('[BRAND INQUIRY API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
