import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

function getUsersFromFile(): any[] {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading data/users.json:', err);
    return [];
  }
}

function saveUsersToFile(users: any[]) {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data/users.json:', err);
    throw new Error('Failed to persist user data.');
  }
}

// GET all users
export async function GET() {
  try {
    const users = getUsersFromFile();
    // Return users without exposing plaintext password by default (or clean for admin)
    const sanitized = users.map(u => ({
      ...u,
      passwordMasked: u.password ? '••••••••' : '',
    }));
    return NextResponse.json({ success: true, count: users.length, users: sanitized });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Create a new user (e.g. CR-101, BR-202, TM-303, AD-02)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      numericId,
      fullName,
      email,
      password,
      role, // 'creator' | 'brand' | 'team_member' | 'admin'
      phone,
      whatsapp,
      planTier,
      permissions,
      notes,
    } = body;

    if (!fullName || !role) {
      return NextResponse.json(
        { success: false, error: 'Full name and role are required.' },
        { status: 400 }
      );
    }

    const users = getUsersFromFile();

    // Auto-generate numeric ID if not provided
    let finalNumericId = (numericId || '').trim().toUpperCase();
    if (!finalNumericId) {
      const prefixMap: Record<string, string> = {
        creator: 'CR',
        brand: 'BR',
        team_member: 'TM',
        admin: 'AD',
      };
      const prefix = prefixMap[role] || 'USR';
      const count = users.filter(u => (u.numeric_id || '').startsWith(prefix)).length + 101;
      finalNumericId = `${prefix}-${count}`;
    }

    // Check for ID collision
    const existing = users.find(
      u => (u.numeric_id || '').toUpperCase() === finalNumericId ||
           (email && u.email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (existing) {
      if ((existing.numeric_id || '').toUpperCase() === finalNumericId) {
        return NextResponse.json(
          { success: false, error: `User ID "${finalNumericId}" already exists.` },
          { status: 400 }
        );
      }
      if (email && existing.email && existing.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: `An account with email "${email}" already exists.` },
          { status: 400 }
        );
      }
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      numeric_id: finalNumericId,
      full_name: fullName,
      email: email || `${finalNumericId.toLowerCase()}@creatornest.in`,
      password: password || 'nest1234',
      role: role,
      user_type: role,
      plan_tier: planTier || (role === 'brand' ? 'enterprise' : 'pro'),
      status: 'active',
      phone: phone || '',
      whatsapp: whatsapp || phone || '',
      permissions: Array.isArray(permissions) ? permissions : ['wall_of_deals', 'dashboard_access'],
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.unshift(newUser);
    saveUsersToFile(users);

    return NextResponse.json({
      success: true,
      message: `User ${finalNumericId} (${fullName}) created successfully.`,
      user: newUser,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Update an existing user
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, numericId, fullName, email, password, role, status, planTier, permissions, phone, whatsapp, notes } = body;

    if (!id && !numericId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const users = getUsersFromFile();
    const index = users.findIndex(u => u.id === id || u.numeric_id === numericId);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    const user = users[index];

    users[index] = {
      ...user,
      full_name: fullName !== undefined ? fullName : user.full_name,
      email: email !== undefined ? email : user.email,
      password: password ? password : user.password,
      role: role !== undefined ? role : user.role,
      user_type: role !== undefined ? role : user.user_type,
      status: status !== undefined ? status : user.status,
      plan_tier: planTier !== undefined ? planTier : user.plan_tier,
      permissions: permissions !== undefined ? permissions : user.permissions,
      phone: phone !== undefined ? phone : user.phone,
      whatsapp: whatsapp !== undefined ? whatsapp : user.whatsapp,
      notes: notes !== undefined ? notes : user.notes,
      updated_at: new Date().toISOString(),
    };

    saveUsersToFile(users);

    return NextResponse.json({
      success: true,
      message: `User ${users[index].numeric_id} updated.`,
      user: users[index],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a user
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const numericId = searchParams.get('numericId');

    if (!id && !numericId) {
      return NextResponse.json({ success: false, error: 'User ID required.' }, { status: 400 });
    }

    let users = getUsersFromFile();
    const target = users.find(u => u.id === id || u.numeric_id === numericId);

    if (!target) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // Protect Super Admin from deletion
    if (target.numeric_id === 'AD-01' || target.email === 'admin@creatornest.in') {
      return NextResponse.json({ success: false, error: 'Super Admin account (AD-01) cannot be deleted.' }, { status: 403 });
    }

    users = users.filter(u => u.id !== target.id);
    saveUsersToFile(users);

    return NextResponse.json({
      success: true,
      message: `User ${target.numeric_id} (${target.full_name}) deleted.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
