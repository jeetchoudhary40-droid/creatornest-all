-- Run this in Supabase SQL Editor to forcefully approve your user account for testing!

UPDATE public.profiles
SET 
  user_type = 'creator',
  onboarding_data = jsonb_build_object(
    'application', onboarding_data->'application',
    'apply_status', 'approved',
    'numeric_id', 1000
  )
WHERE email = 'jeetchoudhary40@gmail.com';
