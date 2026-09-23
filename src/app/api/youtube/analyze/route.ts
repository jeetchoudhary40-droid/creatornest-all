// ============================================================
// Creator Nest — Universal YouTube Analysis API Route
// GET/POST /api/youtube/analyze?query=@electionguide
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeYouTubeChannel } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || searchParams.get('channel') || searchParams.get('handle');
    const maxVideos = parseInt(searchParams.get('maxVideos') || '15', 10);
    const filterShorts = searchParams.get('filterShorts') === 'true';

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameter (e.g. ?query=@electionguide or channel URL)' },
        { status: 400 }
      );
    }

    const result = await analyzeYouTubeChannel(query, { maxVideos, filterShorts });

    // Calculate sponsorship rate projections based on verified metrics
    const avgViews = result.metrics.avgViews;
    const er = result.metrics.trueEngagementRate;

    // Benchmark CPM band calibrated to detected niche (INR ₹)
    const baseCpmMin = result.detectedNiche.baseCpmMin || 180;
    const baseCpmMax = result.detectedNiche.baseCpmMax || 350;
    const erBonus = er > 3.5 ? 1.3 : er > 2.0 ? 1.15 : 1.0;

    const rateDedicatedMin = Math.round((avgViews / 1000) * baseCpmMin * erBonus * 1.5);
    const rateDedicatedMax = Math.round((avgViews / 1000) * baseCpmMax * erBonus * 1.8);
    const rateIntegrationMin = Math.round((avgViews / 1000) * baseCpmMin * erBonus * 0.7);
    const rateIntegrationMax = Math.round((avgViews / 1000) * baseCpmMax * erBonus * 0.9);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        sponsorshipEstimates: {
          rateDedicatedMin: Math.max(rateDedicatedMin, 3000),
          rateDedicatedMax: Math.max(rateDedicatedMax, 6000),
          rateIntegrationMin: Math.max(rateIntegrationMin, 1500),
          rateIntegrationMax: Math.max(rateIntegrationMax, 3500),
          currency: 'INR',
          symbol: '₹',
        },
      },
    });
  } catch (error: any) {
    console.error('[/api/youtube/analyze] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze YouTube channel' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query || body.channel || body.handle;
    const maxVideos = body.maxVideos ? parseInt(body.maxVideos, 10) : 15;
    const filterShorts = Boolean(body.filterShorts);

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Missing required query in request body' },
        { status: 400 }
      );
    }

    const result = await analyzeYouTubeChannel(query, { maxVideos, filterShorts });

    const avgViews = result.metrics.avgViews;
    const er = result.metrics.trueEngagementRate;
    const baseCpmMin = result.detectedNiche.baseCpmMin || 180;
    const baseCpmMax = result.detectedNiche.baseCpmMax || 350;
    const erBonus = er > 3.5 ? 1.3 : er > 2.0 ? 1.15 : 1.0;

    const rateDedicatedMin = Math.round((avgViews / 1000) * baseCpmMin * erBonus * 1.5);
    const rateDedicatedMax = Math.round((avgViews / 1000) * baseCpmMax * erBonus * 1.8);
    const rateIntegrationMin = Math.round((avgViews / 1000) * baseCpmMin * erBonus * 0.7);
    const rateIntegrationMax = Math.round((avgViews / 1000) * baseCpmMax * erBonus * 0.9);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        sponsorshipEstimates: {
          rateDedicatedMin: Math.max(rateDedicatedMin, 3000),
          rateDedicatedMax: Math.max(rateDedicatedMax, 6000),
          rateIntegrationMin: Math.max(rateIntegrationMin, 1500),
          rateIntegrationMax: Math.max(rateIntegrationMax, 3500),
          currency: 'INR',
          symbol: '₹',
        },
      },
    });
  } catch (error: any) {
    console.error('[/api/youtube/analyze] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze YouTube channel' },
      { status: 500 }
    );
  }
}
