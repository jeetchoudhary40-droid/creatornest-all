-- Add details column to services table if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='services' AND column_name='details') THEN
        ALTER TABLE public.services ADD COLUMN details JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
