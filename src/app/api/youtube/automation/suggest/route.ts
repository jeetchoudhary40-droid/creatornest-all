import { NextRequest, NextResponse } from 'next/server';
import { generateAiSuggestions, AiProvider } from '@/lib/youtubeAutomation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channelTitle, channelDescription, flaggedVideos, provider, customKeys } = body;

    if (!channelTitle || !flaggedVideos) {
      return NextResponse.json({ error: 'Missing channelTitle or flaggedVideos.' }, { status: 400 });
    }

    const aiProvider: AiProvider = (['gemini', 'openai', 'claude', 'auto'] as const).includes(provider)
      ? (provider as AiProvider)
      : 'auto';

    const { drafts, providerUsed } = await generateAiSuggestions(
      channelTitle,
      channelDescription || '',
      flaggedVideos,
      aiProvider,
      customKeys
    );

    return NextResponse.json({ success: true, drafts, providerUsed });
  } catch (error: any) {
    console.error('AI suggestion error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate AI suggestions.' }, { status: 500 });
  }
}
