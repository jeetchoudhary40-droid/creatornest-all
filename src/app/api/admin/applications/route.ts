import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminRequest } from '@/lib/security';

const SUBMISSIONS_FILE_PATH = path.join(process.cwd(), 'data', 'submissions.json');

function getSubmissionsFromFile(): any[] {
  try {
    if (!fs.existsSync(SUBMISSIONS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(SUBMISSIONS_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading data/submissions.json:', err);
    return [];
  }
}

function saveSubmissionsToFile(submissions: any[]) {
  try {
    const dir = path.dirname(SUBMISSIONS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUBMISSIONS_FILE_PATH, JSON.stringify(submissions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving submissions:', err);
    throw new Error('Failed to persist submissions.');
  }
}

// GET all applications (Protected)
export async function GET(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const submissions = getSubmissionsFromFile();
    return NextResponse.json({ success: true, count: submissions.length, applications: submissions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT update application (Protected)
export async function PUT(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const body = await req.json();
    const { id, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Application ID is required.' }, { status: 400 });
    }

    const submissions = getSubmissionsFromFile();
    const index = submissions.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 });
    }

    submissions[index] = {
      ...submissions[index],
      status: status || submissions[index].status || 'pending',
      adminNotes: adminNotes !== undefined ? adminNotes : submissions[index].adminNotes,
      updated_at: new Date().toISOString(),
    };

    saveSubmissionsToFile(submissions);

    return NextResponse.json({
      success: true,
      message: 'Application updated.',
      application: submissions[index],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE application (Protected)
export async function DELETE(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required.' }, { status: 400 });
    }

    let submissions = getSubmissionsFromFile();
    submissions = submissions.filter(s => s.id !== id);
    saveSubmissionsToFile(submissions);

    return NextResponse.json({ success: true, message: 'Application deleted.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
