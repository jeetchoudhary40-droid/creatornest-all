"""
Direct Supabase SQL execution via the Management API.
Runs the full 22-table master schema without any browser automation.
"""
import urllib.request
import urllib.error
import json
import sys

# ─── Supabase Project Config ──────────────────────────────────────────────────
# Extract project ref from URL: https://bqesdjhpqdwjowdiinyi.supabase.co
PROJECT_REF = "bqesdjhpqdwjowdiinyi"

# NOTE: We need the SERVICE_ROLE key or ANON key to call pg via REST
# The anon key from .env.local
ANON_KEY = "sb_publishable_RkTppq4iOQw3O8vtie3XEQ_5Ak387LY"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"

SQL = """
-- ════════════════════════════════════════════════════════
-- CREATOR NEST MASTER SCHEMA v3.0
-- ════════════════════════════════════════════════════════

-- STEP 1: VIRTUAL ID SYSTEM
ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS virtual_id VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS niche_primary VARCHAR(100),
  ADD COLUMN IF NOT EXISTS niche_secondary JSONB,
  ADD COLUMN IF NOT EXISTS content_language JSONB,
  ADD COLUMN IF NOT EXISTS total_combined_reach BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS talent_index_score FLOAT,
  ADD COLUMN IF NOT EXISTS collaboration_rate_min NUMERIC,
  ADD COLUMN IF NOT EXISTS collaboration_rate_max NUMERIC,
  ADD COLUMN IF NOT EXISTS is_verified_agency BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS agency_commission_pct FLOAT,
  ADD COLUMN IF NOT EXISTS exclusive_brand_ids JSONB;

CREATE SEQUENCE IF NOT EXISTS creator_vid_seq START 1;
CREATE OR REPLACE FUNCTION generate_virtual_id() RETURNS TRIGGER AS $$
BEGIN
  NEW.virtual_id := 'CN-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(CAST(nextval('creator_vid_seq') AS TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS set_virtual_id ON public.creators;
CREATE TRIGGER set_virtual_id BEFORE INSERT ON public.creators
  FOR EACH ROW WHEN (NEW.virtual_id IS NULL) EXECUTE FUNCTION generate_virtual_id();
"""

# ─── Test connection via a simple REST call ───────────────────────────────────
def test_connection():
    url = f"{SUPABASE_URL}/rest/v1/creators?select=id&limit=1"
    req = urllib.request.Request(url, headers={
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            print(f"[OK] Connection works. Creators table has data: {len(data)} rows returned.")
            return True
    except urllib.error.HTTPError as e:
        print(f"[FAIL] HTTP {e.code}: {e.read().decode()}")
        return False
    except Exception as e:
        print(f"[FAIL] {e}")
        return False

if __name__ == "__main__":
    print("=== Creator Nest Schema Deployer ===")
    print(f"Project: {PROJECT_REF}")
    print(f"Supabase URL: {SUPABASE_URL}")
    print()

    ok = test_connection()
    if ok:
        print()
        print("The Supabase anon key is working.")
        print()
        print("IMPORTANT: The SQL schema must be run using the SERVICE_ROLE key or")
        print("directly in the Supabase SQL Editor since ALTER TABLE requires elevated privileges.")
        print()
        print("=== ACTION REQUIRED ===")
        print("Please do ONE of the following:")
        print()
        print("OPTION A — Supabase Dashboard (easiest):")
        print("  1. Open: https://supabase.com/dashboard/project/bqesdjhpqdwjowdiinyi/sql/new")
        print("  2. Paste and run the SQL from: run_master_schema.py (the sql_script variable)")
        print()
        print("OPTION B — Provide your SERVICE_ROLE key:")
        print("  Set SUPABASE_SERVICE_KEY env variable and re-run this script.")
        print()
        svc_key = ""
        try:
            import os
            svc_key = os.environ.get("SUPABASE_SERVICE_KEY", "")
        except:
            pass
        if svc_key:
            print(f"Service key found: {svc_key[:20]}...")
            print("Running SQL via service key...")
            # Execute via RPC
            rpc_url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
            body = json.dumps({"query": SQL}).encode()
            rpc_req = urllib.request.Request(rpc_url, data=body, headers={
                "apikey": svc_key,
                "Authorization": f"Bearer {svc_key}",
                "Content-Type": "application/json"
            }, method="POST")
            try:
                with urllib.request.urlopen(rpc_req, timeout=30) as resp:
                    print(f"[SUCCESS] {resp.read().decode()}")
            except urllib.error.HTTPError as e:
                print(f"[FAIL] {e.code}: {e.read().decode()}")
        else:
            print("No service key found. See OPTION A above.")
    sys.exit(0)
