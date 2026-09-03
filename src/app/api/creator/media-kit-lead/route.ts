import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      handle,
      niche,
      location,
      ytSubs,
      igFollowers,
      avgViews,
      er,
      avd,
      email,
      phone,
      imgUrl,
      rateDedicated,
      rateIntegrated,
      rateReel,
      rateShorts,
      rateStory,
      actionTriggered
    } = body;

    const kitEntry = {
      id: `kit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name || 'Creator',
      handle: handle || '@creator',
      niche: niche || 'Tech & Gaming',
      location: location || 'India',
      youtube_subs: ytSubs || '',
      instagram_followers: igFollowers || '',
      avg_views: avgViews || '',
      engagement_rate: er || '',
      avd: avd || '',
      email: email || '',
      phone: phone || '',
      img_url: imgUrl || '',
      rate_dedicated: rateDedicated || '',
      rate_integrated: rateIntegrated || '',
      rate_reel: rateReel || '',
      rate_shorts: rateShorts || '',
      rate_story: rateStory || '',
      action: actionTriggered || 'PDF_DOWNLOAD',
      created_at: new Date().toISOString()
    };

    // Save silently to data/media_kit_leads.json and data/calculator_leads.json for admin record
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

      // Save to media_kit_leads.json
      const kitPath = path.join(dataDir, 'media_kit_leads.json');
      let kitLeads = [];
      if (fs.existsSync(kitPath)) {
        try { kitLeads = JSON.parse(fs.readFileSync(kitPath, 'utf-8') || '[]'); } catch { kitLeads = []; }
      }
      kitLeads.unshift(kitEntry);
      fs.writeFileSync(kitPath, JSON.stringify(kitLeads, null, 2), 'utf-8');

      // Also append to calculator_leads.json so admin sees unified valuation telemetry
      const calcPath = path.join(dataDir, 'calculator_leads.json');
      let calcLeads = [];
      if (fs.existsSync(calcPath)) {
        try { calcLeads = JSON.parse(fs.readFileSync(calcPath, 'utf-8') || '[]'); } catch { calcLeads = []; }
      }
      calcLeads.unshift({
        id: kitEntry.id,
        handle: kitEntry.handle,
        platform: 'youtube / instagram',
        followers: kitEntry.youtube_subs || kitEntry.instagram_followers,
        avg_views: kitEntry.avg_views,
        engagement_rate: kitEntry.engagement_rate,
        niche: kitEntry.niche,
        city_tier: kitEntry.location,
        language: 'Hindi / English',
        base_rate: kitEntry.rate_dedicated || 50000,
        monthly_capacity: 'Media Kit Customized',
        email: kitEntry.email,
        phone: kitEntry.phone,
        created_at: kitEntry.created_at
      });
      fs.writeFileSync(calcPath, JSON.stringify(calcLeads, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('[SILENT MEDIA KIT LEAD SAVE ERROR]', fsErr);
    }

    // Try saving to Supabase if table exists
    try {
      await supabase.from('calculator_leads').insert([{
        handle: kitEntry.handle,
        platform: 'all',
        followers: 100000,
        avg_views: 40000,
        niche: kitEntry.niche,
        base_rate: 75000,
        email: kitEntry.email,
        created_at: kitEntry.created_at
      }]);
    } catch {
      // Silent catch
    }

    return NextResponse.json({ success: true, id: kitEntry.id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
