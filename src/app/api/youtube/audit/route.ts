// ============================================================
// Creator Nest — YouTube Monetization Channel Audit API Route
// POST /api/youtube/audit
// Hybrid: YouTube Data API v3 + Gemini AI Vision + Ask Studio
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeYouTubeChannel } from '@/lib/youtube';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-3.8-flash'];

async function callGeminiAudit(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment or .env.local');
  }

  let lastError: Error | null = null;
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 8192,
              responseMimeType: 'application/json'
            },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Gemini error on ${model} (${res.status}): ${JSON.stringify(err)}`);
      }

      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const fullText = parts.map((p: any) => p.text || '').join('').trim();
      return fullText || '{}';
    } catch (err: any) {
      lastError = err;
      console.warn(`[callGeminiAudit] Failed with ${model}, trying next:`, err.message);
    }
  }

  throw lastError || new Error('All Gemini model calls failed.');
}

interface MetadataAudit {
  exactDuplicateTitles: Array<{ title: string; count: number }>;
  uniqueTitleRatio: number;
  isRepetitious: boolean;
  notes: string[];
}

function analyzeMetadataIntegrity(videos: any[]): MetadataAudit {
  if (!videos || videos.length === 0) {
    return { exactDuplicateTitles: [], uniqueTitleRatio: 1, isRepetitious: false, notes: [] };
  }

  const titleCounts: Record<string, number> = {};
  videos.forEach(v => {
    const norm = (v.title || '').trim().toLowerCase();
    if (norm) {
      titleCounts[norm] = (titleCounts[norm] || 0) + 1;
    }
  });

  const exactDuplicateTitles: Array<{ title: string; count: number }> = [];
  let duplicateCount = 0;
  for (const [norm, count] of Object.entries(titleCounts)) {
    if (count > 1) {
      const orig = videos.find(v => (v.title || '').trim().toLowerCase() === norm)?.title || norm;
      exactDuplicateTitles.push({ title: orig, count });
      duplicateCount += (count - 1);
    }
  }

  const uniqueTitleRatio = Number(((videos.length - duplicateCount) / videos.length).toFixed(2));
  const isRepetitious = exactDuplicateTitles.length > 0 || uniqueTitleRatio < 0.85;

  const notes: string[] = [];
  if (exactDuplicateTitles.length > 0) {
    notes.push(`Detected ${exactDuplicateTitles.length} title(s) used repeatedly across videos: ${exactDuplicateTitles.map(d => `"${d.title}" (${d.count}x)`).join(', ')}.`);
    notes.push(`CRITICAL POLICY VIOLATION: Using identical titles across multiple uploads directly breaches YouTube's "Spam, Deceptive Practices, & Misleading Metadata" policy and triggers YPP rejection under "Repetitious Content".`);
  } else {
    notes.push('All analyzed video titles are distinct and unique.');
  }

  return {
    exactDuplicateTitles,
    uniqueTitleRatio,
    isRepetitious,
    notes,
  };
}

function buildAuditPrompt(channelData: any, askStudioText: string, screenshotContext: string, language: string = 'en'): string {
  const { title, handle, subscribers, totalViews, videoCount, metrics, detectedNiche, country, analyzedVideos, description } = channelData;
  const topVideos = (analyzedVideos || []).slice(0, 10).map((v: any, i: number) =>
    `  ${i + 1}. "${v.title}" -- ${v.views?.toLocaleString()} views, ${v.erPct}% ER${v.isShort ? ' [SHORT]' : ''}`
  ).join('\n');

  const metadataAudit = analyzeMetadataIntegrity(analyzedVideos || []);
  const isHindi = language === 'hi';

  if (isHindi) {
    return `You are a world-class senior YouTube Monetization and Channel Health Auditor with 10+ years of creator economy advisory experience.
CRITICAL LANGUAGE DIRECTIVE: The user requested this audit report 100% in HINDI (हिन्दी - देवनागरी लिपि).
- MANDATORY: Every single string value in the output JSON (notes, descriptions, primaryNeed, recommendedSolution, currentStatus, auditPoint, requirement, stream, topStrengths, criticalIssues, action, timeframe, impact, basis, channelHealthSummary, nextMilestone) MUST be written in pure, natural, professional Hindi (देवनागरी लिपि).
- Absolutely NO English sentences or English explanations anywhere in notes or descriptions.
- Common creator terms may be written in Devanagari (जैसे: यूट्यूब, मोनेटाइजेशन, वॉच आवर्स, शॉर्ट्स, सीटीआर, आरपीएम, एडसेंस, स्पॉन्सरशिप, कम्युनिटी गाइडलाइन्स, थंबनेल).
- Keep numerical metrics exact. Keep "status" as "Pass" | "Fail" | "Warning" | "Unknown" for UI badge styling.
- "primaryNeed" must be a concise, actionable 1-sentence summary in pure Hindi explaining the creator's single biggest bottleneck or growth need.

1. PUBLIC CHANNEL DATA (YouTube Data API v3):
- चैनल का नाम: ${title} (${handle})
- सब्सक्राइबर्स: ${subscribers?.toLocaleString()}
- कुल व्यूज: ${totalViews?.toLocaleString()}
- अपलोड किए गए वीडियो: ${videoCount}
- देश: ${country || 'IN'}
- नीश / श्रेणी: ${detectedNiche?.name || 'सामान्य (General)'}
- चैनल विवरण: ${(description || '').substring(0, 300)}

एंगेजमेंट मेट्रिक्स (${metrics?.sampleSize || 0} वीडियो का नमूना):
- प्रति वीडियो औसत व्यूज: ${metrics?.avgViews?.toLocaleString() || 0}
- प्रति वीडियो औसत लाइक्स: ${metrics?.avgLikes?.toLocaleString() || 0}
- वास्तविक एंगेजमेंट दर: ${metrics?.trueEngagementRate || 0}%
- लाइक-टू-व्यू अनुपात: ${metrics?.likeToViewRatio || 0}%

हालिया शीर्ष वीडियो:
${topVideos || '  कोई वीडियो डेटा उपलब्ध नहीं'}

2. मेटाडेटा अखंडता व रीयूज्ड कंटेंट स्कैन:
- डुप्लीकेट शीर्षक: ${metadataAudit.exactDuplicateTitles.length > 0 ? metadataAudit.exactDuplicateTitles.map(d => `"${d.title}" (${d.count}x)`).join(', ') : 'कोई नहीं। सभी शीर्षक अद्वितीय हैं।'}
- शीर्षक विशिष्टता दर: ${(metadataAudit.uniqueTitleRatio * 100).toFixed(0)}%
- रिपीटिशियस मेटाडेटा जोखिम: ${metadataAudit.isRepetitious ? 'उच्च जोखिम (HIGH WARNING)' : 'सुरक्षित (CLEAN)'}

3. यूट्यूब स्टूडियो प्राइवेट टेलीमेट्री (Ask Studio):
${askStudioText ? `[सत्यापित स्टूडियो डेटा]:\n${askStudioText}` : (screenshotContext ? `[स्क्रीनशॉट डेटा]:\n${screenshotContext}` : 'कोई प्राइवेट स्टूडियो डेटा नहीं दिया गया। सार्वजनिक वीडियो गति के आधार पर अनुमान लगाएं।')}

Return ONLY a valid JSON object (no markdown code blocks, no backticks) with EXACTLY this structure in 100% HINDI:
{
  "overallScore": <0-100 पूर्णांक>,
  "monetizationStatus": "<Eligible | Near Eligible | Not Eligible>",
  "primaryNeed": "<चैनल की सबसे बड़ी बाधा या विकास आवश्यकता का हिंदी में 1 स्पष्ट वाक्य>",
  "yppEligibility": {
    "subscriberCheck": {
      "required": 1000,
      "current": ${subscribers || 0},
      "pass": ${(subscribers || 0) >= 1000},
      "note": "<सब्सक्राइबर्स स्थिति का हिंदी में स्पष्ट विवरण>"
    },
    "watchHoursCheck": {
      "required": 4000,
      "current": <वॉच आवर्स पूर्णांक या null>,
      "pass": <boolean>,
      "note": "<वॉच आवर्स स्थिति और बचे हुए घंटों का हिंदी में विवरण>"
    },
    "contentPolicyCheck": {
      "pass": <boolean>,
      "note": "<रीयूज्ड व मौलिक कंटेंट स्थिति का हिंदी में विवरण>"
    },
    "communityGuidelinesCheck": {
      "pass": <boolean>,
      "note": "<कम्युनिटी स्ट्राइक्स व चेतावनियों का हिंदी में विवरण>"
    }
  },
  "auditMatrix": [
    {
      "auditPoint": "YPP सब्सक्राइबर सीमा",
      "requirement": "न्यूनतम 1,000 सब्सक्राइबर्स",
      "currentStatus": "${subscribers?.toLocaleString() || 0} सब्सक्राइबर्स",
      "status": "${(subscribers || 0) >= 1000 ? 'Pass' : 'Fail'}",
      "recommendedSolution": "<हिंदी में समाधान>"
    },
    {
      "auditPoint": "वैध सार्वजनिक वॉच आवर्स (पिछले 365 दिन)",
      "requirement": "4,000 सार्वजनिक वॉच आवर्स या 90 दिनों में 10M शॉर्ट्स व्यूज",
      "currentStatus": "<वर्तमान वॉच आवर्स स्थिति हिंदी में>",
      "status": "<Pass | Fail | Warning | Unknown>",
      "recommendedSolution": "<हिंदी में समाधान>"
    },
    {
      "auditPoint": "रीयूज्ड व रिपीटिशियस कंटेंट पॉलिसी",
      "requirement": "मौलिक कमेंट्री और अद्वितीय शीर्षक (कोई डुप्लीकेट या स्पैम टाइटल नहीं)",
      "currentStatus": "<वर्तमान कंटेंट स्थिति हिंदी में>",
      "status": "<Pass | Fail | Warning>",
      "recommendedSolution": "<हिंदी में समाधान>"
    },
    {
      "auditPoint": "कम्युनिटी गाइडलाइन्स व कॉपीराइट स्ट्राइक्स",
      "requirement": "शून्य सक्रिय स्ट्राइक्स या नीति उल्लंघन",
      "currentStatus": "<स्ट्राइक्स स्थिति हिंदी में>",
      "status": "<Pass | Fail | Warning>",
      "recommendedSolution": "<हिंदी में समाधान>"
    },
    {
      "auditPoint": "2-स्टेप वेरिफिकेशन व एडवांस्ड फीचर्स",
      "requirement": "सक्रिय 2FA और उन्नत चैनल सुविधाएं अनलॉक",
      "currentStatus": "स्टूडियो में सत्यापित",
      "status": "Pass",
      "recommendedSolution": "<हिंदी में समाधान>"
    },
    {
      "auditPoint": "ऑडियंस रिटेंशन (AVD) व जुड़ाव",
      "requirement": "सक्रिय दर्शक जुड़ाव और स्वस्थ व्यू-टू-सब अनुपात",
      "currentStatus": "<रिटेंशन स्थिति हिंदी में>",
      "status": "<Pass | Warning | Fail>",
      "recommendedSolution": "<हिंदी में समाधान>"
    },
    {
      "auditPoint": "अपलोड निरंतरता व प्रकाशन शेड्यूल",
      "requirement": "पिछले 90 दिनों में नियमित वीडियो अपलोड",
      "currentStatus": "<अपलोड स्थिति हिंदी में>",
      "status": "<Pass | Warning | Fail>",
      "recommendedSolution": "<हिंदी में समाधान>"
    },
    {
      "auditPoint": "नीश CPM व विज्ञापनदाताओं की मांग",
      "requirement": "ब्रांड-सुरक्षित विषय और उच्च विज्ञापन मांग",
      "currentStatus": "<सीपीएम स्थिति हिंदी में>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<हिंदी में समाधान>"
    },
    {
      "auditPoint": "क्लिक-थ्रू रेट (CTR) व थंबनेल पैकेजिंग",
      "requirement": "आकर्षक थंबनेल और प्रामाणिक गैर-भ्रामक शीर्षक",
      "currentStatus": "<सीटीआर स्थिति हिंदी में>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<हिंदी में समाधान>"
    },
    {
      "auditPoint": "शॉर्ट्स बनाम लॉन्ग-फॉर्म फनल रणनीति",
      "requirement": "शॉर्ट्स दर्शकों को लॉन्ग-फॉर्म वॉच टाइम में बदलना",
      "currentStatus": "<फनल स्थिति हिंदी में>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<हिंदी में समाधान>"
    },
    {
      "auditPoint": "वैकल्पिक राजस्व विविधीकरण",
      "requirement": "मल्टी-स्ट्रीम कमाई (स्पॉन्सरशिप, डिजिटल प्रोडक्ट्स, एफिलिएट)",
      "currentStatus": "<राजस्व स्थिति हिंदी में>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<हिंदी में समाधान>"
    },
    {
      "auditPoint": "चैनल SEO व यूट्यूब सर्च डिस्कवरी",
      "requirement": "अनुकूलित चैनल टैग्स, प्लेलिस्ट और विवरण",
      "currentStatus": "<एसईओ स्थिति हिंदी में>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<हिंदी में समाधान>"
    }
  ],
  "revenueStreams": [
    {
      "stream": "यूट्यूब पार्टनर प्रोग्राम (Google AdSense)",
      "eligible": ${(subscribers || 0) >= 1000},
      "estimatedMonthlyMin": <INR में न्यूनतम>,
      "estimatedMonthlyMax": <INR में अधिकतम>,
      "currency": "INR",
      "note": "<हिंदी में आधार व सुझाव>"
    },
    {
      "stream": "ब्रांड स्पॉन्सरशिप व पेड इंटीग्रेशन",
      "eligible": <boolean>,
      "estimatedMonthlyMin": <INR में न्यूनतम>,
      "estimatedMonthlyMax": <INR में अधिकतम>,
      "currency": "INR",
      "note": "<हिंदी में आधार व सुझाव>"
    },
    {
      "stream": "चैनल मेंबरशिप व सुपर थैंक्स",
      "eligible": ${(subscribers || 0) >= 500},
      "estimatedMonthlyMin": <INR में न्यूनतम>,
      "estimatedMonthlyMax": <INR में अधिकतम>,
      "currency": "INR",
      "note": "<हिंदी में आधार व सुझाव>"
    },
    {
      "stream": "एफिलिएट मार्केटिंग व टूल्स प्रमोशन",
      "eligible": true,
      "estimatedMonthlyMin": <INR में न्यूनतम>,
      "estimatedMonthlyMax": <INR में अधिकतम>,
      "currency": "INR",
      "note": "<हिंदी में आधार व सुझाव>"
    },
    {
      "stream": "डिजिटल प्रोडक्ट्स, कोर्स व कंसल्टेशन",
      "eligible": <boolean>,
      "estimatedMonthlyMin": <INR में न्यूनतम>,
      "estimatedMonthlyMax": <INR में अधिकतम>,
      "currency": "INR",
      "note": "<हिंदी में आधार व सुझाव>"
    }
  ],
  "topStrengths": ["<हिंदी में शीर्ष मजबूती 1>", "<हिंदी में मजबूती 2>", "<हिंदी में मजबूती 3>"],
  "criticalIssues": ["<हिंदी में गंभीर नीति या ग्रोथ समस्या 1>", "<हिंदी में समस्या 2>"],
  "actionPlan": [
    { "priority": "High", "action": "<हिंदी में पहला सबसे महत्वपूर्ण कार्य>", "timeframe": "<जैसे 1-7 दिन>", "impact": "<हिंदी में अपेक्षित प्रभाव>" },
    { "priority": "Medium", "action": "<हिंदी में दूसरा कार्य>", "timeframe": "<जैसे 8-21 दिन>", "impact": "<हिंदी में अपेक्षित प्रभाव>" },
    { "priority": "Low", "action": "<हिंदी में तीसरा कार्य>", "timeframe": "<जैसे 22-30 दिन>", "impact": "<हिंदी में अपेक्षित प्रभाव>" }
  ],
  "estimatedMonthlyAdRevenue": {
    "min": <INR में संख्या>,
    "max": <INR में संख्या>,
    "currency": "INR",
    "basis": "<हिंदी में रेवेन्यू अनुमान का आधार (व्यूज, सीपीएम और वाईपीपी स्थिति)>"
  },
  "channelHealthSummary": "<हिंदी में विस्तृत निष्कर्ष सारांश>",
  "nextMilestone": "<हिंदी में अगला प्रमुख लक्ष्य मील का पत्थर>"
}

Indian niche CPM ranges (INR per 1000 views): Finance 400-800, Tech 300-600, Education 150-400, Entertainment 80-200, Gaming 100-250, Lifestyle 120-300.
Always output estimated revenue figures in INR (₹).
Keep all strings concise and factual.`;
  }

  return `You are a world-class senior YouTube Monetization and Channel Health Auditor with 10+ years of creator economy advisory experience.
Conduct a rigorous audit for this channel synthesizing three data inputs:
CRITICAL LANGUAGE DIRECTIVE: Output in clear, professional English.
- "primaryNeed" must be a concise, actionable 1-sentence summary explaining the creator's single biggest bottleneck or growth need (e.g., "Short 1,200 watch hours to meet YPP threshold" or "High risk of repetitious content rejection due to duplicate video titles").

1. PUBLIC CHANNEL DATA (YouTube Data API v3):
- Channel: ${title} (${handle})
- Subscribers: ${subscribers?.toLocaleString()}
- Total Views: ${totalViews?.toLocaleString()}
- Total Videos: ${videoCount}
- Country: ${country || 'IN'}
- Detected Niche: ${detectedNiche?.name || 'General'}
- Description: ${(description || '').substring(0, 300)}

ENGAGEMENT METRICS (sample of ${metrics?.sampleSize || 0} videos):
- Avg Views per Video: ${metrics?.avgViews?.toLocaleString() || 0}
- Avg Likes per Video: ${metrics?.avgLikes?.toLocaleString() || 0}
- Avg Comments per Video: ${metrics?.avgComments?.toLocaleString() || 0}
- True Engagement Rate: ${metrics?.trueEngagementRate || 0}%
- Like to View Ratio: ${metrics?.likeToViewRatio || 0}%

TOP RECENT VIDEOS:
${topVideos || '  No video data available'}

2. METADATA INTEGRITY & REPETITIOUS CONTENT SCAN:
- Duplicate Titles Found: ${metadataAudit.exactDuplicateTitles.length > 0 ? metadataAudit.exactDuplicateTitles.map(d => `"${d.title}" (${d.count} uploads)`).join(', ') : 'None. All video titles are unique.'}
- Title Uniqueness Ratio: ${(metadataAudit.uniqueTitleRatio * 100).toFixed(0)}%
- Repetitious Metadata Risk: ${metadataAudit.isRepetitious ? 'HIGH WARNING' : 'CLEAN'}
- Scan Analysis: ${metadataAudit.notes.join(' ')}
(IMPORTANT: If duplicate titles or repetitious metadata are detected, you MUST issue a Warning or Fail on the "Reused & Repetitious Content Policy" audit point, explain why YouTube flags identical titles as Spam/Misleading Metadata, and give an actionable solution.)

3. PRIVATE STUDIO GROUND-TRUTH TELEMETRY (via 'Ask Studio' / Studio Assistant):
${askStudioText ? `[STRUCTURED ASK STUDIO DATA RECEIVED]:\n${askStudioText}\n(CRITICAL INSTRUCTION: Treat the figures in this Ask Studio block as 100% verified private data from YouTube Studio. Use the exact valid watch hours, exact Shorts views, active strikes, RPM, CTR, and AVD given here for the YPP checklist and audit matrix.)` : (screenshotContext ? `[SCREENSHOT OCR DATA]:\n${screenshotContext}` : 'No private Studio telemetry provided. Estimate watch hours, strike status, and RPM based on public video velocity and Indian niche benchmarks.')}

Return ONLY a valid JSON object (no markdown code blocks, no backticks) with EXACTLY this structure:
{
  "overallScore": <integer 0-100>,
  "monetizationStatus": "<Eligible | Near Eligible | Not Eligible>",
  "primaryNeed": "<1-sentence summary of creator's biggest bottleneck or growth need>",
  "yppEligibility": {
    "subscriberCheck": {
      "required": 1000,
      "current": ${subscribers || 0},
      "pass": ${(subscribers || 0) >= 1000},
      "note": "<explanation>"
    },
    "watchHoursCheck": {
      "required": 4000,
      "current": <integer watch hours or null>,
      "pass": <boolean or null>,
      "note": "<detailed watch hours status>"
    },
    "contentPolicyCheck": {
      "pass": <boolean>,
      "note": "<reused content, original commentary & AI transparency assessment>"
    },
    "communityGuidelinesCheck": {
      "pass": <boolean>,
      "note": "<strikes, warnings, or brand safety assessment>"
    }
  },
  "auditMatrix": [
    {
      "auditPoint": "YPP Subscriber Threshold",
      "requirement": "1,000 subscribers minimum",
      "currentStatus": "${subscribers?.toLocaleString() || 0} subscribers",
      "status": "${(subscribers || 0) >= 1000 ? 'Pass' : 'Fail'}",
      "recommendedSolution": "<solution>"
    },
    {
      "auditPoint": "Valid Public Watch Hours (Past 365 Days)",
      "requirement": "4,000 public watch hours or 10M valid Shorts views in 90 days",
      "currentStatus": "<status>",
      "status": "<Pass | Fail | Warning | Unknown>",
      "recommendedSolution": "<solution>"
    },
    {
      "auditPoint": "Reused & Repetitious Content Policy",
      "requirement": "Original commentary and unique titles with zero duplicate or spammy titles across uploads",
      "currentStatus": "<status detailing whether duplicate titles, templated descriptions, or repetitious content were found>",
      "status": "<Pass | Fail | Warning>",
      "recommendedSolution": "<solution>"
    },
    {
      "auditPoint": "Community Guidelines & Copyright Strikes",
      "requirement": "Zero active strikes on record",
      "currentStatus": "<status>",
      "status": "<Pass | Fail | Warning>",
      "recommendedSolution": "<solution>"
    },
    {
      "auditPoint": "2-Step Verification & Advanced Features",
      "requirement": "Active 2FA on Google Account and Advanced Channel Features unlocked",
      "currentStatus": "Verified in Studio",
      "status": "Pass",
      "recommendedSolution": "<solution>"
    },
    {
      "auditPoint": "Audience Retention & View-to-Sub Ratio",
      "requirement": "Healthy engagement indicating active human viewership",
      "currentStatus": "<status>",
      "status": "<Pass | Warning | Fail>",
      "recommendedSolution": "<solution>"
    },
    {
      "auditPoint": "Upload Cadence & Consistency",
      "requirement": "Regular publishing schedule in the last 90 days",
      "currentStatus": "<status>",
      "status": "<Pass | Warning | Fail>",
      "recommendedSolution": "<solution>"
    },
    {
      "auditPoint": "Niche CPM & Commercial Advertisability",
      "requirement": "Brand-safe themes with high advertiser demand",
      "currentStatus": "<status>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<solution>"
    },
    {
      "auditPoint": "Click-Through Rate (CTR) & Packaging",
      "requirement": "Distinctive thumbnail branding and non-misleading titles",
      "currentStatus": "<status>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<solution>"
    },
    {
      "auditPoint": "Shorts vs Long-form Funnel Strategy",
      "requirement": "Using Shorts to drive long-form watch time conversion",
      "currentStatus": "<status>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<solution>"
    },
    {
      "auditPoint": "Alternative Revenue Diversification",
      "requirement": "Multi-stream monetization (sponsorships, digital products, affiliate)",
      "currentStatus": "<status>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<solution>"
    },
    {
      "auditPoint": "Channel SEO & Search Discovery",
      "requirement": "Optimized channel tags, playlist architecture, and descriptions",
      "currentStatus": "<status>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<solution>"
    }
  ],
  "revenueStreams": [
    {
      "stream": "YouTube Partner Program (AdSense)",
      "eligible": ${(subscribers || 0) >= 1000},
      "estimatedMonthlyMin": <number in INR>,
      "estimatedMonthlyMax": <number in INR>,
      "currency": "INR",
      "note": "<basis>"
    },
    {
      "stream": "Brand Sponsorships & Integrations",
      "eligible": <boolean>,
      "estimatedMonthlyMin": <number in INR>,
      "estimatedMonthlyMax": <number in INR>,
      "currency": "INR",
      "note": "<basis>"
    },
    {
      "stream": "Super Thanks & Channel Memberships",
      "eligible": ${(subscribers || 0) >= 500},
      "estimatedMonthlyMin": <number in INR>,
      "estimatedMonthlyMax": <number in INR>,
      "currency": "INR",
      "note": "<basis>"
    },
    {
      "stream": "Affiliate Marketing & Tools",
      "eligible": true,
      "estimatedMonthlyMin": <number in INR>,
      "estimatedMonthlyMax": <number in INR>,
      "currency": "INR",
      "note": "<basis>"
    },
    {
      "stream": "Digital Products, Courses & Consultations",
      "eligible": <boolean>,
      "estimatedMonthlyMin": <number in INR>,
      "estimatedMonthlyMax": <number in INR>,
      "currency": "INR",
      "note": "<basis>"
    }
  ],
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "criticalIssues": ["<critical issue 1>", "<critical issue 2>"],
  "actionPlan": [
    { "priority": "High", "action": "<action>", "timeframe": "<timeframe>", "impact": "<impact>" },
    { "priority": "Medium", "action": "<action>", "timeframe": "<timeframe>", "impact": "<impact>" },
    { "priority": "Low", "action": "<action>", "timeframe": "<timeframe>", "impact": "<impact>" }
  ],
  "estimatedMonthlyAdRevenue": {
    "min": <number in INR>,
    "max": <number in INR>,
    "currency": "INR",
    "basis": "<basis>"
  },
  "channelHealthSummary": "<executive summary>",
  "nextMilestone": "<milestone>"
}

Indian niche CPM ranges (INR per 1000 views): Finance 400-800, Tech 300-600, Education 150-400, Entertainment 80-200, Gaming 100-250, Lifestyle 120-300.
Always output estimated revenue figures in INR (₹).

CRITICAL CONSTRAINTS:
- Keep every "recommendedSolution", "requirement", "note", "action", and "channelHealthSummary" concise (1 to 2 punchy sentences maximum per string).
- Do NOT write lengthy paragraphs. Keep the JSON compact, factual, and strictly closed.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      channelHandle,
      askStudioText = '',
      screenshotOcrText = '',
      email = '',
      phone = '',
      language = 'en'
    } = body;

    if (!channelHandle?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid YouTube channel handle or URL.' },
        { status: 400 }
      );
    }

    // 1. Fetch public YouTube Data API v3 statistics
    let channelData: any;
    try {
      channelData = await analyzeYouTubeChannel(channelHandle.trim(), { maxVideos: 20, filterShorts: false });
    } catch (ytErr: any) {
      console.warn('YouTube API fetch warning:', ytErr.message);
      return NextResponse.json(
        { success: false, error: `Could not retrieve channel info from YouTube API: ${ytErr.message}` },
        { status: 422 }
      );
    }

    // 2. Synthesize using Gemini LLM
    const prompt = buildAuditPrompt(channelData, askStudioText?.trim() || '', screenshotOcrText?.trim() || '', language);
    let auditRaw: string;
    try {
      auditRaw = await callGeminiAudit(prompt);
    } catch (geminiErr: any) {
      console.error('Gemini audit error:', geminiErr);
      return NextResponse.json(
        { success: false, error: `AI analysis failed: ${geminiErr.message}` },
        { status: 500 }
      );
    }

    // 3. Parse JSON response
    let auditResult: any;
    try {
      let cleaned = auditRaw.trim();
      // Remove code fences
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }
      try {
        auditResult = JSON.parse(cleaned);
      } catch {
        const first = cleaned.indexOf('{');
        const last = cleaned.lastIndexOf('}');
        if (first !== -1 && last > first) {
          const slice = cleaned.substring(first, last + 1)
            .replace(/,\s*([\]}])/g, '$1');
          auditResult = JSON.parse(slice);
        } else {
          throw new Error('Could not locate JSON block');
        }
      }
    } catch (parseErr: any) {
      console.error('Audit JSON parse failure:', parseErr.message, 'Length:', auditRaw.length, 'End:', auditRaw.slice(-150));
      return NextResponse.json(
        { success: false, error: 'Failed to format AI audit results. Please retry.' },
        { status: 500 }
      );
    }

    // Normalize keys and status codes for consistent UI rendering
    if (auditResult) {
      const rawStatus = String(auditResult.monetizationStatus || '');
      if (rawStatus.includes('करीब') || rawStatus.toLowerCase().includes('near')) {
        auditResult.monetizationStatus = 'Near Eligible';
      } else if (rawStatus.includes('अपात्र') || rawStatus.toLowerCase().includes('not')) {
        auditResult.monetizationStatus = 'Not Eligible';
      } else if (rawStatus.includes('पात्र') || rawStatus.toLowerCase().includes('eligible')) {
        auditResult.monetizationStatus = 'Eligible';
      } else {
        auditResult.monetizationStatus = 'Near Eligible';
      }

      if (Array.isArray(auditResult.auditMatrix)) {
        auditResult.auditMatrix = auditResult.auditMatrix.map((row: any) => {
          let s = String(row.status || '').trim();
          if (s.includes('पास') || s.includes('सफल') || s.toLowerCase() === 'pass') s = 'Pass';
          else if (s.includes('फेल') || s.includes('विफल') || s.toLowerCase() === 'fail') s = 'Fail';
          else if (s.includes('चेतावनी') || s.toLowerCase() === 'warning') s = 'Warning';
          else if (s.toLowerCase() === 'unknown') s = 'Unknown';
          else s = 'Warning';
          return { ...row, status: s };
        });
      }

      if (Array.isArray(auditResult.actionPlan)) {
        auditResult.actionPlan = auditResult.actionPlan.map((item: any) => {
          let p = String(item.priority || '').trim();
          if (p.includes('उच्च') || p.toLowerCase() === 'high') p = 'High';
          else if (p.includes('मध्यम') || p.toLowerCase() === 'medium') p = 'Medium';
          else p = 'Low';
          return { ...item, priority: p };
        });
      }
    }

    // 4. Capture Tool Lead automatically in background for Admin Panel
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      const toolLeadsPath = path.join(dataDir, 'tool_leads.json');
      let toolLeads = [];
      if (fs.existsSync(toolLeadsPath)) {
        try { toolLeads = JSON.parse(fs.readFileSync(toolLeadsPath, 'utf-8') || '[]'); } catch { toolLeads = []; }
      }
      const cleanHandle = channelData.handle || channelHandle.trim();
      const cleanEmail = email?.trim()?.toLowerCase() || null;
      const existingIdx = toolLeads.findIndex((l: any) => 
        (cleanHandle && l.handle?.toLowerCase() === cleanHandle.toLowerCase() && l.tool_id === 'youtube-monetization-audit') ||
        (cleanEmail && l.email?.toLowerCase() === cleanEmail && l.tool_id === 'youtube-monetization-audit')
      );

      const revMin = auditResult.estimatedMonthlyAdRevenue?.min || 0;
      const revMax = auditResult.estimatedMonthlyAdRevenue?.max || 0;
      const estRevStr = revMin && revMax ? `₹${Number(revMin).toLocaleString('en-IN')} - ₹${Number(revMax).toLocaleString('en-IN')}` : (revMin ? `₹${Number(revMin).toLocaleString('en-IN')}` : '');

      const leadEntry = {
        id: existingIdx >= 0 ? toolLeads[existingIdx].id : `tool_lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        tool_id: 'youtube-monetization-audit',
        tool_name: 'YouTube Monetization Channel Audit',
        handle: cleanHandle,
        channel_title: channelData.title || cleanHandle,
        email: cleanEmail,
        phone: phone?.trim() || null,
        subscribers: channelData.subscribers || 0,
        total_views: channelData.totalViews || 0,
        video_count: channelData.videoCount || 0,
        niche: channelData.detectedNiche?.name || 'General',
        country: channelData.country || 'India',
        overall_score: auditResult.overallScore || 0,
        monetization_status: auditResult.monetizationStatus || 'Pending',
        primary_need: auditResult.primaryNeed || (auditResult.overallScore < 70 ? 'Watch Hours & Policy Compliance' : 'Brand Deal & Sponsorship Scaling'),
        estimated_monthly_revenue: estRevStr,
        metadata: {
          topStrengths: auditResult.topStrengths || [],
          criticalIssues: auditResult.criticalIssues || []
        },
        status: existingIdx >= 0 ? (toolLeads[existingIdx].status || 'NEW') : 'NEW',
        notes: existingIdx >= 0 ? toolLeads[existingIdx].notes : '',
        created_at: existingIdx >= 0 ? toolLeads[existingIdx].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        toolLeads[existingIdx] = leadEntry;
      } else {
        toolLeads.unshift(leadEntry);
      }
      fs.writeFileSync(toolLeadsPath, JSON.stringify(toolLeads, null, 2), 'utf-8');

      // Sync to calculator_leads.json for backwards compatibility
      const calcPath = path.join(dataDir, 'calculator_leads.json');
      let calcLeads = [];
      if (fs.existsSync(calcPath)) {
        try { calcLeads = JSON.parse(fs.readFileSync(calcPath, 'utf-8') || '[]'); } catch { calcLeads = []; }
      }
      const cIdx = calcLeads.findIndex((c: any) => c.id === leadEntry.id);
      const calcItem = {
        id: leadEntry.id,
        tool: leadEntry.tool_name,
        handle: leadEntry.handle,
        platform: 'youtube',
        followers: leadEntry.subscribers,
        avg_views: channelData.metrics?.avgViews || 0,
        niche: leadEntry.niche,
        score: leadEntry.overall_score,
        need: leadEntry.primary_need,
        base_rate: leadEntry.estimated_monthly_revenue,
        email: leadEntry.email,
        phone: leadEntry.phone,
        status: leadEntry.status,
        created_at: leadEntry.created_at
      };
      if (cIdx >= 0) calcLeads[cIdx] = calcItem;
      else calcLeads.unshift(calcItem);
      fs.writeFileSync(calcPath, JSON.stringify(calcLeads, null, 2), 'utf-8');
    } catch (leadSaveErr) {
      console.warn('[LEAD AUTO-SAVE WARNING]', leadSaveErr);
    }

    return NextResponse.json({
      success: true,
      channelProfile: {
        title: channelData.title,
        handle: channelData.handle,
        subscribers: channelData.subscribers,
        totalViews: channelData.totalViews,
        videoCount: channelData.videoCount,
        avatarUrl: channelData.avatarUrl,
        bannerUrl: channelData.bannerUrl,
        country: channelData.country,
        detectedNiche: channelData.detectedNiche,
        metrics: channelData.metrics,
        analyzedVideos: channelData.analyzedVideos?.slice(0, 10),
      },
      audit: auditResult,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[/api/youtube/audit] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during audit generation.' },
      { status: 500 }
    );
  }
}
