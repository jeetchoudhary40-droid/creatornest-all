import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isServiceKeyValid = serviceKey && serviceKey !== 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE';

// Use service_role key if available (bypasses RLS), otherwise fall back to anon key
// The anon key will work if you ran the public dev access SQL policies in Supabase
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  isServiceKeyValid ? serviceKey! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

if (!isServiceKeyValid) {
  console.warn('[Admin API] SUPABASE_SERVICE_ROLE_KEY not set — using anon key (requires public dev access SQL policies)');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, table, data, id, where } = body;

    // Simple auth check — require an admin token in the header
    const authToken = request.headers.get('x-admin-token');
    if (authToken !== 'mock_access_token_admin' && !authToken?.startsWith('mock_access_token_')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let result;

    switch (action) {
      case 'insert':
        result = await supabaseAdmin.from(table).insert(data).select();
        break;
      case 'update':
        result = await supabaseAdmin.from(table).update(data).eq('id', id).select();
        break;
      case 'delete':
        result = await supabaseAdmin.from(table).delete().eq('id', id);
        break;
      case 'upsert':
        result = await supabaseAdmin.from(table).upsert(data).select();
        break;
      case 'update_where':
        result = await supabaseAdmin.from(table).update(data).match(where).select();
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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
