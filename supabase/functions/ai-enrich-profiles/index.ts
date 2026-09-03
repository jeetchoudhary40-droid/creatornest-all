// ============================================================
// Supabase Edge Function — ai-enrich-profiles
// Runs every Wednesday at 3 AM IST via cron
// supabase/functions/ai-enrich-profiles/index.ts
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl    = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const nextjsBaseUrl  = Deno.env.get('NEXTJS_BASE_URL')!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (_req) => {
  const startTime = Date.now();

  try {
    // Get creators where AI hasn't run in 72+ hours OR never enriched
    const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    const { data: creators, error } = await supabase
      .from('creator_roster')
      .select('id, name, crm_status, ai_last_enriched')
      .eq('crm_status', 'Active')
      .or(`ai_last_enriched.is.null,ai_last_enriched.lt.${cutoff}`)
      .order('creator_score', { ascending: false }) // Enrich top creators first
      .limit(30); // Process max 30/run to respect Gemini rate limits

    if (error) throw error;

    console.log(`[ai-enrich-profiles] Enriching ${creators?.length ?? 0} creators`);

    const results: { id: string; status: string }[] = [];

    for (const creator of creators ?? []) {
      try {
        const res = await fetch(`${nextjsBaseUrl}/api/creator/ai-enrich`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'X-Internal-Key': serviceRoleKey },
          body:    JSON.stringify({ creatorId: creator.id, force: true }),
        });

        results.push({ id: creator.id, status: res.ok ? 'enriched' : 'error' });

        // Rate limit: Gemini free tier = 60 req/min → 2s between calls
        await new Promise(r => setTimeout(r, 2000));

      } catch (err) {
        results.push({ id: creator.id, status: 'error' });
        console.error(`Failed to enrich ${creator.id}:`, err);
      }
    }

    const enriched = results.filter(r => r.status === 'enriched').length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`[ai-enrich-profiles] Done: ${enriched} enriched in ${duration}s`);

    return new Response(
      JSON.stringify({ success: true, enriched, total: creators?.length, duration_sec: parseFloat(duration) }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
