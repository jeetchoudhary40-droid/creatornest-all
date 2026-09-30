import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, isAllowedTable, checkRateLimit, getClientIp } from '@/lib/security';

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isServiceKeyValid = serviceKey && serviceKey !== 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE';

// Use service_role key if available (bypasses RLS), otherwise fall back to anon key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  isServiceKeyValid ? serviceKey! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

if (!isServiceKeyValid) {
  console.warn('[Admin API] SUPABASE_SERVICE_ROLE_KEY not set — using anon key (requires public dev access SQL policies)');
}

// Cleanse payload to prevent prototype pollution
function sanitizePayload(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayload);

  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    clean[key] = typeof val === 'object' && val !== null ? sanitizePayload(val) : val;
  }
  return clean;
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  
  // Rate limiting on DB operations: 120 calls per minute
  const rateLimit = checkRateLimit(`admindb_${clientIp}`, 120, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: `Too many database operations. Please wait ${rateLimit.resetInSec}s.` },
      { status: 429 }
    );
  }

  const auth = verifyAdminRequest(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const body = await request.json();
    const { action, table, data, id, where } = body;

    // 1. Strict Table Whitelist Check (Prevents access to auth.users, pg_*, internal tables)
    if (!table || typeof table !== 'string' || !isAllowedTable(table)) {
      return NextResponse.json(
        { error: `Database access violation: Table '${table || 'unknown'}' is not permitted.` },
        { status: 403 }
      );
    }

    const cleanData = sanitizePayload(data);
    const cleanWhere = sanitizePayload(where);

    let result;

    switch (action) {
      case 'insert':
        if (!cleanData) return NextResponse.json({ error: 'Insert payload required.' }, { status: 400 });
        result = await supabaseAdmin.from(table).insert(cleanData).select();
        break;
      case 'update':
        if (!id) return NextResponse.json({ error: 'Record ID required for update.' }, { status: 400 });
        result = await supabaseAdmin.from(table).update(cleanData).eq('id', id).select();
        break;
      case 'delete':
        if (!id) return NextResponse.json({ error: 'Record ID required for deletion.' }, { status: 400 });
        result = await supabaseAdmin.from(table).delete().eq('id', id);
        break;
      case 'upsert':
        if (!cleanData) return NextResponse.json({ error: 'Upsert payload required.' }, { status: 400 });
        result = await supabaseAdmin.from(table).upsert(cleanData).select();
        break;
      case 'update_where':
        if (!cleanWhere || Object.keys(cleanWhere).length === 0) {
          return NextResponse.json({ error: 'Where condition required to prevent blanket updates.' }, { status: 400 });
        }
        result = await supabaseAdmin.from(table).update(cleanData).match(cleanWhere).select();
        break;
      default:
        return NextResponse.json({ error: 'Invalid or unsupported database action.' }, { status: 400 });
    }

    if (result?.error) {
      console.error('Admin DB error:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result?.data });
  } catch (err: any) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
