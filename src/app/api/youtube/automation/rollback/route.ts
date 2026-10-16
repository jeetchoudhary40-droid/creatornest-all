import { NextRequest, NextResponse } from 'next/server';
import { rollbackChange, getChangeLogs } from '@/lib/youtubeAutomation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId') || undefined;
    const logs = getChangeLogs(channelId);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { logId, accessToken } = body;

    if (!logId) {
      return NextResponse.json({ error: 'Missing logId.' }, { status: 400 });
    }

    const result = await rollbackChange(logId, accessToken);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
