// ============================================================
// Creator Nest — Instagram Graph API Helper
// src/lib/instagram.ts
// Requires creator to connect via Meta OAuth
// ============================================================

const IG_API_BASE = 'https://graph.instagram.com/v19.0';
const META_API_BASE = 'https://graph.facebook.com/v19.0';

// ── Fetch IG Business account basic stats ────────────────────
export async function fetchInstagramProfile(accessToken: string) {
  const fields = [
    'id', 'username', 'name', 'biography',
    'followers_count', 'follows_count', 'media_count',
    'profile_picture_url', 'website',
  ].join(',');

  const res = await fetch(`${IG_API_BASE}/me?fields=${fields}&access_token=${accessToken}`);
  if (!res.ok) throw new Error(`IG Profile error: ${res.status}`);
  const data = await res.json();

  return {
    instagram_handle:       String(data.username ?? ''),
    instagram_followers:    Number(data.followers_count ?? 0),
    instagram_posts_count:  Number(data.media_count ?? 0),
    website_url:            String(data.website ?? ''),
    bio:                    String(data.biography ?? ''),
  };
}

// ── Fetch IG Insights (last 30 days) ─────────────────────────
export async function fetchInstagramInsights(igUserId: string, accessToken: string) {
  const metrics = ['reach', 'impressions', 'follower_count', 'profile_views'].join(',');

  const res = await fetch(
    `${META_API_BASE}/${igUserId}/insights?` +
    `metric=${metrics}&period=days_28&access_token=${accessToken}`
  );

  if (!res.ok) throw new Error(`IG Insights error: ${res.status}`);
  const data = await res.json();

  const getValue = (name: string) => {
    const item = data.data?.find((d: { name: string; values: { value: number }[] }) => d.name === name);
    return item?.values?.slice(-1)?.[0]?.value ?? 0;
  };

  return {
    estimated_monthly_reach: getValue('reach'),
    monthly_impressions:     getValue('impressions'),
  };
}

// ── Fetch avg engagement from last N posts ───────────────────
export async function fetchInstagramMediaStats(igUserId: string, accessToken: string, limit = 20) {
  const fields = ['like_count', 'comments_count', 'plays', 'reach', 'saved', 'media_type'].join(',');

  const res = await fetch(
    `${META_API_BASE}/${igUserId}/media?` +
    `fields=${fields}&limit=${limit}&access_token=${accessToken}`
  );

  if (!res.ok) throw new Error(`IG Media error: ${res.status}`);
  const data = await res.json();

  const posts = data.data ?? [];
  if (posts.length === 0) return {};

  const reels  = posts.filter((p: { media_type: string }) => p.media_type === 'VIDEO' || p.media_type === 'REELS');
  const images = posts.filter((p: { media_type: string }) => p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM');

  const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const allLikes    = posts.map((p: { like_count: number })     => p.like_count    ?? 0);
  const allComments = posts.map((p: { comments_count: number }) => p.comments_count ?? 0);
  const allSaved    = posts.map((p: { saved: number })          => p.saved          ?? 0);
  const reelViews   = reels.map((r: { plays: number })          => r.plays          ?? 0);

  return {
    ig_avg_post_likes:    avg(allLikes),
    ig_avg_post_comments: avg(allComments),
    ig_saves_rate:        avg(allSaved),
    ig_avg_reel_views:    avg(reelViews),
  };
}

// ── Compute IG engagement rate ────────────────────────────────
export function computeIGEngagementRate(
  avgLikes: number,
  avgComments: number,
  followers: number
): number {
  if (followers === 0) return 0;
  return Number((((avgLikes + avgComments) / followers) * 100).toFixed(2));
}

// ── Exchange short-lived token for long-lived token ──────────
export async function exchangeForLongLivedToken(shortToken: string): Promise<string> {
  const appId     = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) throw new Error('META credentials not set');

  const res = await fetch(
    `${IG_API_BASE}/access_token?` +
    `grant_type=ig_exchange_token` +
    `&client_secret=${appSecret}` +
    `&access_token=${shortToken}`
  );

  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to exchange token');
  return data.access_token;
}
