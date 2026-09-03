// ============================================================
// POST /api/creator/score
// Recalculate creator_score, tier, reach, completeness for one or all
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { autoScoreCreator } from '@/lib/scoring';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { creatorId } = await req.json() as { creatorId?: string };

    // Score one or all creators
    let query = supabaseAdmin
      .from('creator_roster')
      .select('*');

    if (creatorId) {
      query = query.eq('id', creatorId);
    } else {
      query = query.eq('crm_status', 'Active').limit(200);
    }

    const { data: creators, error } = await query;
    if (error) throw error;

    let updated = 0;

    for (const creator of creators ?? []) {
      const { creator_score, creator_tier, total_reach, growth_velocity, profile_completeness_pct } =
        autoScoreCreator(creator);

      await supabaseAdmin.from('creator_roster').update({
        creator_score,
        creator_tier,
        total_reach,
        growth_velocity,
        profile_completeness_pct,
        data_last_updated: new Date().toISOString(),
      }).eq('id', creator.id);

      updated++;
    }

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET /api/creator/score?id=xxx — get score breakdown for one creator
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get('id');
  if (!creatorId) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { data: creator } = await supabaseAdmin
    .from('creator_roster')
    .select('*')
    .eq('id', creatorId)
    .single();

  if (!creator) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { autoScoreCreator: _, calculateCreatorScore } = await import('@/lib/scoring');
  const breakdown = calculateCreatorScore(creator);

  return NextResponse.json({ breakdown, tier: creator.creator_tier });
}
