-- ====================================================================================
-- MIGRATION: Add CRM and Brand Collaboration fields to public.creator_roster
-- Run this in the Supabase SQL Editor
-- ====================================================================================

ALTER TABLE public.creator_roster 
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20) DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20) DEFAULT '',
  ADD COLUMN IF NOT EXISTS business_email VARCHAR(255) DEFAULT '',
  
  ADD COLUMN IF NOT EXISTS youtube_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_handle VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS insta_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS insta_handle VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_handle VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS twitter_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS tiktok_handle VARCHAR(100) DEFAULT '',
  
  ADD COLUMN IF NOT EXISTS avg_views BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_rate FLOAT DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS primary_language VARCHAR(50) DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS target_country VARCHAR(100) DEFAULT 'India',
  
  ADD COLUMN IF NOT EXISTS audience_gender_male FLOAT DEFAULT 50.0,
  ADD COLUMN IF NOT EXISTS audience_gender_female FLOAT DEFAULT 50.0,
  ADD COLUMN IF NOT EXISTS audience_age_18_24 FLOAT DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS audience_age_25_34 FLOAT DEFAULT 0.0,
  
  ADD COLUMN IF NOT EXISTS rate_post NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rate_video NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manager_notes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS brand_categories JSONB DEFAULT '[]'::jsonb;

SELECT 'CRM columns added successfully!' as status;
