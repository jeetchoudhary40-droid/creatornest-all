import pygetwindow as gw
import pyautogui
import pyperclip
import time

sql_script = """
-- ════════════════════════════════════════════════════════
-- CREATOR NEST MASTER SCHEMA v3.0 — 22 TABLES
-- ════════════════════════════════════════════════════════

-- STEP 1: VIRTUAL ID SYSTEM
ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS virtual_id VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS niche_primary VARCHAR(100),
  ADD COLUMN IF NOT EXISTS niche_secondary JSONB,
  ADD COLUMN IF NOT EXISTS content_language JSONB,
  ADD COLUMN IF NOT EXISTS total_combined_reach BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS talent_index_score FLOAT,
  ADD COLUMN IF NOT EXISTS collaboration_rate_min NUMERIC,
  ADD COLUMN IF NOT EXISTS collaboration_rate_max NUMERIC,
  ADD COLUMN IF NOT EXISTS is_verified_agency BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS agency_commission_pct FLOAT,
  ADD COLUMN IF NOT EXISTS exclusive_brand_ids JSONB;

CREATE SEQUENCE IF NOT EXISTS creator_vid_seq START 1;
CREATE OR REPLACE FUNCTION generate_virtual_id() RETURNS TRIGGER AS $$
BEGIN
  NEW.virtual_id := 'CN-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(CAST(nextval('creator_vid_seq') AS TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS set_virtual_id ON public.creators;
CREATE TRIGGER set_virtual_id BEFORE INSERT ON public.creators
  FOR EACH ROW WHEN (NEW.virtual_id IS NULL) EXECUTE FUNCTION generate_virtual_id();

-- STEP 2: COMMUNICATION CONTACTS
CREATE TABLE IF NOT EXISTS public.creator_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  personal_mobile VARCHAR(20), whatsapp_number VARCHAR(20), alternate_mobile VARCHAR(20),
  personal_email VARCHAR(255), business_email VARCHAR(255),
  manager_name VARCHAR(255), manager_phone VARCHAR(20), manager_email VARCHAR(255),
  agency_name VARCHAR(255), agency_contact VARCHAR(255), mailing_address TEXT,
  pan_number VARCHAR(20), gst_number VARCHAR(20),
  bank_account_number VARCHAR(50), bank_ifsc VARCHAR(20), bank_name VARCHAR(100), upi_id VARCHAR(100),
  emergency_contact_name VARCHAR(255), emergency_contact_phone VARCHAR(20),
  preferred_contact_method VARCHAR(20) DEFAULT 'whatsapp',
  best_contact_time VARCHAR(100), do_not_contact_flag BOOLEAN DEFAULT FALSE, internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.creator_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin access contacts" ON public.creator_contacts;
CREATE POLICY "Admin access contacts" ON public.creator_contacts FOR ALL USING (auth.role() = 'authenticated');

-- STEP 3: YOUTUBE TABLES
CREATE TABLE IF NOT EXISTS public.creator_youtube_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  channel_name VARCHAR(255), channel_handle VARCHAR(100), channel_url TEXT, channel_id VARCHAR(100) UNIQUE,
  primary_language VARCHAR(50), secondary_language VARCHAR(50), yt_category VARCHAR(100),
  primary_niche VARCHAR(100), sub_niche VARCHAR(100), content_format JSONB,
  upload_freq_per_week FLOAT, total_videos_published INTEGER DEFAULT 0,
  channel_start_date DATE, country_of_origin VARCHAR(50), profile_image_url TEXT, banner_image_url TEXT,
  total_views BIGINT DEFAULT 0, total_watch_hours BIGINT DEFAULT 0,
  total_subscribers BIGINT DEFAULT 0, total_impressions BIGINT DEFAULT 0,
  overall_ctr_pct FLOAT, search_ctr_pct FLOAT, browse_ctr_pct FLOAT,
  avg_view_duration_seconds INTEGER, retention_short_pct FLOAT, retention_long_pct FLOAT,
  like_to_view_ratio FLOAT, comment_to_view_ratio FLOAT, share_rate_per_1k FLOAT,
  overall_engagement_rate FLOAT, total_likes BIGINT DEFAULT 0, total_comments BIGINT DEFAULT 0,
  total_shares BIGINT DEFAULT 0, avg_likes_per_video FLOAT, avg_comments_per_video FLOAT,
  avg_shares_per_video FLOAT, like_to_dislike_ratio FLOAT,
  monetization_status VARCHAR(50) DEFAULT 'not_monetized',
  est_total_revenue_inr NUMERIC, rpm_last_12m FLOAT, rpm_brand_safety_est FLOAT, est_cpv FLOAT,
  rev_source_ads FLOAT, rev_source_shorts FLOAT, rev_source_memberships FLOAT,
  rev_source_super_thanks FLOAT, rev_source_sponsorships FLOAT,
  top_earning_video_url TEXT, top_earning_video_revenue NUMERIC,
  collab_rate_per_integration NUMERIC, collab_rate_per_dedicated NUMERIC, collab_rate_per_short NUMERIC,
  top_traffic_sources JSONB, top_search_keywords JSONB, external_traffic_sources JSONB,
  data_source VARCHAR(50) DEFAULT 'manual_entry', last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_youtube_audience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data_period_days INTEGER DEFAULT 28,
  age_13_17_pct FLOAT, age_18_24_pct FLOAT, age_25_34_pct FLOAT, age_35_44_pct FLOAT,
  age_45_54_pct FLOAT, age_55_64_pct FLOAT, age_65_plus_pct FLOAT,
  gender_male_pct FLOAT, gender_female_pct FLOAT, gender_other_pct FLOAT,
  device_mobile_pct FLOAT, device_desktop_pct FLOAT, device_tablet_pct FLOAT, device_tv_pct FLOAT,
  new_viewers_pct FLOAT, returning_viewers_pct FLOAT, subscribed_viewers_pct FLOAT, non_subscribed_viewers_pct FLOAT,
  peak_active_days JSONB, peak_active_time_ist VARCHAR(30),
  geo_country_data JSONB, geo_city_data JSONB, occupational_profile JSONB, interest_overlap JSONB,
  data_source VARCHAR(50) DEFAULT 'manual_entry', updated_at TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_youtube_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  period_type VARCHAR(10) CHECK (period_type IN ('weekly','monthly','yearly')),
  period_label VARCHAR(30), period_start DATE, period_end DATE,
  views BIGINT DEFAULT 0, watch_hours FLOAT, subscribers_gained INTEGER,
  revenue_est_inr NUMERIC, rpm_est FLOAT, impressions BIGINT, ctr_pct FLOAT,
  avg_view_duration_seconds INTEGER, likes INTEGER, comments INTEGER, shares INTEGER,
  mom_views_change_pct FLOAT, mom_revenue_change_pct FLOAT, wow_views_change_pct FLOAT,
  notes TEXT, data_source VARCHAR(50) DEFAULT 'manual_entry', created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_youtube_top_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  rank INTEGER, video_url TEXT, title TEXT, thumbnail_url TEXT,
  published_at DATE, views BIGINT DEFAULT 0, watch_hours FLOAT,
  likes INTEGER, comments INTEGER, shares INTEGER, impressions BIGINT,
  ctr_pct FLOAT, avg_view_duration_seconds INTEGER, retention_pct FLOAT,
  subscribers_gained INTEGER, sub_conversion_pct FLOAT, revenue_est_inr NUMERIC,
  content_type VARCHAR(20), niche_tag VARCHAR(100),
  data_source VARCHAR(50) DEFAULT 'manual_entry', created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.creator_youtube_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_youtube_audience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_youtube_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_youtube_top_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "yt profiles auth" ON public.creator_youtube_profiles;
DROP POLICY IF EXISTS "yt audience auth" ON public.creator_youtube_audience;
DROP POLICY IF EXISTS "yt history auth" ON public.creator_youtube_history;
DROP POLICY IF EXISTS "yt content auth" ON public.creator_youtube_top_content;
CREATE POLICY "yt profiles auth" ON public.creator_youtube_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "yt audience auth" ON public.creator_youtube_audience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "yt history auth" ON public.creator_youtube_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "yt content auth" ON public.creator_youtube_top_content FOR ALL USING (auth.role() = 'authenticated');

-- STEP 4: INSTAGRAM TABLES
CREATE TABLE IF NOT EXISTS public.creator_instagram_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  handle VARCHAR(100), profile_url TEXT, instagram_id VARCHAR(100),
  account_type VARCHAR(20) DEFAULT 'creator', bio TEXT,
  followers BIGINT DEFAULT 0, following INTEGER DEFAULT 0, total_posts INTEGER DEFAULT 0, total_reels INTEGER DEFAULT 0,
  avg_reel_plays FLOAT, avg_reel_views FLOAT, avg_likes_per_post FLOAT, avg_comments_per_post FLOAT,
  avg_saves_per_post FLOAT, avg_shares_per_post FLOAT, engagement_rate FLOAT, reel_engagement_rate FLOAT,
  story_views_avg FLOAT, story_completion_rate FLOAT, profile_visits_per_month INTEGER,
  reach_per_post FLOAT, impressions_per_post FLOAT, ctr_on_bio_link FLOAT,
  content_mix JSONB, upload_freq_per_week FLOAT, primary_niche VARCHAR(100),
  is_meta_verified BOOLEAN DEFAULT FALSE,
  collab_rate_per_reel NUMERIC, collab_rate_per_story NUMERIC, collab_rate_per_carousel NUMERIC, collab_rate_per_static NUMERIC,
  data_source VARCHAR(50) DEFAULT 'manual_entry', last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_instagram_audience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data_period_days INTEGER DEFAULT 28,
  age_13_17_pct FLOAT, age_18_24_pct FLOAT, age_25_34_pct FLOAT, age_35_44_pct FLOAT,
  age_45_54_pct FLOAT, age_55_plus_pct FLOAT, gender_male_pct FLOAT, gender_female_pct FLOAT, gender_other_pct FLOAT,
  top_cities JSONB, top_countries JSONB, peak_active_days JSONB, peak_active_time_ist VARCHAR(30),
  follower_growth_rate_mom FLOAT, audience_authenticity_score FLOAT, interest_categories JSONB,
  data_source VARCHAR(50) DEFAULT 'manual_entry', updated_at TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_instagram_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  period_type VARCHAR(10), period_label VARCHAR(30), period_start DATE, period_end DATE,
  followers_count BIGINT, followers_gained INTEGER, followers_lost INTEGER, net_follower_growth INTEGER,
  total_reach BIGINT, total_impressions BIGINT, total_reel_plays BIGINT,
  avg_engagement_rate FLOAT, profile_visits INTEGER, website_clicks INTEGER,
  posts_published INTEGER, reels_published INTEGER, stories_published INTEGER,
  mom_follower_change_pct FLOAT, mom_reach_change_pct FLOAT,
  data_source VARCHAR(50) DEFAULT 'manual_entry', created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_instagram_top_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  rank INTEGER, post_url TEXT, caption TEXT, thumbnail_url TEXT, content_type VARCHAR(20), published_at DATE,
  plays BIGINT DEFAULT 0, reach BIGINT, impressions BIGINT, likes INTEGER, comments INTEGER, saves INTEGER, shares INTEGER,
  engagement_rate FLOAT, followers_gained INTEGER, niche_tag VARCHAR(100),
  data_source VARCHAR(50) DEFAULT 'manual_entry', created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.creator_instagram_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_instagram_audience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_instagram_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_instagram_top_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ig all auth" ON public.creator_instagram_profiles;
DROP POLICY IF EXISTS "ig aud auth" ON public.creator_instagram_audience;
DROP POLICY IF EXISTS "ig hist auth" ON public.creator_instagram_history;
DROP POLICY IF EXISTS "ig cont auth" ON public.creator_instagram_top_content;
CREATE POLICY "ig all auth" ON public.creator_instagram_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "ig aud auth" ON public.creator_instagram_audience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "ig hist auth" ON public.creator_instagram_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "ig cont auth" ON public.creator_instagram_top_content FOR ALL USING (auth.role() = 'authenticated');

-- STEP 5: FACEBOOK TABLES
CREATE TABLE IF NOT EXISTS public.creator_facebook_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  page_name VARCHAR(255), page_url TEXT, page_id VARCHAR(100),
  page_likes BIGINT DEFAULT 0, page_followers BIGINT DEFAULT 0,
  avg_post_reach FLOAT, avg_post_engagement FLOAT, engagement_rate FLOAT,
  avg_video_views FLOAT, avg_reel_plays FLOAT, avg_watch_time_seconds INTEGER,
  top_content_type VARCHAR(100), page_category VARCHAR(100), primary_niche VARCHAR(100),
  weekly_upload_freq FLOAT, is_verified BOOLEAN DEFAULT FALSE,
  collab_rate_per_post NUMERIC, collab_rate_per_video NUMERIC, collab_rate_per_reel NUMERIC,
  data_source VARCHAR(50) DEFAULT 'manual_entry', last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_facebook_audience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data_period_days INTEGER DEFAULT 28,
  age_18_24_pct FLOAT, age_25_34_pct FLOAT, age_35_44_pct FLOAT,
  age_45_54_pct FLOAT, age_55_64_pct FLOAT, age_65_plus_pct FLOAT,
  gender_male_pct FLOAT, gender_female_pct FLOAT,
  top_countries JSONB, top_cities JSONB, peak_active_time_ist VARCHAR(30), audience_interest_data JSONB,
  data_source VARCHAR(50) DEFAULT 'manual_entry', updated_at TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_facebook_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  period_type VARCHAR(10), period_label VARCHAR(30), period_start DATE, period_end DATE,
  page_likes_count BIGINT, new_page_likes INTEGER, total_reach BIGINT, total_impressions BIGINT,
  total_video_views BIGINT, avg_engagement_rate FLOAT, posts_published INTEGER, videos_published INTEGER,
  data_source VARCHAR(50) DEFAULT 'manual_entry', created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_facebook_top_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  rank INTEGER, post_url TEXT, content_type VARCHAR(20), published_at DATE,
  reach BIGINT, impressions BIGINT, video_views BIGINT,
  likes INTEGER, comments INTEGER, shares INTEGER, engagement_rate FLOAT, niche_tag VARCHAR(100),
  data_source VARCHAR(50) DEFAULT 'manual_entry', created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.creator_facebook_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_facebook_audience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_facebook_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_facebook_top_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fb all" ON public.creator_facebook_profiles;
DROP POLICY IF EXISTS "fb aud" ON public.creator_facebook_audience;
DROP POLICY IF EXISTS "fb hist" ON public.creator_facebook_history;
DROP POLICY IF EXISTS "fb cont" ON public.creator_facebook_top_content;
CREATE POLICY "fb all" ON public.creator_facebook_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "fb aud" ON public.creator_facebook_audience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "fb hist" ON public.creator_facebook_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "fb cont" ON public.creator_facebook_top_content FOR ALL USING (auth.role() = 'authenticated');

-- STEP 6: TWITTER/X TABLES
CREATE TABLE IF NOT EXISTS public.creator_twitter_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  handle VARCHAR(100), twitter_id VARCHAR(100), profile_url TEXT, display_name VARCHAR(255), bio TEXT,
  followers BIGINT DEFAULT 0, following INTEGER DEFAULT 0, total_tweets INTEGER DEFAULT 0, total_lists INTEGER DEFAULT 0,
  avg_impressions_per_tweet FLOAT, avg_likes_per_tweet FLOAT, avg_retweets_per_tweet FLOAT,
  avg_replies_per_tweet FLOAT, avg_bookmarks_per_tweet FLOAT, engagement_rate FLOAT,
  is_verified_blue BOOLEAN DEFAULT FALSE, posting_freq_per_week FLOAT,
  primary_topic VARCHAR(100), primary_niche VARCHAR(100),
  collab_rate_per_tweet NUMERIC, collab_rate_per_thread NUMERIC,
  data_source VARCHAR(50) DEFAULT 'manual_entry', last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_twitter_audience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data_period_days INTEGER DEFAULT 28,
  age_18_24_pct FLOAT, age_25_34_pct FLOAT, age_35_44_pct FLOAT, age_45_54_pct FLOAT, age_55_plus_pct FLOAT,
  gender_male_pct FLOAT, gender_female_pct FLOAT,
  top_countries JSONB, top_cities JSONB, interest_categories JSONB, follower_occupation_profile JSONB,
  peak_active_time_ist VARCHAR(30),
  data_source VARCHAR(50) DEFAULT 'manual_entry', updated_at TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_twitter_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  period_type VARCHAR(10), period_label VARCHAR(30), period_start DATE, period_end DATE,
  followers_count BIGINT, followers_gained INTEGER, total_impressions BIGINT,
  total_likes INTEGER, total_retweets INTEGER, total_replies INTEGER,
  avg_engagement_rate FLOAT, tweets_published INTEGER, threads_published INTEGER,
  data_source VARCHAR(50) DEFAULT 'manual_entry', created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_twitter_top_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  rank INTEGER, tweet_url TEXT, content_preview TEXT, content_type VARCHAR(20), published_at DATE,
  impressions BIGINT, likes INTEGER, retweets INTEGER, replies INTEGER, bookmarks INTEGER,
  engagement_rate FLOAT, link_clicks INTEGER, niche_tag VARCHAR(100),
  data_source VARCHAR(50) DEFAULT 'manual_entry', created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.creator_twitter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_twitter_audience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_twitter_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_twitter_top_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tw all" ON public.creator_twitter_profiles;
DROP POLICY IF EXISTS "tw aud" ON public.creator_twitter_audience;
DROP POLICY IF EXISTS "tw hist" ON public.creator_twitter_history;
DROP POLICY IF EXISTS "tw cont" ON public.creator_twitter_top_content;
CREATE POLICY "tw all" ON public.creator_twitter_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "tw aud" ON public.creator_twitter_audience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "tw hist" ON public.creator_twitter_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "tw cont" ON public.creator_twitter_top_content FOR ALL USING (auth.role() = 'authenticated');

-- STEP 7: LINKEDIN TABLES
CREATE TABLE IF NOT EXISTS public.creator_linkedin_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_url TEXT, linkedin_id VARCHAR(100), full_name_on_platform VARCHAR(255),
  headline TEXT, about TEXT, connections INTEGER DEFAULT 0, followers BIGINT DEFAULT 0,
  avg_post_impressions FLOAT, avg_post_reactions FLOAT, avg_post_comments FLOAT,
  avg_post_shares FLOAT, avg_post_clicks FLOAT, engagement_rate FLOAT,
  newsletter_name VARCHAR(255), newsletter_subscribers INTEGER DEFAULT 0, avg_newsletter_open_rate FLOAT,
  industry_tag VARCHAR(100), primary_niche VARCHAR(100), seniority_level VARCHAR(50),
  posting_freq_per_week FLOAT, is_top_voice BOOLEAN DEFAULT FALSE, is_creator_mode BOOLEAN DEFAULT FALSE,
  collab_rate_per_post NUMERIC, collab_rate_per_article NUMERIC, collab_rate_per_newsletter NUMERIC,
  data_source VARCHAR(50) DEFAULT 'manual_entry', last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_linkedin_audience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data_period_days INTEGER DEFAULT 28,
  age_18_24_pct FLOAT, age_25_34_pct FLOAT, age_35_44_pct FLOAT, age_45_54_pct FLOAT, age_55_plus_pct FLOAT,
  gender_male_pct FLOAT, gender_female_pct FLOAT,
  top_countries JSONB, top_cities JSONB,
  industry_distribution JSONB, seniority_distribution JSONB,
  company_size_distribution JSONB, job_function_distribution JSONB,
  data_source VARCHAR(50) DEFAULT 'manual_entry', updated_at TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_linkedin_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  period_type VARCHAR(10), period_label VARCHAR(30), period_start DATE, period_end DATE,
  followers_count BIGINT, followers_gained INTEGER, total_impressions BIGINT,
  total_reactions INTEGER, total_comments INTEGER, total_shares INTEGER,
  avg_engagement_rate FLOAT, posts_published INTEGER, articles_published INTEGER,
  newsletter_sends INTEGER, profile_views INTEGER, search_appearances INTEGER,
  data_source VARCHAR(50) DEFAULT 'manual_entry', created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.creator_linkedin_top_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  rank INTEGER, post_url TEXT, title TEXT, content_type VARCHAR(20), published_at DATE,
  impressions BIGINT, reactions INTEGER, comments INTEGER, shares INTEGER, clicks INTEGER,
  engagement_rate FLOAT, niche_tag VARCHAR(100),
  data_source VARCHAR(50) DEFAULT 'manual_entry', created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.creator_linkedin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_linkedin_audience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_linkedin_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_linkedin_top_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "li all" ON public.creator_linkedin_profiles;
DROP POLICY IF EXISTS "li aud" ON public.creator_linkedin_audience;
DROP POLICY IF EXISTS "li hist" ON public.creator_linkedin_history;
DROP POLICY IF EXISTS "li cont" ON public.creator_linkedin_top_content;
CREATE POLICY "li all" ON public.creator_linkedin_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "li aud" ON public.creator_linkedin_audience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "li hist" ON public.creator_linkedin_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "li cont" ON public.creator_linkedin_top_content FOR ALL USING (auth.role() = 'authenticated');

-- STEP 8: BRAND-CREATOR MATCHING
CREATE TABLE IF NOT EXISTS public.brand_creator_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  match_score FLOAT DEFAULT 0,
  niche_match_score FLOAT, audience_fit_score FLOAT, budget_fit_score FLOAT,
  performance_score FLOAT, geo_match_score FLOAT,
  match_reasons JSONB, platforms_matched JSONB,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, creator_id)
);
ALTER TABLE public.brand_creator_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "match auth" ON public.brand_creator_matches;
CREATE POLICY "match auth" ON public.brand_creator_matches FOR ALL USING (auth.role() = 'authenticated');

SELECT 'CREATOR NEST MASTER SCHEMA v3.0 — ALL 22 TABLES CREATED SUCCESSFULLY' as status;
"""

pyperclip.copy(sql_script)

windows = [w for w in gw.getAllWindows() if 'SQL Editor' in w.title and 'Supabase' in w.title]
if windows:
    win = windows[0]
    try:
        win.restore()
    except:
        pass
    win.activate()
    time.sleep(1.5)
    
    cx = win.left + (win.width // 2) + 200
    cy = win.top + (win.height // 2)
    pyautogui.click(cx, cy)
    time.sleep(0.5)
    pyautogui.hotkey('ctrl', 'a')
    time.sleep(0.2)
    pyautogui.press('backspace')
    time.sleep(0.2)
    pyautogui.hotkey('ctrl', 'v')
    time.sleep(2)
    pyautogui.hotkey('ctrl', 'enter')
    print("✅ Master schema SQL executed in Supabase!")
else:
    print("❌ Supabase SQL Editor window not found — please open it first")
