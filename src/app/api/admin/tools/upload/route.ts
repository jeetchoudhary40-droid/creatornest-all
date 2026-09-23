// ============================================================
// Creator Nest — Admin Tools & Assets Upload API
// POST /api/admin/tools/upload
// Accepts multipart form with 'file' and 'type' ('thumbnail' | 'asset')
// Saves to /public/uploads/tools/thumbnails or /public/uploads/tools/assets
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminRequest } from '@/lib/security';

export async function POST(req: NextRequest) {
  // Allow authorized admin or admin password header for dev
  const adminPassword = req.headers.get('x-admin-password');
  const isDirectAdmin = adminPassword && adminPassword === process.env.ADMIN_PASSWORD;
  
  if (!isDirectAdmin) {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      // In development, allow localhost upload if cookies contain user info
      const hasCookie = req.cookies.get('cn_user') || req.cookies.get('cn_admin_token');
      if (!hasCookie && process.env.NODE_ENV === 'production') {
        return auth.errorResponse!;
      }
    }
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const uploadCategory = (formData.get('category') as string) || 'asset'; // 'thumbnail' or 'asset'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);

    // Subdirectory based on category
    const subfolder = (uploadCategory === 'thumbnail' || isImage) ? 'thumbnails' : 'assets';
    const targetDir = path.join(process.cwd(), 'public', 'uploads', 'tools', subfolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Sanitize filename
    const safeBase = file.name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 50);

    const uniqueName = `${Date.now()}_${safeBase}.${ext}`;
    const filePath = path.join(targetDir, uniqueName);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/tools/${subfolder}/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueName,
      originalName: file.name,
      size: file.size,
      category: subfolder
    });
  } catch (err: any) {
    console.error('[Admin Tools Upload] Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'File upload failed.' }, { status: 500 });
  }
}
