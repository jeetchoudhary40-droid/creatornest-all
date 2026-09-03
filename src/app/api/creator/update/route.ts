// ============================================================
// POST /api/creator/update
// Manual profile update — admin or creator self-update
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { autoScoreCreator } from '@/lib/scoring';
import type { IntelligentCreator } from '@/types/creator';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_ROSTER_COLUMNS = new Set([
  // Core identity
  'id', 'profile_id', 'name', 'full_name', 'display_name', 'tagline', 'bio',
  'profile_photo_url', 'img', 'cover_photo_url', 'creator_since', 'gender',
  // Location
  'location', 'location_city', 'location_state', 'location_country', 'target_country',
  'primary_language', 'content_language', 'timezone',
  // Category & Niche
  'niche', 'primary_category', 'secondary_category', 'primary_niche', 'secondary_niche',
  'niche_tags', 'content_formats', 'content_style', 'content_tone',
  'upload_frequency', 'avg_content_length_min', 'content_pillars',
  'brand_categories', 'brand_categories_blacklist',
  'best_posting_day', 'best_posting_time',
  // Platform Presence
  'primary_platform', 'total_reach',
  'youtube_url', 'youtube_handle', 'youtube_channel_id',
  'youtube_subscribers', 'youtube_total_views', 'youtube_video_count', 'youtube_partner',
  'youtube_subs', 'youtube_num',
  'insta_url', 'insta_handle', 'instagram_followers', 'instagram_posts_count', 'instagram_verified',
  'insta_subs', 'insta_num',
  'tiktok_url', 'tiktok_handle', 'tiktok_followers',
  'twitter_url', 'twitter_handle', 'twitter_followers',
  'linkedin_url', 'linkedin_handle', 'linkedin_followers',
  'podcast_url', 'podcast_listeners', 'newsletter_url', 'newsletter_subscribers', 'website_url',
  // YouTube Analytics
  'yt_avg_views_per_video', 'yt_avg_watch_time_pct', 'yt_avg_watch_time_sec',
  'yt_subscriber_growth_30d', 'yt_subscriber_growth_pct', 'yt_engagement_rate',
  'yt_like_rate', 'yt_comment_rate', 'yt_share_rate', 'yt_click_through_rate',
  'yt_viral_video_count', 'yt_shorts_avg_views', 'yt_community_post_reach',
  'avd',
  // Instagram Analytics
  'ig_engagement_rate', 'ig_avg_reel_views', 'ig_avg_post_likes', 'ig_avg_post_comments',
  'ig_avg_story_views', 'ig_saves_rate', 'ig_reach_per_post',
  'ig_follower_growth_30d', 'ig_follower_growth_pct',
  // Cross-Platform Scores
  'engagement_rate', 'avg_views', 'monthly_impressions', 'estimated_monthly_reach',
  'authenticity_score', 'audience_quality_score', 'influence_score', 'trending_score',
  'growth_velocity', 'creator_score', 'creator_tier',
  // Audience Demographics
  'audience_gender_male', 'audience_gender_female', 'audience_gender_other',
  'audience_age_13_17', 'audience_age_18_24', 'audience_age_25_34',
  'audience_age_35_44', 'audience_age_45_plus',
  'audience_top_countries', 'audience_top_cities', 'audience_interests',
  'audience_income_segment', 'audience_india_pct', 'audience_tier1_city_pct',
  'audience_device_split', 'audience_language_pref',
  // Commercial
  'rate_post', 'rate_video',
  'rate_dedicated_video', 'rate_integrated_video', 'rate_youtube_short',
  'rate_ig_reel', 'rate_ig_story_set', 'rate_package_bundle',
  'rate_ambassador_monthly', 'rate_negotiable', 'barter_collab_open', 'barter_min_value',
  'open_to_collab', 'collab_lead_time_days', 'preferred_collab_type',
  'past_brand_collabs', 'collab_count_total', 'collab_count_current_year',
  'repeat_brand_rate', 'avg_campaign_roi_delivered', 'case_study_urls',
  'exclusive_brand_active', 'exclusive_brand_name', 'exclusive_expiry_date',
  'media_kit_url', 'contract_template_url', 'currency',
  // AI Strategy
  'seo_keywords', 'competitor_channels', 'strategy_goals', 'seasonal_peak_months',
  'best_performing_category', 'worst_performing_category', 'content_gap_notes',
  'ai_growth_insight', 'ai_brand_fit_summary', 'ai_content_suggestions',
  'next_big_video_date', 'channel_age_months', 'subscriber_milestone_next', 'projected_growth_6m',
  // Contact & Management
  'business_email', 'contact_phone', 'whatsapp_number',
  'management_agency', 'manager_name', 'manager_email', 'manager_phone', 'manager_notes',
  'response_time_hrs', 'preferred_contact_method',
  // Trust & Verification
  'is_verified_creator', 'verification_date', 'pan_kyc_verified', 'gstin_available',
  'is_featured', 'top_growing',
  'awards_and_badges',
  // CRM & Sync
  'crm_status', 'onboarding_date', 'last_activity_date',
  'profile_completeness_pct', 'data_last_updated', 'data_source',
  'internal_tags', 'contract_status', 'payment_terms', 'revenue_generated_lifetime',
  'auto_sync_enabled', 'youtube_access_token', 'instagram_access_token',
  'ai_last_enriched', 'last_api_sync', 'sync_error_log',
  // Display control
  'show_on_roster', 'show_on_home', 'home_sequence',
  'created_at', 'updated_at',
]);


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorId, fields, updatedBy, source = 'Manual' } = body as {
      creatorId: string;
      fields:    Partial<IntelligentCreator>;
      updatedBy: string;
      source?:   string;
    };

    if (!creatorId || !fields) {
      return NextResponse.json({ error: 'creatorId and fields are required' }, { status: 400 });
    }

    const decodedId = decodeURIComponent(creatorId);

    // ── Find existing creator row by ID or handle ────────────────
    let existing: Record<string, unknown> = {};
    let targetId = decodedId;

    let { data: dbRow } = await supabaseAdmin
      .from('creator_roster')
      .select('*')
      .eq('id', decodedId)
      .maybeSingle();

    if (!dbRow && (decodedId.startsWith('@') || !decodedId.includes('-'))) {
      const handleClean = decodedId.replace(/^@/, '');
      const { data: handleRow } = await supabaseAdmin
        .from('creator_roster')
        .select('*')
        .or(`youtube_handle.ilike.%${handleClean}%,insta_handle.ilike.%${handleClean}%,display_name.ilike.%${handleClean}%`)
        .limit(1)
        .maybeSingle();
      if (handleRow) {
        dbRow = handleRow;
      }
    }

    if (dbRow) {
      existing = dbRow;
      targetId = String(dbRow.id);
    }

    // ── Map alias fields ─────────────────────────────────────────
    const mappedPayload: Record<string, unknown> = { ...fields };

    const fAny = fields as Record<string, any>;
    if (fAny.topGrowing !== undefined) mappedPayload.top_growing = fAny.topGrowing;
    if (fAny.featured !== undefined) mappedPayload.is_featured = fAny.featured;
    if (fAny.location_city && !fAny.location) mappedPayload.location = fAny.location_city;
    if (fAny.location_country && !fAny.target_country) mappedPayload.target_country = fAny.location_country;
    if (fAny.youtube_subscribers && !fAny.youtube_num) mappedPayload.youtube_num = fAny.youtube_subscribers;
    if (fAny.instagram_followers && !fAny.insta_num) mappedPayload.insta_num = fAny.instagram_followers;

    const merged = { id: targetId, ...existing, ...mappedPayload } as Partial<IntelligentCreator>;
    const { creator_score, creator_tier, total_reach, growth_velocity, profile_completeness_pct } =
      autoScoreCreator(merged);

    mappedPayload.id = targetId;
    mappedPayload.creator_score = creator_score;
    mappedPayload.creator_tier = creator_tier;
    mappedPayload.total_reach = total_reach;
    mappedPayload.growth_velocity = growth_velocity;
    mappedPayload.profile_completeness_pct = profile_completeness_pct;
    mappedPayload.data_last_updated = new Date().toISOString();
    mappedPayload.data_source = source;

    // ── Filter to ONLY valid database table columns ──────────────
    const updatePayload: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(mappedPayload)) {
      if (VALID_ROSTER_COLUMNS.has(key)) {
        updatePayload[key] = val;
      }
    }

    // ── Save to local data/roster.json ─────────────────────────
    try {
      const fs = require('fs');
      const path = require('path');
      const ROSTER_FILE_PATH = path.join(process.cwd(), 'data', 'roster.json');
      let localCreators: any[] = [];
      if (fs.existsSync(ROSTER_FILE_PATH)) {
        localCreators = JSON.parse(fs.readFileSync(ROSTER_FILE_PATH, 'utf-8') || '[]');
      }
      
      const foundIdx = localCreators.findIndex((c: any) => 
        String(c.id) === String(targetId) || 
        String(c.id) === String(decodedId) ||
        (c.name && fields.full_name && c.name.toLowerCase() === fields.full_name.toLowerCase()) ||
        (c.youtubeHandle && fields.youtube_handle && c.youtubeHandle.toLowerCase() === fields.youtube_handle.toLowerCase())
      );

      const f = fields as any;
      const creatorRecord = {
        id: foundIdx !== -1 ? localCreators[foundIdx].id : targetId,
        name: f.full_name || f.name || (foundIdx !== -1 ? localCreators[foundIdx].name : 'Creator'),
        channelName: f.channel_name || f.channelName || (foundIdx !== -1 ? localCreators[foundIdx].channelName : ''),
        niche: f.primary_category || f.niche || (foundIdx !== -1 ? localCreators[foundIdx].niche : 'AI & Automation'),
        platform: f.primary_platform || (foundIdx !== -1 ? localCreators[foundIdx].platform : 'Both'),
        youtube: f.youtube_subs || (f.youtube_subscribers ? String(f.youtube_subscribers) : (foundIdx !== -1 ? localCreators[foundIdx].youtube : '0')),
        youtubeNum: Number(f.youtube_subscribers || f.youtube_num) || (foundIdx !== -1 ? localCreators[foundIdx].youtubeNum : 0),
        instagram: f.insta_subs || (f.instagram_followers ? String(f.instagram_followers) : (foundIdx !== -1 ? localCreators[foundIdx].instagram : '0')),
        instaNum: Number(f.instagram_followers || f.insta_num) || (foundIdx !== -1 ? localCreators[foundIdx].instaNum : 0),
        location: f.location_city || f.location || (foundIdx !== -1 ? localCreators[foundIdx].location : 'India'),
        avd: f.avd || (f.yt_avg_watch_time_pct ? `${f.yt_avg_watch_time_pct}%` : (foundIdx !== -1 ? localCreators[foundIdx].avd : '75%')),
        topGrowing: f.top_growing !== undefined ? Boolean(f.top_growing) : (foundIdx !== -1 ? localCreators[foundIdx].topGrowing : true),
        featured: f.is_featured !== undefined ? Boolean(f.is_featured) : (foundIdx !== -1 ? localCreators[foundIdx].featured : true),
        rank: Number(f.home_sequence) || (foundIdx !== -1 ? localCreators[foundIdx].rank : 999),
        img: f.profile_photo_url || f.img || (foundIdx !== -1 ? localCreators[foundIdx].img : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'),
        bio: f.bio || (foundIdx !== -1 ? localCreators[foundIdx].bio : ''),
        show_on_home: f.show_on_home !== undefined ? Boolean(f.show_on_home) : true,
        show_on_roster: f.show_on_roster !== undefined ? Boolean(f.show_on_roster) : true,
        contactPhone: f.contact_phone || (foundIdx !== -1 ? localCreators[foundIdx].contactPhone : ''),
        whatsappNumber: f.whatsapp_number || (foundIdx !== -1 ? localCreators[foundIdx].whatsappNumber : ''),
        businessEmail: f.business_email || (foundIdx !== -1 ? localCreators[foundIdx].businessEmail : ''),
        youtubeUrl: f.youtube_url || (foundIdx !== -1 ? localCreators[foundIdx].youtubeUrl : ''),
        youtubeHandle: f.youtube_handle || (foundIdx !== -1 ? localCreators[foundIdx].youtubeHandle : ''),
        instaUrl: f.insta_url || (foundIdx !== -1 ? localCreators[foundIdx].instaUrl : ''),
        instaHandle: f.insta_handle || (foundIdx !== -1 ? localCreators[foundIdx].instaHandle : ''),
        updated_at: new Date().toISOString(),
      };

      if (foundIdx !== -1) {
        localCreators[foundIdx] = { ...localCreators[foundIdx], ...creatorRecord };
      } else {
        localCreators.unshift(creatorRecord);
      }

      fs.writeFileSync(ROSTER_FILE_PATH, JSON.stringify(localCreators, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('Could not sync update to data/roster.json:', fsErr);
    }

    // ── Save to Supabase creator_roster (if configured) ──────────
    let dbResult = null;
    try {
      const { data, error } = await supabaseAdmin
        .from('creator_roster')
        .upsert(updatePayload, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.warn('[/api/creator/update] Supabase upsert note:', error.message);
      } else {
        dbResult = data;
      }
    } catch (dbErr) {
      console.warn('[/api/creator/update] Supabase error:', dbErr);
    }

    // ── Optionally update linked profile full_name / avatar ──────
    if (existing.profile_id && (fields.full_name || fields.profile_photo_url)) {
      try {
        const profileUpdates: Record<string, unknown> = {};
        if (fields.full_name) profileUpdates.full_name = fields.full_name;
        if (fields.profile_photo_url) profileUpdates.avatar_url = fields.profile_photo_url;
        
        await supabaseAdmin
          .from('profiles')
          .update(profileUpdates)
          .eq('id', existing.profile_id);
      } catch (profErr) {
        console.warn('Profiles sync note:', profErr);
      }
    }

    return NextResponse.json({ success: true, creator: dbResult || updatePayload });

  } catch (err) {
    console.error('[/api/creator/update] Uncaught error:', err);
    return NextResponse.json({ error: 'Update failed', detail: String(err) }, { status: 500 });
  }
}
