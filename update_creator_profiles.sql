-- SQL Migration for Creator Profiles, Platforms, and Deal History

-- 1. Create Enums if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'creator_type_enum') THEN
        CREATE TYPE creator_type_enum AS ENUM ('youtuber', 'instagrammer', 'poet', 'speaker', 'gamer', 'trainer', 'artist', 'expert');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'monetization_status_enum') THEN
        CREATE TYPE monetization_status_enum AS ENUM ('not_ready', 'in_progress', 'ready', 'active');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_stage_enum') THEN
        CREATE TYPE onboarding_stage_enum AS ENUM ('applied', 'screening', 'analysis', 'coaching', 'live');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'creator_status_enum') THEN
        CREATE TYPE creator_status_enum AS ENUM ('active', 'inactive', 'paused', 'archived');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_tier_enum') THEN
        CREATE TYPE pricing_tier_enum AS ENUM ('nano', 'micro', 'macro', 'mega', 'celebrity');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_type_enum') THEN
        CREATE TYPE platform_type_enum AS ENUM ('youtube', 'instagram', 'twitter', 'linkedin', 'podcast', 'website', 'other');
    END IF;
END$$;

-- 2. Create or Update `creators` table
CREATE TABLE IF NOT EXISTS public.creators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) UNIQUE,
    full_name VARCHAR NOT NULL,
    display_name VARCHAR,
    bio TEXT,
    phone VARCHAR,
    email VARCHAR,
    city VARCHAR,
    state VARCHAR,
    pincode VARCHAR,
    language JSON,
    creator_type creator_type_enum NOT NULL,
    niche JSON,
    primary_platform VARCHAR,
    total_followers FLOAT DEFAULT 0.0,
    avg_views FLOAT DEFAULT 0.0,
    avg_engagement_rate FLOAT DEFAULT 0.0,
    monetization_status monetization_status_enum NOT NULL DEFAULT 'not_ready',
    onboarding_stage onboarding_stage_enum NOT NULL DEFAULT 'applied',
    assigned_manager_id UUID REFERENCES public.users(id),
    talent_score FLOAT,
    is_featured BOOLEAN DEFAULT FALSE,
    portfolio_url VARCHAR,
    sample_content_urls JSON,
    onboarded_at TIMESTAMP WITH TIME ZONE,
    status creator_status_enum NOT NULL DEFAULT 'active',
    notes TEXT,
    tags JSON,
    metadata JSON,
    virtual_id VARCHAR(20) UNIQUE,
    profile_image_url VARCHAR,
    niche_primary VARCHAR(100),
    niche_secondary JSON,
    content_language JSON,
    total_combined_reach FLOAT DEFAULT 0.0,
    talent_index_score FLOAT,
    collaboration_rate_min FLOAT,
    collaboration_rate_max FLOAT,
    is_verified_agency BOOLEAN DEFAULT FALSE,
    agency_commission_pct FLOAT,
    exclusive_brand_ids JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID REFERENCES public.users(id),
    updated_by_id UUID REFERENCES public.users(id)
);

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for creators" ON public.creators FOR SELECT USING (true);

-- Ensure the new columns exist if the table was already there
ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS primary_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS authenticity_score FLOAT,
ADD COLUMN IF NOT EXISTS brand_safety_score FLOAT,
ADD COLUMN IF NOT EXISTS pricing_tier pricing_tier_enum,
ADD COLUMN IF NOT EXISTS deliverable_pricing JSON,
ADD COLUMN IF NOT EXISTS deal_history_summary JSON;


-- 3. Create or Update `creator_platforms` table
CREATE TABLE IF NOT EXISTS public.creator_platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    platform platform_type_enum NOT NULL,
    handle VARCHAR,
    url VARCHAR,
    followers FLOAT DEFAULT 0.0,
    subscribers FLOAT DEFAULT 0.0,
    avg_views FLOAT DEFAULT 0.0,
    avg_likes FLOAT DEFAULT 0.0,
    avg_comments FLOAT DEFAULT 0.0,
    engagement_rate FLOAT DEFAULT 0.0,
    verified BOOLEAN DEFAULT FALSE,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    raw_data JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID REFERENCES public.users(id),
    updated_by_id UUID REFERENCES public.users(id)
);

ALTER TABLE public.creator_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for platforms" ON public.creator_platforms FOR SELECT USING (true);

-- Ensure the new columns exist if the table was already there
ALTER TABLE public.creator_platforms
ADD COLUMN IF NOT EXISTS platform_niche VARCHAR(100),
ADD COLUMN IF NOT EXISTS average_view_duration FLOAT,
ADD COLUMN IF NOT EXISTS audience_demographics JSON,
ADD COLUMN IF NOT EXISTS platform_authenticity_score FLOAT,
ADD COLUMN IF NOT EXISTS content_frequency FLOAT;


-- 4. Create the new `creator_deal_history` table
CREATE TABLE IF NOT EXISTS public.creator_deal_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    brand_name VARCHAR,
    campaign_name VARCHAR NOT NULL,
    deliverables_executed JSON NOT NULL,
    deal_value FLOAT,
    performance_roi FLOAT,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID REFERENCES public.users(id),
    updated_by_id UUID REFERENCES public.users(id)
);

ALTER TABLE public.creator_deal_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to deal history" ON public.creator_deal_history
FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role::text IN ('super_admin', 'admin', 'creator_manager')));
CREATE POLICY "Creators can read their own deal history" ON public.creator_deal_history
FOR SELECT USING (auth.role() = 'authenticated' AND creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));
