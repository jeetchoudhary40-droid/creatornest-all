-- Run this in Supabase SQL Editor to allow client-side inserts/updates.
-- Since Next.js offloads authentication to the FastAPI backend and doesn't log in to Supabase auth,
-- all client-side Supabase write queries are anonymous (auth.uid() is null). 
-- Therefore, we must define write policies that allow access for anon client queries.

-- 1. Profiles Table Policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for all" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for all" ON public.profiles;

CREATE POLICY "Enable insert for all" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.profiles FOR UPDATE USING (true);

-- 2. Creator Roster Table Policies
DROP POLICY IF EXISTS "Admins can manage roster" ON public.creator_roster;
DROP POLICY IF EXISTS "Enable insert for all" ON public.creator_roster;
DROP POLICY IF EXISTS "Enable update for all" ON public.creator_roster;
DROP POLICY IF EXISTS "Enable delete for all" ON public.creator_roster;

CREATE POLICY "Enable insert for all" ON public.creator_roster FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.creator_roster FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.creator_roster FOR DELETE USING (true);

