-- ============================================================
-- MIGRATION: Multi-Channel Support (Social Accounts)
-- Creator Nest · Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.creator_social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id VARCHAR(100) REFERENCES public.creator_roster(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  handle VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  channel_id VARCHAR(100),
  followers BIGINT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  stats_json JSONB DEFAULT '{}'::jsonb,
  last_synced TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_creator_social_accounts_creator_id ON public.creator_social_accounts(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_social_accounts_platform ON public.creator_social_accounts(platform);

-- Trigger to update `updated_at` automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_creator_social_accounts_updated_at
        BEFORE UPDATE ON public.creator_social_accounts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
