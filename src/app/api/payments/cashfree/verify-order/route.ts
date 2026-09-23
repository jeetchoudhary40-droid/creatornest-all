// ============================================================
// Creator Nest — Cashfree Verify Order API
// POST /api/payments/cashfree/verify-order
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyCashfreeOrder } from '@/lib/cashfree';

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
    const { orderId, isSimulatedSuccess } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required.' }, { status: 400 });
    }

    const orders = getOrders();
    const orderIndex = orders.findIndex((o: any) => o.orderId === orderId);

    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    const currentOrder = orders[orderIndex];

    // Check if already paid
    let isPaid = currentOrder.status === 'PAID';

    if (!isPaid) {
      if (isSimulatedSuccess || currentOrder.isSimulation) {
        isPaid = true;
      } else {
        const verifyResult = await verifyCashfreeOrder(orderId);
        isPaid = verifyResult.paid;
      }

      if (isPaid) {
        orders[orderIndex] = {
          ...currentOrder,
          status: 'PAID',
          paidAt: new Date().toISOString()
        };
        saveOrders(orders);
      }
    }

    if (!isPaid) {
      return NextResponse.json({
        success: false,
        status: 'PENDING',
        error: 'Payment has not been completed yet.'
      }, { status: 400 });
    }

    // Get tool to retrieve file download link
    const tools = getTools();
    const tool = tools.find((t: any) => String(t.id) === String(currentOrder.toolId));

    const fileName = tool?.file_url ? path.basename(tool.file_url) : `${(tool?.title || 'CreatorNest_Tool').replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;
    const downloadUrl = `/api/tools/download?tool_id=${encodeURIComponent(currentOrder.toolId)}&order_id=${encodeURIComponent(orderId)}`;

    return NextResponse.json({
      success: true,
      status: 'PAID',
      orderId,
      toolId: currentOrder.toolId,
      toolTitle: currentOrder.toolTitle,
      downloadUrl,
      fileName,
      customerEmail: currentOrder.customerEmail,
      amount: currentOrder.amount
    });
  } catch (err: any) {
    console.error('[Cashfree Verify Order] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
