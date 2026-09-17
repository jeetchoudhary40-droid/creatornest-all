import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/security';
import { 
  getSubmissions, 
  updateSubmission, 
  markAllSubmissionsAsRead, 
  deleteSubmission 
} from '@/lib/submissions';

// GET all applications with stats & filtering (Protected)
export async function GET(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { searchParams } = new URL(req.url);
    const readFilter = searchParams.get('read'); // 'unread' | 'read'
    const roleFilter = searchParams.get('role'); // 'creator' | 'brand' | 'team' | 'contact'
    const statusFilter = searchParams.get('status'); // 'pending' | 'contacted' | 'accepted' | 'rejected'
    const search = (searchParams.get('search') || '').toLowerCase().trim();

    const allSubmissions = getSubmissions();

    // Compute aggregate counts
    const total = allSubmissions.length;
    const unread = allSubmissions.filter(s => !s.isRead).length;
    const read = allSubmissions.filter(s => s.isRead).length;
    const creators = allSubmissions.filter(s => s.role === 'creator').length;
    const brands = allSubmissions.filter(s => s.role === 'brand').length;
    const team = allSubmissions.filter(s => s.role === 'career' || s.role === 'team' || s.role === 'team_member').length;
    const contact = allSubmissions.filter(s => s.role === 'general' || s.source?.toLowerCase().includes('contact')).length;

    // Apply filters
    let filtered = allSubmissions;

    if (readFilter === 'unread') {
      filtered = filtered.filter(s => !s.isRead);
    } else if (readFilter === 'read') {
      filtered = filtered.filter(s => s.isRead);
    }

    if (roleFilter === 'creator') {
      filtered = filtered.filter(s => s.role === 'creator');
    } else if (roleFilter === 'brand') {
      filtered = filtered.filter(s => s.role === 'brand');
    } else if (roleFilter === 'team') {
      filtered = filtered.filter(s => s.role === 'career' || s.role === 'team' || s.role === 'team_member');
    } else if (roleFilter === 'contact') {
      filtered = filtered.filter(s => s.role === 'general' || s.source?.toLowerCase().includes('contact'));
    }

    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    if (search) {
      filtered = filtered.filter(s => 
        (s.applicantName || '').toLowerCase().includes(search) ||
        (s.applicantEmail || '').toLowerCase().includes(search) ||
        (s.source || '').toLowerCase().includes(search) ||
        (s.subject || '').toLowerCase().includes(search) ||
        JSON.stringify(s.data || {}).toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      stats: {
        total,
        unread,
        read,
        creators,
        brands,
        team,
        contact,
      },
      applications: filtered,
    });
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

    // Batch Action: Mark all as read
    if (body.action === 'mark_all_read') {
      const updatedCount = markAllSubmissionsAsRead();
      return NextResponse.json({
        success: true,
        message: `Marked ${updatedCount} inquiries as read.`,
        updatedCount,
      });
    }

    const { id, isRead, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Application ID is required.' }, { status: 400 });
    }

    const updated = updateSubmission(id, {
      isRead,
      status,
      adminNotes,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully.',
      application: updated,
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

    const deleted = deleteSubmission(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Application deleted.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
