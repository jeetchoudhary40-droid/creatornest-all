// ============================================================
// Supabase Edge Function — sync-creator-stats
// Runs daily at 2 AM IST via cron
// supabase/functions/sync-creator-stats/index.ts
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl     = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const youtubeApiKey   = Deno.env.get('YOUTUBE_API_KEY')!;
const nextjsBaseUrl   = Deno.env.get('NEXTJS_BASE_URL')!; // e.g. https://creatornest.in

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (_req) => {
  const startTime = Date.now();
  const results: { id: string; status: string; error?: string }[] = [];

  try {
    // 1. Get all creators with auto_sync_enabled
    const { data: creators, error } = await supabase
      .from('creator_roster')
      .select('id, name, youtube_channel_id, crm_status')
      .eq('auto_sync_enabled', true)
      .eq('crm_status', 'Active');

    if (error) throw error;

    console.log(`[sync-creator-stats] Syncing ${creators?.length ?? 0} creators`);

    // 2. Trigger YouTube sync for each creator via Next.js API
    for (const creator of creators ?? []) {
      try {
        const res = await fetch(`${nextjsBaseUrl}/api/creator/sync-youtube`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'X-Internal-Key': serviceRoleKey },
          body:    JSON.stringify({ creatorId: creator.id }),
        });

        if (res.ok) {
          results.push({ id: creator.id, status: 'synced' });
        } else {
          const err = await res.text();
          results.push({ id: creator.id, status: 'error', error: err });
        }

        // Rate limit: 1 req/sec to avoid YouTube API quota issues
        await new Promise(r => setTimeout(r, 1000));

      } catch (err) {
        results.push({ id: creator.id, status: 'error', error: String(err) });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const synced   = results.filter(r => r.status === 'synced').length;
    const errors   = results.filter(r => r.status === 'error').length;

    console.log(`[sync-creator-stats] Done: ${synced} synced, ${errors} errors in ${duration}s`);

    // 3. Log run to sync_log table
    await supabase.from('creator_sync_log').insert({
      run_type:      'youtube_daily',
      synced_count:  synced,
      error_count:   errors,
      duration_sec:  parseFloat(duration),
      ran_at:        new Date().toISOString(),
    }).throwOnError().then(() => {}).catch(() => {});

    return new Response(
      JSON.stringify({ success: true, synced, errors, duration_sec: parseFloat(duration) }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[sync-creator-stats] Fatal error:', err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
