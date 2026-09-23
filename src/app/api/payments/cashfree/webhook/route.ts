// ============================================================
// Creator Nest — Cashfree Webhook Handler
// POST /api/payments/cashfree/webhook
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

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
    const rawBody = await req.json();
    console.log('[Cashfree Webhook] Event received:', JSON.stringify(rawBody, null, 2));

    const data = rawBody.data || rawBody;
    const orderId = data.order?.order_id || data.order_id;
    const paymentStatus = data.payment?.payment_status || data.order?.order_status || data.order_status;

    if (orderId && (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID')) {
      const orders = getOrders();
      const index = orders.findIndex((o: any) => o.orderId === orderId);
      if (index !== -1) {
        orders[index] = {
          ...orders[index],
          status: 'PAID',
          paymentDetails: data.payment || data,
          webhookVerifiedAt: new Date().toISOString()
        };
        saveOrders(orders);
        console.log(`[Cashfree Webhook] Order ${orderId} marked as PAID.`);
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed.' });
  } catch (err: any) {
    console.error('[Cashfree Webhook Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
