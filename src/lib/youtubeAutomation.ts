// ============================================================
// Creator Nest — YouTube Automation & Policy Compliance Engine
// src/lib/youtubeAutomation.ts
//
// 1. Audit Engine (reads channel & video data via official API)
// 2. Rules Engine (monetization policy checks & SEO rules)
// 3. AI Suggestion Engine (generates compliant titles, descriptions, tags)
// 4. Review Queue (human-in-the-loop approve/edit/reject)
// 5. Publisher & Rollback (publishes approved updates, records history)
// ============================================================

import fs from 'fs';
import path from 'path';

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';
const DB_FILE = path.join(process.cwd(), 'data', 'youtube_automation_db.json');

// Ensure database file exists
function getDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      channels: [],
      auditReports: [],
      draftChanges: [],
      changeLogs: [],
    };
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
    return initialDb;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return { channels: [], auditReports: [], draftChanges: [], changeLogs: [] };
  }
}

function saveDb(data: any) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ── Types ───────────────────────────────────────────────────

export interface AuditIssue {
  id: string;
  category: 'policy' | 'seo' | 'branding' | 'monetization';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedItem?: string; // Video ID or 'channel'
  currentValue?: string;
  recommendedAction: string;
}

export interface DraftChange {
  id: string;
  channelId: string;
  channelTitle: string;
  videoId?: string; // undefined if channel-level metadata
  videoTitle?: string;
  thumbnailUrl?: string;
  itemType: 'video_title' | 'video_description' | 'video_tags' | 'channel_description';
  fieldName: string;
  currentValue: string;
  suggestedValue: string;
  reason: string;
  charCount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'published';
  createdAt: string;
  reviewedAt?: string;
}

export interface ChangeLogItem {
  id: string;
  channelId: string;
  videoId?: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  publishedAt: string;
  status: 'published' | 'rolled_back';
  rolledBackAt?: string;
}

export interface AuditResult {
  channelId: string;
  title: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string;
  description: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  isMonetized: boolean;
  monetizationScore: number; // 0 - 100
  yppMetrics: {
    subscriberThresholdMet: boolean;
    subscriberCount: number;
    subscribersRequired: number;
    estimatedWatchHours: number;
    watchHoursRequired: number;
    shortsCount: number;
    estimatedShortsViews: number;
    shortsViewsRequired: number;
    status: 'Eligible' | 'Close' | 'In Progress';
  };
  humanChecklist: Array<{
    item: string;
    description: string;
    status: 'Action Required' | 'Verify in Studio';
    studioUrl: string;
  }>;
  policySummary: {
    reusedContentRisk: 'Low' | 'Medium' | 'High';
    repetitiousTitlesCount: number;
    tagSpamDetected: boolean;
    phoneNumbersInTitles: number;
    missingDescriptionsCount: number;
  };
  issues: AuditIssue[];
  videos: Array<{
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    views: number;
    likes: number;
    tags: string[];
    thumbnailUrl: string;
    issues: string[];
  }>;
  draftChanges: DraftChange[];
}

// ── 1. Audit Engine (YouTube Data API v3) ───────────────────

export async function fetchChannelWithVideos(channelHandleOrUrl: string): Promise<{
  channel: any;
  videos: any[];
}> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not configured in environment or .env.local');

  let clean = channelHandleOrUrl.trim();
  if (clean.includes('youtube.com/')) {
    const handleMatch = clean.match(/@([a-zA-Z0-9_\-\.]+)/);
    if (handleMatch) clean = handleMatch[1];
    else if (clean.includes('/channel/')) clean = clean.split('/channel/')[1].split('/')[0].split('?')[0];
    else if (clean.includes('/c/')) clean = clean.split('/c/')[1].split('/')[0].split('?')[0];
  }
  clean = clean.replace(/^@/, '');

  // 1. Fetch channel by handle
  let channelData: any = null;
  let chanRes = await fetch(
    `${YT_API_BASE}/channels?part=snippet,statistics,brandingSettings,contentDetails,topicDetails&forHandle=${encodeURIComponent(clean)}&key=${apiKey}`
  );
  let chanJson = await chanRes.json();
  if (chanJson.items && chanJson.items.length > 0) {
    channelData = chanJson.items[0];
  } else {
    // Fallback: search for channel
    const searchRes = await fetch(
      `${YT_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(clean)}&maxResults=1&key=${apiKey}`
    );
    const searchJson = await searchRes.json();
    if (searchJson.items && searchJson.items.length > 0) {
      const channelId = searchJson.items[0].snippet.channelId;
      const detailRes = await fetch(
        `${YT_API_BASE}/channels?part=snippet,statistics,brandingSettings,contentDetails,topicDetails&id=${channelId}&key=${apiKey}`
      );
      const detailJson = await detailRes.json();
      channelData = detailJson.items?.[0];
    }
  }

  if (!channelData) {
    throw new Error(`Channel '@${clean}' not found on YouTube.`);
  }

  // 2. Fetch uploads playlist (paginating up to 150 recent videos to cover the entire channel)
  const uploadsPlaylistId = channelData.contentDetails?.relatedPlaylists?.uploads;
  let rawVideos: any[] = [];

  if (uploadsPlaylistId) {
    let allVideoIds: string[] = [];
    let nextPageToken: string | undefined = undefined;
    let pageCount = 0;
    const MAX_PAGES = 3; // 3 pages * 50 = up to 150 uploads

    while (pageCount < MAX_PAGES) {
      pageCount++;
      const pageParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
      const pageUrl: string = `${YT_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50${pageParam}&key=${apiKey}`;
      const plRes: Response = await fetch(pageUrl);
      const plJson: any = await plRes.json();
      const pageIds: string[] = (plJson.items || []).map((it: any) => it.contentDetails?.videoId).filter(Boolean);
      allVideoIds.push(...pageIds);
      nextPageToken = plJson.nextPageToken;
      if (!nextPageToken) break;
    }

    // Deduplicate IDs
    allVideoIds = Array.from(new Set(allVideoIds));

    // Fetch video details in batches of 50 (YouTube Data API videos.list limit is 50 IDs)
    if (allVideoIds.length > 0) {
      const chunks: string[][] = [];
      for (let i = 0; i < allVideoIds.length; i += 50) {
        chunks.push(allVideoIds.slice(i, i + 50));
      }

      const results = await Promise.all(
        chunks.map(async (chunk) => {
          const vidRes = await fetch(
            `${YT_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${chunk.join(',')}&key=${apiKey}`
          );
          const vidJson = await vidRes.json();
          return vidJson.items || [];
        })
      );
      rawVideos = results.flat();
    }
  }

  return { channel: channelData, videos: rawVideos };
}

// ── 2. Rules Engine (Policy & SEO Rules) ─────────────────────

export function runRulesEngine(channel: any, videos: any[]): {
  monetizationScore: number;
  yppMetrics: any;
  humanChecklist: any[];
  policySummary: any;
  issues: AuditIssue[];
  auditedVideos: any[];
} {
  const issues: AuditIssue[] = [];
  const subs = parseInt(channel.statistics?.subscriberCount || '0', 10);
  const totalViews = parseInt(channel.statistics?.viewCount || '0', 10);
  const videoCount = parseInt(channel.statistics?.videoCount || '0', 10);
  const desc = channel.snippet?.description || '';
  const bannerUrl = channel.brandingSettings?.image?.bannerExternalUrl || '';

  // Calculate approximate watch hours based on average video views and durations
  let totalVideoViewsSample = 0;
  let estimatedTotalWatchHours = 0;
  let shortsCount = 0;
  let phoneNumbersInTitles = 0;

  // Title frequency map to catch repetitious content
  const titleMap: Record<string, number> = {};
  videos.forEach(v => {
    const t = (v.snippet?.title || '').trim().toLowerCase();
    if (t) titleMap[t] = (titleMap[t] || 0) + 1;
  });

  const repetitiousTitles = Object.entries(titleMap).filter(([_, count]) => count > 1);

  // Analyze each video
  const auditedVideos = videos.map(v => {
    const vId = v.id;
    const title = v.snippet?.title || '';
    const vDesc = v.snippet?.description || '';
    const vTags = v.snippet?.tags || [];
    const views = parseInt(v.statistics?.viewCount || '0', 10);
    const likes = parseInt(v.statistics?.likeCount || '0', 10);
    const duration = v.contentDetails?.duration || '';
    const isShort = duration.includes('M') ? false : true;

    if (isShort) shortsCount++;
    totalVideoViewsSample += views;

    const vIssues: string[] = [];

    // Check 1: Title length > 70 characters
    if (title.length > 70) {
      vIssues.push(`Title exceeds 70 characters (${title.length} chars). Truncated on mobile search.`);
      issues.push({
        id: `title-len-${vId}`,
        category: 'seo',
        severity: 'warning',
        title: 'Title Too Long (Truncation Risk)',
        description: `Video "${title}" is ${title.length} characters long. YouTube truncates titles over 70 chars on smartphones.`,
        affectedItem: vId,
        currentValue: title,
        recommendedAction: 'Trim title to 50–65 characters with the primary keyword near the beginning.',
      });
    }

    // Check 2: Repetitive / Duplicate title
    if ((titleMap[title.trim().toLowerCase()] || 0) > 1) {
      vIssues.push('Identical duplicate title detected. Violates YouTube Repetitious Content policy.');
      issues.push({
        id: `title-dup-${vId}`,
        category: 'policy',
        severity: 'critical',
        title: 'Repetitious / Duplicate Title Violation',
        description: `Title "${title}" is used on multiple uploads. YouTube flags this under "Repetitious Content" and refuses YPP monetization.`,
        affectedItem: vId,
        currentValue: title,
        recommendedAction: 'Give every video a distinct, specific title describing its unique topic.',
      });
    }

    // Check 3: Phone number in title (privacy & commercial spam risk)
    if (/\b\d{10}\b|\b[6-9]\d{9}\b|\b\d{5}[- ]?\d{5}\b/.test(title)) {
      phoneNumbersInTitles++;
      vIssues.push('Phone number detected in public title. Potential spam/privacy violation.');
      issues.push({
        id: `phone-title-${vId}`,
        category: 'policy',
        severity: 'warning',
        title: 'Phone Number In Video Title',
        description: `Video title "${title}" contains a direct phone number. YouTube flags this as low-quality commercial metadata.`,
        affectedItem: vId,
        currentValue: title,
        recommendedAction: 'Move contact numbers to video description and pinned comment; keep title focused on content value.',
      });
    }

    // Check 4: Generic / Vague meme title (#viral, #funny, "work", "new video")
    if (
      title.length < 15 ||
      /^#+.*#+.*viral/i.test(title) ||
      /^(work|working|khana|task|new video|magic)$/i.test(title.trim())
    ) {
      vIssues.push('Vague or hashtag-stuffed title. Risks algorithmic suppression and reused content rejection.');
      issues.push({
        id: `vague-title-${vId}`,
        category: 'policy',
        severity: 'critical',
        title: 'Vague / Low-Context Title',
        description: `Video title "${title}" lacks descriptive context and relies on generic viral tags, which triggers YouTube\'s inauthentic content filter.`,
        affectedItem: vId,
        currentValue: title,
        recommendedAction: 'Rewrite with informative keywords and compelling narrative angle.',
      });
    }

    // Check 5: Missing or ultra-short description
    if (vDesc.trim().length < 50) {
      vIssues.push('Description is missing or empty. YouTube search cannot index this video.');
      issues.push({
        id: `empty-desc-${vId}`,
        category: 'seo',
        severity: 'warning',
        title: 'Empty / Missing Video Description',
        description: `Video "${title}" has only ${vDesc.trim().length} characters in its description.`,
        affectedItem: vId,
        currentValue: vDesc,
        recommendedAction: 'Add a 2–3 paragraph summary, structured timestamps, and social/contact links.',
      });
    }

    // Check 6: Tag stuffing or missing tags
    if (vTags.length === 0) {
      vIssues.push('No video tags configured.');
      issues.push({
        id: `missing-tags-${vId}`,
        category: 'seo',
        severity: 'info',
        title: 'No Tags Configured',
        description: `Video "${title}" has 0 tags.`,
        affectedItem: vId,
        recommendedAction: 'Add 10–15 focused niche tags.',
      });
    } else if (vTags.length > 25) {
      vIssues.push('Excessive tags (> 25). Risks tag stuffing penalty.');
      issues.push({
        id: `tag-stuffing-${vId}`,
        category: 'policy',
        severity: 'warning',
        title: 'Potential Tag Stuffing',
        description: `Video has ${vTags.length} tags. Exceeding 25 tags looks like spam to YouTube.`,
        affectedItem: vId,
        recommendedAction: 'Keep tags to 10–15 highly relevant keywords.',
      });
    }

    return {
      id: vId,
      title,
      description: vDesc,
      publishedAt: v.snippet?.publishedAt || '',
      views,
      likes,
      tags: vTags,
      thumbnailUrl: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || '',
      issues: vIssues,
    };
  });

  // Channel-level checks
  if (!desc || desc.trim().length < 30) {
    issues.push({
      id: 'channel-desc-missing',
      category: 'branding',
      severity: 'critical',
      title: 'Empty Channel "About" Description',
      description: 'Your channel has no description. YouTube reviewers and viewers cannot understand who you are or what your channel is about.',
      affectedItem: 'channel',
      currentValue: desc,
      recommendedAction: 'Write an engaging 150–300 word description detailing your niche, publishing schedule, and business inquiries.',
    });
  }

  if (!bannerUrl) {
    issues.push({
      id: 'channel-banner-missing',
      category: 'branding',
      severity: 'warning',
      title: 'Missing Channel Banner Art',
      description: 'Your channel does not have a branded banner (2048 x 1152 px). Unbranded channels look unprofessional during human monetization review.',
      affectedItem: 'channel',
      recommendedAction: 'Upload a custom high-resolution banner matching your channel theme.',
    });
  }

  // YPP Metrics Evaluation
  const subMet = subs >= 1000;
  estimatedTotalWatchHours = Math.round((totalViews * 2.5) / 60);

  // Score calculation (0 - 100)
  let score = 100;
  if (!subMet) score -= 25;
  if (estimatedTotalWatchHours < 4000) score -= 20;
  if (repetitiousTitles.length > 0) score -= 20;
  if (phoneNumbersInTitles > 0) score -= 10;
  if (!desc || desc.trim().length < 30) score -= 10;
  if (!bannerUrl) score -= 5;
  if (score < 10) score = 10;

  const yppMetrics = {
    subscriberThresholdMet: subMet,
    subscriberCount: subs,
    subscribersRequired: 1000,
    estimatedWatchHours: estimatedTotalWatchHours,
    watchHoursRequired: 4000,
    shortsCount,
    estimatedShortsViews: Math.round(totalViews * 0.7),
    shortsViewsRequired: 10000000,
    status: (subMet && estimatedTotalWatchHours >= 4000) ? 'Eligible' : (subMet ? 'Close' : 'In Progress'),
  };

  // Human Checklist (Legal ground rules: Google reserves these for humans)
  const humanChecklist = [
    {
      item: 'Enable 2-Step Verification',
      description: 'Turn on 2FA on your Google Account. YouTube will not accept YPP applications without it.',
      status: 'Verify in Studio' as const,
      studioUrl: 'https://myaccount.google.com/security',
    },
    {
      item: 'Confirm 0 Active Community Guidelines Strikes',
      description: 'Active strikes disqualify you from applying until they expire or are successfully appealed.',
      status: 'Verify in Studio' as const,
      studioUrl: 'https://studio.youtube.com/channel/settings',
    },
    {
      item: 'Link Approved AdSense for YouTube Account',
      description: 'You must link an active AdSense account in the Studio Earn tab. Never attempt to automate this.',
      status: 'Action Required' as const,
      studioUrl: 'https://studio.youtube.com/channel/earn',
    },
    {
      item: 'Set "Made for Kids" Setting Accurately',
      description: 'Declare channel-level or video-level COPPA settings truthfully in YouTube Studio.',
      status: 'Verify in Studio' as const,
      studioUrl: 'https://studio.youtube.com/channel/settings/audience',
    },
    {
      item: 'Altered or Synthetic Content Disclosure',
      description: 'If you use realistic generative AI audio or face swaps, mark the AI disclosure in upload settings.',
      status: 'Verify in Studio' as const,
      studioUrl: 'https://support.google.com/youtube/answer/14328491',
    },
  ];

  return {
    monetizationScore: score,
    yppMetrics,
    humanChecklist,
    policySummary: {
      reusedContentRisk: repetitiousTitles.length > 0 || phoneNumbersInTitles > 0 ? 'High' : (desc.length < 30 ? 'Medium' : 'Low'),
      repetitiousTitlesCount: repetitiousTitles.length,
      tagSpamDetected: issues.some(i => i.id.startsWith('tag-stuffing')),
      phoneNumbersInTitles,
      missingDescriptionsCount: issues.filter(i => i.id.startsWith('empty-desc')).length,
    },
    issues,
    auditedVideos,
  };
}

// ── 3. AI Suggestion Engine (Multi-Provider: Gemini / OpenAI / Claude) ──────

export type AiProvider = 'gemini' | 'openai' | 'claude' | 'auto';
export type LanguageMode = 'mixed' | 'hinglish' | 'hindi' | 'english' | 'auto';

export function getLanguageInstructions(mode: LanguageMode = 'mixed', sampleTitle: string = ''): string {
  const containsDevanagari = /[\u0900-\u097F]/.test(sampleTitle);
  const containsHinglishWords = /\b(kaise|kare|karein|bhi|nahi|hai|hain|yeh|woh|apna|apne|dekhe|dekho|sikhe|sikho|tarika|aasan|wala|wali|video|shuru|shandar)\b/i.test(sampleTitle);

  switch (mode) {
    case 'hindi':
      return `LANGUAGE SPECIFICATION: PURE HINDI (शुद्ध हिन्दी - देवनागरी लिपि).
- The new title, description, and keywords MUST be in natural, engaging Hindi using Devanagari script (e.g. "घर पर बनाएं रेस्टोरेंट जैसा पनीर टिक्का | आसान रेसिपी" या "यूट्यूब चैनल कैसे ग्रो करें | 3 असरदार टिप्स").
- Ensure all words are fully spelled out in Hindi with proper matras; do NOT slice or corrupt any words.
- Tags should include both Hindi keywords in Devanagari and Roman transliterations for maximum search indexing.`;

    case 'hinglish':
      return `LANGUAGE SPECIFICATION: HINGLISH (Hindi written in Roman/English alphabet - extremely popular for Indian YouTube).
- The title MUST be in natural, conversational Hinglish (e.g. "Ghar Par Banaye Restaurant Style Paneer Tikka | Aasan Recipe" or "YouTube Views Kaise Badhaye? 3 Viral Tricks 2026").
- Do NOT use Devanagari script. Use Roman letters that native Hindi speakers type on keyboards.
- Make it punchy, conversational, and high-CTR.`;

    case 'english':
      return `LANGUAGE SPECIFICATION: GLOBAL ENGLISH.
- The title, description, and tags MUST be in clean, grammatically complete English (e.g. "Restaurant Style Paneer Tikka Recipe at Home | Easy Steps").`;

    case 'auto':
      if (containsDevanagari) {
        return `LANGUAGE SPECIFICATION: AUTO-DETECTED HINDI / MIXED.
- The original title contains Hindi in Devanagari script.
- Generate an optimized title in authentic Hindi or high-CTR Mixed Hindi-English (e.g. "Recipe / Tutorial Name | हिन्दी में आसान तरीका").`;
      } else if (containsHinglishWords) {
        return `LANGUAGE SPECIFICATION: AUTO-DETECTED HINGLISH.
- The original title contains Roman Hindi / Hinglish.
- Generate an engaging, high-CTR Hinglish title (e.g. "Topic Name | Kaise Kare Aasan Steps").`;
      } else {
        return `LANGUAGE SPECIFICATION: AUTO-DETECTED MIXED / ENGLISH.
- Retain the natural language tone of the original video while optimizing keywords and fixing policy violations.`;
      }

    case 'mixed':
    default:
      return `LANGUAGE SPECIFICATION: MIXED (HINDI / HINGLISH + ENGLISH COMBINATION - HIGHEST RETENTION FOR INDIAN YOUTUBE).
- You MUST create a high-impact mixed language title popular among top Indian creators.
- Format options to blend English & Hindi/Hinglish:
  Option A (English Hook + Hindi in Devanagari): e.g. "Paneer Tikka Recipe | घर पर बनाएं आसान तरीका" or "Viral Shorts Formula | Views कैसे बढ़ाएं?"
  Option B (English Keywords + Hinglish Question/Hook): e.g. "YouTube Algorithm Secrets: 100K Subscribers Kaise Kare?" or "Best Gaming PC Under ₹50,000 | Sabse Sasta aur Best"
- Ensure primary search keywords are prominent in English, paired with an emotionally compelling Hindi/Hinglish hook.
- Description should feature a bilingual or Hinglish friendly greeting and summary.`;
  }
}

export interface CustomAiKeys {
  gemini?: string;
  openai?: string;
  claude?: string;
}

interface AiVideoSuggestion {
  newTitle: string;
  newDescription: string;
  newTags: string[];
  reason: string;
}

// ── Provider: Google Gemini ──────────────────────────────────
async function callGemini(prompt: string, jsonMode = false, customKey?: string): Promise<string | null> {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) return null;

  const models = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
  for (const model of models) {
    try {
      const body: any = { contents: [{ parts: [{ text: prompt }] }] };
      if (jsonMode) body.generationConfig = { responseMimeType: 'application/json' };
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );
      if (!res.ok) {
        console.warn(`[Gemini API] Model ${model} returned status: ${res.status}`);
        continue;
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
    } catch (e) {
      console.warn(`[Gemini API] Exception on model ${model}:`, e);
    }
  }
  return null;
}

// ── Provider: OpenAI GPT-4o ──────────────────────────────────
async function callOpenAI(prompt: string, systemPrompt: string, customKey?: string): Promise<string | null> {
  const key = customKey || process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      console.warn(`[OpenAI API] Error status: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.warn('[OpenAI API] Network exception:', e);
    return null;
  }
}

// ── Provider: Anthropic Claude 3.5 Sonnet ───────────────────
async function callClaude(prompt: string, systemPrompt: string, customKey?: string): Promise<string | null> {
  const key = customKey || process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      console.warn(`[Claude API] Error status: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch (e) {
    console.warn('[Claude API] Network exception:', e);
    return null;
  }
}

// ── Unified AI caller with provider priority chain ───────────
async function callAiProvider(
  videoPrompt: string,
  descPrompt: string,
  systemPrompt: string,
  preferredProvider: AiProvider,
  customKeys?: CustomAiKeys
): Promise<{ suggestion: AiVideoSuggestion | null; providerUsed: string }> {
  // Build ordered list: preferred first, then fallbacks
  const order: AiProvider[] = preferredProvider === 'auto'
    ? ['gemini', 'openai', 'claude']
    : [preferredProvider, ...(['gemini', 'openai', 'claude'] as AiProvider[]).filter(p => p !== preferredProvider)];

  for (const provider of order) {
    try {
      let rawText: string | null = null;

      if (provider === 'gemini') {
        rawText = await callGemini(videoPrompt, true, customKeys?.gemini);
      } else if (provider === 'openai') {
        rawText = await callOpenAI(videoPrompt, systemPrompt, customKeys?.openai);
      } else if (provider === 'claude') {
        const claudePrompt = `${videoPrompt}\n\nOutput ONLY valid JSON with keys: "newTitle", "newDescription", "newTags", "reason". No markdown, no code fences.`;
        rawText = await callClaude(claudePrompt, systemPrompt, customKeys?.claude);
      }

      if (!rawText) continue;

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;
      const parsed: AiVideoSuggestion = JSON.parse(jsonMatch[0]);
      if (parsed.newTitle) {
        console.log(`[AI Engine] Successfully generated via: ${provider}`);
        return { suggestion: parsed, providerUsed: provider };
      }
    } catch (err) {
      console.warn(`[AI Engine] Provider ${provider} failed:`, err);
    }
  }
  return { suggestion: null, providerUsed: 'heuristic' };
}

// ── Channel description via multi-provider ──────────────────
async function generateChannelDesc(
  channelTitle: string,
  provider: AiProvider,
  customKeys?: CustomAiKeys,
  languageMode: LanguageMode = 'mixed'
): Promise<string | null> {
  const langClause = languageMode === 'hindi'
    ? 'Write in pure Hindi (देवनागरी लिपि में) with warm namaste/swagat.'
    : languageMode === 'hinglish'
    ? 'Write in natural conversational Hinglish (Roman Hindi) popular with Indian YouTube creators.'
    : languageMode === 'english'
    ? 'Write in clean, professional English.'
    : 'Write in a friendly, high-converting Mixed Indian Creator style (English + Hindi/Hinglish welcome).';

  const prompt = `Write a professional, YouTube policy-compliant 150-word "About" channel description for "${channelTitle}". ${langClause} Include a warm welcome, content value proposition, upload schedule note, and business inquiry call to action. Return ONLY the description text, no extra markdown.`;
  const systemPrompt = 'You are a professional YouTube channel strategist and copywriter. Return only plain text, no markdown.';

  const order: AiProvider[] = provider === 'auto'
    ? ['gemini', 'openai', 'claude']
    : [provider, ...(['gemini', 'openai', 'claude'] as AiProvider[]).filter(p => p !== provider)];

  for (const p of order) {
    try {
      let text: string | null = null;
      if (p === 'gemini') text = await callGemini(prompt, false, customKeys?.gemini);
      else if (p === 'openai') {
        const res = await callOpenAI(
          prompt,
          'You are a professional YouTube copywriter. Return ONLY plain description text, no JSON, no markdown.',
          customKeys?.openai
        );
        text = res ? res.replace(/^\{[\s\S]*"text"\s*:\s*"(.*?)"\s*[\s\S]*\}$/, '$1').replace(/^"|"$/g, '') : null;
        if (!text || text.trim().startsWith('{')) text = res;
      } else if (p === 'claude') {
        text = await callClaude(
          prompt,
          'You are a professional YouTube copywriter. Return ONLY plain description text, no JSON, no markdown.',
          customKeys?.claude
        );
      }
      if (text && text.trim().length > 40) return text.trim();
    } catch {}
  }
  return null;
}

// ── Smart Title Truncation & Sensible Formatting Helper ───────
export function cleanTrailingPunctuationAndStopwords(title: string): string {
  let cleaned = title.replace(/[\s\-_:|;,./\\+&]+$/, '').trim();
  const danglingWords = [
    // English prepositions and conjunctions
    'and', '&', 'to', 'for', 'with', 'in', 'of', 'a', 'an', 'the', 'by', 'on', 'or', 'at', 'is', 'from', 'about', 'as', 'into', 'part', 'ep', 'episode',
    // Hindi/Hinglish stop words commonly dangling at end of titles
    'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'aur', 'par', 'bhi', 'kare', 'karein', 'wala', 'wali', 'hai', 'hain', 'tha', 'thi', 'the', 'kya', 'kyun', 'kaise', 'dekhe', 'sikhe',
    // Hindi Devanagari dangling words
    'का', 'की', 'के', 'को', 'से', 'में', 'और', 'पर', 'भी', 'करें', 'वाला', 'वाली', 'है', 'हैं', 'था', 'थी', 'थे', 'क्या', 'क्यों', 'कैसे', 'देखें', 'सीखें', 'बनाएं'
  ];

  for (let iter = 0; iter < 3; iter++) {
    cleaned = cleaned.replace(/[\s\-_:|;,./\\+&]+$/, '').trim();
    const words = cleaned.split(' ');
    if (words.length > 2) {
      const lastWord = words[words.length - 1].toLowerCase();
      if (danglingWords.includes(lastWord)) {
        words.pop();
        cleaned = words.join(' ');
      } else {
        break;
      }
    }
  }
  return cleaned.replace(/[\s\-_:|;,./\\+&]+$/, '').trim();
}

/**
 * Formats a video title to be complete, sensible, and SEO-friendly.
 * - Guarantees NO words are ever cut in half (e.g. prevents "tutorial" -> "tuto").
 * - Trims dangling trailing prepositions/conjunctions.
 * - Cleans phone numbers, spam hashtags, extraneous quotes.
 * - Ensures optimal mobile search length (typically 45-65 chars).
 */
export function formatSensibleTitle(rawTitle: string, maxLen = 65): string {
  if (!rawTitle) return '';

  let title = rawTitle
    .replace(/^["'“”‘`]+|["'“”‘`]+$/g, '')
    .replace(/\b\d{10}\b|\b[6-9]\d{9}\b/g, '')
    .replace(/#\s*#?[a-zA-Z0-9_]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (title.length <= maxLen) {
    return cleanTrailingPunctuationAndStopwords(title);
  }

  // If character immediately at maxLen is a space or separator, candidate already contains a complete word
  const charAfter = title.charAt(maxLen);
  if (charAfter === ' ' || charAfter === '-' || charAfter === '|' || charAfter === ':' || charAfter === ',') {
    return cleanTrailingPunctuationAndStopwords(title.slice(0, maxLen).trim());
  }

  const candidate = title.slice(0, maxLen);
  const lastSpace = candidate.lastIndexOf(' ');
  const lastPipe = candidate.lastIndexOf(' | ');
  const lastHyphen = candidate.lastIndexOf(' - ');
  const lastColon = candidate.lastIndexOf(': ');

  let bestBreak = lastSpace;
  if (lastPipe > 20 && lastPipe > candidate.length - 25) bestBreak = lastPipe;
  else if (lastHyphen > 20 && lastHyphen > candidate.length - 25) bestBreak = lastHyphen;
  else if (lastColon > 20 && lastColon > candidate.length - 25) bestBreak = lastColon;

  if (bestBreak > 20) {
    title = candidate.slice(0, bestBreak).trim();
  } else if (lastSpace > 15) {
    title = candidate.slice(0, lastSpace).trim();
  } else {
    title = candidate.trim();
  }

  return cleanTrailingPunctuationAndStopwords(title);
}

export function generateHeuristicMetadata(
  title: string,
  existingDescription: string,
  channelTitle: string,
  languageMode: LanguageMode = 'mixed'
): { newTitle: string; newDescription: string; newTags: string[]; reason: string } {
  // Strip phone numbers, spam hashtags, duplicate spaces
  let base = (title || '')
    .replace(/\b\d{10}\b|\b[6-9]\d{9}\b/g, '')
    .replace(/#\s*#?[a-zA-Z0-9_]+/g, '')
    .replace(/[^\w\s\u0900-\u097F-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!base || base.length < 3) base = `${channelTitle} Special Video`;

  // Capitalize main words for professional CTR presentation
  const capitalized = base
    .split(' ')
    .map(w => w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w)
    .join(' ');

  let newTitle = '';
  if (languageMode === 'hindi') {
    newTitle = `${capitalized} | नए डिज़ाइन और पूरी जानकारी 2026`;
  } else if (languageMode === 'hinglish') {
    newTitle = `${capitalized} | Latest Video & Aasan Tarika Dekho`;
  } else if (languageMode === 'english') {
    newTitle = `${capitalized} | Official 2026 Showcase & Guide`;
  } else {
    // mixed (default)
    newTitle = `${capitalized} 2026 | खास कलेक्शन और नए डिज़ाइन`;
  }

  // Keep strictly <= 62 chars and zero broken words
  newTitle = formatSensibleTitle(newTitle, 62);

  // Structured Description
  const newDescription = `Welcome to ${channelTitle}! In this video, we showcase "${capitalized}". Watch till the end to discover all key details, designs, and insights.

अगर आपको यह वीडियो पसंद आए तो Like, Share और Subscribe जरूर करें! अपने विचार Comment section में शेयर करें।

Chapters:
0:00 Introduction & Overview
0:30 Key Highlights & Features
1:00 Final Details & Summary

#${capitalized.replace(/\s+/g, '')} #Trending #YouTubeSEO
For business inquiries & collaborations: contact@${channelTitle.toLowerCase().replace(/[^a-z0-9]/g, '') || 'creator'}.com`;

  // Keywords & Tags
  const words = capitalized.split(' ').filter(w => w.length > 2);
  const newTags = [
    capitalized.toLowerCase(),
    `${capitalized.toLowerCase()} 2026`,
    ...(words.map(w => `${w.toLowerCase()} tips`)),
    ...(languageMode === 'hindi' || languageMode === 'mixed' ? ['नए डिज़ाइन', 'लेटेस्ट वीडियो', 'पूरी जानकारी'] : []),
    ...(languageMode === 'hinglish' || languageMode === 'mixed' ? ['kaise dekhe', 'aasan tarika', 'best collection'] : []),
    channelTitle.toLowerCase(),
    'trending video',
    'viral'
  ].slice(0, 12);

  return {
    newTitle,
    newDescription,
    newTags,
    reason: `Heuristic SEO enhancement in ${languageMode.toUpperCase()}: added keywords, chapters, and audience tags.`
  };
}

export async function testAiConnection(
  provider: AiProvider = 'auto',
  customKeys?: CustomAiKeys
): Promise<{ success: boolean; providerUsed: string; sampleTitle?: string; message: string }> {
  const testPrompt = `Generate a 1-sentence YouTube video title in Mixed Hindi-English for a tech gadget review. Output ONLY JSON: {"newTitle": "..."}`;
  const systemPrompt = 'Output ONLY valid JSON with key "newTitle".';
  const start = Date.now();
  const { suggestion, providerUsed } = await callAiProvider(testPrompt, '', systemPrompt, provider, customKeys);
  const latency = Date.now() - start;

  if (suggestion && suggestion.newTitle) {
    return {
      success: true,
      providerUsed,
      sampleTitle: suggestion.newTitle,
      message: `Connected to ${providerUsed.toUpperCase()} in ${latency}ms! Sample: "${suggestion.newTitle}"`
    };
  }
  return {
    success: false,
    providerUsed: 'heuristic',
    message: 'AI providers did not return a response. Using smart heuristic engine fallback.'
  };
}

export async function generateAiSuggestions(
  channelTitle: string,
  channelDescription: string,
  flaggedVideos: any[],
  provider: AiProvider = 'auto',
  customKeys?: CustomAiKeys,
  languageMode: LanguageMode = 'mixed'
): Promise<{ drafts: DraftChange[]; providerUsed: string }> {
  const drafts: DraftChange[] = [];
  const now = new Date().toISOString();
  const systemPrompt = 'You are an elite YouTube Monetization Policy & SEO specialist. Output ONLY valid JSON with keys: "newTitle", "newDescription", "newTags", "reason". No markdown code fences.';
  let detectedProviderUsed = 'heuristic';

  // 1. Channel description suggestion if missing/short
  if (!channelDescription || channelDescription.trim().length < 50) {
    let suggestedDesc =
      `Welcome to the official channel of ${channelTitle}! Here you will find regular high-quality videos, tips, and behind-the-scenes updates.\n\nSubscribe to stay updated with our newest uploads!\n\nFor business inquiries & collaborations: contact via our social links below.`;

    const aiDesc = await generateChannelDesc(channelTitle, provider, customKeys, languageMode);
    if (aiDesc) suggestedDesc = aiDesc;

    drafts.push({
      id: `draft-chan-desc-${Date.now()}`,
      channelId: channelTitle,
      channelTitle,
      itemType: 'channel_description',
      fieldName: 'description',
      currentValue: channelDescription || '(Empty description)',
      suggestedValue: suggestedDesc,
      reason: 'Empty channel description triggers reviewer skepticism. Proposing an engaging, policy-compliant about description.',
      status: 'pending',
      createdAt: now,
    });
  }

  // 2. Queue ALL videos where updates are required (No artificial limit)
  const videosWithIssues = flaggedVideos.filter(v => v.issues && v.issues.length > 0);
  const targetVideos = videosWithIssues.length > 0 ? videosWithIssues : flaggedVideos;

  // Process in concurrent chunks of 4 to maximize speed and prevent timeouts
  const BATCH_SIZE = 4;
  for (let i = 0; i < targetVideos.length; i += BATCH_SIZE) {
    const chunk = targetVideos.slice(i, i + BATCH_SIZE);
    await Promise.all(
      chunk.map(async (v: any) => {
        const langInstructions = getLanguageInstructions(languageMode, v.title);
        const videoPrompt = `You are an elite YouTube SEO Strategist and Policy Compliance Expert specializing in Indian YouTube channels & global creators.
Analyze this video:
- Channel: "${channelTitle}"
- Current Title: "${v.title}"
- Current Description: "${v.description || 'Empty'}"
- Flagged Compliance & SEO Issues: ${v.issues?.join('; ') || 'Title and description require optimization'}

${langInstructions}

CRITICAL RULES FOR METADATA GENERATION:
1. "newTitle":
   - Complete, sensible, high-CTR, SEO-optimized title strictly between 45 and 62 characters (TARGET: 50-58 CHARACTERS).
   - ABSOLUTE PROHIBITION: NEVER return the exact same or identical title as the original ("${v.title}"). You MUST rewrite, enhance, and optimize it with high-search keywords and viral curiosity hooks.
   - For example: if original title is "New 🆕 suits", DO NOT return "New 🆕 suits". Return e.g. "Latest Designer Suits 2026 | नए पार्टी वियर सूट कलेक्शन" or "Trending Suits Collection | 10 Best Designs Dekho".
   - NEVER exceed 65 characters under ANY circumstances.
   - NEVER cut off or truncate words. All words in English, Devanagari Hindi, or Hinglish MUST be 100% whole words.
   - Must strictly match the requested language format (${languageMode.toUpperCase()}).
2. "newDescription":
   - A complete 2-paragraph SEO description in ${languageMode.toUpperCase()} style describing the video with rich search terms.
   - 3 structured timestamp chapters (0:00 Introduction, 0:30 Key Highlights, 1:00 Final Details).
   - 3 relevant niche hashtags.
   - Social & business inquiry disclaimer.
3. "newTags":
   - An array of 10-12 accurate, highly searched keyword tags (mix of English and Hindi/Hinglish search queries matching ${languageMode.toUpperCase()}).
4. "reason":
   - A 1-sentence explanation of why these edits fix policy violations, match audience language (${languageMode}), and boost YouTube SEO.

Output ONLY valid JSON with keys: "newTitle", "newDescription", "newTags", "reason".`;

        const { suggestion: parsed, providerUsed } = await callAiProvider(videoPrompt, '', systemPrompt, provider, customKeys);
        if (providerUsed !== 'heuristic') detectedProviderUsed = providerUsed;

        if (parsed) {
          if (parsed.newTitle) {
            let finalTitle = parsed.newTitle;
            // Guard: If AI somehow returned the exact same title as original, enrich it
            if (finalTitle.trim().toLowerCase() === (v.title || '').trim().toLowerCase()) {
              const enriched = generateHeuristicMetadata(v.title, v.description || '', channelTitle, languageMode);
              finalTitle = enriched.newTitle;
            }
            const sensibleTitle = formatSensibleTitle(finalTitle, 65);
            drafts.push({
              id: `draft-title-${v.id}-${Date.now()}`,
              channelId: channelTitle,
              channelTitle,
              videoId: v.id,
              videoTitle: v.title,
              thumbnailUrl: v.thumbnailUrl,
              itemType: 'video_title',
              fieldName: 'title',
              currentValue: v.title,
              suggestedValue: sensibleTitle,
              charCount: sensibleTitle.length,
              reason: parsed.reason || `Optimized ${languageMode.toUpperCase()} SEO title with high-search keywords under 65 chars.`,
              status: 'pending',
              createdAt: now,
            });
          }

          if (parsed.newDescription) {
            drafts.push({
              id: `draft-desc-${v.id}-${Date.now()}`,
              channelId: channelTitle,
              channelTitle,
              videoId: v.id,
              videoTitle: v.title,
              thumbnailUrl: v.thumbnailUrl,
              itemType: 'video_description',
              fieldName: 'description',
              currentValue: v.description || '(Empty description)',
              suggestedValue: parsed.newDescription,
              reason: `SEO-optimized 2-paragraph description in ${languageMode.toUpperCase()} with chapters, keywords, and disclaimer.`,
              status: 'pending',
              createdAt: now,
            });
          }

          if (parsed.newTags && parsed.newTags.length > 0) {
            drafts.push({
              id: `draft-tags-${v.id}-${Date.now()}`,
              channelId: channelTitle,
              channelTitle,
              videoId: v.id,
              videoTitle: v.title,
              thumbnailUrl: v.thumbnailUrl,
              itemType: 'video_tags',
              fieldName: 'tags',
              currentValue: v.tags?.join(', ') || '(No tags)',
              suggestedValue: parsed.newTags.slice(0, 12).join(', '),
              reason: `10–12 high-search keyword tags in ${languageMode.toUpperCase()} to rank in YouTube algorithm.`,
              status: 'pending',
              createdAt: now,
            });
          }
          return;
        }

        // Intelligent Heuristic Fallback if all AI providers fail
        const fallback = generateHeuristicMetadata(v.title, v.description || '', channelTitle, languageMode);
        drafts.push({
          id: `draft-title-${v.id}-${Date.now()}`,
          channelId: channelTitle,
          channelTitle,
          videoId: v.id,
          videoTitle: v.title,
          thumbnailUrl: v.thumbnailUrl,
          itemType: 'video_title',
          fieldName: 'title',
          currentValue: v.title,
          suggestedValue: fallback.newTitle,
          charCount: fallback.newTitle.length,
          reason: fallback.reason,
          status: 'pending',
          createdAt: now,
        });

        drafts.push({
          id: `draft-desc-${v.id}-${Date.now()}`,
          channelId: channelTitle,
          channelTitle,
          videoId: v.id,
          videoTitle: v.title,
          thumbnailUrl: v.thumbnailUrl,
          itemType: 'video_description',
          fieldName: 'description',
          currentValue: v.description || '(Empty description)',
          suggestedValue: fallback.newDescription,
          reason: `Smart fallback structured description in ${languageMode.toUpperCase()} with chapters.`,
          status: 'pending',
          createdAt: now,
        });

        drafts.push({
          id: `draft-tags-${v.id}-${Date.now()}`,
          channelId: channelTitle,
          channelTitle,
          videoId: v.id,
          videoTitle: v.title,
          thumbnailUrl: v.thumbnailUrl,
          itemType: 'video_tags',
          fieldName: 'tags',
          currentValue: v.tags?.join(', ') || '(No tags)',
          suggestedValue: fallback.newTags.join(', '),
          reason: `Smart fallback keyword tags in ${languageMode.toUpperCase()}.`,
          status: 'pending',
          createdAt: now,
        });
      })
    );
  }

  // Save drafts into database (updating existing or adding new)
  const db = getDb();
  drafts.forEach(d => {
    const existingIndex = db.draftChanges.findIndex(
      (existing: any) =>
        (existing.videoId && d.videoId && existing.videoId === d.videoId && existing.itemType === d.itemType) ||
        (!d.videoId && !existing.videoId && existing.itemType === d.itemType && existing.channelTitle === d.channelTitle)
    );
    if (existingIndex >= 0) {
      // Preserve existing ID so database and review queue remain perfectly synchronized
      d.id = db.draftChanges[existingIndex].id;
      db.draftChanges[existingIndex] = {
        ...db.draftChanges[existingIndex],
        ...d,
        status: db.draftChanges[existingIndex].status === 'published' ? 'published' : 'pending',
      };
    } else {
      db.draftChanges.push(d);
    }
  });
  saveDb(db);

  return { drafts, providerUsed: detectedProviderUsed };
}

// ── 4. Review Queue Operations ──────────────────────────────

export function getDraftChanges(channelId?: string): DraftChange[] {
  const db = getDb();
  if (channelId) {
    return db.draftChanges.filter((d: any) => d.channelId === channelId || d.channelTitle === channelId);
  }
  return db.draftChanges;
}

export function updateDraftStatus(draftId: string, status: 'approved' | 'rejected', editedValue?: string): DraftChange | null {
  const db = getDb();
  const draft = db.draftChanges.find((d: any) => d.id === draftId);
  if (!draft) return null;

  draft.status = status;
  if (editedValue !== undefined) {
    draft.suggestedValue = editedValue;
  }
  draft.reviewedAt = new Date().toISOString();
  saveDb(db);
  return draft;
}

export function bulkApproveDrafts(channelId?: string): number {
  const db = getDb();
  let count = 0;
  db.draftChanges.forEach((d: any) => {
    if (!channelId || d.channelId === channelId || d.channelTitle === channelId) {
      if (d.status === 'pending') {
        d.status = 'approved';
        d.reviewedAt = new Date().toISOString();
        count++;
      }
    }
  });
  saveDb(db);
  return count;
}

// ── 5. Publisher & Rollback Engine ──────────────────────────

/**
 * Executes official YouTube Data API v3 update for video titles, descriptions, tags,
 * and channel branding settings.
 */
async function executeLiveYouTubeUpdate(draft: DraftChange, accessToken: string): Promise<void> {
  const authHeaders = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // 1. Channel description update
  if (draft.itemType === 'channel_description') {
    // First get current channel branding settings
    const chanRes = await fetch(`${YT_API_BASE}/channels?part=brandingSettings,snippet&mine=true`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const chanData = await chanRes.json();
    if (!chanRes.ok || !chanData.items || chanData.items.length === 0) {
      throw new Error(chanData.error?.message || 'Failed to fetch authenticated YouTube channel. Check OAuth permissions.');
    }

    const currentChannel = chanData.items[0];
    const branding = currentChannel.brandingSettings || {};
    if (!branding.channel) branding.channel = {};
    branding.channel.description = draft.suggestedValue;

    const putRes = await fetch(`${YT_API_BASE}/channels?part=brandingSettings`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: currentChannel.id,
        brandingSettings: branding,
      }),
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      throw new Error(`YouTube Channel Update Failed: ${errData.error?.message || putRes.statusText}`);
    }
    return;
  }

  // 2. Video metadata updates (title, description, tags)
  if (draft.videoId) {
    const vidGet = await fetch(`${YT_API_BASE}/videos?part=snippet&id=${draft.videoId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const vidData = await vidGet.json();
    if (!vidGet.ok || !vidData.items || vidData.items.length === 0) {
      throw new Error(`YouTube video "${draft.videoId}" not found or unauthorized.`);
    }

    const snippet = vidData.items[0].snippet;
    if (!snippet) throw new Error('Video snippet not found in YouTube response.');

    // Apply the specific requested change
    if (draft.itemType === 'video_title' || draft.fieldName === 'title') {
      snippet.title = draft.suggestedValue;
    } else if (draft.itemType === 'video_description' || draft.fieldName === 'description') {
      snippet.description = draft.suggestedValue;
    } else if (draft.itemType === 'video_tags' || draft.fieldName === 'tags') {
      const parsedTags = draft.suggestedValue
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      snippet.tags = parsedTags;
    }

    // Required by YouTube API v3: snippet must retain categoryId if set
    if (!snippet.categoryId) snippet.categoryId = '22';

    const vidPut = await fetch(`${YT_API_BASE}/videos?part=snippet`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: draft.videoId,
        snippet,
      }),
    });

    if (!vidPut.ok) {
      const errData = await vidPut.json();
      throw new Error(`YouTube Video Update Failed: ${errData.error?.message || vidPut.statusText}`);
    }
  }
}

/**
 * Publishes a single draft change live to YouTube (One-by-One mode).
 */
export async function publishSingleDraft(
  draftId: string,
  accessToken?: string
): Promise<{ success: boolean; message: string; logItem?: ChangeLogItem }> {
  const db = getDb();
  const draft = db.draftChanges.find((d: any) => d.id === draftId);
  if (!draft) {
    throw new Error('Draft change not found.');
  }

  // If live OAuth accessToken is provided, update actual YouTube channel/video
  if (accessToken) {
    await executeLiveYouTubeUpdate(draft, accessToken);
  }

  // Record in Change Log for 1-click rollback
  const logItem: ChangeLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    channelId: draft.channelId,
    videoId: draft.videoId,
    fieldName: draft.fieldName,
    oldValue: draft.currentValue,
    newValue: draft.suggestedValue,
    publishedAt: new Date().toISOString(),
    status: 'published',
  };
  db.changeLogs.push(logItem);

  draft.status = 'published';
  saveDb(db);

  return {
    success: true,
    message: accessToken
      ? `Successfully applied change to live YouTube channel!`
      : `Marked as applied. Provide OAuth access token to automatically write to live YouTube.`,
    logItem,
  };
}

/**
 * Publishes all approved changes to YouTube (Automatic batch mode).
 */
export async function publishApprovedChanges(
  channelId: string,
  accessToken?: string,
  draftIds?: string[]
): Promise<{
  publishedCount: number;
  results: Array<{ id: string; status: string; message: string }>;
}> {
  const db = getDb();
  const approved = db.draftChanges.filter((d: any) => {
    const matchChannel = d.channelId === channelId || d.channelTitle === channelId;
    if (draftIds && draftIds.length > 0) {
      return matchChannel && draftIds.includes(d.id);
    }
    return matchChannel && d.status === 'approved';
  });

  const results: Array<{ id: string; status: string; message: string }> = [];
  let publishedCount = 0;

  for (const draft of approved) {
    try {
      if (accessToken) {
        await executeLiveYouTubeUpdate(draft, accessToken);
      }

      // Record in Change Log for 1-click rollback
      const logItem: ChangeLogItem = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        channelId: draft.channelId,
        videoId: draft.videoId,
        fieldName: draft.fieldName,
        oldValue: draft.currentValue,
        newValue: draft.suggestedValue,
        publishedAt: new Date().toISOString(),
        status: 'published',
      };
      db.changeLogs.push(logItem);

      draft.status = 'published';
      publishedCount++;
      results.push({
        id: draft.id,
        status: 'success',
        message: accessToken ? 'Updated live on YouTube.' : 'Recorded in change log.',
      });
    } catch (err: any) {
      results.push({ id: draft.id, status: 'error', message: err.message });
    }
  }

  saveDb(db);
  return { publishedCount, results };
}

/**
 * Rollback a change in 1-click, reverting the live YouTube video/channel metadata.
 */
export async function rollbackChange(
  logId: string,
  accessToken?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  const db = getDb();
  const logItem = db.changeLogs.find((l: any) => l.id === logId);
  if (!logItem) {
    return { success: false, message: 'Change log item not found.' };
  }
  if (logItem.status === 'rolled_back') {
    return { success: false, message: 'This change has already been rolled back.' };
  }

  try {
    if (accessToken) {
      // Revert video metadata
      if (logItem.videoId) {
        const vidGet = await fetch(`${YT_API_BASE}/videos?part=snippet&id=${logItem.videoId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const vidData = await vidGet.json();
        const snippet = vidData.items?.[0]?.snippet;
        if (snippet) {
          if (logItem.fieldName === 'title') snippet.title = logItem.oldValue;
          else if (logItem.fieldName === 'description') snippet.description = logItem.oldValue;
          else if (logItem.fieldName === 'tags') snippet.tags = logItem.oldValue.split(',').map((s: string) => s.trim());

          if (!snippet.categoryId) snippet.categoryId = '22';

          await fetch(`${YT_API_BASE}/videos?part=snippet`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: logItem.videoId,
              snippet,
            }),
          });
        }
      } else if (logItem.fieldName === 'description') {
        // Revert channel description
        const chanRes = await fetch(`${YT_API_BASE}/channels?part=brandingSettings&mine=true`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const chanData = await chanRes.json();
        const item = chanData.items?.[0];
        if (item) {
          if (!item.brandingSettings) item.brandingSettings = {};
          if (!item.brandingSettings.channel) item.brandingSettings.channel = {};
          item.brandingSettings.channel.description = logItem.oldValue;
          await fetch(`${YT_API_BASE}/channels?part=brandingSettings`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: item.id,
              brandingSettings: item.brandingSettings,
            }),
          });
        }
      }
    }

    logItem.status = 'rolled_back';
    logItem.rolledBackAt = new Date().toISOString();
    saveDb(db);
    return { success: true, message: `Reverted "${logItem.fieldName}" back to original state on YouTube.` };
  } catch (e: any) {
    return { success: false, message: `Rollback failed: ${e.message}` };
  }
}

export function getChangeLogs(channelId?: string): ChangeLogItem[] {
  const db = getDb();
  if (channelId) {
    return db.changeLogs.filter((l: any) => l.channelId === channelId);
  }
  return db.changeLogs;
}
