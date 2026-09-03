-- ============================================================
-- Audit Log & Sync Log tables for the Intelligent Profile system
-- Run in Supabase SQL Editor AFTER add_intelligent_profile_columns.sql
-- ============================================================

-- Creator profile change audit log
CREATE TABLE IF NOT EXISTS public.creator_profile_audit_log (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      TEXT        NOT NULL,
  updated_by      TEXT        NOT NULL,   -- admin email / 'system' / 'ai-enrichment'
  fields_changed  JSONB       DEFAULT '[]'::jsonb,
  source          VARCHAR(50) DEFAULT 'Manual',
  created_at      TIMESTAMP   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_creator_id ON public.creator_profile_audit_log(creator_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.creator_profile_audit_log(created_at DESC);

-- Sync run log
CREATE TABLE IF NOT EXISTS public.creator_sync_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type     VARCHAR(50) NOT NULL,   -- 'youtube_daily' | 'ai_weekly' | 'score_weekly'
  synced_count INT         DEFAULT 0,
  error_count  INT         DEFAULT 0,
  duration_sec FLOAT       DEFAULT 0,
  ran_at       TIMESTAMP   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_log_ran_at ON public.creator_sync_log(ran_at DESC);

-- RLS: only service role can write audit/sync logs
ALTER TABLE public.creator_profile_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_sync_log          ENABLE ROW LEVEL SECURITY;

-- Allow admins to read audit log
CREATE POLICY "admin_read_audit_log" ON public.creator_profile_audit_log
  FOR SELECT USING (true);

SELECT 'Audit + Sync log tables created!' AS status;
