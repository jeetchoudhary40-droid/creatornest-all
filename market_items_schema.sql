CREATE TABLE public.market_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    item_type text NOT NULL CHECK (item_type IN ('tool', 'service', 'template', 'prompt')),
    title text NOT NULL,
    short_desc text NOT NULL,
    long_desc text,
    category text,
    icon text,
    accent text DEFAULT '#00F2FE',
    plan text DEFAULT 'free',
    price numeric DEFAULT 0,
    rating numeric DEFAULT 5.0,
    thumbnail_url text,
    file_url text,
    external_url text,
    tags text[],
    features jsonb,
    is_published boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.market_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.market_items FOR SELECT USING (true);

-- Admins can insert/update/delete (Assumes we use service role or similar admin check, allowing dev access for now based on previous pattern)
CREATE POLICY "Enable insert access for all users" ON public.market_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.market_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.market_items FOR DELETE USING (true);
