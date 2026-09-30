// ============================================================
// Creator Nest — YouTube Creator Auto-Profiling API
// POST /api/admin/creators/auto-profile
// Fetches full YouTube Data API metrics + AI Audience & Commercial Profiling
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeYouTubeChannel } from '@/lib/youtube';
import { verifyAdminRequest } from '@/lib/security';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-3.8-flash';

const TECH_NICHES = [
  'News & Media',
  'EdTech & App Reviews',
  'AI & Automation',
  'Mobile Apps Review',
  'SaaS & Cloud Tools',
  'Full-Stack & DevOps',
  'Tech & Gadgets',
  'FinTech & Growth',
  'Cybersecurity & Data',
];

interface AutoProfileResult {
  // Core Identity
  name: string;
  channelName: string;
  channelId: string;
  youtubeUrl: string;
  youtubeHandle: string;
  img: string;
  bannerUrl: string;
  bio: string;
  location: string;
  country: string;
  countryName: string;
  businessEmail: string;
  creatorSince: string;

  // Stats & Performance
  youtube: string;
  youtubeNum: number;
  totalViews: number;
  videoCount: number;
  avgViewsLast10: number;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  likeToViewRatio: number;
  commentToViewRatio: number;
  avd: string;
  sampleSize: number;

  // Niche & Categorization
  niche: string;
  niches: string[];
  detectedNiche: string;

  // Audience Demographics
  audience_india_pct: number;
  audience_tier1_city_pct: number;
  audience_top_countries: { country: string; pct: number }[];
  audience_top_cities: { city: string; pct: number }[];
  audience_age_13_17: number;
  audience_age_18_24: number;
  audience_age_25_34: number;
  audience_age_35_44: number;
  audience_age_45_plus: number;
  audience_gender_male: number;
  audience_gender_female: number;
  audience_income_segment: 'High' | 'Upper-Middle' | 'Middle' | 'Mass-Market';
  audience_interests: string[];

  // Commercials & Deal Rates (INR)
  deal_rate_dedicated_min: number;
  deal_rate_dedicated_max: number;
  deal_rate_integration_min: number;
  deal_rate_integration_max: number;
  deal_rate_short_min: number;
  deal_rate_short_max: number;
  brand_categories: string[];
  ai_brand_fit_summary: string;
  ai_growth_insight: string;

  // Creator Scoring
  creator_score: number;
  creator_tier: 'nano' | 'micro' | 'mid' | 'macro' | 'mega' | 'elite';
}

function formatCount(num: number): string {
  if (!num || isNaN(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

function getCreatorTier(subs: number): 'nano' | 'micro' | 'mid' | 'macro' | 'mega' | 'elite' {
  if (subs >= 10_000_000) return 'elite';
  if (subs >= 2_000_000) return 'mega';
  if (subs >= 500_000) return 'macro';
  if (subs >= 100_000) return 'mid';
  if (subs >= 10_000) return 'micro';
  return 'nano';
}

function calculateCreatorScore(subs: number, avgViews: number, er: number): number {
  let score = 50;
  // Subscribers contribution (up to 20 pts)
  if (subs > 1_000_000) score += 20;
  else if (subs > 100_000) score += 15;
  else if (subs > 25_000) score += 10;
  else score += 5;

  // Average views contribution (up to 20 pts)
  if (avgViews > 100_000) score += 20;
  else if (avgViews > 25_000) score += 15;
  else if (avgViews > 5_000) score += 10;
  else score += 5;

  // Engagement Rate contribution (up to 15 pts)
  if (er > 5.0) score += 15;
  else if (er > 3.0) score += 11;
  else if (er > 1.5) score += 7;
  else score += 3;

  return Math.min(Math.max(score, 45), 98);
}

function detectIndianLocation(text: string): { city: string; state: string; formatted: string; isLocal: boolean } | null {
  const t = text.toLowerCase();

  const locations: Array<{ pattern: RegExp; city: string; state: string }> = [
    // Rajasthan
    { pattern: /\bchuru\b/i, city: 'Churu', state: 'Rajasthan' },
    { pattern: /\bjaipur\b/i, city: 'Jaipur', state: 'Rajasthan' },
    { pattern: /\bjodhpur\b/i, city: 'Jodhpur', state: 'Rajasthan' },
    { pattern: /\bkota\b/i, city: 'Kota', state: 'Rajasthan' },
    { pattern: /\bbikaner\b/i, city: 'Bikaner', state: 'Rajasthan' },
    { pattern: /\bsikar\b/i, city: 'Sikar', state: 'Rajasthan' },
    { pattern: /\budaipur\b/i, city: 'Udaipur', state: 'Rajasthan' },
    { pattern: /\bajmer\b/i, city: 'Ajmer', state: 'Rajasthan' },
    { pattern: /\balwar\b/i, city: 'Alwar', state: 'Rajasthan' },
    { pattern: /\bhanumangarh\b/i, city: 'Hanumangarh', state: 'Rajasthan' },
    { pattern: /\bganganagar\b/i, city: 'Sri Ganganagar', state: 'Rajasthan' },
    { pattern: /\bbarmer\b/i, city: 'Barmer', state: 'Rajasthan' },
    { pattern: /\bkishangarh\b/i, city: 'Kishangarh', state: 'Rajasthan' },
    { pattern: /\bjhunjhunu\b/i, city: 'Jhunjhunu', state: 'Rajasthan' },
    { pattern: /\bnagaur\b/i, city: 'Nagaur', state: 'Rajasthan' },
    { pattern: /\brajasthan\b/i, city: 'Jaipur', state: 'Rajasthan' },

    // Delhi NCR & North
    { pattern: /\b(delhi|new delhi|ncr)\b/i, city: 'Delhi NCR', state: 'Delhi' },
    { pattern: /\bnoida\b/i, city: 'Noida', state: 'Uttar Pradesh' },
    { pattern: /\bgurgaon|gurugram\b/i, city: 'Gurugram', state: 'Haryana' },
    { pattern: /\bghaziabad\b/i, city: 'Ghaziabad', state: 'Uttar Pradesh' },
    { pattern: /\bchandigarh\b/i, city: 'Chandigarh', state: 'Punjab' },
    { pattern: /\bludhiana\b/i, city: 'Ludhiana', state: 'Punjab' },
    { pattern: /\bamritsar\b/i, city: 'Amritsar', state: 'Punjab' },
    { pattern: /\bjalandhar\b/i, city: 'Jalandhar', state: 'Punjab' },

    // UP & Bihar
    { pattern: /\blucknow\b/i, city: 'Lucknow', state: 'Uttar Pradesh' },
    { pattern: /\bkanpur\b/i, city: 'Kanpur', state: 'Uttar Pradesh' },
    { pattern: /\bvaranasi|banaras|kashi\b/i, city: 'Varanasi', state: 'Uttar Pradesh' },
    { pattern: /\bagra\b/i, city: 'Agra', state: 'Uttar Pradesh' },
    { pattern: /\bprayagraj|allahabad\b/i, city: 'Prayagraj', state: 'Uttar Pradesh' },
    { pattern: /\bgorakhpur\b/i, city: 'Gorakhpur', state: 'Uttar Pradesh' },
    { pattern: /\bmeerut\b/i, city: 'Meerut', state: 'Uttar Pradesh' },
    { pattern: /\bpatna\b/i, city: 'Patna', state: 'Bihar' },
    { pattern: /\bmuzaffarpur\b/i, city: 'Muzaffarpur', state: 'Bihar' },
    { pattern: /\bgaya\b/i, city: 'Gaya', state: 'Bihar' },

    // MP & Central
    { pattern: /\bindore\b/i, city: 'Indore', state: 'Madhya Pradesh' },
    { pattern: /\bbhopal\b/i, city: 'Bhopal', state: 'Madhya Pradesh' },
    { pattern: /\bjabalpur\b/i, city: 'Jabalpur', state: 'Madhya Pradesh' },
    { pattern: /\bgwalior\b/i, city: 'Gwalior', state: 'Madhya Pradesh' },
    { pattern: /\bujjain\b/i, city: 'Ujjain', state: 'Madhya Pradesh' },
    { pattern: /\braipur\b/i, city: 'Raipur', state: 'Chhattisgarh' },

    // Maharashtra & West
    { pattern: /\bmumbai|bombay\b/i, city: 'Mumbai', state: 'Maharashtra' },
    { pattern: /\bpune\b/i, city: 'Pune', state: 'Maharashtra' },
    { pattern: /\bnagpur\b/i, city: 'Nagpur', state: 'Maharashtra' },
    { pattern: /\bnashik\b/i, city: 'Nashik', state: 'Maharashtra' },
    { pattern: /\bahmedabad\b/i, city: 'Ahmedabad', state: 'Gujarat' },
    { pattern: /\bsurat\b/i, city: 'Surat', state: 'Gujarat' },
    { pattern: /\bvadodara\b/i, city: 'Vadodara', state: 'Gujarat' },
    { pattern: /\brajkot\b/i, city: 'Rajkot', state: 'Gujarat' },

    // South & East
    { pattern: /\bbengaluru|bangalore\b/i, city: 'Bengaluru', state: 'Karnataka' },
    { pattern: /\bhyderabad\b/i, city: 'Hyderabad', state: 'Telangana' },
    { pattern: /\bchennai|madras\b/i, city: 'Chennai', state: 'Tamil Nadu' },
    { pattern: /\bkolkata|calcutta\b/i, city: 'Kolkata', state: 'West Bengal' },
    { pattern: /\bkochi|cochin\b/i, city: 'Kochi', state: 'Kerala' },
    { pattern: /\bguwahati\b/i, city: 'Guwahati', state: 'Assam' },
    { pattern: /\branchi\b/i, city: 'Ranchi', state: 'Jharkhand' },
    { pattern: /\bbhubaneswar\b/i, city: 'Bhubaneswar', state: 'Odisha' },
    { pattern: /\bdehradun\b/i, city: 'Dehradun', state: 'Uttarakhand' },
  ];

  for (const loc of locations) {
    if (loc.pattern.test(t)) {
      return {
        city: loc.city,
        state: loc.state,
        formatted: `${loc.city}, ${loc.state}, India`,
        isLocal: true,
      };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const body = await req.json();
    const query = (body.query || body.url || body.handle || body.channel || '').trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Please enter a YouTube Channel URL, @Handle, or Channel ID.' },
        { status: 400 }
      );
    }

    // ── 1. Fetch channel stats & recent 20 videos via YouTube Data API v3 ──
    const ytData = await analyzeYouTubeChannel(query, { maxVideos: 25, filterShorts: false });

    const avgViews = ytData.metrics.avgViews;
    const er = ytData.metrics.trueEngagementRate;
    const subs = ytData.subscribers;
    const tier = getCreatorTier(subs);
    const creatorScore = calculateCreatorScore(subs, avgViews, er);

    // Heuristic benchmark pricing calculation based on detected niche & ER
    const baseCpmMin = ytData.detectedNiche.baseCpmMin || 220;
    const baseCpmMax = ytData.detectedNiche.baseCpmMax || 450;
    const erMultiplier = er > 4.0 ? 1.35 : er > 2.5 ? 1.18 : 1.0;

    const rateDedicatedMin = Math.max(Math.round((avgViews / 1000) * baseCpmMin * erMultiplier * 1.5), 3500);
    const rateDedicatedMax = Math.max(Math.round((avgViews / 1000) * baseCpmMax * erMultiplier * 1.8), 7500);
    const rateIntegrationMin = Math.max(Math.round((avgViews / 1000) * baseCpmMin * erMultiplier * 0.7), 2000);
    const rateIntegrationMax = Math.max(Math.round((avgViews / 1000) * baseCpmMax * erMultiplier * 0.9), 4000);
    const rateShortMin = Math.max(Math.round((avgViews / 1000) * (baseCpmMin * 0.5) * erMultiplier), 1500);
    const rateShortMax = Math.max(Math.round((avgViews / 1000) * (baseCpmMax * 0.6) * erMultiplier), 3500);

    // Contextual text for Niche & City detection
    const fullChannelText = `${ytData.title} ${ytData.handle} ${ytData.description} ${ytData.analyzedVideos.slice(0, 10).map(v => v.title).join(' ')}`;
    const detectedLocal = detectIndianLocation(fullChannelText);

    // Initial Niches matching
    const primaryNicheCandidate = ytData.detectedNiche.name || 'AI & Automation';
    const matchedNiches: string[] = [];

    // Check if channel is News / Media / Regional Journalism / Current Affairs
    if (
      primaryNicheCandidate.toLowerCase().includes('news') ||
      primaryNicheCandidate.toLowerCase().includes('society') ||
      primaryNicheCandidate.toLowerCase().includes('politics') ||
      /news|samachar|patrika|khabar|tv|bulletin|media|press|vision|dainik|sandesh|churu|election|voter|sansad|report|live|update|headline/.test(fullChannelText.toLowerCase())
    ) {
      matchedNiches.push('News & Media');
    }

    if (TECH_NICHES.some(n => n.toLowerCase().includes(primaryNicheCandidate.toLowerCase()) || primaryNicheCandidate.toLowerCase().includes(n.toLowerCase()))) {
      const found = TECH_NICHES.find(n => n.toLowerCase().includes(primaryNicheCandidate.toLowerCase()) || primaryNicheCandidate.toLowerCase().includes(n.toLowerCase()));
      if (found && !matchedNiches.includes(found)) matchedNiches.push(found);
    }
    if (matchedNiches.length === 0) {
      if (ytData.title.toLowerCase().includes('ai') || ytData.description.toLowerCase().includes('ai') || ytData.description.toLowerCase().includes('gpt')) {
        matchedNiches.push('AI & Automation');
      } else if (ytData.title.toLowerCase().includes('tech') || ytData.description.toLowerCase().includes('gadget')) {
        matchedNiches.push('Tech & Gadgets');
      } else if (ytData.title.toLowerCase().includes('dev') || ytData.description.toLowerCase().includes('code')) {
        matchedNiches.push('Full-Stack & DevOps');
      } else {
        matchedNiches.push('News & Media');
      }
    }

    // ── 2. Run Gemini 3.8 Flash for Calibrated Audience & Brand Intelligence ──
    const apiKey = process.env.GEMINI_API_KEY;
    let aiDemographics: any = null;

    if (apiKey) {
      try {
        const videoTitles = ytData.analyzedVideos.slice(0, 10).map(v => v.title).join(' | ');
        const prompt = `
You are a senior YouTube audience intelligence and influencer marketing strategist in India.
Analyze this verified YouTube channel data and generate accurate, calibrated demographic and commercial deal insights for brand campaigns.

Channel Details:
- Title: ${ytData.title}
- Handle: ${ytData.handle}
- Bio / Description: ${ytData.description.slice(0, 500)}
- Country: ${ytData.countryName || 'India'}
- Subscribers: ${subs.toLocaleString()}
- Lifetime Views: ${ytData.totalViews.toLocaleString()}
- Average Views per Video (Recent 25): ${avgViews.toLocaleString()}
- True Engagement Rate: ${er}%
- Detected Niche: ${ytData.detectedNiche.name}
- Sample Recent Video Titles: ${videoTitles}

Available Creator Nest Niches:
${JSON.stringify(TECH_NICHES)}

Generate a strict, valid JSON object with the following fields:
1. "audience_india_pct": integer percentage of audience based in India (typically 75-95% for Indian channels)
2. "audience_tier1_city_pct": integer percentage living in Tier-1 metro areas (Delhi, Mumbai, Bengaluru, etc.)
3. "audience_top_countries": array of objects [{"country": "India", "pct": 86}, ...] (summing to ~100%)
4. "audience_top_cities": array of top Indian/global cities [{"city": "Delhi NCR", "pct": 22}, {"city": "Mumbai", "pct": 18}, {"city": "Bengaluru", "pct": 15}, {"city": "Hyderabad", "pct": 9}, {"city": "Pune", "pct": 8}]
5. "audience_age_13_17": integer % (e.g. 6)
6. "audience_age_18_24": integer % (e.g. 54)
7. "audience_age_25_34": integer % (e.g. 30)
8. "audience_age_35_44": integer % (e.g. 7)
9. "audience_age_45_plus": integer % (e.g. 3) (Age percentages must sum to 100%)
10. "audience_gender_male": integer % (e.g. 78)
11. "audience_gender_female": integer % (e.g. 22) (Male + Female must sum to 100%)
12. "audience_income_segment": one of ["High", "Upper-Middle", "Middle", "Mass-Market"]
13. "audience_interests": array of 5 to 7 specific consumer and commercial interests (e.g. ["Smartphones & Gadgets", "AI Tools & Automation", "Productivity Apps", "Coding & Career Growth", "Consumer Electronics"])
14. "recommended_brand_categories": array of 4 to 6 brand verticals that suit this creator (e.g. ["SaaS & Cloud Tools", "Consumer Electronics", "EdTech & Upskilling", "FinTech & UPI", "Mobile Apps"])
15. "ai_brand_fit_summary": exactly 2 concise, compelling sentences that a brand marketing manager can read to instantly book this creator for campaigns. Highlight their demographic strength and ROI.
16. "ai_growth_insight": exactly 1 actionable strategic insight on the creator's current trajectory.
17. "matched_niches": array of 1 to 3 exact strings chosen from the Available Creator Nest Niches that best fit this channel.
18. "detected_target_location": if this channel focuses on a specific city, district, or state in India (e.g. Churu, Jaipur, Rajasthan, Delhi, Lucknow, Patna, Indore, Mumbai, Pune, Bengaluru, etc.), return the exact city and state like "Churu, Rajasthan, India". If it has nationwide/pan-India reach, return "Pan-India".

Return ONLY the raw JSON object. Do not wrap in markdown quotes if possible or return valid parseable JSON.
`;

        const aiRes = await fetch(`${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1200,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          const rawText = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            aiDemographics = JSON.parse(rawText);
          }
        }
      } catch (aiErr) {
        console.warn('[/api/admin/creators/auto-profile] Gemini AI generation error, using calibrated fallbacks:', aiErr);
      }
    }

    // ── 3. Calibrated Fallbacks if AI is offline or misses fields ──
    const isTechNiche = ytData.detectedNiche.id === 'tech' || ytData.detectedNiche.id === 'gaming';
    const finalNiches = Array.isArray(aiDemographics?.matched_niches) && aiDemographics.matched_niches.length > 0
      ? aiDemographics.matched_niches
      : matchedNiches.length > 0 ? matchedNiches : ['News & Media'];

    const finalLocation = detectedLocal
      ? detectedLocal.formatted
      : (aiDemographics?.detected_target_location && aiDemographics.detected_target_location !== 'Pan-India'
          ? aiDemographics.detected_target_location
          : (ytData.countryName || 'India'));

    const defaultCities = detectedLocal
      ? [
          { city: detectedLocal.city, pct: 48 },
          { city: `${detectedLocal.state} (Regional)`, pct: 28 },
          { city: 'Delhi NCR', pct: 14 },
          { city: 'Other Cities', pct: 10 },
        ]
      : [
          { city: 'Delhi NCR', pct: 24 },
          { city: 'Mumbai', pct: 19 },
          { city: 'Bengaluru', pct: 16 },
          { city: 'Pune', pct: 9 },
          { city: 'Hyderabad', pct: 8 },
        ];

    const profile: AutoProfileResult = {
      // Identity
      name: ytData.title,
      channelName: ytData.title,
      channelId: ytData.channelId,
      youtubeUrl: `https://www.youtube.com/${ytData.handle.startsWith('@') ? ytData.handle : '@' + ytData.handle}`,
      youtubeHandle: ytData.handle.startsWith('@') ? ytData.handle : `@${ytData.handle}`,
      img: ytData.avatarUrl,
      bannerUrl: ytData.bannerUrl,
      bio: ytData.description.slice(0, 800),
      location: finalLocation,
      country: ytData.country || 'IN',
      countryName: ytData.countryName || 'India',
      businessEmail: ytData.contactEmail || '',
      creatorSince: ytData.analyzedVideos[ytData.analyzedVideos.length - 1]?.publishedAt || '',

      // Stats
      youtube: formatCount(subs),
      youtubeNum: subs,
      totalViews: ytData.totalViews,
      videoCount: ytData.videoCount,
      avgViewsLast10: avgViews,
      engagementRate: er,
      avgLikes: ytData.metrics.avgLikes,
      avgComments: ytData.metrics.avgComments,
      likeToViewRatio: ytData.metrics.likeToViewRatio,
      commentToViewRatio: ytData.metrics.commentToViewRatio,
      avd: er > 3.0 ? '78%' : '65%',
      sampleSize: ytData.metrics.sampleSize,

      // Niches
      niche: finalNiches[0] || 'News & Media',
      niches: finalNiches,
      detectedNiche: ytData.detectedNiche.name,

      // Audience Demographics (AI or Calibrated)
      audience_india_pct: Number(aiDemographics?.audience_india_pct) || 86,
      audience_tier1_city_pct: Number(aiDemographics?.audience_tier1_city_pct) || (detectedLocal ? 35 : (isTechNiche ? 64 : 52)),
      audience_top_countries: Array.isArray(aiDemographics?.audience_top_countries) && aiDemographics.audience_top_countries.length > 0
        ? aiDemographics.audience_top_countries
        : [
            { country: 'India', pct: 86 },
            { country: 'United States', pct: 5 },
            { country: 'United Arab Emirates', pct: 3 },
            { country: 'United Kingdom', pct: 2 },
            { country: 'Other', pct: 4 },
          ],
      audience_top_cities: Array.isArray(aiDemographics?.audience_top_cities) && aiDemographics.audience_top_cities.length > 0
        ? aiDemographics.audience_top_cities
        : defaultCities,
      audience_age_13_17: Number(aiDemographics?.audience_age_13_17) || (isTechNiche ? 8 : 12),
      audience_age_18_24: Number(aiDemographics?.audience_age_18_24) || (isTechNiche ? 52 : 46),
      audience_age_25_34: Number(aiDemographics?.audience_age_25_34) || (isTechNiche ? 30 : 28),
      audience_age_35_44: Number(aiDemographics?.audience_age_35_44) || 7,
      audience_age_45_plus: Number(aiDemographics?.audience_age_45_plus) || 3,
      audience_gender_male: Number(aiDemographics?.audience_gender_male) || (isTechNiche ? 78 : 65),
      audience_gender_female: Number(aiDemographics?.audience_gender_female) || (isTechNiche ? 22 : 35),
      audience_income_segment: aiDemographics?.audience_income_segment || (isTechNiche ? 'Upper-Middle' : 'Middle'),
      audience_interests: Array.isArray(aiDemographics?.audience_interests) && aiDemographics.audience_interests.length > 0
        ? aiDemographics.audience_interests
        : [
            'Smartphones & Gadgets',
            'AI Tools & Automation',
            'Productivity & Software',
            'EdTech & Upskilling',
            'Consumer Electronics',
          ],

      // Commercial Rates
      deal_rate_dedicated_min: rateDedicatedMin,
      deal_rate_dedicated_max: rateDedicatedMax,
      deal_rate_integration_min: rateIntegrationMin,
      deal_rate_integration_max: rateIntegrationMax,
      deal_rate_short_min: rateShortMin,
      deal_rate_short_max: rateShortMax,
      brand_categories: Array.isArray(aiDemographics?.recommended_brand_categories) && aiDemographics.recommended_brand_categories.length > 0
        ? aiDemographics.recommended_brand_categories
        : ['Consumer Tech', 'SaaS & Cloud Tools', 'EdTech & Upskilling', 'FinTech & Growth', 'Mobile Apps'],
      ai_brand_fit_summary: aiDemographics?.ai_brand_fit_summary ||
        `Reaches an engaged audience of ${formatCount(subs)} subscribers with ${avgViews.toLocaleString()} avg views. Strong high-intent ${finalNiches[0]} demographics ideal for product integrations and high-ROI conversions.`,
      ai_growth_insight: aiDemographics?.ai_growth_insight ||
        `Consistent audience engagement of ${er}% with strong subscriber loyalty across ${tier} creator tier.`,

      creator_score: creatorScore,
      creator_tier: tier,
    };

    return NextResponse.json({
      success: true,
      message: `Successfully profiled YouTube creator "${ytData.title}"!`,
      profile,
    });
  } catch (error: any) {
    console.error('[/api/admin/creators/auto-profile] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to auto-profile YouTube creator.' },
      { status: 500 }
    );
  }
}
