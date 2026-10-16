import { NextRequest, NextResponse } from 'next/server';
import { getDraftChanges, updateDraftStatus, bulkApproveDrafts } from '@/lib/youtubeAutomation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId') || undefined;
    const drafts = getDraftChanges(channelId);
    return NextResponse.json({ success: true, drafts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.bulkApprove) {
      const count = bulkApproveDrafts(body.channelId);
      return NextResponse.json({ success: true, count, message: `Approved ${count} pending changes.` });
    }

    const { draftId, status, editedValue } = body;
    if (!draftId || !status) {
      return NextResponse.json({ error: 'Missing draftId or status.' }, { status: 400 });
    }

    const updated = updateDraftStatus(draftId, status, editedValue);
    if (!updated) {
      return NextResponse.json({ error: 'Draft not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, draft: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
