-- 1. Create tools table
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  file_url TEXT NOT NULL,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.tools FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.tools FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.tools FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Create tool_downloads table for lead capture
CREATE TABLE IF NOT EXISTS public.tool_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.tool_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for all" ON public.tool_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for authenticated users only" ON public.tool_downloads FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Create an RPC to safely increment tool downloads
CREATE OR REPLACE FUNCTION increment_tool_downloads(tool_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.tools
  SET downloads_count = downloads_count + 1
  WHERE id = tool_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Setup Storage Bucket (Note: This might need to be created manually via Dashboard if this fails)
INSERT INTO storage.buckets (id, name, public) VALUES ('tools-assets', 'tools-assets', true) ON CONFLICT DO NOTHING;

-- Storage Policies for tools-assets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'tools-assets');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tools-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id = 'tools-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'tools-assets' AND auth.role() = 'authenticated');
