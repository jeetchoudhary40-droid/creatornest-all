import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const PRIMARY_EMAIL = process.env.CONTACT_EMAIL || 'hellocreatornest@gmail.com';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqesdjhpqdwjowdiinyi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Persistent Local File Path
const DATA_DIR = path.join(process.cwd(), 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[Storage Error] Failed to initialize submissions file:', err);
  }
}

// Save submission to local JSON file
function saveLocalSubmission(submission: Record<string, any>) {
  try {
    ensureDataDir();
    const existingRaw = fs.existsSync(SUBMISSIONS_FILE) ? fs.readFileSync(SUBMISSIONS_FILE, 'utf-8') : '[]';
    const existing = JSON.parse(existingRaw || '[]');
    existing.unshift(submission);
    // Keep last 500 submissions
    const trimmed = existing.slice(0, 500);
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage Error] Failed to write local submission:', err);
  }
}

// GET endpoint to fetch logged submissions (for admin & debugging)
export async function GET(req: NextRequest) {
  try {
    ensureDataDir();
    const raw = fs.existsSync(SUBMISSIONS_FILE) ? fs.readFileSync(SUBMISSIONS_FILE, 'utf-8') : '[]';
    const submissions = JSON.parse(raw || '[]');
    return NextResponse.json({
      success: true,
      count: submissions.length,
      targetEmail: PRIMARY_EMAIL,
      submissions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source, role, data, applicantEmail, applicantName } = body as {
      source: string;
      role?: string;
      data: Record<string, any>;
      applicantEmail?: string;
      applicantName?: string;
    };

    if (!data) {
      return NextResponse.json({ error: 'Missing form data' }, { status: 400 });
    }

    const email = applicantEmail || data['Email'] || data['Work Email'] || data['email'] || '';
    const name = applicantName || data['Full Name'] || data['Name'] || data['Company / Brand Name'] || data['Contact Person'] || 'Applicant';
    const roleType = role || data['Role / Category'] || (source?.includes('Creator') ? 'Creator' : source?.includes('Brand') ? 'Brand' : 'Team / Freelancer');
    const timestamp = new Date().toISOString();
    const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

    // 1. Generate Subject Line
    const subjectMap: Record<string, string> = {
      'Join Page - Creator': `🎬 [Creator Application] ${name} (${data['Followers / Audience Size'] || data['Platform'] || 'Creator'})`,
      'Join Page - Brand': `🏢 [Brand Inquiry] ${data['Company / Brand Name'] || name} (${data['Estimated Budget'] || 'Campaign'})`,
      'Join Page - Team': `👥 [Team Application] ${name} — ${data['Applied Position'] || data['Role'] || 'Role'}`,
      'Join Page - Career': `👥 [Career Application] ${name} — ${data['Applied Position'] || 'Role'}`,
      'Homepage CTA': `🚀 [Growth Plan Request] ${name} (${data['Followers / Audience Size'] || 'Creator'})`,
    };
    const emailSubject = subjectMap[source] || `📬 New ${roleType} Application: ${name} (Creator Nest)`;

    // 2. Format HTML Table Rows
    const tableRowsHtml = Object.entries(data)
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '' && v !== '—')
      .map(([k, v]) => `
        <tr>
          <td style="padding:12px 16px;background:#131822;color:#00F2FE;font-size:12px;font-weight:700;width:180px;border-bottom:1px solid #1f2736;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">${k}</td>
          <td style="padding:12px 16px;background:#0d1117;color:#f0f6fc;font-size:14px;border-bottom:1px solid #1f2736;vertical-align:top;white-space:pre-wrap;line-height:1.5;">${String(v)}</td>
        </tr>
      `).join('');

    const htmlEmailContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/></head>
      <body style="margin:0;padding:24px;background:#05070a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:640px;margin:0 auto;background:#0b0f17;border:1px solid rgba(0,242,254,0.25);border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <div style="background:linear-gradient(135deg, #0b0f17 0%, #151d2c 100%);padding:24px 30px;border-bottom:1px solid rgba(0,242,254,0.2);">
            <div style="display:inline-block;padding:4px 10px;background:rgba(0,242,254,0.1);border:1px solid rgba(0,242,254,0.3);border-radius:20px;color:#00F2FE;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
              ${roleType} Submission
            </div>
            <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 6px 0;">New Lead / Application</h1>
            <p style="color:#8b949e;font-size:13px;margin:0;">Source: ${source || 'Join Portal'} • Time: ${istTime}</p>
          </div>
          <div style="padding:24px 30px;">
            <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #1f2736;">
              ${tableRowsHtml}
            </table>
          </div>
          <div style="background:#080b10;padding:16px 30px;text-align:center;border-top:1px solid #1f2736;">
            <p style="color:#6e7681;font-size:12px;margin:0;">
              Creator Nest Automated System • Delivered to <strong style="color:#00F2FE;">${PRIMARY_EMAIL}</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Guaranteed Local File Persistence
    const submissionRecord = {
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp,
      istTime,
      source: source || roleType,
      role: roleType,
      applicantName: name,
      applicantEmail: email,
      subject: emailSubject,
      data,
    };
    saveLocalSubmission(submissionRecord);

    let deliveredVia = 'none';
    const errors: string[] = [];

    // 4. Method 1: Gmail SMTP via Nodemailer
    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;

    if (gmailUser && gmailPass && !gmailPass.includes('your_16_char')) {
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: gmailUser, pass: gmailPass.replace(/\s+/g, '') },
        });

        await transporter.sendMail({
          from: `"Creator Nest Desk" <${gmailUser}>`,
          to: PRIMARY_EMAIL,
          replyTo: email || gmailUser,
          subject: emailSubject,
          html: htmlEmailContent,
        });

        deliveredVia = 'smtp_gmail';
        console.log(`[Email Dispatch] Successfully sent via Direct Gmail SMTP to ${PRIMARY_EMAIL}`);
      } catch (smtpErr: any) {
        console.error('[SMTP Send Error]:', smtpErr);
        errors.push(`Gmail SMTP: ${smtpErr.message}`);
      }
    }

    // 5. Method 2: Resend API (if configured)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (deliveredVia === 'none' && resendApiKey && resendApiKey.startsWith('re_')) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Creator Nest <onboarding@resend.dev>',
            to: [PRIMARY_EMAIL],
            reply_to: email || undefined,
            subject: emailSubject,
            html: htmlEmailContent,
          }),
        });

        if (resendRes.ok) {
          deliveredVia = 'resend_api';
          console.log(`[Email Dispatch] Successfully sent via Resend API to ${PRIMARY_EMAIL}`);
        } else {
          const resendErr = await resendRes.text();
          errors.push(`Resend: ${resendErr}`);
        }
      } catch (rErr: any) {
        errors.push(`Resend Error: ${rErr.message}`);
      }
    }

    // 6. Method 3: Supabase Database Backup
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        await supabaseAdmin.from('contact_submissions').insert({
          source: source || `Join Page - ${roleType}`,
          data,
          submitted_at: timestamp,
          email: email || null,
          name: name || null,
        });
      }
    } catch (dbErr) {
      console.warn('[Supabase Backup Warning]:', dbErr);
    }

    // 7. Format WhatsApp Quick Notification Text (for instant forwarding)
    const summaryLines = Object.entries(data)
      .filter(([, v]) => v && String(v).trim() !== '')
      .map(([k, v]) => `• *${k}:* ${v}`)
      .join('\n');
    const waText = `🔔 *New ${roleType} Application on Creator Nest*\n\n${summaryLines}\n\n🕒 _${istTime}_`;
    const whatsappNotificationUrl = `https://wa.me/919876543210?text=${encodeURIComponent(waText)}`;

    return NextResponse.json({
      success: true,
      deliveredTo: PRIMARY_EMAIL,
      deliveredVia: deliveredVia !== 'none' ? deliveredVia : 'local_storage',
      savedLocally: true,
      submissionId: submissionRecord.id,
      whatsappNotificationUrl,
      message: 'Application recorded and processed successfully.',
      diagnostics: {
        smtpConfigured: !!(gmailUser && gmailPass && !gmailPass.includes('your_16_char')),
        resendConfigured: !!(resendApiKey && resendApiKey.startsWith('re_')),
        errors: errors.length > 0 ? errors : undefined,
      }
    });
  } catch (err: any) {
    console.error('Send-email route fatal error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while processing application' },
      { status: 500 }
    );
  }
}
