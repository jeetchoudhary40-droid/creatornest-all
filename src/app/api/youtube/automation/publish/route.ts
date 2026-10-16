import { NextRequest, NextResponse } from 'next/server';
import { publishApprovedChanges, publishSingleDraft } from '@/lib/youtubeAutomation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channelId, draftId, draftIds, accessToken } = body;

    // 1. One-by-One Publishing Mode
    if (draftId) {
      const singleRes = await publishSingleDraft(draftId, accessToken);
      return NextResponse.json({
        success: true,
        publishedCount: 1,
        message: singleRes.message,
        logItem: singleRes.logItem,
      });
    }

    // 2. Batch Publishing Mode
    if (!channelId) {
      return NextResponse.json({ error: 'Missing channelId or draftId.' }, { status: 400 });
    }

    const { publishedCount, results } = await publishApprovedChanges(channelId, accessToken, draftIds);

    return NextResponse.json({
      success: true,
      publishedCount,
      results,
      message: `Successfully applied ${publishedCount} change(s). Changes are recorded in audit history and can be rolled back at any time.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
