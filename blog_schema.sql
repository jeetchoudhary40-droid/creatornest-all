-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
CREATE POLICY "Published blog posts are viewable by everyone." ON public.blog_posts 
  FOR SELECT USING (status = 'published');

-- Allow admins to read all posts (including drafts)
CREATE POLICY "Admins can view all blog posts" ON public.blog_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_blog'))
);

-- Allow admins to insert/update/delete posts
CREATE POLICY "Admins can insert blog posts" ON public.blog_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_blog'))
);
CREATE POLICY "Admins can update blog posts" ON public.blog_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_blog'))
);
CREATE POLICY "Admins can delete blog posts" ON public.blog_posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.user_type = 'admin' OR profiles.permissions ? 'manage_blog'))
);
