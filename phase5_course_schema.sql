-- Phase 5: Complete Course Manager Schema
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to courses table
DO $$ 
BEGIN
  BEGIN ALTER TABLE public.courses ADD COLUMN long_desc TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.courses ADD COLUMN instructor TEXT DEFAULT 'Creator Nest Team'; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.courses ADD COLUMN outcomes JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.courses ADD COLUMN tags TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.courses ADD COLUMN is_published BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.courses ADD COLUMN students_count INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.courses ADD COLUMN rating NUMERIC DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.courses ADD COLUMN total_ratings INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- 2. Add missing columns to course_lessons
DO $$
BEGIN
  BEGIN ALTER TABLE public.course_lessons ADD COLUMN video_type TEXT DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'google_drive')); EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.course_lessons ADD COLUMN description TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.course_lessons ADD COLUMN video_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.course_lessons ADD COLUMN thumbnail_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.course_lessons ADD COLUMN sort_order INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.course_lessons ADD COLUMN is_free BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.course_lessons ADD COLUMN duration TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- 3. Course Ratings Table
CREATE TABLE IF NOT EXISTS public.course_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

-- 4. Enable RLS on ratings
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for ratings
CREATE POLICY "Anyone can view approved ratings" ON public.course_ratings FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can view own ratings" ON public.course_ratings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ratings" ON public.course_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.course_ratings FOR UPDATE USING (auth.uid() = user_id);

-- 6. Function to update course rating aggregate when a rating is approved
CREATE OR REPLACE FUNCTION update_course_rating_aggregate()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.courses
  SET
    rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.course_ratings WHERE course_id = NEW.course_id AND is_approved = true),
    total_ratings = (SELECT COUNT(*) FROM public.course_ratings WHERE course_id = NEW.course_id AND is_approved = true)
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger to auto-update aggregate
DROP TRIGGER IF EXISTS on_rating_change ON public.course_ratings;
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE ON public.course_ratings
  FOR EACH ROW EXECUTE FUNCTION update_course_rating_aggregate();
