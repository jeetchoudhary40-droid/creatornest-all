// ============================================================
// Creator Nest — Admin Orders & Purchases API
// GET /api/admin/orders
// Returns list of all tool orders/purchases
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminRequest } from '@/lib/security';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

function getOrders(): any[] {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8') || '[]');
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
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
    const orders = getOrders();
    // Sort latest first
    orders.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
