// ============================================================
// Creator Nest — Secure Digital Tool Asset Download API
// GET /api/tools/download?tool_id=...&order_id=...
// Streams the authorized tool file with Content-Disposition: attachment
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TOOLS_FILE = path.join(process.cwd(), 'data', 'market_items.json');
const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

function getTools(): any[] {
  try {
    if (!fs.existsSync(TOOLS_FILE)) return [];
    return JSON.parse(fs.readFileSync(TOOLS_FILE, 'utf-8') || '[]');
  } catch {
    return [];
  }
}

function getOrders(): any[] {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8') || '[]');
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const toolId = searchParams.get('tool_id');
    const orderId = searchParams.get('order_id');

    if (!toolId) {
      return NextResponse.json({ error: 'Missing tool_id parameter' }, { status: 400 });
    }

    const tools = getTools();
    const tool = tools.find((t: any) => String(t.id) === String(toolId));

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    const price = parseFloat(String(tool.price)) || 0;
    const isFree = price <= 0 || tool.plan === 'free';

    // Verify payment authorization for paid tools
    if (!isFree) {
      if (!orderId) {
        return NextResponse.json(
          { error: 'Payment required: Please purchase this tool to download.' },
          { status: 403 }
        );
      }

      const orders = getOrders();
      const verifiedOrder = orders.find(
        (o: any) => o.orderId === orderId && String(o.toolId) === String(toolId) && o.status === 'PAID'
      );

      if (!verifiedOrder) {
        return NextResponse.json(
          { error: 'Invalid or unpaid order. Please complete payment on Cashfree.' },
          { status: 403 }
        );
      }
    }

    // Determine file location
    let relativeFilePath = tool.file_url || '';
    let resolvedFilePath = '';

    if (relativeFilePath.startsWith('/uploads/')) {
      resolvedFilePath = path.join(process.cwd(), 'public', relativeFilePath.slice(1));
    } else if (relativeFilePath.startsWith('http://') || relativeFilePath.startsWith('https://')) {
      // If external URL, redirect directly
      return NextResponse.redirect(relativeFilePath);
    } else if (relativeFilePath) {
      resolvedFilePath = path.join(process.cwd(), 'public', 'uploads', 'tools', 'assets', path.basename(relativeFilePath));
    }

    // Fallback if file doesn't exist on disk yet: create a branded starter digital asset
    const safeTitle = (tool.title || 'CreatorNest_AI_Tool').replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = resolvedFilePath ? path.extname(resolvedFilePath) || '.txt' : '.txt';
    const downloadFilename = `${safeTitle}${ext}`;

    let fileBuffer: Buffer;
    if (resolvedFilePath && fs.existsSync(resolvedFilePath)) {
      fileBuffer = fs.readFileSync(resolvedFilePath);
    } else {
      // Branded fallback package
      const content = [
        `=============================================================`,
        `🚀 CREATOR NEST OFFICIAL AI INTELLIGENCE SUITE`,
        `Product: ${tool.title}`,
        `Category: ${tool.category || 'AI Tools'}`,
        `License: Commercial Creator License — CreatorNest.in`,
        `=============================================================`,
        ``,
        `OVERVIEW:`,
        tool.short_desc || '',
        ``,
        `LONG DESCRIPTION:`,
        tool.long_desc || '',
        ``,
        `KEY FEATURES & CAPABILITIES:`,
        ...(Array.isArray(tool.features) ? tool.features.map((f: string, i: number) => `${i + 1}. ${f}`) : []),
        ``,
        `TAGS:`,
        (Array.isArray(tool.tags) ? tool.tags.join(', ') : tool.tags || ''),
        ``,
        `SUPPORT & COMMUNITY:`,
        `Website: https://creatornest.in`,
        `Email: hello@creatornest.in`,
        `WhatsApp Desk: +91 8766077505`,
        `=============================================================`
      ].join('\n');
      fileBuffer = Buffer.from(content, 'utf-8');
    }

    // Return file with automatic browser download headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (err: any) {
    console.error('[Download Tool Asset Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to download tool asset.' }, { status: 500 });
  }
}
