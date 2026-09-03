// ============================================================
// POST /api/creator/ai-enrich
// Trigger Gemini AI enrichment for one creator
// ============================================================

/** Safely serialize errors — handles Supabase error objects */
function serializeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try { return JSON.stringify(err); } catch { return 'Unknown error'; }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enrichCreatorProfile } from '@/lib/gemini';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { creatorId, force = false } = await req.json() as { creatorId: string; force?: boolean };

    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId required' }, { status: 400 });
    }

    const decodedId = decodeURIComponent(creatorId);
    const cleanHandle = decodedId.replace(/^@/, '');

    // 1. Try direct ID match
    let { data: creator, error } = await supabaseAdmin
      .from('creator_roster')
      .select('*')
      .eq('id', decodedId)
      .maybeSingle();

    // 2. Fall back to handle/display_name match
    if (!creator) {
      const { data: handleMatch } = await supabaseAdmin
        .from('creator_roster')
        .select('*')
        .or(`youtube_handle.ilike.%${cleanHandle}%,insta_handle.ilike.%${cleanHandle}%,display_name.ilike.%${cleanHandle}%`)
        .limit(1)
        .maybeSingle();
      if (handleMatch) creator = handleMatch;
    }

    if (!creator) {
      return NextResponse.json({ error: `Creator not found for: ${decodedId}` }, { status: 404 });
    }

    // Skip if enriched within last 72 hours (unless forced)
    if (!force && creator.ai_last_enriched) {
      const lastEnriched = new Date(creator.ai_last_enriched);
      const hoursSince   = (Date.now() - lastEnriched.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 72) {
        return NextResponse.json({
          success: true,
          skipped: true,
          reason: `Enriched ${Math.round(hoursSince)}h ago — next run in ${Math.round(72 - hoursSince)}h`,
        });
      }
    }

    // Build past brands list
    const pastBrands = Array.isArray(creator.past_brand_collabs)
      ? creator.past_brand_collabs.map((c: { brand: string }) => c.brand).slice(0, 5)
      : [];

    // Determine audience age range string
    const age1824 = creator.audience_age_18_24 ?? 0;
    const age2534 = creator.audience_age_25_34 ?? 0;
    const primaryAge = age2534 > age1824 ? '25–34' : '18–24';

    const genderSplit = creator.audience_gender_male > creator.audience_gender_female
      ? 'Male-skewed'
      : 'Female-skewed';

    // Run AI enrichment (all 4 tasks in parallel)
    const enriched = await enrichCreatorProfile({
      name:                   creator.name ?? creator.full_name ?? '',
      niche:                  creator.primary_niche ?? creator.niche ?? '',
      category:               creator.primary_category ?? '',
      youtubeHandle:          creator.youtube_handle ?? '',
      location:               creator.location ?? creator.location_city ?? '',
      language:               creator.primary_language ?? 'Hindi-English',
      contentStyle:           creator.content_style ?? '',
      uploadFrequency:        creator.upload_frequency ?? '',
      primaryPlatform:        creator.primary_platform ?? 'YouTube',
      subscribers:            creator.youtube_subscribers ?? creator.youtubeNum ?? 0,
      avgViews:               creator.yt_avg_views_per_video ?? creator.avg_views ?? 0,
      engagementRate:         creator.engagement_rate ?? 0,
      growthVelocity:         creator.growth_velocity ?? 'Stable',
      indiaPct:               creator.audience_india_pct ?? 80,
      audienceAge:            primaryAge,
      audienceGender:         genderSplit,
      pastBrands,
      openToCollab:           creator.open_to_collab ?? true,
      bestPerformingCategory: creator.best_performing_category ?? creator.niche ?? '',
    });

    // Save enriched data
    const realCreatorId = creator.id;
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('creator_roster')
      .update({
        ...enriched,
        ai_last_enriched:  new Date().toISOString(),
        data_last_updated: new Date().toISOString(),
        data_source:       'AI Enriched',
      })
      .eq('id', realCreatorId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      creator: updated,
      enriched,
    });

  } catch (err) {
    console.error('[/api/creator/ai-enrich]', err);
    return NextResponse.json({ error: serializeError(err) }, { status: 500 });
  }
}
