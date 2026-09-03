// ============================================================
// Creator Nest — Creator Scoring Engine
// src/lib/scoring.ts
// Calculates creator_score (0–100) and tier classification
// ============================================================

import { IntelligentCreator, CreatorTier, GrowthVelocity, assignCreatorTier } from '@/types/creator';

// ── Normalize helpers ─────────────────────────────────────────

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, val));
}

/** Normalize subscriber reach to 0–100 score */
function normalizeReach(totalReach: number): number {
  if (totalReach >= 10_000_000) return 100;
  if (totalReach >= 2_000_000)  return 90;
  if (totalReach >= 1_000_000)  return 80;
  if (totalReach >= 500_000)    return 70;
  if (totalReach >= 200_000)    return 60;
  if (totalReach >= 100_000)    return 50;
  if (totalReach >= 50_000)     return 40;
  if (totalReach >= 10_000)     return 30;
  return 20;
}

/** Normalize engagement rate to 0–100 (industry benchmarks) */
function normalizeEngagement(engagementRate: number): number {
  if (engagementRate >= 10)  return 100;
  if (engagementRate >= 7)   return 90;
  if (engagementRate >= 5)   return 80;
  if (engagementRate >= 3.5) return 70;
  if (engagementRate >= 2.5) return 60;
  if (engagementRate >= 1.5) return 50;
  if (engagementRate >= 1)   return 40;
  if (engagementRate >= 0.5) return 30;
  return 15;
}

/** Normalize watch time % (YouTube AVD) to 0–100 */
function normalizeWatchTime(watchTimePct: number): number {
  return clamp(watchTimePct * 1.4); // 70% AVD → 98 score
}

/** Normalize growth % to 0–100 */
function normalizeGrowth(growthPct: number): number {
  if (growthPct >= 20)  return 100;
  if (growthPct >= 10)  return 90;
  if (growthPct >= 5)   return 80;
  if (growthPct >= 3)   return 70;
  if (growthPct >= 1.5) return 60;
  if (growthPct >= 0.5) return 50;
  if (growthPct >= 0)   return 40;
  return 20; // declining
}

/** Normalize brand history */
function normalizeBrandHistory(collabCount: number, repeatRate: number): number {
  const collabScore  = Math.min(100, collabCount * 2);       // 50+ collabs → 100
  const repeatScore  = clamp(repeatRate);                     // 0–100%
  return (collabScore * 0.6) + (repeatScore * 0.4);
}

// ── Main Scoring Function ─────────────────────────────────────

export interface CreatorScoreBreakdown {
  total:             number;
  reach:             number;
  engagement:        number;
  content_quality:   number;
  growth:            number;
  authenticity:      number;
  completeness:      number;
  brand_history:     number;
}

export function calculateCreatorScore(creator: Partial<IntelligentCreator>): CreatorScoreBreakdown {
  // Weighted components (must sum to 1.0)
  const WEIGHTS = {
    reach:           0.20,
    engagement:      0.25,
    content_quality: 0.18,
    growth:          0.15,
    authenticity:    0.10,
    completeness:    0.06,
    brand_history:   0.06,
  };

  const totalReach    = creator.total_reach    ?? (creator.youtube_subscribers ?? 0) + (creator.instagram_followers ?? 0);
  const engagementRate = creator.engagement_rate ?? creator.yt_engagement_rate ?? 0;
  const watchTimePct  = creator.yt_avg_watch_time_pct ?? 0;
  const ctr           = creator.yt_click_through_rate ?? 0;
  const growthPct     = creator.yt_subscriber_growth_pct ?? 0;
  const authenticity  = creator.authenticity_score ?? 75; // default fair score
  const completeness  = creator.profile_completeness_pct ?? 0;
  const collabCount   = creator.collab_count_total ?? 0;
  const repeatRate    = creator.repeat_brand_rate ?? 0;

  const scores = {
    reach:           normalizeReach(totalReach),
    engagement:      normalizeEngagement(engagementRate),
    content_quality: clamp((normalizeWatchTime(watchTimePct) * 0.7) + (Math.min(ctr * 6, 100) * 0.3)),
    growth:          normalizeGrowth(growthPct),
    authenticity:    clamp(authenticity),
    completeness:    clamp(completeness),
    brand_history:   normalizeBrandHistory(collabCount, repeatRate),
  };

  const total = clamp(
    Object.entries(WEIGHTS).reduce((sum, [key, weight]) => {
      return sum + (scores[key as keyof typeof scores] * weight);
    }, 0)
  );

  return { total: Number(total.toFixed(1)), ...scores };
}

// ── Growth Velocity Calculator ────────────────────────────────

export function calculateGrowthVelocity(growthPct30d: number): GrowthVelocity {
  if (growthPct30d >= 2)   return 'Rising';
  if (growthPct30d >= -1)  return 'Stable';
  return 'Declining';
}

// ── Total Reach Calculator ────────────────────────────────────

export function calculateTotalReach(creator: Partial<IntelligentCreator>): number {
  return (
    (creator.youtube_subscribers ?? 0) +
    (creator.instagram_followers ?? 0) +
    (creator.tiktok_followers    ?? 0) +
    (creator.twitter_followers   ?? 0) +
    (creator.linkedin_followers  ?? 0) +
    (creator.newsletter_subscribers ?? 0)
  );
}

// ── Profile Completeness Calculator ──────────────────────────

const COMPLETENESS_WEIGHTS: Partial<Record<keyof IntelligentCreator, number>> = {
  // Critical — 3pts
  full_name:          3,
  bio:                3,
  primary_category:   3,
  primary_niche:      3,
  engagement_rate:    3,
  business_email:     3,
  // Important — 2pts
  tagline:            2,
  cover_photo_url:    2,
  content_formats:    2,
  upload_frequency:   2,
  audience_age_18_24: 2,
  audience_gender_male: 2,
  rate_ig_reel:       2,
  rate_dedicated_video: 2,
  niche_tags:         2,
  audience_interests: 2,
  // Nice to have — 1pt
  seo_keywords:       1,
  media_kit_url:      1,
  ai_growth_insight:  1,
  past_brand_collabs: 1,
  strategy_goals:     1,
  website_url:        1,
  youtube_channel_id: 1,
};

export function calculateProfileCompleteness(creator: Partial<IntelligentCreator>): number {
  const total  = Object.values(COMPLETENESS_WEIGHTS).reduce((a, b) => a + (b ?? 0), 0);
  const earned = (Object.entries(COMPLETENESS_WEIGHTS) as [keyof IntelligentCreator, number][])
    .filter(([field]) => {
      const val = creator[field];
      if (val === undefined || val === null) return false;
      if (typeof val === 'string')  return val.trim().length > 0;
      if (typeof val === 'number')  return val > 0;
      if (typeof val === 'boolean') return val;
      if (Array.isArray(val))       return val.length > 0;
      return false;
    })
    .reduce((sum, [, weight]) => sum + weight, 0);

  return Math.min(100, Math.round((earned / total) * 100));
}

// ── Full auto-score a creator ─────────────────────────────────

export function autoScoreCreator(creator: Partial<IntelligentCreator>): {
  creator_score:            number;
  creator_tier:             CreatorTier;
  total_reach:              number;
  growth_velocity:          GrowthVelocity;
  profile_completeness_pct: number;
} {
  const total_reach              = calculateTotalReach(creator);
  const creator_tier             = assignCreatorTier(total_reach);
  const growth_velocity          = calculateGrowthVelocity(creator.yt_subscriber_growth_pct ?? 0);
  const profile_completeness_pct = calculateProfileCompleteness(creator);
  const { total: creator_score } = calculateCreatorScore({ ...creator, total_reach, profile_completeness_pct });

  return { creator_score, creator_tier, total_reach, growth_velocity, profile_completeness_pct };
}
