-- ══════════════════════════════════════════════════════════
-- MIGRATION: Auto-assign Numeric IDs (from 1000) and User Management
-- Run this in the Supabase SQL Editor
-- ══════════════════════════════════════════════════════════

-- 1. Create a Sequence for the Numeric IDs starting at 1000
CREATE SEQUENCE IF NOT EXISTS public.user_numeric_id_seq START 1000;
GRANT USAGE ON SEQUENCE public.user_numeric_id_seq TO postgres, authenticated, anon, service_role;

-- 2. Ensure profiles table has the new columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}'::jsonb;

-- 3. Create or replace the trigger function that auto-creates a profile on new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_numeric_id INT;
BEGIN
  -- Get the next numeric ID securely using fully qualified schema
  new_numeric_id := nextval('public.user_numeric_id_seq');

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    user_type,
    plan_tier,
    permissions,
    is_active,
    onboarding_data,
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
    true,
    jsonb_build_object('numeric_id', new_numeric_id),
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

-- 4. Note: Trigger remains attached to auth.users, just the function is updated.
