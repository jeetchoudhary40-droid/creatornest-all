// ============================================================
// Supabase Edge Function — score-creators
// Runs every Sunday at 1 AM IST via cron
// Recalculates creator_score + tier for all active creators
// supabase/functions/score-creators/index.ts
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl    = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const nextjsBaseUrl  = Deno.env.get('NEXTJS_BASE_URL')!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (_req) => {
  const startTime = Date.now();

  try {
    // Trigger full re-score via Next.js (runs scoring engine for all active)
    const res = await fetch(`${nextjsBaseUrl}/api/creator/score`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Key': serviceRoleKey },
      body:    JSON.stringify({}), // no creatorId = score all
    });

    const data = await res.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`[score-creators] Done: ${data.updated} creators re-scored in ${duration}s`);

    return new Response(
      JSON.stringify({ success: true, ...data, duration_sec: parseFloat(duration) }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
