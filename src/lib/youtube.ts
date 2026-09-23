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

// ── ISO 8601 Duration Parser ──────────────────────────────────
export function parseIsoDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// ── Types for Channel Analysis ────────────────────────────────
export interface AnalyzedVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  erPct: number;
  durationSec: number;
  isShort: boolean;
  thumbnailUrl: string;
}

export interface DetectedNiche {
  id: string;
  name: string;
  benchmarkEr: number;
  baseCpmMin: number;
  baseCpmMax: number;
  source: string;
}

export interface ChannelAnalysisResult {
  channelId: string;
  title: string;
  handle: string;
  description: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  avatarUrl: string;
  bannerUrl: string;
  country: string;
  countryName: string;
  contactEmail: string;
  detectedNiche: DetectedNiche;
  analyzedVideos: AnalyzedVideo[];
  metrics: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    trueEngagementRate: number;
    likeToViewRatio: number;
    commentToViewRatio: number;
    sampleSize: number;
  };
}

// ── Niche Classifier: Inspects YouTube Topics, Upload Categories & Keywords ──
export function detectChannelNiche(channel: any, rawVideos: any[]): DetectedNiche {
  const topicCategories = (channel.topicDetails?.topicCategories || []) as string[];
  const topicString = topicCategories.join(' ').toLowerCase();

  const title = (channel.snippet?.title || '').toLowerCase();
  const desc = (channel.snippet?.description || '').toLowerCase();
  const keywords = (channel.brandingSettings?.channel?.keywords || '').toLowerCase();
  const combinedText = `${title} ${desc} ${keywords} ${topicString}`;

  // 1. Check YouTube Topic Categories (Official Wikipedia Topics)
  if (topicString.includes('music') || topicString.includes('song')) {
    return { id: 'music', name: 'Music & Songs', benchmarkEr: 1.5, baseCpmMin: 90, baseCpmMax: 200, source: 'Official YouTube Topic (Music)' };
  }
  if (topicString.includes('video_game') || topicString.includes('gaming')) {
    return { id: 'gaming', name: 'Gaming & Esports', benchmarkEr: 4.5, baseCpmMin: 180, baseCpmMax: 350, source: 'Official YouTube Topic (Gaming)' };
  }
  if (topicString.includes('technology')) {
    return { id: 'tech', name: 'Tech & Gadgets', benchmarkEr: 3.8, baseCpmMin: 400, baseCpmMax: 800, source: 'Official YouTube Topic (Technology)' };
  }
  if (topicString.includes('society') || topicString.includes('politics')) {
    return { id: 'news', name: 'News & Current Affairs', benchmarkEr: 1.8, baseCpmMin: 100, baseCpmMax: 220, source: 'Official YouTube Topic (Society/News)' };
  }

  // 2. Check video categoryId from recent uploads
  const catCounts: Record<string, number> = {};
  rawVideos.forEach((v) => {
    const cid = v.snippet?.categoryId;
    if (cid) catCounts[cid] = (catCounts[cid] || 0) + 1;
  });
  const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCats[0]?.[0];

  if (topCat === '10') {
    return { id: 'music', name: 'Music & Songs', benchmarkEr: 1.5, baseCpmMin: 90, baseCpmMax: 200, source: 'Upload Category (Music)' };
  }
  if (topCat === '20') {
    return { id: 'gaming', name: 'Gaming & Esports', benchmarkEr: 4.5, baseCpmMin: 180, baseCpmMax: 350, source: 'Upload Category (Gaming)' };
  }
  if (topCat === '27') {
    return { id: 'education', name: 'Education & Civics', benchmarkEr: 2.2, baseCpmMin: 220, baseCpmMax: 500, source: 'Upload Category (Education)' };
  }
  if (topCat === '28') {
    return { id: 'tech', name: 'Tech & Gadgets', benchmarkEr: 3.8, baseCpmMin: 400, baseCpmMax: 800, source: 'Upload Category (Science & Tech)' };
  }
  if (topCat === '23') {
    return { id: 'comedy', name: 'Comedy & Entertainment', benchmarkEr: 4.8, baseCpmMin: 140, baseCpmMax: 280, source: 'Upload Category (Comedy)' };
  }
  if (topCat === '17') {
    return { id: 'fitness', name: 'Fitness & Sports', benchmarkEr: 4.0, baseCpmMin: 300, baseCpmMax: 650, source: 'Upload Category (Sports)' };
  }
  if (topCat === '25') {
    return { id: 'news', name: 'News & Current Affairs', benchmarkEr: 1.8, baseCpmMin: 100, baseCpmMax: 220, source: 'Upload Category (News)' };
  }
  if (topCat === '24') {
    return { id: 'entertainment', name: 'Entertainment & Film', benchmarkEr: 3.0, baseCpmMin: 120, baseCpmMax: 260, source: 'Upload Category (Entertainment)' };
  }

  // 3. Keyword / description matching
  if (/song|music|audio|album|singer|beat|lyrics|t-series|saga hits|soundtrack|dj|rap/.test(combinedText)) {
    return { id: 'music', name: 'Music & Songs', benchmarkEr: 1.5, baseCpmMin: 90, baseCpmMax: 200, source: 'Channel Keywords (Music)' };
  }
  if (/game|gaming|gameplay|esports|streamer|free fire|bgmi|minecraft/.test(combinedText)) {
    return { id: 'gaming', name: 'Gaming & Esports', benchmarkEr: 4.5, baseCpmMin: 180, baseCpmMax: 350, source: 'Channel Keywords (Gaming)' };
  }
  if (/voter|census|janganana|blo|scheme|yojana|sarkari|government|election|exam|upsc|gk|tutorial|study/.test(combinedText)) {
    return { id: 'education', name: 'Education & Civics', benchmarkEr: 2.2, baseCpmMin: 220, baseCpmMax: 500, source: 'Channel Content (Civics/Govt Schemes)' };
  }
  if (/finance|stock|crypto|trading|investing|mutual fund|sip|budget|earning|business|startup/.test(combinedText)) {
    return { id: 'finance', name: 'Finance & Business', benchmarkEr: 3.2, baseCpmMin: 600, baseCpmMax: 1400, source: 'Channel Keywords (Finance)' };
  }
  if (/tech|coding|software|gadget|ai|mobile|unboxing|phone review|computer/.test(combinedText)) {
    return { id: 'tech', name: 'Tech & Gadgets', benchmarkEr: 3.8, baseCpmMin: 400, baseCpmMax: 800, source: 'Channel Keywords (Technology)' };
  }
  if (/fitness|workout|gym|diet|bodybuilding|yoga|health/.test(combinedText)) {
    return { id: 'fitness', name: 'Fitness & Health', benchmarkEr: 4.0, baseCpmMin: 300, baseCpmMax: 650, source: 'Channel Keywords (Fitness)' };
  }
  if (/vlog|travel|fashion|beauty|makeup|lifestyle|food|cooking|recipe/.test(combinedText)) {
    return { id: 'lifestyle', name: 'Lifestyle & Travel', benchmarkEr: 3.9, baseCpmMin: 250, baseCpmMax: 500, source: 'Channel Keywords (Lifestyle)' };
  }
  if (/comedy|funny|roast|prank|memes/.test(combinedText)) {
    return { id: 'comedy', name: 'Comedy & Entertainment', benchmarkEr: 4.8, baseCpmMin: 140, baseCpmMax: 280, source: 'Channel Keywords (Comedy)' };
  }

  // Default fallback
  return { id: 'entertainment', name: 'Entertainment & Film', benchmarkEr: 3.0, baseCpmMin: 120, baseCpmMax: 260, source: 'General Entertainment' };
}

// ── Universal YouTube Channel & Video Analysis ────────────────
export async function analyzeYouTubeChannel(
  query: string,
  options: { maxVideos?: number; filterShorts?: boolean } = {}
): Promise<ChannelAnalysisResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not configured in environment.');

  const maxVideos = options.maxVideos ?? 15;
  const filterShorts = options.filterShorts ?? false;

  // 1. Clean input query
  let clean = query.trim();
  // Strip URL prefixes if full URL provided
  clean = clean.replace(/^https?:\/\/(www\.)?youtube\.com\//, '');
  clean = clean.replace(/^https?:\/\/studio\.youtube\.com\/channel\//, '');
  clean = clean.replace(/^(channel|c|user)\//, '');
  clean = clean.split(/[?#/]/)[0]; // strip trailing paths/query

  let channelUrl = '';
  if (clean.startsWith('UC') && clean.length === 24) {
    channelUrl = `${YT_API_BASE}/channels?part=snippet,statistics,brandingSettings,contentDetails,topicDetails&id=${clean}&key=${apiKey}`;
  } else {
    const handle = clean.replace(/^@/, '');
    channelUrl = `${YT_API_BASE}/channels?part=snippet,statistics,brandingSettings,contentDetails,topicDetails&forHandle=${handle}&key=${apiKey}`;
  }

  const chanRes = await fetch(channelUrl, { next: { revalidate: 1800 } });
  if (!chanRes.ok) throw new Error(`YouTube API error (${chanRes.status}): Failed to fetch channel`);
  const chanData = await chanRes.json();
  const channel = chanData.items?.[0];

  if (!channel) {
    // If handle lookup didn't match directly, attempt fallback search
    const searchRes = await fetch(
      `${YT_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(clean)}&maxResults=1&key=${apiKey}`
    );
    const searchData = await searchRes.json();
    const fallbackId = searchData.items?.[0]?.snippet?.channelId;
    if (!fallbackId) {
      throw new Error(`No YouTube channel found matching "${query}". Please check the handle or channel URL.`);
    }
    return analyzeYouTubeChannel(fallbackId, options);
  }

  const channelId = channel.id;
  const snippet = channel.snippet;
  const stats = channel.statistics;
  const contentDetails = channel.contentDetails;

  const uploadsPlaylistId = contentDetails?.relatedPlaylists?.uploads || channelId.replace(/^UC/, 'UU');

  // 2. Fetch recent uploads from the uploads playlist (costs only 1 quota unit)
  const playlistRes = await fetch(
    `${YT_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${Math.min(maxVideos + 5, 25)}&key=${apiKey}`,
    { next: { revalidate: 1800 } }
  );

  let videoItems: any[] = [];
  if (playlistRes.ok) {
    const plData = await playlistRes.json();
    videoItems = plData.items || [];
  }

  const videoIds = videoItems.map(item => item.contentDetails?.videoId).filter(Boolean);

  if (videoIds.length === 0) {
    const detectedNiche = detectChannelNiche(channel, []);
    const emailMatch = (snippet.description || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const contactEmail = emailMatch ? emailMatch[0] : '';
    const countryName = snippet.country === 'IN' ? 'India' : snippet.country === 'US' ? 'United States' : snippet.country === 'GB' ? 'United Kingdom' : snippet.country === 'CA' ? 'Canada' : snippet.country || '';

    return {
      channelId,
      title: snippet.title || 'YouTube Channel',
      handle: snippet.customUrl || `@${clean}`,
      description: snippet.description || '',
      subscribers: parseInt(stats.subscriberCount || '0', 10),
      totalViews: parseInt(stats.viewCount || '0', 10),
      videoCount: parseInt(stats.videoCount || '0', 10),
      avatarUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
      bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || '',
      country: snippet.country || 'IN',
      countryName,
      contactEmail,
      detectedNiche,
      analyzedVideos: [],
      metrics: {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        avgViews: 0,
        avgLikes: 0,
        avgComments: 0,
        trueEngagementRate: 0,
        likeToViewRatio: 0,
        commentToViewRatio: 0,
        sampleSize: 0,
      },
    };
  }

  // 3. Batch fetch video statistics & duration (costs only 1 quota unit for up to 50 videos)
  const videosRes = await fetch(
    `${YT_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`,
    { next: { revalidate: 1800 } }
  );

  let rawVideos: any[] = [];
  if (videosRes.ok) {
    const vData = await videosRes.json();
    rawVideos = vData.items || [];
  }

  // 4. Map & calculate per-video metrics
  const analyzedVideos: AnalyzedVideo[] = [];
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;

  for (const v of rawVideos) {
    const vStats = v.statistics || {};
    const vSnippet = v.snippet || {};
    const vDetails = v.contentDetails || {};

    const views = parseInt(vStats.viewCount || '0', 10);
    const likes = parseInt(vStats.likeCount || '0', 10);
    const comments = parseInt(vStats.commentCount || '0', 10);
    const durationSec = parseIsoDuration(vDetails.duration || '');
    const isShort = durationSec > 0 && durationSec <= 60;

    if (filterShorts && isShort) continue;

    const erPct = views > 0 ? Number((((likes + comments) / views) * 100).toFixed(2)) : 0;

    analyzedVideos.push({
      videoId: v.id,
      title: vSnippet.title || 'Untitled Video',
      publishedAt: vSnippet.publishedAt?.split('T')[0] || '',
      views,
      likes,
      comments,
      erPct,
      durationSec,
      isShort,
      thumbnailUrl: vSnippet.thumbnails?.medium?.url || vSnippet.thumbnails?.default?.url || '',
    });

    totalViews += views;
    totalLikes += likes;
    totalComments += comments;

    if (analyzedVideos.length >= maxVideos) break;
  }

  const sampleSize = analyzedVideos.length;
  const avgViews = sampleSize > 0 ? Math.round(totalViews / sampleSize) : 0;
  const avgLikes = sampleSize > 0 ? Math.round(totalLikes / sampleSize) : 0;
  const avgComments = sampleSize > 0 ? Math.round(totalComments / sampleSize) : 0;

  const trueEngagementRate = totalViews > 0 ? Number((((totalLikes + totalComments) / totalViews) * 100).toFixed(2)) : 0;
  const likeToViewRatio = totalViews > 0 ? Number(((totalLikes / totalViews) * 100).toFixed(2)) : 0;
  const commentToViewRatio = totalViews > 0 ? Number(((totalComments / totalViews) * 100).toFixed(2)) : 0;

  // Detect accurate niche and extract verified profile fields
  const detectedNiche = detectChannelNiche(channel, rawVideos);
  const emailMatch = (snippet.description || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const contactEmail = emailMatch ? emailMatch[0] : '';
  const countryName = snippet.country === 'IN' ? 'India' : snippet.country === 'US' ? 'United States' : snippet.country === 'GB' ? 'United Kingdom' : snippet.country === 'CA' ? 'Canada' : snippet.country || '';

  return {
    channelId,
    title: snippet.title || 'YouTube Channel',
    handle: snippet.customUrl || `@${clean}`,
    description: snippet.description || '',
    subscribers: parseInt(stats.subscriberCount || '0', 10),
    totalViews: parseInt(stats.viewCount || '0', 10),
    videoCount: parseInt(stats.videoCount || '0', 10),
    avatarUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
    bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || '',
    country: snippet.country || 'IN',
    countryName,
    contactEmail,
    detectedNiche,
    analyzedVideos,
    metrics: {
      totalViews,
      totalLikes,
      totalComments,
      avgViews,
      avgLikes,
      avgComments,
      trueEngagementRate,
      likeToViewRatio,
      commentToViewRatio,
      sampleSize,
    },
  };
}
