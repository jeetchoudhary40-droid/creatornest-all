// ============================================================
// CREATOR NEST — Intelligent Creator Profile Type System
// src/types/creator.ts
// ============================================================

export type CreatorTier = 'nano' | 'micro' | 'mid' | 'macro' | 'mega' | 'elite';
export type GrowthVelocity = 'Rising' | 'Stable' | 'Declining';
export type CRMStatus = 'Active' | 'Inactive' | 'On Hold' | 'Exited';
export type DataSource = 'Manual' | 'YouTube API' | 'Instagram API' | 'AI Enriched' | 'Mixed';
export type CollabType = 'Dedicated Video' | 'Integration' | 'YouTube Short' | 'IG Reel' | 'IG Story' | 'Ambassador' | 'Barter' | 'Package';
export type ContactMethod = 'Email' | 'WhatsApp' | 'Phone';

import type { SocialAccount } from './socialAccount';

// ── Sub-types ────────────────────────────────────────────────

export interface BrandCollab {
  brand: string;
  year: number;
  type: CollabType;
  sector?: string;
  value?: number;
  case_study_url?: string;
}

export interface AudienceCountry {
  country: string;
  pct: number;
}

export interface AudienceCity {
  city: string;
  pct: number;
}

export interface CompetitorChannel {
  name: string;
  url: string;
  subscribers?: number;
}

export interface CaseStudy {
  title: string;
  url: string;
  brand?: string;
}

export interface DeviceSplit {
  mobile: number;
  desktop: number;
  tablet: number;
}

// ── Creator Tier config ──────────────────────────────────────

export const CREATOR_TIERS: Record<CreatorTier, { label: string; min: number; max: number; color: string; bg: string }> = {
  nano:  { label: 'Nano',    min: 0,          max: 10_000,     color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
  micro: { label: 'Micro',   min: 10_000,     max: 100_000,    color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
  mid:   { label: 'Mid-Tier',min: 100_000,    max: 500_000,    color: '#34D399', bg: 'rgba(52,211,153,0.12)'  },
  macro: { label: 'Macro',   min: 500_000,    max: 2_000_000,  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  mega:  { label: 'Mega',    min: 2_000_000,  max: 10_000_000, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
  elite: { label: 'Elite',   min: 10_000_000, max: Infinity,   color: '#00F2FE', bg: 'rgba(0,242,254,0.12)'   },
};

// ── Full Niche Taxonomy ──────────────────────────────────────

export const NICHE_TAXONOMY: Record<string, string[]> = {
  'Technology':        ['Smartphone Reviews', 'Laptop Reviews', 'Budget Tech', 'AI & Future Tech', 'Cybersecurity', 'Programming', 'App Reviews', 'Wearables'],
  'Gaming':            ['Mobile Gaming', 'PC Gaming', 'Game Reviews', 'Esports', 'Speedruns', 'Horror Games', 'Gaming Lifestyle', 'Game Development'],
  'Entertainment':     ['Comedy Skits', 'Pranks', 'Reaction Videos', 'Storytelling', 'True Crime', 'Viral Challenges', 'POV Content', 'Short Films'],
  'Education':         ['UPSC & Exam Prep', 'Science Explainers', 'History', 'Mathematics', 'Language Learning', 'Study With Me', 'Career Advice', 'Books & Literature'],
  'Finance & Business':['Stock Market', 'Crypto', 'Personal Finance', 'Startups & Entrepreneurship', 'Real Estate', 'Side Hustles', 'Business Reviews'],
  'Fashion & Beauty':  ['Skincare', 'Makeup Tutorials', 'Outfit Ideas', 'Sustainable Fashion', "Men's Fashion", 'Hauls & Reviews', 'Luxury Fashion'],
  'Food & Cooking':    ['Home Cooking', 'Street Food Reviews', 'Restaurant Reviews', 'Healthy Eating', 'Baking', 'Regional Cuisine', 'Vegan & Vegetarian'],
  'Travel & Adventure':['Budget Travel', 'Luxury Travel', 'Solo Travel', 'Hidden Gems', 'Road Trips', 'International Travel', 'Travel Tips'],
  'Fitness & Wellness':['Workout Routines', 'Yoga', 'Weight Loss Journey', 'Nutrition', 'Mental Health', 'Running', 'Calisthenics'],
  'Music':             ['Original Music', 'Covers', 'Music Production', 'Instrument Tutorials', 'Bollywood', 'Indie Music', 'Music Reviews'],
  'Lifestyle & Vlogging':['Daily Vlogs', 'Minimalism', 'Productivity', 'Morning Routines', 'Room Tours', 'Moving Vlogs'],
  'Art & Design':      ['Digital Art', 'Illustration', 'Photography', 'Videography', 'UI/UX Design', 'Animation', 'Crafts & DIY'],
  'Parenting & Family':['Mom Life', 'Dad Content', "Kids' Education", 'Pregnancy', 'Relationship Advice', 'Family Vlogs'],
  'Spirituality':      ['Meditation', 'Self-Help', 'Astrology', 'Motivation', 'Manifestation'],
  'Automotive':        ['Car Reviews', 'Bike Reviews', 'EV Content', 'Modification Tips', 'Road Test'],
};

export const CONTENT_FORMATS = [
  'Long-form Video (10m+)',
  'Short-form Video (<10m)',
  'YouTube Shorts',
  'Instagram Reels',
  'Instagram Stories',
  'Instagram Posts (Static)',
  'Instagram Carousels',
  'Live Streams',
  'Podcasts',
  'Newsletter',
  'Blog / Articles',
  'Community Posts',
];

export const CONTENT_STYLES = [
  'Educational',
  'Educational-Entertaining (Edutainment)',
  'Entertainment / Comedy',
  'Documentary / Cinematic',
  'Review & Analysis',
  'Tutorial / How-To',
  'Vlog / Lifestyle',
  'Motivational / Inspirational',
  'News & Commentary',
  'ASMR / Relaxation',
];

// ── The Master Creator Profile Interface ─────────────────────

export interface IntelligentCreator {
  // ── Core Identity ──────────────────────────────────────────
  id:                string;
  full_name:         string;
  display_name:      string;
  tagline:           string;
  bio:               string;
  profile_photo_url: string;   // was: img
  cover_photo_url:   string;
  creator_since?:    string;
  gender?:           string;

  // ── Location ───────────────────────────────────────────────
  location:          string;   // legacy city field
  location_city:     string;
  location_state:    string;
  location_country:  string;   // was: target_country
  primary_language:  string;
  content_language:  string;
  timezone:          string;

  // ── Category & Niche ───────────────────────────────────────
  primary_category:           string;
  secondary_category:         string;
  niche:                      string;   // legacy single niche
  primary_niche:              string;
  secondary_niche:            string;
  niche_tags:                 string[];
  content_formats:            string[];
  content_style:              string;
  content_tone:               string;
  upload_frequency:           string;
  avg_content_length_min:     number;
  content_pillars:            string[];
  brand_categories:           string[];   // was: brand_categories (willing)
  brand_categories_blacklist: string[];
  best_posting_day:           string;
  best_posting_time:          string;

  // ── Platform Presence ──────────────────────────────────────
  primary_platform:        string;
  total_reach:             number;
  social_accounts?:        SocialAccount[]; // Multi-channel support

  // YouTube
  youtube_url:             string;
  youtube_handle:          string;
  channel_name?:           string;
  channelName?:            string;
  youtube_channel_id:      string;
  youtube_subscribers:     number;   // was: youtubeNum
  youtube_total_views:     number;
  youtube_video_count:     number;
  youtube_partner:         boolean;

  // Instagram
  insta_url:               string;
  insta_handle:            string;
  instagram_followers:     number;   // was: instaNum
  instagram_posts_count:   number;
  instagram_verified:      boolean;

  // Other platforms
  tiktok_url:              string;
  tiktok_handle:           string;
  tiktok_followers:        number;
  twitter_url:             string;
  twitter_handle:          string;
  twitter_followers:       number;
  linkedin_url:            string;
  linkedin_handle:         string;
  linkedin_followers:      number;

  // Other channels
  podcast_url:             string;
  podcast_listeners:       number;
  newsletter_url:          string;
  newsletter_subscribers:  number;
  website_url:             string;

  // ── YouTube Analytics (auto-synced) ───────────────────────
  yt_avg_views_per_video:    number;
  yt_avg_watch_time_pct:     number;   // was: avd
  yt_avg_watch_time_sec:     number;
  yt_subscriber_growth_30d:  number;
  yt_subscriber_growth_pct:  number;
  yt_engagement_rate:        number;
  yt_like_rate:              number;
  yt_comment_rate:           number;
  yt_share_rate:             number;
  yt_click_through_rate:     number;
  yt_viral_video_count:      number;
  yt_shorts_avg_views:       number;
  yt_community_post_reach:   number;

  // ── Instagram Analytics (auto-synced) ─────────────────────
  ig_engagement_rate:       number;
  ig_avg_reel_views:        number;
  ig_avg_post_likes:        number;
  ig_avg_post_comments:     number;
  ig_avg_story_views:       number;
  ig_saves_rate:            number;
  ig_reach_per_post:        number;
  ig_follower_growth_30d:   number;
  ig_follower_growth_pct:   number;

  // ── Cross-Platform Scores ──────────────────────────────────
  engagement_rate:          number;   // was: engagement_rate (legacy blended)
  avg_views:                number;   // legacy blended
  monthly_impressions:      number;
  estimated_monthly_reach:  number;
  authenticity_score:       number;   // 0–100, fake follower detection
  audience_quality_score:   number;   // 0–100
  influence_score:          number;   // 0–100 composite
  trending_score:           number;   // 0–100 momentum
  growth_velocity:          GrowthVelocity;
  creator_score:            number;   // 0–100 platform score
  creator_tier:             CreatorTier;

  // ── Audience Demographics ──────────────────────────────────
  audience_gender_male:    number;
  audience_gender_female:  number;
  audience_gender_other:   number;
  audience_age_13_17:      number;
  audience_age_18_24:      number;
  audience_age_25_34:      number;
  audience_age_35_44:      number;
  audience_age_45_plus:    number;
  audience_top_countries:  AudienceCountry[];
  audience_top_cities:     AudienceCity[];
  audience_interests:      string[];
  audience_income_segment: string;
  audience_india_pct:      number;
  audience_tier1_city_pct: number;
  audience_device_split:   DeviceSplit;
  audience_language_pref:  string[];

  // ── Commercial & Collaboration ─────────────────────────────
  rate_post:                number;   // legacy IG post rate
  rate_video:               number;   // legacy YT video rate
  rate_dedicated_video:     number;
  rate_integrated_video:    number;
  rate_youtube_short:       number;
  rate_ig_reel:             number;
  rate_ig_story_set:        number;
  rate_package_bundle:      number;
  rate_ambassador_monthly:  number;
  rate_negotiable:          boolean;
  barter_collab_open:       boolean;
  barter_min_value:         number;
  past_brand_collabs:       BrandCollab[];
  collab_count_total:       number;
  collab_count_current_year: number;
  repeat_brand_rate:        number;
  avg_campaign_roi_delivered: string;
  case_study_urls:          CaseStudy[];
  exclusive_brand_active:   boolean;
  exclusive_brand_name:     string;
  exclusive_expiry_date?:   string;
  open_to_collab:           boolean;
  collab_lead_time_days:    number;
  preferred_collab_type:    CollabType[];
  media_kit_url:            string;
  contract_template_url:    string;
  currency:                 string;

  // ── AI-Generated Strategy ──────────────────────────────────
  seo_keywords:              string[];
  competitor_channels:       CompetitorChannel[];
  strategy_goals:            string[];
  seasonal_peak_months:      string[];
  best_performing_category:  string;
  worst_performing_category: string;
  content_gap_notes:         string;
  ai_growth_insight:         string;
  ai_brand_fit_summary:      string;
  ai_content_suggestions:    string[];
  next_big_video_date?:      string;
  channel_age_months:        number;
  subscriber_milestone_next: number;
  projected_growth_6m:       number;

  // ── Contact & Management ───────────────────────────────────
  business_email:           string;
  contact_phone:            string;
  whatsapp_number:          string;
  management_agency:        string;
  manager_name:             string;
  manager_email:            string;
  manager_phone:            string;
  manager_notes:            string;
  response_time_hrs:        number;
  preferred_contact_method: ContactMethod;

  // ── Private Admin-Only Contact Info ────────────────────────
  // ⚠️  NEVER expose these fields to public pages or creator-facing UI
  private_business_email:         string;   // Primary business/collab email
  private_contact_phone_1:        string;   // Primary contact number
  private_contact_phone_2:        string;   // Secondary contact number
  private_whatsapp_number:        string;   // WhatsApp number (may differ from phone)
  private_instagram_dm_handle:    string;   // Instagram handle for direct DM
  private_twitter_dm_handle:      string;   // Twitter/X handle for DM
  private_linkedin_dm_handle:     string;   // LinkedIn handle for DM
  private_youtube_community_url:  string;   // YouTube community / about page
  private_telegram_handle:        string;   // Telegram username
  private_snapchat_handle:        string;   // Snapchat username
  private_facebook_page_url:      string;   // Facebook page URL
  private_discord_handle:         string;   // Discord username / server invite
  private_contact_notes:          string;   // Admin notes on best way to reach

  // ── Trust & Verification ───────────────────────────────────
  is_verified_creator:      boolean;
  verification_date?:       string;
  pan_kyc_verified:         boolean;
  gstin_available:          boolean;
  featured:                 boolean;
  topGrowing:               boolean;
  awards_and_badges:        string[];

  // ── Platform CRM ──────────────────────────────────────────
  crm_status:               CRMStatus;
  onboarding_date?:         string;
  last_activity_date?:      string;
  profile_completeness_pct: number;
  data_last_updated:        string;
  data_source:              DataSource;
  internal_tags:            string[];
  contract_status:          string;
  payment_terms:            string;
  revenue_generated_lifetime: number;
  auto_sync_enabled:        boolean;
  youtube_access_token?:    string;   // encrypted – never expose to client
  instagram_access_token?:  string;   // encrypted – never expose to client
  ai_last_enriched?:        string;
  last_api_sync?:           string;
  sync_error_log?:          string;
}

// ── Helper: assign creator tier from total reach ─────────────
export function assignCreatorTier(totalReach: number): CreatorTier {
  if (totalReach >= 10_000_000) return 'elite';
  if (totalReach >= 2_000_000)  return 'mega';
  if (totalReach >= 500_000)    return 'macro';
  if (totalReach >= 100_000)    return 'mid';
  if (totalReach >= 10_000)     return 'micro';
  return 'nano';
}

// ── Helper: calculate profile completeness % ─────────────────
export function calculateCompleteness(creator: Partial<IntelligentCreator>): number {
  const FIELD_WEIGHTS: Partial<Record<keyof IntelligentCreator, number>> = {
    // Critical (3pts each)
    full_name: 3, bio: 3, primary_category: 3, primary_niche: 3,
    youtube_subscribers: 3, engagement_rate: 3, business_email: 3,
    // Important (2pts each)
    tagline: 2, cover_photo_url: 2, content_formats: 2, upload_frequency: 2,
    audience_age_18_24: 2, audience_gender_male: 2, rate_ig_reel: 2,
    rate_dedicated_video: 2, niche_tags: 2, audience_interests: 2,
    // Nice to have (1pt each)
    seo_keywords: 1,
    media_kit_url: 1,
    ai_growth_insight: 1,
    past_brand_collabs: 1,
    strategy_goals: 1,
    website_url: 1,
  };

  const total = Object.values(FIELD_WEIGHTS).reduce((a: number, b) => a + (b ?? 0), 0);
  const earned = (Object.entries(FIELD_WEIGHTS) as [keyof IntelligentCreator, number][])
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

// ── Legacy CreatorType for backwards compat (roster/page.tsx) ─
export type LegacyCreatorType = {
  id:           string | number;
  name:         string;
  niche:        string;
  platform:     'Youtube' | 'Instagram' | 'Both';
  youtube:      string;
  youtubeNum:   number;
  instagram:    string;
  instaNum:     number;
  avd:          string;
  location:     string;
  featured:     boolean;
  topGrowing:   boolean;
  img:          string;
  bio:          string;
  rank?:        number;
  channelName?: string;
  channel_name?: string;
  // extended
  contactPhone?:      string;
  whatsappNumber?:    string;
  businessEmail?:     string;
  youtubeUrl?:        string;
  youtubeHandle?:     string;
  instaUrl?:          string;
  instaHandle?:       string;
  linkedinUrl?:       string;
  linkedinHandle?:    string;
  twitterUrl?:        string;
  twitterHandle?:     string;
  tiktokUrl?:         string;
  tiktokHandle?:      string;
  avgViews?:          number;
  engagementRate?:    number;
  primaryLanguage?:   string;
  targetCountry?:     string;
  audienceGenderMale?:   number;
  audienceGenderFemale?: number;
  audienceAge1824?:   number;
  audienceAge2534?:   number;
  ratePost?:          number;
  rateVideo?:         number;
  managerNotes?:      string;
  brandCategories?:   string[];
  socialAccounts?:    any[]; // Multi-channel support for roster
  // ── Private Admin-Only Contact Fields (never shown publicly) ─
  private_business_email?:         string;
  private_contact_phone_1?:        string;
  private_contact_phone_2?:        string;
  private_whatsapp_number?:        string;
  private_instagram_dm_handle?:    string;
  private_twitter_dm_handle?:      string;
  private_linkedin_dm_handle?:     string;
  private_youtube_community_url?:  string;
  private_telegram_handle?:        string;
  private_snapchat_handle?:        string;
  private_facebook_page_url?:      string;
  private_discord_handle?:         string;
  private_contact_notes?:          string;
};

// ── Mapper: DB row → IntelligentCreator ──────────────────────
export function mapDbRowToCreator(row: Record<string, unknown>): Partial<IntelligentCreator> {
  return {
    id:                    String(row.id ?? ''),
    full_name:             String(row.name ?? row.full_name ?? ''),
    display_name:          String(row.display_name ?? ''),
    tagline:               String(row.tagline ?? ''),
    bio:                   String(row.bio ?? ''),
    profile_photo_url:     String(row.img ?? row.profile_photo_url ?? ''),
    cover_photo_url:       String(row.cover_photo_url ?? ''),
    location:              String(row.location ?? ''),
    location_city:         String(row.location ?? row.location_city ?? ''),
    location_country:      String(row.target_country ?? row.location_country ?? 'India'),
    primary_language:      String(row.primary_language ?? 'English'),
    content_language:      String(row.content_language ?? ''),
    primary_category:      String(row.primary_category ?? ''),
    primary_niche:         String(row.niche ?? row.primary_niche ?? ''),
    secondary_niche:       String(row.secondary_niche ?? ''),
    niche_tags:            (row.niche_tags as string[]) ?? [],
    content_formats:       (row.content_formats as string[]) ?? [],
    content_pillars:       (row.content_pillars as string[]) ?? [],
    brand_categories:      (row.brand_categories as string[]) ?? [],
    primary_platform:      String(row.primary_platform ?? row.platform ?? 'YouTube'),
    youtube_url:           String(row.youtube_url ?? ''),
    youtube_handle:        String(row.youtube_handle ?? ''),
    channel_name:          String(row.channel_name ?? row.channelName ?? row.youtube_handle ?? row.youtubeHandle ?? ''),
    channelName:           String(row.channelName ?? row.channel_name ?? row.youtubeHandle ?? row.youtube_handle ?? ''),
    youtube_channel_id:    String(row.youtube_channel_id ?? ''),
    youtube_subscribers:   Number(row.youtubeNum ?? row.youtube_subscribers ?? 0),
    youtube_total_views:   Number(row.youtube_total_views ?? 0),
    youtube_video_count:   Number(row.youtube_video_count ?? 0),
    youtube_partner:       Boolean(row.youtube_partner ?? false),
    insta_url:             String(row.insta_url ?? ''),
    insta_handle:          String(row.insta_handle ?? ''),
    instagram_followers:   Number(row.instaNum ?? row.instagram_followers ?? 0),
    instagram_posts_count: Number(row.instagram_posts_count ?? 0),
    instagram_verified:    Boolean(row.instagram_verified ?? false),
    tiktok_url:            String(row.tiktok_url ?? ''),
    tiktok_handle:         String(row.tiktok_handle ?? ''),
    tiktok_followers:      Number(row.tiktok_followers ?? 0),
    twitter_url:           String(row.twitter_url ?? ''),
    twitter_handle:        String(row.twitter_handle ?? ''),
    twitter_followers:     Number(row.twitter_followers ?? 0),
    linkedin_url:          String(row.linkedin_url ?? ''),
    linkedin_handle:       String(row.linkedin_handle ?? ''),
    linkedin_followers:    Number(row.linkedin_followers ?? 0),
    total_reach:           Number(row.total_reach ?? 0),
    yt_avg_watch_time_pct: Number(row.avd ?? row.yt_avg_watch_time_pct ?? 0),
    yt_avg_views_per_video:Number(row.yt_avg_views_per_video ?? 0),
    yt_avg_watch_time_sec: Number(row.yt_avg_watch_time_sec ?? 0),
    yt_subscriber_growth_30d: Number(row.yt_subscriber_growth_30d ?? 0),
    yt_subscriber_growth_pct: Number(row.yt_subscriber_growth_pct ?? 0),
    yt_engagement_rate:    Number(row.yt_engagement_rate ?? 0),
    yt_like_rate:          Number(row.yt_like_rate ?? 0),
    yt_comment_rate:       Number(row.yt_comment_rate ?? 0),
    yt_share_rate:         Number(row.yt_share_rate ?? 0),
    yt_click_through_rate: Number(row.yt_click_through_rate ?? 0),
    yt_viral_video_count:  Number(row.yt_viral_video_count ?? 0),
    yt_shorts_avg_views:   Number(row.yt_shorts_avg_views ?? 0),
    yt_community_post_reach: Number(row.yt_community_post_reach ?? 0),

    engagement_rate:       Number(row.engagement_rate ?? 0),
    avg_views:             Number(row.avg_views ?? 0),

    ig_engagement_rate:    Number(row.ig_engagement_rate ?? 0),
    ig_avg_reel_views:     Number(row.ig_avg_reel_views ?? 0),
    ig_avg_post_likes:     Number(row.ig_avg_post_likes ?? 0),
    ig_avg_post_comments:  Number(row.ig_avg_post_comments ?? 0),
    ig_avg_story_views:    Number(row.ig_avg_story_views ?? 0),
    ig_saves_rate:         Number(row.ig_saves_rate ?? 0),
    ig_reach_per_post:     Number(row.ig_reach_per_post ?? 0),
    ig_follower_growth_30d: Number(row.ig_follower_growth_30d ?? 0),
    ig_follower_growth_pct: Number(row.ig_follower_growth_pct ?? 0),

    authenticity_score:    Number(row.authenticity_score ?? 0),
    audience_quality_score: Number(row.audience_quality_score ?? 0),
    influence_score:       Number(row.influence_score ?? 0),
    trending_score:        Number(row.trending_score ?? 0),
    monthly_impressions:   Number(row.monthly_impressions ?? 0),
    estimated_monthly_reach: Number(row.estimated_monthly_reach ?? 0),
    creator_score:         Number(row.creator_score ?? 0),
    creator_tier:          (row.creator_tier as CreatorTier) ?? 'micro',
    growth_velocity:       (row.growth_velocity as GrowthVelocity) ?? 'Stable',
    audience_gender_male:  Number(row.audience_gender_male ?? 50),
    audience_gender_female:Number(row.audience_gender_female ?? 50),
    audience_age_18_24:    Number(row.audience_age_18_24 ?? 0),
    audience_age_25_34:    Number(row.audience_age_25_34 ?? 0),
    audience_age_35_44:    Number(row.audience_age_35_44 ?? 0),
    audience_top_countries:(row.audience_top_countries as AudienceCountry[]) ?? [],
    audience_top_cities:   (row.audience_top_cities as AudienceCity[]) ?? [],
    audience_interests:    (row.audience_interests as string[]) ?? [],
    audience_india_pct:    Number(row.audience_india_pct ?? 0),
    rate_post:             Number(row.rate_post ?? 0),
    rate_video:            Number(row.rate_video ?? 0),
    rate_dedicated_video:  Number(row.rate_dedicated_video ?? 0),
    rate_ig_reel:          Number(row.rate_ig_reel ?? 0),
    rate_ig_story_set:     Number(row.rate_ig_story_set ?? 0),
    rate_youtube_short:    Number(row.rate_youtube_short ?? 0),
    rate_ambassador_monthly: Number(row.rate_ambassador_monthly ?? 0),
    rate_negotiable:       Boolean(row.rate_negotiable ?? true),
    barter_collab_open:    Boolean(row.barter_collab_open ?? true),
    open_to_collab:        Boolean(row.open_to_collab ?? true),
    past_brand_collabs:    (row.past_brand_collabs as BrandCollab[]) ?? [],
    collab_count_total:    Number(row.collab_count_total ?? 0),
    collab_count_current_year: Number(row.collab_count_current_year ?? 0),
    repeat_brand_rate:     Number(row.repeat_brand_rate ?? 0),
    preferred_collab_type: (row.preferred_collab_type as any[]) ?? [],
    collab_lead_time_days: Number(row.collab_lead_time_days ?? 14),
    avg_campaign_roi_delivered: String(row.avg_campaign_roi_delivered ?? ''),
    exclusive_brand_active:Boolean(row.exclusive_brand_active ?? false),
    exclusive_brand_name:  String(row.exclusive_brand_name ?? ''),
    exclusive_expiry_date: row.exclusive_expiry_date ? String(row.exclusive_expiry_date) : undefined,
    media_kit_url:         String(row.media_kit_url ?? ''),
    seo_keywords:          (row.seo_keywords as string[]) ?? [],
    strategy_goals:        (row.strategy_goals as string[]) ?? [],
    seasonal_peak_months:  (row.seasonal_peak_months as string[]) ?? [],
    best_performing_category: String(row.best_performing_category ?? ''),
    worst_performing_category: String(row.worst_performing_category ?? ''),
    content_gap_notes:     String(row.content_gap_notes ?? ''),
    projected_growth_6m:   Number(row.projected_growth_6m ?? 0),
    subscriber_milestone_next: Number(row.subscriber_milestone_next ?? 0),
    ai_growth_insight:     String(row.ai_growth_insight ?? ''),
    ai_brand_fit_summary:  String(row.ai_brand_fit_summary ?? ''),
    ai_content_suggestions:(row.ai_content_suggestions as string[]) ?? [],
    business_email:        String(row.business_email ?? ''),
    contact_phone:         String(row.contact_phone ?? ''),
    whatsapp_number:       String(row.whatsapp_number ?? ''),
    manager_notes:         String(row.manager_notes ?? ''),
    management_agency:     String(row.management_agency ?? 'Creator Nest'),
    manager_name:          String(row.manager_name ?? ''),
    manager_email:         String(row.manager_email ?? ''),
    is_verified_creator:   Boolean(row.is_verified_creator ?? false),
    featured:              Boolean(row.featured ?? false),
    topGrowing:            Boolean(row.top_growing ?? row.topGrowing ?? false),
    awards_and_badges:     (row.awards_and_badges as string[]) ?? [],
    crm_status:            (row.crm_status as CRMStatus) ?? 'Active',
    profile_completeness_pct: Number(row.profile_completeness_pct ?? 0),
    data_last_updated:     String(row.data_last_updated ?? ''),
    data_source:           (row.data_source as DataSource) ?? 'Manual',
    auto_sync_enabled:     Boolean(row.auto_sync_enabled ?? false),
    ai_last_enriched:      row.ai_last_enriched ? String(row.ai_last_enriched) : undefined,
    last_api_sync:         row.last_api_sync ? String(row.last_api_sync) : undefined,
    internal_tags:         (row.internal_tags as string[]) ?? [],
    revenue_generated_lifetime: Number(row.revenue_generated_lifetime ?? 0),
    // ── Private admin-only contact fields ─────────────────────
    private_business_email:        String(row.private_business_email ?? ''),
    private_contact_phone_1:       String(row.private_contact_phone_1 ?? ''),
    private_contact_phone_2:       String(row.private_contact_phone_2 ?? ''),
    private_whatsapp_number:       String(row.private_whatsapp_number ?? ''),
    private_instagram_dm_handle:   String(row.private_instagram_dm_handle ?? ''),
    private_twitter_dm_handle:     String(row.private_twitter_dm_handle ?? ''),
    private_linkedin_dm_handle:    String(row.private_linkedin_dm_handle ?? ''),
    private_youtube_community_url: String(row.private_youtube_community_url ?? ''),
    private_telegram_handle:       String(row.private_telegram_handle ?? ''),
    private_snapchat_handle:       String(row.private_snapchat_handle ?? ''),
    private_facebook_page_url:     String(row.private_facebook_page_url ?? ''),
    private_discord_handle:        String(row.private_discord_handle ?? ''),
    private_contact_notes:         String(row.private_contact_notes ?? ''),
  };
}

// ── Helper: Get URL slug (e.g. @ElectionGuide) for creator ────
export function getCreatorSlug(creator: Partial<IntelligentCreator> | Record<string, any>): string {
  if (!creator) return 'creator';
  const handle = creator.youtube_handle || creator.insta_handle || creator.display_name;
  if (handle && String(handle).trim()) {
    const clean = String(handle).trim();
    return clean.startsWith('@') ? clean : `@${clean}`;
  }
  const name = creator.full_name || (creator as Record<string, any>).name;
  if (name && String(name).trim()) {
    const cleanName = String(name).trim().toLowerCase().replace(/[^a-z0-9_]/gi, '');
    return `@${cleanName}`;
  }
  return creator.id ? String(creator.id) : 'creator';
}
