// ============================================================
// POST /api/creator/sync-youtube
// Triggers YouTube API sync for one or all auto-sync creators
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  fetchYouTubeChannelStats,
  fetchYouTubeAnalytics,
  fetchYouTubeAvgViews,
  resolveYouTubeHandle,
} from '@/lib/youtube';
import { autoScoreCreator } from '@/lib/scoring';

/** Safely serialize errors — handles Supabase error objects */
function serializeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try { return JSON.stringify(err); } catch { return 'Unknown error'; }
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getDateRange(daysBack: number) {
  const end   = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate:   end.toISOString().split('T')[0],
  };
}

export async function POST(req: NextRequest) {
  try {
    const { creatorId, force = false } = await req.json() as { creatorId?: string; force?: boolean };

    // ── Fetch target creators ───────────────────────────────────
    // When syncing a specific creator (manual trigger), skip auto_sync filter
    // and also support lookup by handle/display_name slug
    let creators: Record<string, unknown>[] | null = null;

    if (creatorId) {
      // 1. Try direct ID match
      let { data } = await supabaseAdmin
        .from('creator_roster')
        .select('id, name, full_name, youtube_channel_id, youtube_handle, youtube_access_token, youtube_subscribers')
        .eq('id', creatorId)
        .maybeSingle();

      // 2. Fall back to handle/display_name match
      if (!data) {
        const cleanHandle = decodeURIComponent(creatorId).replace(/^@/, '');
        const { data: handleMatch } = await supabaseAdmin
          .from('creator_roster')
          .select('id, name, full_name, youtube_channel_id, youtube_handle, youtube_access_token, youtube_subscribers')
          .or(`youtube_handle.ilike.%${cleanHandle}%,insta_handle.ilike.%${cleanHandle}%,display_name.ilike.%${cleanHandle}%`)
          .limit(1)
          .maybeSingle();
        if (handleMatch) data = handleMatch;
      }

      creators = data ? [data] : [];
    } else {
      // Batch sync — only auto-sync-enabled creators
      const { data, error } = await supabaseAdmin
        .from('creator_roster')
        .select('id, name, full_name, youtube_channel_id, youtube_handle, youtube_access_token, youtube_subscribers')
        .eq('auto_sync_enabled', true)
        .limit(50);
      if (error) throw new Error(serializeError(error));
      creators = data;
    }

    if (!creators || creators.length === 0) {
      return NextResponse.json({ success: true, results: [], message: 'No creators found to sync' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY!;
    const results: { id: string; status: string; error?: string }[] = [];

    for (const creator of creators) {
      let channelId = creator.youtube_channel_id as string;

      // Auto-resolve handle → channel ID if missing
      if (!channelId && creator.youtube_handle) {
        try {
          const resolved = await resolveYouTubeHandle(String(creator.youtube_handle));
          if (resolved) {
            channelId = resolved;
            // Persist the resolved channel ID for future syncs
            await supabaseAdmin.from('creator_roster').update({ youtube_channel_id: resolved }).eq('id', creator.id);
          }
        } catch (e) {
          console.warn(`[sync-youtube] Failed to resolve handle ${creator.youtube_handle}:`, e);
        }
      }

      if (!channelId) {
        results.push({ id: String(creator.id), status: 'skipped', error: 'No channel ID or resolvable handle' });
        continue;
      }

      try {
        // 1. Public channel stats (no auth)
        const channelStats = await fetchYouTubeChannelStats(channelId);

        // 2. Avg views from last 20 videos (no auth)
        const yt_avg_views_per_video = await fetchYouTubeAvgViews(channelId, apiKey, 20);

        // 3. Subscriber growth calculation
        const prevSubs = Number((creator as any).youtube_subscribers) || 0;
        const newSubs = Number(channelStats?.youtube_subscribers) || prevSubs;
        const yt_subscriber_growth_30d = newSubs - prevSubs;
        const yt_subscriber_growth_pct = prevSubs > 0
          ? Number(((yt_subscriber_growth_30d / prevSubs) * 100).toFixed(2))
          : 0;

        // 4. Analytics (only if creator has connected OAuth)
        let analyticsData = {};
        const accessToken = (creator as any).youtube_access_token ? String((creator as any).youtube_access_token) : '';
        if (accessToken) {
          const { startDate, endDate } = getDateRange(30);
          try {
            analyticsData = await fetchYouTubeAnalytics(channelId, accessToken, startDate, endDate);
          } catch {
            // Token may be expired — flag for re-auth
            await supabaseAdmin.from('creator_roster').update({
              sync_error_log: 'YouTube OAuth token expired — creator must re-connect',
            }).eq('id', (creator as any).id);
          }
        }

        // 5. Build update payload
        const update = {
          ...channelStats,
          ...analyticsData,
          yt_avg_views_per_video,
          yt_subscriber_growth_30d,
          yt_subscriber_growth_pct,
          last_api_sync:     new Date().toISOString(),
          data_last_updated: new Date().toISOString(),
          data_source:       'YouTube API' as const,
          sync_error_log:    '',
        };

        // 6. Recalculate scores
        const { creator_score, creator_tier, total_reach, growth_velocity } =
          autoScoreCreator({ ...creator, ...update });

        await supabaseAdmin.from('creator_roster').update({
          ...update,
          creator_score,
          creator_tier,
          total_reach,
          growth_velocity,
        }).eq('id', creator.id);

        results.push({ id: String(creator.id), status: 'synced' });
      } catch (err) {
        const errMsg = serializeError(err);
        console.error(`[sync-youtube] Error syncing creator ${creator.id}:`, err);
        await supabaseAdmin.from('creator_roster').update({
          sync_error_log: errMsg,
        }).eq('id', creator.id);
        results.push({ id: String(creator.id), status: 'error', error: errMsg });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('[/api/creator/sync-youtube] Uncaught error:', err);
    return NextResponse.json({ error: serializeError(err) }, { status: 500 });
  }
}
