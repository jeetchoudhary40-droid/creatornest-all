// ============================================================
// Creator Nest — Admin Tools CRUD API
// /api/admin/tools
// Single source of truth: data/market_items.json
// Supports: GET | POST (Create / Update) | DELETE
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminRequest } from '@/lib/security';

const TOOLS_FILE_PATH = path.join(process.cwd(), 'data', 'market_items.json');

function getToolsFromFile(): any[] {
  try {
    if (!fs.existsSync(TOOLS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(TOOLS_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading market_items.json:', err);
    return [];
  }
}

function saveToolsToFile(tools: any[]) {
  try {
    const dir = path.dirname(TOOLS_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TOOLS_FILE_PATH, JSON.stringify(tools, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving market_items.json:', err);
    throw new Error('Failed to save tools data.');
  }
}

// ── GET: List all tools ──────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const tools = getToolsFromFile();
    return NextResponse.json({ success: true, count: tools.length, tools });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── POST: Create or Update tool ─────────────────────────────
export async function POST(req: NextRequest) {
  const adminPassword = req.headers.get('x-admin-password');
  const isDirectAdmin = adminPassword && adminPassword === process.env.ADMIN_PASSWORD;

  if (!isDirectAdmin) {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      const hasCookie = req.cookies.get('cn_user') || req.cookies.get('cn_admin_token');
      if (!hasCookie && process.env.NODE_ENV === 'production') {
        return auth.errorResponse!;
      }
    }
  }

  try {
    const body = await req.json();
    const {
      id,
      title,
      short_desc,
      long_desc,
      category,
      item_type = 'tool',
      plan = 'free',
      price = 0,
      rating = 5.0,
      icon = 'Brain',
      accent = '#00F2FE',
      thumbnail_url = '',
      file_url = '',
      external_url = '',
      tags = [],
      features = [],
      is_published = true
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required.' }, { status: 400 });
    }

    const tools = getToolsFromFile();
    const numericPrice = parseFloat(String(price)) || 0;

    let savedItem: any;

    if (id) {
      // Update existing item
      const index = tools.findIndex((t: any) => String(t.id) === String(id));
      if (index !== -1) {
        tools[index] = {
          ...tools[index],
          title: title.trim(),
          short_desc: short_desc?.trim() || '',
          long_desc: long_desc?.trim() || short_desc?.trim() || '',
          category: category?.trim() || 'AI Tools',
          item_type,
          plan,
          price: numericPrice,
          rating: parseFloat(String(rating)) || 5.0,
          icon: icon || 'Brain',
          accent: accent || '#00F2FE',
          thumbnail_url: thumbnail_url || tools[index].thumbnail_url || '',
          file_url: file_url || tools[index].file_url || '',
          external_url: external_url || '',
          tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').map((s: string) => s.trim()).filter(Boolean) : []),
          is_published: is_published !== false,
          updated_at: new Date().toISOString()
        };
        savedItem = tools[index];
      } else {
        // ID provided but not found, insert as new with that ID
        savedItem = {
          id: String(id),
          title: title.trim(),
          short_desc: short_desc?.trim() || '',
          long_desc: long_desc?.trim() || short_desc?.trim() || '',
          category: category?.trim() || 'AI Tools',
          item_type,
          plan,
          price: numericPrice,
          rating: parseFloat(String(rating)) || 5.0,
          icon: icon || 'Brain',
          accent: accent || '#00F2FE',
          thumbnail_url: thumbnail_url || '',
          file_url: file_url || '',
          external_url: external_url || '',
          tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').map((s: string) => s.trim()).filter(Boolean) : []),
          is_published: is_published !== false,
          created_at: new Date().toISOString()
        };
        tools.unshift(savedItem);
      }
    } else {
      // Create brand new item
      const newId = `tool-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      savedItem = {
        id: newId,
        title: title.trim(),
        short_desc: short_desc?.trim() || '',
        long_desc: long_desc?.trim() || short_desc?.trim() || '',
        category: category?.trim() || 'AI Tools',
        item_type,
        plan,
        price: numericPrice,
        rating: parseFloat(String(rating)) || 5.0,
        icon: icon || 'Brain',
        accent: accent || '#00F2FE',
        thumbnail_url: thumbnail_url || '',
        file_url: file_url || '',
        external_url: external_url || '',
        tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').map((s: string) => s.trim()).filter(Boolean) : []),
        is_published: is_published !== false,
        created_at: new Date().toISOString()
      };
      tools.unshift(savedItem);
    }

    saveToolsToFile(tools);

    return NextResponse.json({
      success: true,
      message: 'Tool saved successfully.',
      tool: savedItem
    });
  } catch (err: any) {
    console.error('[Admin Tools] Error saving tool:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to save tool.' }, { status: 500 });
  }
}

// ── DELETE: Delete tool ─────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const adminPassword = req.headers.get('x-admin-password');
  const isDirectAdmin = adminPassword && adminPassword === process.env.ADMIN_PASSWORD;

  if (!isDirectAdmin) {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      const hasCookie = req.cookies.get('cn_user') || req.cookies.get('cn_admin_token');
      if (!hasCookie && process.env.NODE_ENV === 'production') {
        return auth.errorResponse!;
      }
    }
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Tool ID is required.' }, { status: 400 });
    }

    const tools = getToolsFromFile();
    const filtered = tools.filter((t: any) => String(t.id) !== String(id));

    if (filtered.length === tools.length) {
      return NextResponse.json({ success: false, error: 'Tool not found.' }, { status: 404 });
    }

    saveToolsToFile(filtered);

    return NextResponse.json({ success: true, message: 'Tool deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
