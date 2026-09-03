-- Phase 4 LMS Advanced Schema: Progress & Tracking
-- Run this in your Supabase SQL Editor

-- 1. Course Enrollments (tracks a user's overall progress in a course)
CREATE TABLE IF NOT EXISTS public.user_course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    completion_percentage NUMERIC DEFAULT 0,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- 2. Lesson Progress (granular tracking per lesson)
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    play_count INTEGER DEFAULT 0,
    total_watch_time_seconds INTEGER DEFAULT 0,
    last_watched_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, lesson_id)
);

-- 3. Enable RLS
ALTER TABLE public.user_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- 4. Policies: Users can view and update their own progress
CREATE POLICY "Users can view own course enrollments" ON public.user_course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own course enrollments" ON public.user_course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own course enrollments" ON public.user_course_enrollments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own lesson progress" ON public.user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lesson progress" ON public.user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lesson progress" ON public.user_lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- 5. Policies: Admins can view ALL progress (for analytics)
CREATE POLICY "Admins can view all enrollments" ON public.user_course_enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_courses'))
);
CREATE POLICY "Admins can view all lesson progress" ON public.user_lesson_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_courses'))
);

-- Note: We already have course_sections and course_lessons in the schema, but we need to ensure lessons have video_url and sort_order.
-- These were added in phase3_schema.sql, but just to be safe:
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.course_lessons ADD COLUMN video_url TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.course_lessons ADD COLUMN sort_order INTEGER DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.course_lessons ADD COLUMN description TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;
