// ============================================================
// Creator Nest — Gemini AI Helper
// src/lib/gemini.ts
// Powers AI enrichment of creator profiles
// ============================================================

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-2.0-flash'; // upgraded from 1.5-flash for better reliability

interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }> };
  }>;
}

/** Retry helper with exponential backoff */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, baseDelayMs = 1000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Retry exhausted'); // unreachable
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  return withRetry(async () => {
    const res = await fetch(
      `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Gemini error (${res.status}): ${JSON.stringify(err)}`);
    }

    const data: GeminiResponse = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  });
}

// ── 1. Generate SEO Keywords ──────────────────────────────────
export async function generateSEOKeywords(creator: {
  name: string;
  niche: string;
  category: string;
  youtubeHandle: string;
  location: string;
  language: string;
}): Promise<string[]> {
  const prompt = `
You are an expert YouTube SEO strategist for the Indian creator market.

Creator Profile:
- Name: ${creator.name}
- Niche: ${creator.niche}
- Category: ${creator.category}
- YouTube Handle: ${creator.youtubeHandle}
- Location: ${creator.location}, India
- Content Language: ${creator.language}

Generate exactly 12 YouTube SEO keywords/phrases this creator currently ranks for OR should strongly target to grow their channel.
Focus on Hindi/Indian audience search behavior.

Return ONLY a valid JSON array of strings, no explanation:
["keyword 1", "keyword 2", ...]
`;

  try {
    const raw = await callGemini(prompt);
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

// ── 2. Generate Growth Insight ────────────────────────────────
export async function generateGrowthInsight(creator: {
  name: string;
  niche: string;
  subscribers: number;
  avgViews: number;
  engagementRate: number;
  growthVelocity: string;
  uploadFrequency: string;
  bestPerformingCategory: string;
}): Promise<string> {
  const prompt = `
You are a senior creator growth strategist.

Creator Stats:
- Name: ${creator.name}
- Niche: ${creator.niche}
- Subscribers: ${creator.subscribers.toLocaleString()}
- Avg Views: ${creator.avgViews.toLocaleString()}
- Engagement Rate: ${creator.engagementRate}%
- Growth Momentum: ${creator.growthVelocity}
- Upload Frequency: ${creator.uploadFrequency}
- Best Performing: ${creator.bestPerformingCategory}

Write 2 concise, specific, actionable sentences that give this creator their most important growth insight right now.
Be data-driven. Mention specific numbers when useful. No fluff.

Return ONLY a JSON object: {"insight": "...2 sentences here..."}
`;

  try {
    const raw = await callGemini(prompt);
    const parsed = JSON.parse(raw);
    return String(parsed.insight ?? '');
  } catch {
    return '';
  }
}

// ── 3. Generate Brand Fit Summary ─────────────────────────────
export async function generateBrandFitSummary(creator: {
  name: string;
  niche: string;
  subscribers: number;
  audienceAge: string;
  audienceGender: string;
  indiaPct: number;
  engagementRate: number;
  pastBrands: string[];
  openToCollab: boolean;
}): Promise<string> {
  const prompt = `
You are a brand partnership manager writing a pitch for a creator.

Creator Profile:
- Name: ${creator.name}
- Content Niche: ${creator.niche}
- Total Reach: ${creator.subscribers.toLocaleString()} subscribers
- Audience: ${creator.audienceAge} age group, ${creator.audienceGender}
- India Audience: ${creator.indiaPct}%
- Engagement Rate: ${creator.engagementRate}% (industry avg: 2-4%)
- Past Brand Deals: ${creator.pastBrands.join(', ') || 'None listed'}
- Currently Accepting Deals: ${creator.openToCollab ? 'Yes' : 'No'}

Write 2 professional sentences that a brand manager would read to quickly decide if this creator fits their campaign.
Highlight unique value. Mention real numbers. Professional tone.

Return ONLY a JSON object: {"summary": "...2 sentences here..."}
`;

  try {
    const raw = await callGemini(prompt);
    const parsed = JSON.parse(raw);
    return String(parsed.summary ?? '');
  } catch {
    return '';
  }
}

// ── 4. Generate Content Suggestions ──────────────────────────
export async function generateContentSuggestions(creator: {
  name: string;
  niche: string;
  primaryPlatform: string;
  bestPerformingCategory: string;
  contentStyle: string;
  uploadFrequency: string;
  language: string;
}): Promise<string[]> {
  const prompt = `
You are a top content strategist for Indian creators.

Creator:
- Niche: ${creator.niche}
- Platform: ${creator.primaryPlatform}
- Best Content Type: ${creator.bestPerformingCategory}
- Content Style: ${creator.contentStyle}
- Upload Frequency: ${creator.uploadFrequency}
- Language: ${creator.language}

Generate exactly 6 specific, creative video/reel ideas for this creator that:
1. Fit their niche and style
2. Have high viral potential for Indian audience
3. Are achievable and practical

Return ONLY a valid JSON array of strings (each is a video title/concept):
["Idea 1", "Idea 2", ...]
`;

  try {
    const raw = await callGemini(prompt);
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

// ── 5. Full Profile Enrichment (all 4 tasks in parallel) ─────
export async function enrichCreatorProfile(creator: {
  name: string;
  niche: string;
  category: string;
  youtubeHandle: string;
  location: string;
  language: string;
  contentStyle: string;
  uploadFrequency: string;
  primaryPlatform: string;
  subscribers: number;
  avgViews: number;
  engagementRate: number;
  growthVelocity: string;
  indiaPct: number;
  audienceAge: string;
  audienceGender: string;
  pastBrands: string[];
  openToCollab: boolean;
  bestPerformingCategory: string;
}): Promise<{
  seo_keywords:          string[];
  ai_growth_insight:     string;
  ai_brand_fit_summary:  string;
  ai_content_suggestions: string[];
}> {
  // Run all 4 AI tasks in parallel for speed
  const [seoKeywords, growthInsight, brandFitSummary, contentSuggestions] = await Promise.allSettled([
    generateSEOKeywords({
      name:          creator.name,
      niche:         creator.niche,
      category:      creator.category,
      youtubeHandle: creator.youtubeHandle,
      location:      creator.location,
      language:      creator.language,
    }),
    generateGrowthInsight({
      name:                   creator.name,
      niche:                  creator.niche,
      subscribers:            creator.subscribers,
      avgViews:               creator.avgViews,
      engagementRate:         creator.engagementRate,
      growthVelocity:         creator.growthVelocity,
      uploadFrequency:        creator.uploadFrequency,
      bestPerformingCategory: creator.bestPerformingCategory,
    }),
    generateBrandFitSummary({
      name:           creator.name,
      niche:          creator.niche,
      subscribers:    creator.subscribers,
      audienceAge:    creator.audienceAge,
      audienceGender: creator.audienceGender,
      indiaPct:       creator.indiaPct,
      engagementRate: creator.engagementRate,
      pastBrands:     creator.pastBrands,
      openToCollab:   creator.openToCollab,
    }),
    generateContentSuggestions({
      name:                   creator.name,
      niche:                  creator.niche,
      primaryPlatform:        creator.primaryPlatform,
      bestPerformingCategory: creator.bestPerformingCategory,
      contentStyle:           creator.contentStyle,
      uploadFrequency:        creator.uploadFrequency,
      language:               creator.language,
    }),
  ]);

  return {
    seo_keywords:           seoKeywords.status          === 'fulfilled' ? seoKeywords.value          : [],
    ai_growth_insight:      growthInsight.status        === 'fulfilled' ? growthInsight.value         : '',
    ai_brand_fit_summary:   brandFitSummary.status      === 'fulfilled' ? brandFitSummary.value       : '',
    ai_content_suggestions: contentSuggestions.status   === 'fulfilled' ? contentSuggestions.value    : [],
  };
}
