// ============================================================
// Creator Nest — YouTube Data API v3 Helper
// src/lib/youtube.ts
// Fetches public channel stats + analytics (with OAuth token)
// ============================================================

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';
const YT_ANALYTICS_BASE = 'https://youtubeanalytics.googleapis.com/v2';

// ── Public channel data (no auth needed, just API key) ───────
export async function fetchYouTubeChannelStats(channelId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set');

  const res = await fetch(
    `${YT_API_BASE}/channels?part=statistics,snippet,brandingSettings&id=${channelId}&key=${apiKey}`,
    { next: { revalidate: 3600 } } // cache 1 hour
  );

  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();

  const channel = data.items?.[0];
  if (!channel) return null;

  const stats = channel.statistics;
  const snippet = channel.snippet;

  return {
    youtube_channel_id:    channelId,
    youtube_subscribers:   parseInt(stats.subscriberCount ?? '0'),
    youtube_total_views:   parseInt(stats.viewCount ?? '0'),
    youtube_video_count:   parseInt(stats.videoCount ?? '0'),
    display_name:          snippet.title ?? '',
    bio:                   snippet.description ?? '',
    cover_photo_url:       channel.brandingSettings?.image?.bannerExternalUrl ?? '',
    profile_photo_url:     snippet.thumbnails?.high?.url ?? '',
    creator_since:         snippet.publishedAt?.split('T')[0] ?? '',
  };
}

// ── Channel handle → channel ID lookup ───────────────────────
export async function resolveYouTubeHandle(handle: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set');

  // Strip @ prefix
  const cleanHandle = handle.replace(/^@/, '');

  const res = await fetch(
    `${YT_API_BASE}/channels?part=id&forHandle=${cleanHandle}&key=${apiKey}`
  );
  const data = await res.json();
  return data.items?.[0]?.id ?? null;
}

// ── Analytics (requires creator OAuth token) ─────────────────
export async function fetchYouTubeAnalytics(
  channelId: string,
  accessToken: string,
  startDate: string,   // 'YYYY-MM-DD'
  endDate: string      // 'YYYY-MM-DD'
) {
  const metrics = [
    'views', 'likes', 'comments', 'shares',
    'averageViewDuration', 'averageViewPercentage',
    'subscribersGained', 'subscribersLost',
    'impressions', 'impressionClickThroughRate',
  ].join(',');

  const res = await fetch(
    `${YT_ANALYTICS_BASE}/reports?` +
    `ids=channel==${channelId}` +
    `&startDate=${startDate}` +
    `&endDate=${endDate}` +
    `&metrics=${metrics}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`YouTube Analytics error: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const row = data.rows?.[0] ?? [];
  const cols = data.columnHeaders?.map((h: { name: string }) => h.name) ?? [];

  const getValue = (name: string) => {
    const idx = cols.indexOf(name);
    return idx >= 0 ? (row[idx] ?? 0) : 0;
  };

  const views       = getValue('views');
  const likes       = getValue('likes');
  const comments    = getValue('comments');
  const shares      = getValue('shares');
  const subsGained  = getValue('subscribersGained');
  const subsLost    = getValue('subscribersLost');

  return {
    yt_avg_watch_time_pct:    Number(getValue('averageViewPercentage').toFixed(1)),
    yt_avg_watch_time_sec:    Math.round(Number(getValue('averageViewDuration'))),
    yt_subscriber_growth_30d: Math.round(subsGained - subsLost),
    yt_like_rate:             views > 0 ? Number(((likes / views) * 100).toFixed(2))    : 0,
    yt_comment_rate:          views > 0 ? Number(((comments / views) * 100).toFixed(2)) : 0,
    yt_share_rate:            views > 0 ? Number(((shares / views) * 100).toFixed(2))   : 0,
    yt_engagement_rate:       views > 0 ? Number((((likes + comments + shares) / views) * 100).toFixed(2)) : 0,
    yt_click_through_rate:    Number(getValue('impressionClickThroughRate').toFixed(2)),
    monthly_impressions:      Math.round(Number(getValue('impressions'))),
  };
}

// ── Get avg views from last N videos ─────────────────────────
export async function fetchYouTubeAvgViews(
  channelId: string,
  apiKey: string,
  videoCount = 20
): Promise<number> {
  // Get latest videos
  const searchRes = await fetch(
    `${YT_API_BASE}/search?part=id&channelId=${channelId}&type=video&order=date&maxResults=${videoCount}&key=${apiKey}`
  );
  const searchData = await searchRes.json();
  const videoIds = searchData.items?.map((i: { id: { videoId: string } }) => i.id.videoId).join(',');

  if (!videoIds) return 0;

  // Get view counts
  const statsRes = await fetch(
    `${YT_API_BASE}/videos?part=statistics&id=${videoIds}&key=${apiKey}`
  );
  const statsData = await statsRes.json();
  const views = statsData.items?.map((v: { statistics: { viewCount: string } }) => parseInt(v.statistics.viewCount ?? '0')) ?? [];

  return views.length > 0 ? Math.round(views.reduce((a: number, b: number) => a + b, 0) / views.length) : 0;
}
