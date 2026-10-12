// ============================================================
// Creator Nest — Public Creator Services Directory API
// GET /api/services
// Supports: list all published services, or ?id=... for single service
// Strictly returns ONLY services (never tools)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { ITEMS } from '@/app/marketplace/marketData';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const services = ITEMS.filter((item) => item.type === 'service');

    if (id) {
      const found = services.find((s) => String(s.id) === String(id));
      if (!found) {
        return NextResponse.json({ success: false, error: 'Service not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, service: found });
    }

    return NextResponse.json({ success: true, count: services.length, services });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
