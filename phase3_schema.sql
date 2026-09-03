-- Create profiles table if it does not exist (tied to auth.users in a real Supabase setup, but we'll use UUID primary key here)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    plan_tier TEXT DEFAULT 'free',
    user_type TEXT DEFAULT 'user',
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add new fields to the existing profiles table for admin permissions (in case it existed but didn't have this column)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;


-- Create tools table
CREATE TABLE IF NOT EXISTS public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    slug TEXT UNIQUE,
    image_url TEXT,
    file_url TEXT,
    downloads_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    plan_tier TEXT DEFAULT 'free',
    tool_type TEXT DEFAULT 'downloadable',
    icon TEXT,
    accent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.tools ADD COLUMN slug TEXT UNIQUE;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.tools ADD COLUMN plan_tier TEXT DEFAULT 'free';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.tools ADD COLUMN tool_type TEXT DEFAULT 'downloadable';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.tools ADD COLUMN icon TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.tools ADD COLUMN accent TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;


-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    short_desc TEXT,
    long_desc TEXT,
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    duration TEXT,
    rating NUMERIC DEFAULT 0,
    students INTEGER DEFAULT 0,
    instructor TEXT,
    category TEXT,
    plan TEXT DEFAULT 'free',
    accent TEXT,
    icon TEXT,
    outcomes JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create course_sections table
CREATE TABLE IF NOT EXISTS public.course_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    section_title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create course_lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.course_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration TEXT,
    is_free BOOLEAN DEFAULT false,
    video_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    delivery_time TEXT,
    rating NUMERIC DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    provider TEXT,
    plan_required TEXT DEFAULT 'free',
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and setup policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Allow public read access to content
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Tools are viewable by everyone." ON public.tools FOR SELECT USING (true);
CREATE POLICY "Courses are viewable by everyone." ON public.courses FOR SELECT USING (true);
CREATE POLICY "Course sections are viewable by everyone." ON public.course_sections FOR SELECT USING (true);
CREATE POLICY "Course lessons are viewable by everyone." ON public.course_lessons FOR SELECT USING (true);
CREATE POLICY "Services are viewable by everyone." ON public.services FOR SELECT USING (true);

-- Drop existing policies if running multiple times (prevents policy already exists error)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can insert tools" ON public.tools;
    DROP POLICY IF EXISTS "Admins can update tools" ON public.tools;
    DROP POLICY IF EXISTS "Admins can delete tools" ON public.tools;
    
    DROP POLICY IF EXISTS "Admins can insert courses" ON public.courses;
    DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
    DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;

    DROP POLICY IF EXISTS "Admins can insert course sections" ON public.course_sections;
    DROP POLICY IF EXISTS "Admins can update course sections" ON public.course_sections;
    DROP POLICY IF EXISTS "Admins can delete course sections" ON public.course_sections;

    DROP POLICY IF EXISTS "Admins can insert course lessons" ON public.course_lessons;
    DROP POLICY IF EXISTS "Admins can update course lessons" ON public.course_lessons;
    DROP POLICY IF EXISTS "Admins can delete course lessons" ON public.course_lessons;

    DROP POLICY IF EXISTS "Admins can insert services" ON public.services;
    DROP POLICY IF EXISTS "Admins can update services" ON public.services;
    DROP POLICY IF EXISTS "Admins can delete services" ON public.services;

    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Policies for Profiles (Upsert logic from auth)
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Super Admins can update profiles to grant permissions
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.user_type = 'admin')
);

-- Policies for content
CREATE POLICY "Admins can insert tools" ON public.tools FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_tools'))
);
CREATE POLICY "Admins can update tools" ON public.tools FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_tools'))
);
CREATE POLICY "Admins can delete tools" ON public.tools FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_tools'))
);

CREATE POLICY "Admins can insert courses" ON public.courses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_courses'))
);
CREATE POLICY "Admins can update courses" ON public.courses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_courses'))
);
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_courses'))
);

CREATE POLICY "Admins can insert course sections" ON public.course_sections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_courses'))
);
CREATE POLICY "Admins can update course sections" ON public.course_sections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_courses'))
);
CREATE POLICY "Admins can delete course sections" ON public.course_sections FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_courses'))
);

CREATE POLICY "Admins can insert course lessons" ON public.course_lessons FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_courses'))
);
CREATE POLICY "Admins can update course lessons" ON public.course_lessons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_courses'))
);
CREATE POLICY "Admins can delete course lessons" ON public.course_lessons FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_courses'))
);

CREATE POLICY "Admins can insert services" ON public.services FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_services'))
);
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_services'))
);
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_services'))
);
