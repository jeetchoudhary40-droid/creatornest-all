// ============================================================
// Creator Nest — Cashfree Create Order API
// POST /api/payments/cashfree/create-order
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createCashfreeOrder } from '@/lib/cashfree';

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

function saveOrders(orders: any[]) {
  const dir = path.dirname(ORDERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toolId, customerName, customerEmail, customerPhone } = body;

    if (!toolId) {
      return NextResponse.json({ success: false, error: 'Tool ID is required.' }, { status: 400 });
    }

    // Find tool
    const tools = getTools();
    const tool = tools.find((t: any) => String(t.id) === String(toolId));

    if (!tool) {
      return NextResponse.json({ success: false, error: 'Tool not found in catalog.' }, { status: 404 });
    }

    const price = parseFloat(String(tool.price)) || 0;

    // Free tool handling
    if (price <= 0 || tool.plan === 'free') {
      const freeOrderId = `free_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const orders = getOrders();
      orders.unshift({
        orderId: freeOrderId,
        toolId: tool.id,
        toolTitle: tool.title,
        amount: 0,
        customerName: customerName || 'Valued User',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
        status: 'PAID',
        isFree: true,
        createdAt: new Date().toISOString()
      });
      saveOrders(orders);

      return NextResponse.json({
        success: true,
        isFree: true,
        orderId: freeOrderId,
        downloadUrl: `/api/tools/download?tool_id=${encodeURIComponent(tool.id)}&order_id=${freeOrderId}`,
        message: 'Free tool ready for download.'
      });
    }

    // Paid tool: Create Cashfree Order
    const orderId = `order_cn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const returnUrl = `${req.nextUrl.origin}/marketplace/item/${tool.id}?order_id=${orderId}&payment=complete`;

    const cfResult = await createCashfreeOrder({
      orderId,
      orderAmount: price,
      customerName: customerName || 'Valued Creator',
      customerEmail: customerEmail || 'customer@creatornest.in',
      customerPhone: customerPhone || '9999999999',
      returnUrl,
      orderNote: `Purchase of ${tool.title}`
    });

    if (!cfResult.success) {
      return NextResponse.json({
        success: false,
        error: cfResult.error || 'Failed to initialize payment gateway'
      }, { status: 500 });
    }

    // Save pending order
    const orders = getOrders();
    orders.unshift({
      orderId,
      toolId: tool.id,
      toolTitle: tool.title,
      amount: price,
      customerName: customerName || 'Valued Creator',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      status: 'PENDING',
      paymentSessionId: cfResult.paymentSessionId,
      isSimulation: cfResult.isSimulation,
      createdAt: new Date().toISOString()
    });
    saveOrders(orders);

    return NextResponse.json({
      success: true,
      orderId,
      paymentSessionId: cfResult.paymentSessionId,
      isSimulation: cfResult.isSimulation,
      amount: price,
      currency: 'INR',
      toolTitle: tool.title
    });
  } catch (err: any) {
    console.error('[Cashfree Create Order] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
