-- ══════════════════════════════════════════════════════════
-- MIGRATION: Auto-create user profiles + role_applications table
-- Run this in the Supabase SQL Editor
-- ══════════════════════════════════════════════════════════

-- 1. Ensure profiles table has all required columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create or replace the trigger function that auto-creates a profile on new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    user_type,
    plan_tier,
    permissions,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'user',
    'free',
    '[]'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop old trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Create role_applications table (safe — won't error if it already exists)
CREATE TABLE IF NOT EXISTS public.role_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  requested_role VARCHAR(50) NOT NULL CHECK (requested_role IN ('creator', 'brand', 'team_member', 'career')),
  application_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS on role_applications
ALTER TABLE public.role_applications ENABLE ROW LEVEL SECURITY;

-- Drop old policies first to avoid conflicts
DROP POLICY IF EXISTS "Admins can do everything on role_applications" ON public.role_applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.role_applications;
DROP POLICY IF EXISTS "Users can read their own applications" ON public.role_applications;

-- Admins can read and update all applications
CREATE POLICY "Admins manage all applications" 
ON public.role_applications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type IN ('admin', 'super_admin')
  )
);

-- Users can insert their own application
CREATE POLICY "Users can insert their own applications" 
ON public.role_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can read their own applications
CREATE POLICY "Users can read their own applications" 
ON public.role_applications 
FOR SELECT 
USING (auth.uid() = user_id);

-- 6. Backfill existing auth users who don't have a profile yet
INSERT INTO public.profiles (id, email, full_name, avatar_url, user_type, plan_tier, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture'),
  'user',
  'free',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 7. Ensure RLS policies exist for profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

SELECT 'Migration completed successfully!' as status, count(*) as total_profiles FROM public.profiles;
