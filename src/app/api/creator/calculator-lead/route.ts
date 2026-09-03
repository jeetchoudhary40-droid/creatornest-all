import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      handle,
      platform,
      followers,
      avgViews,
      engagementRate,
      niche,
      cityTier,
      language,
      calculatedBaseRate,
      estimatedMonthlyCapacity,
      email,
      phone
    } = body;

    if (!handle) {
      return NextResponse.json({ error: 'Handle or channel link is required' }, { status: 400 });
    }

    const leadEntry = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      handle: handle.trim(),
      platform: platform || 'instagram',
      followers: Number(followers) || 0,
      avg_views: Number(avgViews) || 0,
      engagement_rate: Number(engagementRate) || 0,
      niche: niche || 'General',
      city_tier: cityTier || 'Tier 1',
      language: language || 'Hindi/Hinglish',
      base_rate: Number(calculatedBaseRate) || 0,
      monthly_capacity: estimatedMonthlyCapacity || '',
      email: email || null,
      phone: phone || null,
      created_at: new Date().toISOString()
    };

    // Save locally to data/calculator_leads.json
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      const filePath = path.join(dataDir, 'calculator_leads.json');
      let leads = [];
      if (fs.existsSync(filePath)) {
        try {
          leads = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
        } catch {
          leads = [];
        }
      }
      leads.unshift(leadEntry);
      fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('[CALCULATOR LEAD FILE SAVE WARNING]', fsErr);
    }

    // Save to Supabase
    try {
      await supabase.from('calculator_leads').insert([leadEntry]);
    } catch (dbErr) {
      console.warn('[CALCULATOR LEAD DB SAVE WARNING]', dbErr);
    }

    return NextResponse.json({
      ok: true,
      message: 'Creator calculation saved successfully',
      data: leadEntry
    });
  } catch (err: any) {
    console.error('[CALCULATOR LEAD API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'calculator_leads.json');
    let leads = [];
    if (fs.existsSync(filePath)) {
      try {
        leads = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
      } catch {
        leads = [];
      }
    }
    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
