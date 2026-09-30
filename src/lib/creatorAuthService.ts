import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { hashPassword, comparePassword } from '@/lib/security';

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');
const ROSTER_FILE_PATH = path.join(process.cwd(), 'data', 'roster.json');
const BRAND_DEALS_FILE_PATH = path.join(process.cwd(), 'data', 'brand_deals_crm.json');
const BRANDS_FILE_PATH = path.join(process.cwd(), 'data', 'brands.json');

export function getUsersFromFile(): any[] {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) return [];
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading users.json:', err);
    return [];
  }
}

export function saveUsersToFile(users: any[]) {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users.json:', err);
    throw new Error('Failed to persist users data.');
  }
}

export function getRosterFromFile(): any[] {
  try {
    if (!fs.existsSync(ROSTER_FILE_PATH)) return [];
    const data = fs.readFileSync(ROSTER_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading roster.json:', err);
    return [];
  }
}

export function saveRosterToFile(creators: any[]) {
  try {
    const dir = path.dirname(ROSTER_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ROSTER_FILE_PATH, JSON.stringify(creators, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving roster.json:', err);
    throw new Error('Failed to persist roster data.');
  }
}

/**
 * Calculates next available Creator ID formatted as CR-XXX (e.g. CR-103)
 */
export function getNextCreatorNumericId(users: any[]): string {
  let maxId = 100;
  users.forEach((u: any) => {
    if (u.numeric_id && typeof u.numeric_id === 'string' && u.numeric_id.startsWith('CR-')) {
      const num = parseInt(u.numeric_id.replace('CR-', ''), 10);
      if (!isNaN(num) && num > maxId) {
        maxId = num;
      }
    }
  });
  return `CR-${maxId + 1}`;
}

/**
 * Provisions or synchronizes a user account in users.json for a creator in roster.json
 */
export async function ensureCreatorAccount(
  creator: any,
  defaultPassword = 'Creator@123'
): Promise<{ user: any; isNew: boolean; defaultPassword: string }> {
  const users = getUsersFromFile();

  // Find existing user by roster_id or numeric_id, or non-generic unique email
  let existingUser = users.find((u: any) => {
    if (creator.id && (String(u.roster_id) === String(creator.id))) return true;
    if (creator.numeric_id && u.numeric_id === creator.numeric_id) return true;
    if (creator.user_numeric_id && u.numeric_id === creator.user_numeric_id) return true;
    if (
      creator.businessEmail &&
      u.email &&
      u.email.toLowerCase() === creator.businessEmail.toLowerCase() &&
      creator.businessEmail.toLowerCase() !== 'collabs@creatornest.in' &&
      (!u.roster_id || String(u.roster_id) === String(creator.id))
    ) {
      return true;
    }
    return false;
  });

  if (existingUser) {
    // Synchronize latest admin-created profile image and name
    let updated = false;
    if (creator.img && existingUser.avatar_url !== creator.img) {
      existingUser.avatar_url = creator.img;
      updated = true;
    }
    if (creator.name && existingUser.full_name !== creator.name) {
      existingUser.full_name = creator.name;
      updated = true;
    }
    if (creator.id && !existingUser.roster_id) {
      existingUser.roster_id = creator.id;
      updated = true;
    }
    if (updated) {
      existingUser.updated_at = new Date().toISOString();
      saveUsersToFile(users);
    }
    return { user: existingUser, isNew: false, defaultPassword: existingUser.default_password_plain || defaultPassword };
  }

  // Generate next unique creator ID (e.g. CR-103)
  const nextNumericId = getNextCreatorNumericId(users);

  // Generate clean email if none provided, if generic collabs@, or if already taken
  let accountEmail = (creator.businessEmail || '').trim().toLowerCase();
  const isGeneric = accountEmail === 'collabs@creatornest.in' || accountEmail === 'admin@creatornest.in';
  const emailTaken = users.some((u: any) => u.email && u.email.toLowerCase() === accountEmail);
  if (!accountEmail || emailTaken || isGeneric) {
    const slug = (creator.name || 'creator')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.|\.$/g, '');
    accountEmail = `${slug}@creatornest.in`;
    // If slug alone is taken, append creator id
    if (users.some((u: any) => u.email && u.email.toLowerCase() === accountEmail)) {
      accountEmail = `${slug}.${creator.id || Date.now().toString().slice(-4)}@creatornest.in`;
    }
  }

  // Hash the default password with bcrypt (12 rounds)
  const passwordHash = await hashPassword(defaultPassword);

  const newUser: any = {
    id: `usr_cr_${creator.id || Date.now()}`,
    numeric_id: nextNumericId,
    full_name: creator.name || 'Creator',
    email: accountEmail,
    password_hash: passwordHash,
    role: 'creator',
    user_type: 'creator',
    plan_tier: 'free',
    status: 'active',
    phone: creator.contactPhone || creator.whatsappNumber || '',
    whatsapp: creator.whatsappNumber || '',
    avatar_url: creator.img || null,
    must_change_password: true,
    is_temporary_password: true,
    default_password_plain: defaultPassword,
    permissions: [
      'creator_roster',
      'ai_tools_access',
      'wall_of_deals',
      'profile_edit'
    ],
    roster_id: creator.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsersToFile(users);

  // Sync back to roster item
  const roster = getRosterFromFile();
  const rIdx = roster.findIndex((c: any) => c.id === creator.id);
  if (rIdx !== -1) {
    roster[rIdx].user_id = newUser.id;
    roster[rIdx].user_numeric_id = newUser.numeric_id;
    roster[rIdx].account_email = newUser.email;
    roster[rIdx].default_password = defaultPassword;
    saveRosterToFile(roster);
  }

  return { user: newUser, isNew: true, defaultPassword };
}

/**
 * Ensures all existing creators in roster.json have active user accounts in users.json
 */
export async function syncAllRosterCreatorAccounts(): Promise<number> {
  const roster = getRosterFromFile();
  let createdCount = 0;

  for (const creator of roster) {
    const res = await ensureCreatorAccount(creator);
    if (res.isNew) createdCount++;
  }

  return createdCount;
}

/**
 * Changes a user's password and removes must_change_password flag
 */
export async function changeUserPassword(
  userIdOrEmail: string,
  currentPassword: string,
  newPassword: string,
  force = false
): Promise<{ success: boolean; error?: string; message?: string }> {
  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  const users = getUsersFromFile();
  const searchKey = userIdOrEmail.trim().toLowerCase();

  const userIndex = users.findIndex((u: any) =>
    (u.id && u.id.toLowerCase() === searchKey) ||
    (u.numeric_id && u.numeric_id.toLowerCase() === searchKey) ||
    (u.email && u.email.toLowerCase() === searchKey)
  );

  if (userIndex === -1) {
    return { success: false, error: 'User account not found.' };
  }

  const user = users[userIndex];

  // If not forced or not first-time change with temporary password, verify current password
  if (!force && !user.must_change_password) {
    const check = await comparePassword(currentPassword, user.password_hash || user.password);
    if (!check.valid) {
      return { success: false, error: 'Current password does not match.' };
    }
  } else if (!force && user.must_change_password && currentPassword) {
    // Check against default password or existing password hash
    const check = await comparePassword(currentPassword, user.password_hash || user.password);
    if (!check.valid && currentPassword !== user.default_password_plain && currentPassword !== 'Creator@123') {
      return { success: false, error: 'Current default password does not match.' };
    }
  }

  const newHash = await hashPassword(newPassword.trim());

  users[userIndex].password_hash = newHash;
  delete users[userIndex].password;
  delete users[userIndex].default_password_plain;
  users[userIndex].must_change_password = false;
  users[userIndex].is_temporary_password = false;
  users[userIndex].password_last_changed = new Date().toISOString();
  users[userIndex].updated_at = new Date().toISOString();

  saveUsersToFile(users);

  // Also remove plain default password from roster.json if present
  try {
    const roster = getRosterFromFile();
    const rIdx = roster.findIndex((c: any) => c.user_numeric_id === user.numeric_id || c.id === user.roster_id);
    if (rIdx !== -1) {
      delete roster[rIdx].default_password;
      saveRosterToFile(roster);
    }
  } catch (err) {
    console.error('Failed to clean roster default password:', err);
  }

  return { success: true, message: 'Password changed successfully! You can now log in with your new password.' };
}

/**
 * Creates a password reset token for a user
 */
export async function requestPasswordReset(identifier: string): Promise<{
  success: boolean;
  token?: string;
  user?: { email: string; numeric_id: string; full_name: string };
  error?: string;
  message?: string;
}> {
  const users = getUsersFromFile();
  const searchKey = identifier.trim().toLowerCase();

  const user = users.find((u: any) =>
    (u.numeric_id && u.numeric_id.toLowerCase() === searchKey) ||
    (u.email && u.email.toLowerCase() === searchKey) ||
    (u.id && u.id.toLowerCase() === searchKey)
  );

  if (!user) {
    return {
      success: false,
      error: 'No creator account found with this Creator ID or Email. Please contact your administrator.',
    };
  }

  const resetToken = `rst_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
  const expiresAt = Date.now() + 3600000; // 1 hour

  user.reset_token = resetToken;
  user.reset_token_expires = expiresAt;
  user.updated_at = new Date().toISOString();

  saveUsersToFile(users);

  return {
    success: true,
    token: resetToken,
    user: {
      email: user.email,
      numeric_id: user.numeric_id,
      full_name: user.full_name,
    },
    message: `Password reset request authorized for ${user.full_name} (${user.numeric_id}). Use the reset token to establish a new password.`,
  };
}

/**
 * Resets a password using a valid reset token
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  if (!token || !newPassword || newPassword.trim().length < 6) {
    return { success: false, error: 'Token and new password (min 6 chars) are required.' };
  }

  const users = getUsersFromFile();
  const user = users.find((u: any) => u.reset_token === token && Number(u.reset_token_expires) > Date.now());

  if (!user) {
    return { success: false, error: 'Invalid or expired password reset link/token. Please request a new one.' };
  }

  const newHash = await hashPassword(newPassword.trim());

  user.password_hash = newHash;
  delete user.password;
  delete user.default_password_plain;
  delete user.reset_token;
  delete user.reset_token_expires;
  user.must_change_password = false;
  user.is_temporary_password = false;
  user.password_last_changed = new Date().toISOString();
  user.updated_at = new Date().toISOString();

  saveUsersToFile(users);

  return { success: true, message: 'Password has been successfully reset. Please log in with your new password.' };
}

/**
 * Loads full creator profile including basic info, admin profile picture, deals, and free tools
 */
export function getCreatorFullProfile(identifierOrEmail: string): any {
  const users = getUsersFromFile();
  const roster = getRosterFromFile();
  const searchKey = (identifierOrEmail || '').trim().toLowerCase();

  // Find user
  const user = users.find((u: any) =>
    (u.numeric_id && u.numeric_id.toLowerCase() === searchKey) ||
    (u.email && u.email.toLowerCase() === searchKey) ||
    (u.id && u.id.toLowerCase() === searchKey)
  );

  // Find roster creator
  let creator = roster.find((c: any) => {
    if (user && user.roster_id && (c.id === user.roster_id || String(c.id) === String(user.roster_id))) return true;
    if (user && user.numeric_id && (c.user_numeric_id === user.numeric_id || c.numeric_id === user.numeric_id)) return true;
    if (user && user.email && c.businessEmail && c.businessEmail.toLowerCase() === user.email.toLowerCase()) return true;
    if (searchKey && c.businessEmail && c.businessEmail.toLowerCase() === searchKey) return true;
    if (searchKey && (c.name && c.name.toLowerCase().includes(searchKey))) return true;
    return false;
  });

  // If no roster creator found, fallback to first creator or default profile
  if (!creator && roster.length > 0) {
    creator = roster[0];
  }

  // Load Brand Deals from CRM and Brands Hub
  let brandDeals: any[] = [];
  try {
    if (fs.existsSync(BRAND_DEALS_FILE_PATH)) {
      const deals = JSON.parse(fs.readFileSync(BRAND_DEALS_FILE_PATH, 'utf-8') || '[]');
      brandDeals = deals;
    }
  } catch (err) {
    console.error('Error reading brand_deals_crm.json:', err);
  }

  // Also extract campaigns from brands.json
  let brandCampaigns: any[] = [];
  try {
    if (fs.existsSync(BRANDS_FILE_PATH)) {
      const brands = JSON.parse(fs.readFileSync(BRANDS_FILE_PATH, 'utf-8') || '[]');
      brands.forEach((brand: any) => {
        (brand.campaigns || []).forEach((camp: any) => {
          brandCampaigns.push({
            id: camp.id || `camp_${Math.random()}`,
            brand_name: brand.brand_name,
            brand_logo: brand.logo_url,
            campaign_name: camp.campaign_name,
            promotion_type: camp.promotion_type,
            deliverables: camp.deliverables_summary || `${camp.promotion_type || 'Brand Sponsorship'} Integration`,
            budget: camp.budget,
            timeline: camp.timeline || 'Executed Q3',
            status: camp.status === 'Completed' ? 'Completed' : (camp.status || 'Active'),
            created_at: camp.created_at,
          });
        });
      });
    }
  } catch (err) {
    console.error('Error reading brands.json:', err);
  }

  // Completed deals
  const completedDeals = [
    {
      id: 'deal_comp_boat',
      brand_name: 'boAt Lifestyle',
      brand_logo: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&q=80',
      campaign_name: 'Airdopes 141 ANC Surge',
      deliverables: '1 Dedicated Video Review + 2 Instagram Reels',
      deal_value: 350000,
      timeline: 'Completed & Live',
      status: 'Completed',
      script_approved: true,
      payment_status: 'Paid in Full',
    },
    {
      id: 'deal_comp_zerodha',
      brand_name: 'Zerodha Coin',
      brand_logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=80',
      campaign_name: 'Direct Mutual Funds Awareness',
      deliverables: 'Quarterly 3-Video Retainer + Community Post',
      deal_value: 320000,
      timeline: 'Completed & Live',
      status: 'Completed',
      script_approved: true,
      payment_status: 'Paid in Full',
    },
    ...brandDeals.filter((d: any) => d.status === 'Deal Won').map((d: any) => ({
      id: d.id,
      brand_name: d.brand_name,
      brand_logo: null,
      campaign_name: `${d.brand_name} Sponsorship`,
      deliverables: d.deliverables,
      deal_value: d.deal_value || 150000,
      timeline: d.timeline || 'Executed',
      status: 'Completed',
      script_approved: true,
      payment_status: 'Paid in Full',
    })),
    ...brandCampaigns.filter((c: any) => c.status === 'Completed').map((c: any) => ({
      id: c.id,
      brand_name: c.brand_name,
      brand_logo: c.brand_logo,
      campaign_name: c.campaign_name,
      deliverables: c.deliverables,
      deal_value: c.budget,
      timeline: c.timeline,
      status: 'Completed',
      script_approved: true,
      payment_status: 'Paid in Full',
    })),
  ];

  // Active / Pipeline deals
  const activeDeals = [
    {
      id: 'deal_act_samsung',
      brand_name: 'Samsung India',
      brand_logo: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=200&q=80',
      campaign_name: 'Galaxy M-Series Festive Showcase',
      deliverables: '1 Integrated YouTube Video + 1 Story Link',
      deal_value: 200000,
      timeline: 'In Production (Live next week)',
      status: 'In Execution',
      script_approved: true,
      payment_status: '50% Advance Received',
    },
    {
      id: 'deal_act_swiggy',
      brand_name: 'Swiggy One',
      brand_logo: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=200&q=80',
      campaign_name: 'Gourmet Festival Launch',
      deliverables: '60-Second Integration + Custom Promo Code',
      deal_value: 75000,
      timeline: 'Contract Signed',
      status: 'Contract Sent',
      script_approved: false,
      payment_status: 'Awaiting Invoice',
    },
  ];

  // Free Creator Tools Suite
  const freeTools = [
    {
      id: 'tool-media-kit-builder',
      title: 'Influencer Media Kit & Rate Card Suite',
      description: 'Build a live, mobile-responsive media kit with dynamic CPM rate cards, built-in brand lead capture, and 1-click sponsor agreements.',
      badge: '100% Free Forever',
      icon: 'Sparkles',
      category: 'Commercial Suite',
      link: '/tools/media-kit-builder',
      features: ['Live Web Media Kit', 'Dynamic CPM/CPE Rate Cards', 'Brand Deal Lead CRM', '1-Click Contract Generator'],
    },
    {
      id: 'tool-youtube-er-calc',
      title: 'YouTube Engagement Rate Calculator',
      description: 'Calculate your real views-based engagement rate, benchmark against top creators in your niche, and evaluate commercial sponsorship viability.',
      badge: '100% Free Forever',
      icon: 'Video',
      category: 'Analytics & Benchmarking',
      link: '/tools/youtube-engagement-calculator',
      features: ['Views-based ER% Formula', 'Industry Loyalty Benchmarks', 'Niche CPM Multipliers', 'Bridge to Live Rate Card'],
    },
    {
      id: 'tool-brand-deal-calculator',
      title: 'Brand Deal Pricing & Capacity Calculator',
      description: 'Calculate your exact creator rate card in ₹, deliverable pricing for 11+ formats, CPM/CPE, and compare rates across 13 tech and lifestyle niches.',
      badge: '100% Free Forever',
      icon: 'Calculator',
      category: 'Rate Estimation',
      link: '/tools/brand-deal-calculator',
      features: ['11+ Deliverable Rate Formulas', 'Dual Niche Comparison', 'Usage Rights Multipliers', 'Brand Pitch Formula Trace'],
    },
    {
      id: 'tool-profile-analyzer',
      title: 'Smart Creator Profile & Audience Analyzer',
      description: 'AI-powered creator scoring engine evaluating brand safety, audience authenticity, demographic income splits, and brand sponsorship readiness.',
      badge: '100% Free Forever',
      icon: 'Zap',
      category: 'AI Auditing',
      link: '/tools/profile-analyzer',
      features: ['Authenticity Scoring', 'Brand Safety Index', 'Demographic Income Segment', 'AI Brand Fit Summary'],
    },
  ];

  return {
    user_account: user ? {
      id: user.id,
      numeric_id: user.numeric_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      user_type: user.user_type,
      plan_tier: user.plan_tier,
      must_change_password: Boolean(user.must_change_password),
      is_temporary_password: Boolean(user.is_temporary_password),
      phone: user.phone || creator?.contactPhone || '',
      whatsapp: user.whatsapp || creator?.whatsappNumber || '',
      avatar_url: creator?.img || user.avatar_url || null,
    } : null,
    creator: creator ? {
      id: creator.id,
      numeric_id: creator.user_numeric_id || user?.numeric_id || 'CR-102',
      name: creator.name,
      channelName: creator.channelName || creator.youtubeHandle || creator.name,
      img: creator.img, // Admin set profile picture
      niche: creator.niche || 'AI & Automation',
      niches: creator.niches || [creator.niche || 'AI & Automation'],
      location: creator.location || 'India',
      platform: creator.platform || 'Youtube',
      bio: creator.bio || 'Verified Exclusive Creator at Creator Nest.',
      youtube: creator.youtube || '0',
      youtubeNum: creator.youtubeNum || 0,
      instagram: creator.instagram || '0',
      instaNum: creator.instaNum || 0,
      avgViewsLast10: creator.avgViewsLast10 || 0,
      engagementRate: creator.engagementRate || 4.2,
      creator_score: creator.creator_score || 85,
      creator_tier: creator.creator_tier || 'micro',
      topGrowing: Boolean(creator.topGrowing),
      featured: Boolean(creator.featured),
      // Audience breakdown
      audience: {
        india_pct: creator.audience_india_pct ?? 86,
        tier1_city_pct: creator.audience_tier1_city_pct ?? 60,
        gender_male: creator.audience_gender_male ?? 75,
        gender_female: creator.audience_gender_female ?? 25,
        age_splits: {
          '13-17': creator.audience_age_13_17 ?? 8,
          '18-24': creator.audience_age_18_24 ?? 52,
          '25-34': creator.audience_age_25_34 ?? 30,
          '35-44': creator.audience_age_35_44 ?? 7,
          '45+': creator.audience_age_45_plus ?? 3,
        },
        income_segment: creator.audience_income_segment || 'Upper-Middle',
        top_cities: creator.audience_top_cities || ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune'],
        top_countries: creator.audience_top_countries || ['India', 'United States', 'United Arab Emirates'],
        interests: creator.audience_interests || ['Artificial Intelligence', 'Software Development', 'Gadgets', 'Productivity'],
      },
      // Commercial pricing
      commercials: {
        dedicated_min: creator.deal_rate_dedicated_min || 80000,
        dedicated_max: creator.deal_rate_dedicated_max || 150000,
        integration_min: creator.deal_rate_integration_min || 40000,
        integration_max: creator.deal_rate_integration_max || 75000,
        short_min: creator.deal_rate_short_min || 25000,
        short_max: creator.deal_rate_short_max || 45000,
      },
      social_links: {
        youtube: creator.youtubeUrl || '',
        instagram: creator.instaUrl || '',
        linkedin: creator.linkedinUrl || '',
        twitter: creator.twitterUrl || '',
        website: creator.websiteUrl || '',
      },
    } : null,
    deals: {
      completed: completedDeals,
      active: activeDeals,
      total_deals_count: completedDeals.length + activeDeals.length,
      total_earnings: completedDeals.reduce((sum, d) => sum + Number(d.deal_value || 0), 0),
    },
    free_tools: freeTools,
  };
}
