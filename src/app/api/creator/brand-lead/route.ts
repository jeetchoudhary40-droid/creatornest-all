import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CRM_FILE = path.join(process.cwd(), 'data', 'brand_deals_crm.json');

function getDeals(): any[] {
  try {
    if (!fs.existsSync(CRM_FILE)) {
      return [];
    }
    const content = fs.readFileSync(CRM_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error('Error reading brand_deals_crm.json:', err);
    return [];
  }
}

function saveDeals(deals: any[]) {
  try {
    const dir = path.dirname(CRM_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CRM_FILE, JSON.stringify(deals, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving brand_deals_crm.json:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorHandle = searchParams.get('creator_handle');

    const deals = getDeals();

    if (creatorHandle) {
      const filtered = deals.filter((d: any) => 
        (d.creator_handle || '').toLowerCase() === creatorHandle.toLowerCase()
      );
      return NextResponse.json({ success: true, count: filtered.length, deals: filtered });
    }

    return NextResponse.json({ success: true, count: deals.length, deals });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      creator_handle,
      brand_name,
      contact_name,
      contact_email,
      budget_band,
      deliverables,
      timeline,
      message,
      utm_source,
      utm_campaign,
      deal_value
    } = body;

    if (!brand_name || !contact_email) {
      return NextResponse.json(
        { success: false, error: 'Brand name and contact email are required.' },
        { status: 400 }
      );
    }

    const deals = getDeals();

    const newDeal = {
      id: `deal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      creator_handle: creator_handle || '@creator',
      brand_name: brand_name.trim(),
      contact_name: contact_name?.trim() || 'Brand Partner',
      contact_email: contact_email.trim(),
      budget_band: budget_band || 'To be discussed',
      deliverables: deliverables || 'Custom Collaboration',
      timeline: timeline || 'Flexible',
      message: message || '',
      status: 'New Inquiry',
      utm_source: utm_source || 'direct_media_kit',
      utm_campaign: utm_campaign || 'inbound',
      deal_value: Number(deal_value) || 50000,
      created_at: new Date().toISOString()
    };

    deals.unshift(newDeal);
    saveDeals(deals);

    return NextResponse.json({
      success: true,
      message: 'Inquiry successfully delivered to creator CRM.',
      deal: newDeal
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, deal_value } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Deal ID is required.' }, { status: 400 });
    }

    const deals = getDeals();
    const index = deals.findIndex(d => d.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Deal not found.' }, { status: 404 });
    }

    if (status) deals[index].status = status;
    if (deal_value !== undefined) deals[index].deal_value = Number(deal_value);

    saveDeals(deals);

    return NextResponse.json({ success: true, deal: deals[index] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
