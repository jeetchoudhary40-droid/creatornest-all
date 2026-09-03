// ============================================================
// Creator Nest — Image Upload API
// POST /api/admin/upload
// Accepts a multipart form with a file, saves to /public/images/creators/
// Returns { success: true, url: '/images/creators/filename.jpg' }
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Only JPG, PNG, WebP and GIF images are allowed.' }, { status: 400 });
    }

    // Validate size (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'Image must be under 5 MB.' }, { status: 400 });
    }

    // Build safe filename: timestamp + sanitised original name
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = file.name
      .replace(/\.[^.]+$/, '')            // remove extension
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')         // keep only alphanumerics
      .replace(/-+/g, '-')
      .slice(0, 40);
    const filename = `${Date.now()}-${safeName}.${ext}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'creators');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write the file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    const url = `/images/creators/${filename}`;
    return NextResponse.json({ success: true, url, filename });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Upload failed.' }, { status: 500 });
  }
}
