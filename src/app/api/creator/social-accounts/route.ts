import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Safely serialize errors */
function serializeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try { return JSON.stringify(err); } catch { return 'Unknown error'; }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('creator_social_accounts')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // In case table doesn't exist yet, catch error
    return NextResponse.json({ accounts: data ?? [] });
  } catch (err) {
    console.error('[/api/creator/social-accounts GET]', err);
    return NextResponse.json({ error: serializeError(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const account = await req.json();

    if (!account.creator_id || !account.platform || !account.handle || !account.url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('creator_social_accounts')
      .upsert(
        { ...account },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ account: data });
  } catch (err) {
    console.error('[/api/creator/social-accounts POST]', err);
    return NextResponse.json({ error: serializeError(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('creator_social_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/creator/social-accounts DELETE]', err);
    return NextResponse.json({ error: serializeError(err) }, { status: 500 });
  }
}
