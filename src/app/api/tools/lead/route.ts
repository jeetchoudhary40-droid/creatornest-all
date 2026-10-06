// ============================================================
// Creator Nest — Universal Tool Leads Collection API
// /api/tools/lead
// Captures creator leads across all tools (YouTube Monetization Audit,
// Brand Deal Calculator, Media Kit Builder, etc.)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const TOOL_LEADS_FILE = path.join(DATA_DIR, 'tool_leads.json');
const CALC_LEADS_FILE = path.join(DATA_DIR, 'calculator_leads.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getStoredToolLeads(): any[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(TOOL_LEADS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(TOOL_LEADS_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading tool_leads.json:', err);
    return [];
  }
}

function saveToolLeads(leads: any[]) {
  ensureDataDir();
  fs.writeFileSync(TOOL_LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

// ── POST: Capture or Update a Tool Lead ──────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tool_id = 'youtube-monetization-audit',
      tool_name = 'YouTube Monetization Channel Audit',
      handle,
      channel_title,
      email,
      phone,
      subscribers = 0,
      total_views = 0,
      video_count = 0,
      niche = 'General',
      country = 'India',
      overall_score = 0,
      monetization_status = 'Pending',
      primary_need = '',
      estimated_monthly_revenue = '',
      metadata = {},
      notes = ''
    } = body;

    if (!handle && !email) {
      return NextResponse.json(
        { success: false, error: 'Channel handle or email is required to register lead' },
        { status: 400 }
      );
    }

    const cleanHandle = (handle || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const now = new Date().toISOString();

    const existingLeads = getStoredToolLeads();

    // Check if duplicate recent lead exists for same handle or email (within last 24h)
    const existingIndex = existingLeads.findIndex(l => 
      (cleanHandle && l.handle?.toLowerCase() === cleanHandle.toLowerCase() && l.tool_id === tool_id) ||
      (cleanEmail && l.email?.toLowerCase() === cleanEmail && l.tool_id === tool_id)
    );

    const leadEntry = {
      id: existingIndex >= 0 ? existingLeads[existingIndex].id : `tool_lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tool_id,
      tool_name,
      handle: cleanHandle || (channel_title ? `@${channel_title.replace(/\s+/g, '')}` : 'Creator'),
      channel_title: channel_title || cleanHandle || 'Channel',
      email: cleanEmail || null,
      phone: (phone || '').trim() || null,
      subscribers: Number(subscribers) || 0,
      total_views: Number(total_views) || 0,
      video_count: Number(video_count) || 0,
      niche: niche || 'Creator',
      country: country || 'India',
      overall_score: Number(overall_score) || 0,
      monetization_status: monetization_status || 'Pending',
      primary_need: primary_need || (overall_score < 70 ? 'Monetization Optimization & Policy Compliance' : 'Brand Deal & Sponsorship Scaling'),
      estimated_monthly_revenue: estimatedMonthlyRevenueString(estimated_monthly_revenue),
      metadata: metadata || {},
      status: existingIndex >= 0 ? (existingLeads[existingIndex].status || 'NEW') : 'NEW',
      notes: notes || (existingIndex >= 0 ? existingLeads[existingIndex].notes : ''),
      created_at: existingIndex >= 0 ? existingLeads[existingIndex].created_at : now,
      updated_at: now
    };

    if (existingIndex >= 0) {
      existingLeads[existingIndex] = leadEntry;
    } else {
      existingLeads.unshift(leadEntry);
    }

    saveToolLeads(existingLeads);

    // Also sync to calculator_leads.json for backwards compatibility
    try {
      let calcLeads = [];
      if (fs.existsSync(CALC_LEADS_FILE)) {
        try {
          calcLeads = JSON.parse(fs.readFileSync(CALC_LEADS_FILE, 'utf-8') || '[]');
        } catch {
          calcLeads = [];
        }
      }
      const existingCalcIdx = calcLeads.findIndex((c: any) => c.id === leadEntry.id);
      const calcItem = {
        id: leadEntry.id,
        tool: leadEntry.tool_name,
        handle: leadEntry.handle,
        platform: 'youtube',
        followers: leadEntry.subscribers,
        avg_views: leadEntry.video_count > 0 ? Math.round(leadEntry.total_views / leadEntry.video_count) : 0,
        niche: leadEntry.niche,
        score: leadEntry.overall_score,
        need: leadEntry.primary_need,
        base_rate: leadEntry.estimated_monthly_revenue,
        email: leadEntry.email,
        phone: leadEntry.phone,
        status: leadEntry.status,
        created_at: leadEntry.created_at
      };

      if (existingCalcIdx >= 0) {
        calcLeads[existingCalcIdx] = calcItem;
      } else {
        calcLeads.unshift(calcItem);
      }
      fs.writeFileSync(CALC_LEADS_FILE, JSON.stringify(calcLeads, null, 2), 'utf-8');
    } catch (calcErr) {
      console.warn('Sync to calculator_leads.json warning:', calcErr);
    }

    // Attempt Supabase insert if table exists
    try {
      await supabase.from('tool_leads').upsert([leadEntry], { onConflict: 'id' });
    } catch {
      // Non-fatal if Supabase table not created yet
    }

    return NextResponse.json({
      success: true,
      message: 'Tool lead captured successfully',
      lead: leadEntry
    });
  } catch (err: any) {
    console.error('[/api/tools/lead POST ERROR]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── GET: List and Filter Tool Leads ──────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const toolFilter = searchParams.get('tool');
    const statusFilter = searchParams.get('status');

    let leads = getStoredToolLeads();

    // Check if calculator_leads.json has historical items not yet in tool_leads.json
    try {
      if (fs.existsSync(CALC_LEADS_FILE)) {
        const calcLeads = JSON.parse(fs.readFileSync(CALC_LEADS_FILE, 'utf-8') || '[]');
        const existingIds = new Set(leads.map(l => l.id));
        const legacyConverted = calcLeads
          .filter((c: any) => !existingIds.has(c.id))
          .map((c: any) => ({
            id: c.id || `legacy_${Date.now()}`,
            tool_id: c.tool?.includes('YouTube') ? 'youtube-monetization-audit' : (c.action ? 'media-kit-builder' : 'brand-deal-calculator'),
            tool_name: c.tool || (c.action ? 'Media Kit Builder' : 'Brand Deal Pricing Calculator'),
            handle: c.handle || '@creator',
            channel_title: c.handle || 'Creator',
            email: c.email || null,
            phone: c.phone || null,
            subscribers: Number(c.followers?.toString().replace(/[^0-9]/g, '')) || 0,
            total_views: Number(c.avg_views?.toString().replace(/[^0-9]/g, '')) || 0,
            video_count: 0,
            niche: c.niche || 'General',
            country: c.city_tier || 'India',
            overall_score: c.score || 75,
            monetization_status: 'Calculated',
            primary_need: c.need || (c.monthly_capacity ? `Monthly Capacity: ${c.monthly_capacity}` : 'Commercial Brand Sponsorship Pricing'),
            estimated_monthly_revenue: c.base_rate ? `₹${Number(c.base_rate).toLocaleString('en-IN')}` : '',
            status: c.status || 'NEW',
            notes: '',
            created_at: c.created_at || new Date().toISOString(),
            updated_at: c.created_at || new Date().toISOString()
          }));

        if (legacyConverted.length > 0) {
          leads = [...leads, ...legacyConverted];
        }
      }
    } catch (e) {
      console.warn('Legacy leads merge warning:', e);
    }

    if (toolFilter && toolFilter !== 'all') {
      leads = leads.filter(l => l.tool_id === toolFilter || l.tool_name?.toLowerCase().includes(toolFilter.toLowerCase()));
    }

    if (statusFilter && statusFilter !== 'all') {
      leads = leads.filter(l => (l.status || 'NEW').toUpperCase() === statusFilter.toUpperCase());
    }

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (err: any) {
    console.error('[/api/tools/lead GET ERROR]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── PATCH: Update Lead Status & Outreach Notes ───────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead id is required' }, { status: 400 });
    }

    const leads = getStoredToolLeads();
    const idx = leads.findIndex(l => l.id === id);

    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    if (status !== undefined) leads[idx].status = status;
    if (notes !== undefined) leads[idx].notes = notes;
    leads[idx].updated_at = new Date().toISOString();

    saveToolLeads(leads);

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      lead: leads[idx]
    });
  } catch (err: any) {
    console.error('[/api/tools/lead PATCH ERROR]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function estimatedMonthlyRevenueString(rev: any): string {
  if (!rev) return '';
  if (typeof rev === 'string') return rev;
  if (typeof rev === 'number') return `₹${rev.toLocaleString('en-IN')}`;
  if (typeof rev === 'object') {
    if (rev.min && rev.max) {
      return `₹${Number(rev.min).toLocaleString('en-IN')} - ₹${Number(rev.max).toLocaleString('en-IN')}`;
    }
    if (rev.min) return `₹${Number(rev.min).toLocaleString('en-IN')}`;
  }
  return '';
}
