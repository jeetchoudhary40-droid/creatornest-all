// ============================================================
// Creator Nest — Admin Roster API
// /api/admin/roster
// Single source of truth: data/roster.json
// Supports: GET | POST | PUT | PATCH (reorder) | DELETE
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ROSTER_FILE_PATH = path.join(process.cwd(), 'data', 'roster.json');

// ── File helpers ─────────────────────────────────────────────

function getRosterFromFile(): any[] {
  try {
    if (!fs.existsSync(ROSTER_FILE_PATH)) return [];
    const data = fs.readFileSync(ROSTER_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading roster.json:', err);
    return [];
  }
}

function saveRosterToFile(creators: any[]) {
  try {
    const dir = path.dirname(ROSTER_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ROSTER_FILE_PATH, JSON.stringify(creators, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving roster.json:', err);
    throw new Error('Failed to save roster data.');
  }
}

function formatCount(num: number): string {
  if (!num || isNaN(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

function determinePlatform(ytNum: number, igNum: number, existing?: string): string {
  if (existing && existing !== 'Both' && existing !== 'Youtube' && existing !== 'Instagram') return existing;
  if (ytNum > 0 && igNum > 0) return 'Both';
  if (igNum > 0) return 'Instagram';
  return 'Youtube';
}

// ── GET: List all creators ─────────────────────────────────

export async function GET() {
  try {
    const creators = getRosterFromFile();
    // Sort by rank ascending so order is correct
    creators.sort((a: any, b: any) => (a.rank ?? 999) - (b.rank ?? 999));
    return NextResponse.json({ success: true, count: creators.length, creators });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── POST: Add new creator ──────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, channelName, niche, niches, category, platform, bio, img,
      youtubeNum, instaNum, location, avd, avgViewsLast10,
      topGrowing, featured, show_on_home, show_on_roster,
      businessEmail, whatsappNumber, contactPhone,
      youtubeUrl, youtubeHandle, instaUrl, instaHandle,
      linkedinUrl, twitterUrl, websiteUrl,
    } = body;

    const creatorName = (name || '').trim();
    if (!creatorName) {
      return NextResponse.json({ success: false, error: 'Creator name is required.' }, { status: 400 });
    }

    const creators = getRosterFromFile();
    const newId = Date.now();
    const ytNum = Number(youtubeNum) || 0;
    const igNum = Number(instaNum) || 0;
    const maxRank = creators.reduce((m: number, c: any) => Math.max(m, Number(c.rank) || 0), 0);

    const nichesList: string[] = Array.isArray(niches) && niches.length > 0
      ? niches
      : (niche ? String(niche).split(',').map((s: string) => s.trim()).filter(Boolean) : ['AI & Automation']);
    const primaryNiche = nichesList[0] || niche || category || 'AI & Automation';

    const newCreator = {
      id: newId,
      name: creatorName,
      channelName: channelName || youtubeHandle || '',
      niche: primaryNiche,
      niches: nichesList,
      platform: platform || determinePlatform(ytNum, igNum),
      youtube: formatCount(ytNum),
      youtubeNum: ytNum,
      instagram: formatCount(igNum),
      instaNum: igNum,
      location: location || 'India',
      avd: avd || '',
      avgViewsLast10: Number(avgViewsLast10) || 0,
      topGrowing: Boolean(topGrowing),
      featured: Boolean(featured),
      rank: maxRank + 1,
      img: img || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      bio: bio || '',
      show_on_home: show_on_home !== undefined ? Boolean(show_on_home) : Boolean(featured),
      show_on_roster: show_on_roster !== undefined ? Boolean(show_on_roster) : true,
      businessEmail: businessEmail || '',
      whatsappNumber: whatsappNumber || '',
      contactPhone: contactPhone || '',
      youtubeUrl: youtubeUrl || '',
      youtubeHandle: youtubeHandle || '',
      instaUrl: instaUrl || '',
      instaHandle: instaHandle || '',
      linkedinUrl: linkedinUrl || '',
      twitterUrl: twitterUrl || '',
      websiteUrl: websiteUrl || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    creators.push(newCreator);
    saveRosterToFile(creators);

    return NextResponse.json({ success: true, message: `Creator "${creatorName}" added successfully.`, creator: newCreator });
  } catch (err: any) {
    console.error('POST /api/admin/roster error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── PUT: Update existing creator by id ────────────────────

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Creator id is required.' }, { status: 400 });
    }

    const creators = getRosterFromFile();
    const index = creators.findIndex((c: any) => String(c.id) === String(id));

    if (index === -1) {
      return NextResponse.json({ success: false, error: `Creator with id "${id}" not found.` }, { status: 404 });
    }

    const current = creators[index];
    const ytNum = updates.youtubeNum !== undefined ? Number(updates.youtubeNum) : current.youtubeNum;
    const igNum = updates.instaNum !== undefined ? Number(updates.instaNum) : current.instaNum;

    let nichesList = current.niches || [current.niche];
    if (updates.niches !== undefined) {
      nichesList = Array.isArray(updates.niches) ? updates.niches : [updates.niches];
    } else if (updates.niche !== undefined) {
      nichesList = String(updates.niche).split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    const primaryNiche = nichesList[0] || updates.niche || current.niche || 'AI & Automation';

    creators[index] = {
      ...current,
      name: updates.name !== undefined ? String(updates.name).trim() : current.name,
      channelName: updates.channelName !== undefined ? updates.channelName : (current.channelName || current.youtubeHandle || ''),
      niche: primaryNiche,
      niches: nichesList,
      platform: updates.platform !== undefined ? updates.platform : determinePlatform(ytNum, igNum, current.platform),
      youtube: updates.youtubeNum !== undefined ? formatCount(ytNum) : current.youtube,
      youtubeNum: ytNum,
      instagram: updates.instaNum !== undefined ? formatCount(igNum) : current.instagram,
      instaNum: igNum,
      location: updates.location !== undefined ? updates.location : current.location,
      avd: updates.avd !== undefined ? updates.avd : current.avd,
      avgViewsLast10: updates.avgViewsLast10 !== undefined ? Number(updates.avgViewsLast10) : (current.avgViewsLast10 || 0),
      topGrowing: updates.topGrowing !== undefined ? Boolean(updates.topGrowing) : current.topGrowing,
      featured: updates.featured !== undefined ? Boolean(updates.featured) : current.featured,
      rank: updates.rank !== undefined ? Number(updates.rank) : current.rank,
      img: updates.img !== undefined ? updates.img : current.img,
      bio: updates.bio !== undefined ? updates.bio : current.bio,
      show_on_home: updates.show_on_home !== undefined ? Boolean(updates.show_on_home) : current.show_on_home,
      show_on_roster: updates.show_on_roster !== undefined ? Boolean(updates.show_on_roster) : current.show_on_roster,
      businessEmail: updates.businessEmail !== undefined ? updates.businessEmail : current.businessEmail,
      whatsappNumber: updates.whatsappNumber !== undefined ? updates.whatsappNumber : current.whatsappNumber,
      contactPhone: updates.contactPhone !== undefined ? updates.contactPhone : current.contactPhone,
      youtubeUrl: updates.youtubeUrl !== undefined ? updates.youtubeUrl : current.youtubeUrl,
      youtubeHandle: updates.youtubeHandle !== undefined ? updates.youtubeHandle : current.youtubeHandle,
      instaUrl: updates.instaUrl !== undefined ? updates.instaUrl : current.instaUrl,
      instaHandle: updates.instaHandle !== undefined ? updates.instaHandle : current.instaHandle,
      linkedinUrl: updates.linkedinUrl !== undefined ? updates.linkedinUrl : current.linkedinUrl,
      twitterUrl: updates.twitterUrl !== undefined ? updates.twitterUrl : current.twitterUrl,
      websiteUrl: updates.websiteUrl !== undefined ? updates.websiteUrl : current.websiteUrl,
      updated_at: new Date().toISOString(),
    };

    saveRosterToFile(creators);

    return NextResponse.json({ success: true, message: 'Creator updated successfully.', creator: creators[index] });
  } catch (err: any) {
    console.error('PUT /api/admin/roster error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── PATCH: Bulk reorder / toggle visibility ─────────────────
// Body: { action: 'reorder', items: [{id, rank}] }
//    or { action: 'toggle', id, field, value }

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const creators = getRosterFromFile();

    if (action === 'reorder') {
      // items = [{ id: string|number, rank: number }, ...]
      const items: { id: string | number; rank: number }[] = body.items || [];
      for (const item of items) {
        const idx = creators.findIndex((c: any) => String(c.id) === String(item.id));
        if (idx !== -1) {
          creators[idx].rank = item.rank;
          creators[idx].updated_at = new Date().toISOString();
        }
      }
      saveRosterToFile(creators);
      return NextResponse.json({ success: true, message: 'Order updated successfully.' });
    }

    if (action === 'toggle') {
      const { id, field, value } = body;
      if (!id || !field) {
        return NextResponse.json({ success: false, error: 'id and field are required for toggle.' }, { status: 400 });
      }
      const TOGGLEABLE = ['show_on_home', 'show_on_roster', 'featured', 'topGrowing'];
      if (!TOGGLEABLE.includes(field)) {
        return NextResponse.json({ success: false, error: `Field "${field}" is not toggleable.` }, { status: 400 });
      }
      const idx = creators.findIndex((c: any) => String(c.id) === String(id));
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Creator not found.' }, { status: 404 });
      }
      creators[idx][field] = Boolean(value);
      creators[idx].updated_at = new Date().toISOString();
      saveRosterToFile(creators);
      return NextResponse.json({ success: true, creator: creators[idx] });
    }

    return NextResponse.json({ success: false, error: `Unknown action "${action}".` }, { status: 400 });
  } catch (err: any) {
    console.error('PATCH /api/admin/roster error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── DELETE: Remove creator ─────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Creator id is required.' }, { status: 400 });
    }

    let creators = getRosterFromFile();
    const target = creators.find((c: any) => String(c.id) === String(id));

    if (!target) {
      return NextResponse.json({ success: false, error: 'Creator not found.' }, { status: 404 });
    }

    creators = creators.filter((c: any) => String(c.id) !== String(id));
    saveRosterToFile(creators);

    return NextResponse.json({ success: true, message: `Creator "${target.name}" removed from roster.` });
  } catch (err: any) {
    console.error('DELETE /api/admin/roster error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
