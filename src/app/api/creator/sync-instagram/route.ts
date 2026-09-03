// ============================================================
// POST /api/creator/sync-instagram
// Triggers Instagram Graph API sync for one or all auto-sync creators
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  fetchInstagramProfile,
  fetchInstagramInsights,
  fetchInstagramMediaStats,
  computeIGEngagementRate,
} from '@/lib/instagram';
import { autoScoreCreator } from '@/lib/scoring';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { creatorId } = await req.json() as { creatorId?: string };

    // Fetch creators with Instagram token
    let query = supabaseAdmin
      .from('creator_roster')
      .select('id, name, instagram_handle, instagram_access_token, instagram_followers')
      .eq('auto_sync_enabled', true)
      .neq('instagram_access_token', '');

    if (creatorId) {
      query = query.eq('id', creatorId);
    }

    const { data: creators, error } = await query.limit(50);
    if (error) throw error;

    const results: { id: string; status: string; error?: string }[] = [];

    for (const creator of creators ?? []) {
      const token = creator.instagram_access_token;
      if (!token) {
        results.push({ id: creator.id, status: 'skipped', error: 'No IG access token' });
        continue;
      }

      try {
        // 1. Profile basics
        const profile = await fetchInstagramProfile(token);

        // 2. Get IG user ID from profile call
        const igRes = await fetch(
          `https://graph.instagram.com/v19.0/me?fields=id&access_token=${token}`
        );
        const igData = await igRes.json();
        const igUserId = igData.id;

        // 3. Insights (reach, impressions) - requires Business account
        let insights = {};
        try {
          insights = await fetchInstagramInsights(igUserId, token);
        } catch {
          // Personal accounts can't access insights — skip gracefully
        }

        // 4. Media engagement stats
        const mediaStats = await fetchInstagramMediaStats(igUserId, token, 20);

        // 5. Calculate engagement rate
        const ig_engagement_rate = computeIGEngagementRate(
          mediaStats.ig_avg_post_likes ?? 0,
          mediaStats.ig_avg_post_comments ?? 0,
          profile.instagram_followers
        );

        // 6. Follower growth
        const prevFollowers = creator.instagram_followers ?? 0;
        const newFollowers  = profile.instagram_followers;
        const ig_follower_growth_30d = newFollowers - prevFollowers;
        const ig_follower_growth_pct = prevFollowers > 0
          ? Number(((ig_follower_growth_30d / prevFollowers) * 100).toFixed(2))
          : 0;

        const updatePayload = {
          ...profile,
          ...insights,
          ...mediaStats,
          ig_engagement_rate,
          ig_follower_growth_30d,
          ig_follower_growth_pct,
          last_api_sync:     new Date().toISOString(),
          data_last_updated: new Date().toISOString(),
          data_source:       'Instagram API' as const,
          sync_error_log:    '',
        };

        // 7. Recalculate scores
        const { creator_score, creator_tier, total_reach, growth_velocity } =
          autoScoreCreator({ ...creator, ...updatePayload });

        await supabaseAdmin.from('creator_roster').update({
          ...updatePayload,
          creator_score,
          creator_tier,
          total_reach,
          growth_velocity,
        }).eq('id', creator.id);

        results.push({ id: creator.id, status: 'synced' });
      } catch (err) {
        const errMsg = String(err);
        await supabaseAdmin.from('creator_roster').update({
          sync_error_log: `IG sync error: ${errMsg}`,
        }).eq('id', creator.id);
        results.push({ id: creator.id, status: 'error', error: errMsg });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
