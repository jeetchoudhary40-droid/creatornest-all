import { NextRequest, NextResponse } from 'next/server';
import { saveSubmission } from '@/lib/submissions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, message, phone, company, _honey } = body;

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

    // Persist to unified submissions database
    const savedRecord = saveSubmission({
      source: 'Contact Page Direct',
      role: role || 'general',
      applicantName: name,
      applicantEmail: email,
      subject: `📬 Contact Desk Inquiry: ${name}`,
      isRead: false,
      status: 'pending',
      data: {
        'Full Name': name,
        'Email': email,
        'Phone': phone || 'Not provided',
        'Company / Channel': company || 'Not specified',
        'Role': role || 'general',
        'Message': message,
      },
    });

    console.log('[CONTACT FORM SAVED]', savedRecord.id);

    return NextResponse.json({ 
      ok: true, 
      id: savedRecord.id, 
      message: 'Inquiry saved successfully.' 
    });
  } catch (err) {
    console.error('[CONTACT API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
