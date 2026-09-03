-- ====================================================================================
-- MIGRATION: Create creator_roster table for Dynamic Roster & Homepage Management
-- Run this in the Supabase SQL Editor
-- ====================================================================================

-- 1. Create the creator_roster table
CREATE TABLE IF NOT EXISTS public.creator_roster (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  niche VARCHAR(100) DEFAULT 'General',
  youtube_subs VARCHAR(20) DEFAULT '0',
  youtube_num BIGINT DEFAULT 0,
  insta_subs VARCHAR(20) DEFAULT '0',
  insta_num BIGINT DEFAULT 0,
  avd VARCHAR(20) DEFAULT '0m 0s',
  location VARCHAR(100) DEFAULT 'Global',
  bio TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  top_growing BOOLEAN DEFAULT false,
  show_on_roster BOOLEAN DEFAULT false,
  show_on_home BOOLEAN DEFAULT false,
  home_sequence INTEGER DEFAULT 999,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.creator_roster ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts if re-running
DROP POLICY IF EXISTS "Public can view roster" ON public.creator_roster;
DROP POLICY IF EXISTS "Admins can manage roster" ON public.creator_roster;

-- 4. Create Policies
-- Anyone can view the roster data
CREATE POLICY "Public can view roster" 
ON public.creator_roster FOR SELECT USING (true);

-- Only Admins and Super Admins can manage the roster
CREATE POLICY "Admins can manage roster" 
ON public.creator_roster 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.user_type IN ('admin', 'super_admin')
  )
);

-- 5. Trigger to automatically update 'updated_at' column
CREATE OR REPLACE FUNCTION update_roster_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_creator_roster_modtime ON public.creator_roster;

CREATE TRIGGER update_creator_roster_modtime
BEFORE UPDATE ON public.creator_roster
FOR EACH ROW EXECUTE FUNCTION update_roster_updated_at_column();

-- 6. Pre-fill the creator_roster table for existing users who have user_type = 'creator'
INSERT INTO public.creator_roster (profile_id)
SELECT id FROM public.profiles 
WHERE user_type = 'creator' 
ON CONFLICT (profile_id) DO NOTHING;

SELECT 'Migration completed successfully!' as status;
