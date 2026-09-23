// ============================================================
// Creator Nest — Public AI Tools Directory API
// GET /api/tools
// Supports: list all tools, or ?id=... for single tool
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TOOLS_FILE_PATH = path.join(process.cwd(), 'data', 'market_items.json');

function getTools(): any[] {
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const tools = getTools();

    if (id) {
      const found = tools.find((t: any) => String(t.id) === String(id));
      if (!found) {
        return NextResponse.json({ success: false, error: 'Tool not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, tool: found });
    }

    // Return only published items for public directory
    const published = tools.filter((t: any) => t.is_published !== false);
    return NextResponse.json({ success: true, count: published.length, tools: published });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
