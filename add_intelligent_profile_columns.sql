-- ============================================================
-- MIGRATION: Intelligent Creator Profile — Full Field Set
-- Creator Nest · Supabase SQL Editor
-- Run AFTER: add_crm_columns_to_roster.sql
-- ============================================================

-- ── SECTION 1: Identity & Branding ──────────────────────────
ALTER TABLE public.creator_roster
  ADD COLUMN IF NOT EXISTS display_name        VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS tagline             VARCHAR(200) DEFAULT '',
  ADD COLUMN IF NOT EXISTS profile_photo_url   TEXT         DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_photo_url     TEXT         DEFAULT '',
  ADD COLUMN IF NOT EXISTS creator_since       DATE,
  ADD COLUMN IF NOT EXISTS gender              VARCHAR(20)  DEFAULT '',
  ADD COLUMN IF NOT EXISTS content_language    VARCHAR(50)  DEFAULT 'Hindi-English',
  ADD COLUMN IF NOT EXISTS timezone            VARCHAR(50)  DEFAULT 'Asia/Kolkata';

-- ── SECTION 2: Category & Niche Taxonomy ────────────────────
ALTER TABLE public.creator_roster
  ADD COLUMN IF NOT EXISTS primary_category           VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS secondary_category         VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS primary_niche              VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS secondary_niche            VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS niche_tags                 JSONB        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS content_formats            JSONB        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS content_style              VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS content_tone               VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS upload_frequency           VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS avg_content_length_min     FLOAT        DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS content_pillars            JSONB        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS brand_categories_blacklist JSONB        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS best_posting_day           VARCHAR(30)  DEFAULT '',
  ADD COLUMN IF NOT EXISTS best_posting_time          VARCHAR(30)  DEFAULT '';

-- ── SECTION 3: Extended Platform Presence ───────────────────
ALTER TABLE public.creator_roster
  ADD COLUMN IF NOT EXISTS youtube_channel_id      VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_subscribers     BIGINT       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS youtube_total_views     BIGINT       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS youtube_video_count     INT          DEFAULT 0,
  ADD COLUMN IF NOT EXISTS youtube_partner         BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS instagram_followers     BIGINT       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instagram_posts_count   INT          DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instagram_verified      BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS tiktok_followers        BIGINT       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS twitter_followers       INT          DEFAULT 0,
  ADD COLUMN IF NOT EXISTS linkedin_followers      INT          DEFAULT 0,
  ADD COLUMN IF NOT EXISTS podcast_url             TEXT         DEFAULT '',
  ADD COLUMN IF NOT EXISTS podcast_listeners       INT          DEFAULT 0,
  ADD COLUMN IF NOT EXISTS newsletter_url          TEXT         DEFAULT '',
  ADD COLUMN IF NOT EXISTS newsletter_subscribers  INT          DEFAULT 0,
  ADD COLUMN IF NOT EXISTS website_url             TEXT         DEFAULT '',
  ADD COLUMN IF NOT EXISTS total_reach             BIGINT       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS primary_platform        VARCHAR(50)  DEFAULT 'YouTube';

-- ── SECTION 4: YouTube Analytics (Auto-synced via API) ──────
ALTER TABLE public.creator_roster
  ADD COLUMN IF NOT EXISTS yt_avg_views_per_video    BIGINT  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS yt_avg_watch_time_pct     FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS yt_avg_watch_time_sec     INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS yt_subscriber_growth_30d  INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS yt_subscriber_growth_pct  FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS yt_engagement_rate        FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS yt_like_rate              FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS yt_comment_rate           FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS yt_share_rate             FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS yt_click_through_rate     FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS yt_viral_video_count      INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS yt_shorts_avg_views       BIGINT  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS yt_community_post_reach   BIGINT  DEFAULT 0;

-- ── SECTION 5: Instagram Analytics (Auto-synced via API) ────
ALTER TABLE public.creator_roster
  ADD COLUMN IF NOT EXISTS ig_engagement_rate      FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS ig_avg_reel_views       BIGINT  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ig_avg_post_likes       INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ig_avg_post_comments    INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ig_avg_story_views      INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ig_saves_rate           FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS ig_reach_per_post       BIGINT  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ig_follower_growth_30d  INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ig_follower_growth_pct  FLOAT   DEFAULT 0.0;

-- ── SECTION 6: Cross-Platform Scores (AI-computed) ──────────
ALTER TABLE public.creator_roster
  ADD COLUMN IF NOT EXISTS monthly_impressions        BIGINT       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_monthly_reach    BIGINT       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS authenticity_score         FLOAT        DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS audience_quality_score     FLOAT        DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS influence_score            FLOAT        DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS trending_score             FLOAT        DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS growth_velocity            VARCHAR(20)  DEFAULT 'Stable',
  ADD COLUMN IF NOT EXISTS creator_score              FLOAT        DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS creator_tier               VARCHAR(20)  DEFAULT 'micro';

-- ── SECTION 7: Extended Audience Demographics ────────────────
ALTER TABLE public.creator_roster
  ADD COLUMN IF NOT EXISTS audience_age_13_17         FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS audience_age_35_44         FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS audience_age_45_plus       FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS audience_gender_other      FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS audience_top_countries     JSONB   DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS audience_top_cities        JSONB   DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS audience_interests         JSONB   DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS audience_income_segment    VARCHAR(50)  DEFAULT '',
  ADD COLUMN IF NOT EXISTS audience_india_pct         FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS audience_tier1_city_pct    FLOAT   DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS audience_device_split      JSONB   DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS audience_language_pref     JSONB   DEFAULT '[]'::jsonb;

-- ── SECTION 8: Commercial & Collaboration Data ───────────────
ALTER TABLE public.creator_roster
  ADD COLUMN IF NOT EXISTS rate_dedicated_video       NUMERIC  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rate_integrated_video      NUMERIC  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rate_youtube_short         NUMERIC  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rate_ig_reel               NUMERIC  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rate_ig_story_set          NUMERIC  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rate_package_bundle        NUMERIC  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rate_ambassador_monthly    NUMERIC  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rate_negotiable            BOOLEAN  DEFAULT true,
  ADD COLUMN IF NOT EXISTS barter_collab_open         BOOLEAN  DEFAULT true,
  ADD COLUMN IF NOT EXISTS barter_min_value           NUMERIC  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS past_brand_collabs         JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS collab_count_total         INT      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS collab_count_current_year  INT      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS repeat_brand_rate          FLOAT    DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS avg_campaign_roi_delivered VARCHAR(50) DEFAULT '',
  ADD COLUMN IF NOT EXISTS case_study_urls            JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exclusive_brand_active     BOOLEAN  DEFAULT false,
  ADD COLUMN IF NOT EXISTS exclusive_brand_name       VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS exclusive_expiry_date      DATE,
  ADD COLUMN IF NOT EXISTS open_to_collab             BOOLEAN  DEFAULT true,
  ADD COLUMN IF NOT EXISTS collab_lead_time_days      INT      DEFAULT 14,
  ADD COLUMN IF NOT EXISTS preferred_collab_type      JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS media_kit_url              TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS contract_template_url      TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS currency                   VARCHAR(10)  DEFAULT 'INR';

-- ── SECTION 9: AI-Generated Strategy Fields ──────────────────
ALTER TABLE public.creator_roster
  ADD COLUMN IF NOT EXISTS seo_keywords               JSONB        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS competitor_channels        JSONB        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS strategy_goals             JSONB        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seasonal_peak_months       JSONB        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS best_performing_category   VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS worst_performing_category  VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS content_gap_notes          TEXT         DEFAULT '',
  ADD COLUMN IF NOT EXISTS ai_growth_insight          TEXT         DEFAULT '',
  ADD COLUMN IF NOT EXISTS ai_brand_fit_summary       TEXT         DEFAULT '',
  ADD COLUMN IF NOT EXISTS ai_content_suggestions     JSONB        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS next_big_video_date        DATE,
  ADD COLUMN IF NOT EXISTS channel_age_months         INT          DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscriber_milestone_next  BIGINT       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS projected_growth_6m        FLOAT        DEFAULT 0.0;

-- ── SECTION 10: Management, CRM & Sync Control ───────────────
ALTER TABLE public.creator_roster
  ADD COLUMN IF NOT EXISTS management_agency          VARCHAR(200) DEFAULT 'Creator Nest',
  ADD COLUMN IF NOT EXISTS manager_name              VARCHAR(150) DEFAULT '',
  ADD COLUMN IF NOT EXISTS manager_email             VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS manager_phone             VARCHAR(20)  DEFAULT '',
  ADD COLUMN IF NOT EXISTS response_time_hrs         INT          DEFAULT 24,
  ADD COLUMN IF NOT EXISTS preferred_contact_method  VARCHAR(50)  DEFAULT 'Email',
  ADD COLUMN IF NOT EXISTS crm_status                VARCHAR(50)  DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS onboarding_date           DATE,
  ADD COLUMN IF NOT EXISTS last_activity_date        TIMESTAMP    DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS pan_kyc_verified          BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS gstin_available           BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified_creator       BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_date         DATE,
  ADD COLUMN IF NOT EXISTS awards_and_badges         JSONB        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_completeness_pct  FLOAT        DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS data_last_updated         TIMESTAMP    DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS data_source               VARCHAR(100) DEFAULT 'Manual',
  ADD COLUMN IF NOT EXISTS internal_tags             JSONB        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contract_status           VARCHAR(50)  DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS payment_terms             VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS revenue_generated_lifetime NUMERIC     DEFAULT 0,
  -- Auto-sync control
  ADD COLUMN IF NOT EXISTS auto_sync_enabled         BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS youtube_access_token      TEXT         DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram_access_token    TEXT         DEFAULT '',
  ADD COLUMN IF NOT EXISTS ai_last_enriched          TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_api_sync             TIMESTAMP,
  ADD COLUMN IF NOT EXISTS sync_error_log            TEXT         DEFAULT '';

-- ── PERFORMANCE INDEXES ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_creator_tier         ON public.creator_roster(creator_tier);
CREATE INDEX IF NOT EXISTS idx_creator_score        ON public.creator_roster(creator_score DESC);
CREATE INDEX IF NOT EXISTS idx_primary_category     ON public.creator_roster(primary_category);
CREATE INDEX IF NOT EXISTS idx_primary_niche        ON public.creator_roster(primary_niche);
CREATE INDEX IF NOT EXISTS idx_crm_status           ON public.creator_roster(crm_status);
CREATE INDEX IF NOT EXISTS idx_open_to_collab       ON public.creator_roster(open_to_collab);
CREATE INDEX IF NOT EXISTS idx_total_reach          ON public.creator_roster(total_reach DESC);
CREATE INDEX IF NOT EXISTS idx_auto_sync_enabled    ON public.creator_roster(auto_sync_enabled);
CREATE INDEX IF NOT EXISTS idx_influence_score      ON public.creator_roster(influence_score DESC);

-- ── CONFIRMATION ──────────────────────────────────────────────
SELECT 
  'Intelligent Creator Profile migration complete!' AS status,
  COUNT(*) AS existing_creators
FROM public.creator_roster;
