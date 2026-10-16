import { NextRequest, NextResponse } from 'next/server';
import { fetchChannelWithVideos, runRulesEngine } from '@/lib/youtubeAutomation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channelHandle } = body;

    if (!channelHandle || typeof channelHandle !== 'string') {
      return NextResponse.json({ error: 'Please provide a valid YouTube channel handle or URL.' }, { status: 400 });
    }

    const { channel, videos } = await fetchChannelWithVideos(channelHandle);
    const ruleEvaluation = runRulesEngine(channel, videos);

    const auditResponse = {
      channelId: channel.id,
      title: channel.snippet?.title || '',
      handle: channel.snippet?.customUrl || `@${channelHandle.replace(/^@/, '')}`,
      avatarUrl: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || '',
      bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || '',
      description: channel.snippet?.description || '',
      subscribers: parseInt(channel.statistics?.subscriberCount || '0', 10),
      totalViews: parseInt(channel.statistics?.viewCount || '0', 10),
      videoCount: parseInt(channel.statistics?.videoCount || '0', 10),
      isMonetized: ruleEvaluation.monetizationScore >= 80 && ruleEvaluation.yppMetrics.subscriberThresholdMet,
      videos: ruleEvaluation.auditedVideos,
      ...ruleEvaluation,
    };

    return NextResponse.json({ success: true, audit: auditResponse });
  } catch (error: any) {
    console.error('Audit automation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to audit YouTube channel.' }, { status: 500 });
  }
}
