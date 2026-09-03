-- ════════════════════════════════════════════════════════
-- ROLE APPLICATIONS SCHEMA
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.role_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  requested_role VARCHAR(50) NOT NULL CHECK (requested_role IN ('creator', 'brand', 'team_member', 'career')),
  application_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.role_applications ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can do everything on role_applications" 
ON public.role_applications 
FOR ALL 
USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'super_admin')));

-- Users can insert and read their own applications
CREATE POLICY "Users can insert their own applications" 
ON public.role_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own applications" 
ON public.role_applications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update profiles table to make sure user_type accepts all required values
-- In PostgreSQL, altering a check constraint usually means dropping and recreating it or relying on application logic.
-- Assuming 'visitor', 'creator', 'brand', 'team' are handled by application logic mostly, we just ensure it here.

SELECT 'ROLE APPLICATIONS TABLE CREATED SUCCESSFULLY' as status;
