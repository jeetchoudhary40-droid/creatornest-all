import { NextRequest, NextResponse } from 'next/server';

// Valid role IDs from the /join page
const VALID_ROLE_IDS = new Set([
  'video-editor','motion-graphics','graphic-designer','thumbnail-designer',
  'dop','director','camera-operator','camera-assistant','lighting-tech','set-coordinator',
  'voice-artist','show-anchor','script-reader','audio-engineer',
  'content-strategist','content-analyst','script-writer',
  'social-media-mgr','team-manager','organizer','talent-manager',
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Anti-spam honeypot
    if (formData.get('_honey')) return NextResponse.json({ ok: true });

    const roleId    = formData.get('roleId')?.toString() ?? '';
    const roleTitle = formData.get('roleTitle')?.toString() ?? '';
    const name      = formData.get('name')?.toString() ?? '';
    const email     = formData.get('email')?.toString() ?? '';
    const phone     = formData.get('phone')?.toString() ?? '';
    const city      = formData.get('city')?.toString() ?? '';
    const experience = formData.get('experience')?.toString() ?? '';
    const workType  = formData.get('workType')?.toString() ?? '';
    const rate      = formData.get('rate')?.toString() ?? '';
    const portfolio = formData.get('portfolio')?.toString() ?? '';
    const bestWork  = formData.get('bestWork')?.toString() ?? '';
    const file      = formData.get('file') as File | null;

    // Validate role ID
    if (!VALID_ROLE_IDS.has(roleId)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Required fields
    if (!name || !email || !phone || !city || !bestWork) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Portfolio or file required
    if (!portfolio && !file) {
      return NextResponse.json({ error: 'Please provide a portfolio URL or file upload' }, { status: 400 });
    }

    // File size check (20MB)
    if (file && file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 20MB limit' }, { status: 400 });
    }

    const entry = {
      id: Date.now(),
      type: 'job-application',
      roleId,
      roleTitle,
      name,
      email,
      phone,
      city,
      experience,
      workType,
      rate: rate || 'Not specified',
      portfolio: portfolio || 'None provided',
      hasFile: !!file,
      fileName: file?.name ?? null,
      fileType: file?.type ?? null,
      fileSizeKB: file ? Math.round(file.size / 1024) : null,
      bestWork,
      submittedAt: new Date().toISOString(),
    };

    console.log('[JOB APPLICATION]', JSON.stringify(entry, null, 2));

    // TODO: Upload file to storage (Cloudinary, S3, Supabase Storage)
    // if (file) {
    //   const buffer = Buffer.from(await file.arrayBuffer());
    //   const uploadedUrl = await uploadToStorage(buffer, file.name, file.type);
    //   entry.fileUrl = uploadedUrl;
    // }

    // TODO: Save to database
    // await db.insert('job_applications', entry);

    // TODO: Send notification to HR + confirmation to applicant
    // await sendEmail({ to: email, subject: `Application Received – ${roleTitle}`, ... });

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (err) {
    console.error('[APPLY API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
