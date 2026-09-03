-- This script temporarily disables Row Level Security on role_applications
-- This allows the custom Admin Portal to fetch and approve applications 
-- without needing a Supabase Auth session.

ALTER TABLE public.role_applications DISABLE ROW LEVEL SECURITY;
