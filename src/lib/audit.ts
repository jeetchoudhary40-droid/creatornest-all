// ============================================================
// CREATOR NEST — Intelligent Creator Profile Audit Engine
// src/lib/audit.ts
// Audits creator profile completeness, data integrity, score & tier
// ============================================================

import type { IntelligentCreator, CreatorTier } from '@/types/creator';
import { calculateCreatorScore } from './scoring';

export interface AuditIssue {
  field: keyof IntelligentCreator | string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

export interface CreatorProfileAuditResult {
  creator_id: string;
  creator_name: string;
  completeness_pct: number;
  creator_score: number;
  creator_tier: CreatorTier;
  total_reach: number;
  status: 'passed' | 'needs_attention' | 'incomplete';
  issues: AuditIssue[];
  passed_checks: number;
  total_checks: number;
  audit_timestamp: string;
}

/**
 * Perform a full automated audit on a Creator Profile
 */
export function auditCreatorProfile(creator: Partial<IntelligentCreator>): CreatorProfileAuditResult {
  const issues: AuditIssue[] = [];
  let passedChecks = 0;
  let totalChecks = 0;

  function check(
    field: keyof IntelligentCreator | string,
    condition: boolean,
    severity: 'critical' | 'warning' | 'info',
    failMessage: string
  ) {
    totalChecks++;
    if (condition) {
      passedChecks++;
    } else {
      issues.push({ field, severity, message: failMessage });
    }
  }

  // 1. Identity Checks
  check('full_name', Boolean(creator.full_name && creator.full_name.trim().length > 1), 'critical', 'Full name is required');
  check('bio', Boolean(creator.bio && creator.bio.trim().length >= 20), 'warning', 'Bio should be at least 20 characters for brand visibility');
  check('profile_photo_url', Boolean(creator.profile_photo_url || creator.id), 'warning', 'Profile photo URL is missing');
  check('location', Boolean(creator.location || creator.location_city), 'info', 'Location/City is recommended');

  // 2. Category & Niche Taxonomy
  check('primary_niche', Boolean(creator.niche || creator.primary_niche || creator.primary_category), 'critical', 'Primary niche or category must be specified');
  check('content_language', Boolean(creator.primary_language || creator.content_language), 'warning', 'Content language is missing');

  // 3. Reach & Platform Presence
  const ytReach = creator.youtube_subscribers ?? 0;
  const igReach = creator.instagram_followers ?? 0;
  const totalReach = creator.total_reach ?? (ytReach + igReach);

  check('total_reach', totalReach > 0, 'critical', 'Total reach (YouTube subscribers + IG followers) is 0');
  check('youtube_handle', Boolean(creator.youtube_handle || creator.youtube_url || creator.insta_handle || creator.insta_url), 'warning', 'At least one social platform handle (YouTube or Instagram) is required');

  // 4. Analytics & Performance
  const avd = creator.yt_avg_watch_time_pct ?? 0;
  if (ytReach > 0) {
    check('yt_avg_watch_time_pct', avd > 0, 'info', 'Average View Duration (AVD) is not set');
    if (avd > 0) {
      check('avd_quality', avd >= 50, 'info', `AVD is ${avd}% (Industry benchmark is 60%+)`);
    }
  }

  const engagement = creator.engagement_rate ?? creator.yt_engagement_rate ?? creator.ig_engagement_rate ?? 0;
  check('engagement_rate', engagement > 0, 'warning', 'Engagement rate metric is missing');

  // 5. Commercial & Pricing
  const ratePost = creator.rate_post ?? 0;
  const rateVideo = creator.rate_video ?? 0;
  check('rate_card', ratePost > 0 || rateVideo > 0, 'warning', 'No commercial rates set (rate_post or rate_video)');

  // 6. Audience Demographics
  const genderMale = creator.audience_gender_male ?? 0;
  const genderFemale = creator.audience_gender_female ?? 0;
  check('audience_demographics', (genderMale + genderFemale) > 0, 'info', 'Audience gender demographics are not populated');

  // 7. Calculate Completeness & Score
  const completenessPct = Math.round((passedChecks / totalChecks) * 100);
  const scoreBreakdown = calculateCreatorScore(creator);
  const creatorScore = Math.round(scoreBreakdown.total);

  // Status classification
  let status: 'passed' | 'needs_attention' | 'incomplete' = 'passed';
  if (issues.some(i => i.severity === 'critical')) {
    status = 'incomplete';
  } else if (issues.length > 2 || completenessPct < 70) {
    status = 'needs_attention';
  }

  return {
    creator_id: creator.id || 'unknown',
    creator_name: creator.full_name || creator.display_name || 'Unnamed Creator',
    completeness_pct: completenessPct,
    creator_score: creatorScore,
    creator_tier: creator.creator_tier || 'micro',
    total_reach: totalReach,
    status,
    issues,
    passed_checks: passedChecks,
    total_checks: totalChecks,
    audit_timestamp: new Date().toISOString(),
  };
}

/**
 * Audit multiple creator profiles and return aggregated report
 */
export function auditCreatorRoster(creators: Partial<IntelligentCreator>[]) {
  const results = creators.map(auditCreatorProfile);
  const total = results.length;
  const avgCompleteness = total > 0 ? Math.round(results.reduce((acc, r) => acc + r.completeness_pct, 0) / total) : 0;
  const avgScore = total > 0 ? Math.round(results.reduce((acc, r) => acc + r.creator_score, 0) / total) : 0;

  const passedCount = results.filter(r => r.status === 'passed').length;
  const needsAttentionCount = results.filter(r => r.status === 'needs_attention').length;
  const incompleteCount = results.filter(r => r.status === 'incomplete').length;

  return {
    total_creators_audited: total,
    avg_completeness_pct: avgCompleteness,
    avg_creator_score: avgScore,
    status_summary: {
      passed: passedCount,
      needs_attention: needsAttentionCount,
      incomplete: incompleteCount,
    },
    results,
  };
}
