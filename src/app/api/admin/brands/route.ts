import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminRequest, checkRateLimit, getClientIp } from '@/lib/security';

const BRANDS_FILE_PATH = path.join(process.cwd(), 'data', 'brands.json');

function getBrandsFromFile(): any[] {
  try {
    if (!fs.existsSync(BRANDS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(BRANDS_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading data/brands.json:', err);
    return [];
  }
}

function saveBrandsToFile(brands: any[]) {
  try {
    const dir = path.dirname(BRANDS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BRANDS_FILE_PATH, JSON.stringify(brands, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data/brands.json:', err);
    throw new Error('Failed to persist brands data.');
  }
}

// GET: Retrieve brands, campaigns, and executive stats
export async function GET(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const brands = getBrandsFromFile();
    const url = new URL(req.url);
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const industryFilter = url.searchParams.get('industry') || '';
    const tierFilter = url.searchParams.get('tier') || '';
    const statusFilter = url.searchParams.get('status') || '';
    const promotionTypeFilter = url.searchParams.get('promotion_type') || '';

    // Calculate executive KPIs
    let totalCampaigns = 0;
    let activeCampaigns = 0;
    let executedCampaigns = 0;
    let totalPipelineBudget = 0;
    let totalHistoricalSpend = 0;
    let scriptsPendingReview = 0;

    brands.forEach((brand: any) => {
      totalHistoricalSpend += Number(brand.total_spend || 0);
      const campaigns = brand.campaigns || [];
      totalCampaigns += campaigns.length;

      campaigns.forEach((camp: any) => {
        if (camp.status === 'Completed') {
          executedCampaigns++;
        } else if (camp.status !== 'Cancelled') {
          activeCampaigns++;
          totalPipelineBudget += Number(camp.budget || 0);
        }

        if (camp.script_status === 'Under Brand Review' || camp.script_status === 'Draft Submitted') {
          scriptsPendingReview++;
        }
      });
    });

    let filtered = brands;

    if (search) {
      filtered = filtered.filter((b: any) => {
        const matchName = (b.brand_name || '').toLowerCase().includes(search);
        const matchCompany = (b.company_legal_name || '').toLowerCase().includes(search);
        const matchContact = (b.primary_contact?.name || '').toLowerCase().includes(search);
        const matchEmail = (b.primary_contact?.email || '').toLowerCase().includes(search);
        const matchCampaign = (b.campaigns || []).some((c: any) => 
          (c.campaign_name || '').toLowerCase().includes(search) ||
          (c.coupon_code || '').toLowerCase().includes(search)
        );
        return matchName || matchCompany || matchContact || matchEmail || matchCampaign;
      });
    }

    if (industryFilter) {
      filtered = filtered.filter((b: any) => (b.industry || '').toLowerCase() === industryFilter.toLowerCase());
    }

    if (tierFilter) {
      filtered = filtered.filter((b: any) => (b.tier || '').toLowerCase() === tierFilter.toLowerCase());
    }

    if (statusFilter) {
      filtered = filtered.filter((b: any) => (b.status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    if (promotionTypeFilter) {
      filtered = filtered.filter((b: any) => 
        (b.campaigns || []).some((c: any) => (c.promotion_type || '').toLowerCase() === promotionTypeFilter.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      stats: {
        totalBrands: brands.length,
        activeBrands: brands.filter((b: any) => b.status === 'Active Client').length,
        totalCampaigns,
        activeCampaigns,
        executedCampaigns,
        totalPipelineBudget,
        totalHistoricalSpend,
        scriptsPendingReview,
      },
      brands: filtered,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Create a new Brand Partner OR add a Campaign to an existing brand
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`brand_post_${clientIp}`, 60, 60000);
  if (!rateLimit.success) {
    return NextResponse.json({ error: `Too many requests. Wait ${rateLimit.resetInSec}s.` }, { status: 429 });
  }

  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const body = await req.json();
    const { action = 'create_brand', brandId, brandData, campaignData } = body;
    const brands = getBrandsFromFile();

    if (action === 'create_brand') {
      if (!brandData?.brand_name) {
        return NextResponse.json({ success: false, error: 'Brand Name is required.' }, { status: 400 });
      }

      // Generate numeric ID (BR-101, BR-102...)
      const existingNumeric = brands
        .map((b: any) => parseInt(b.numeric_id?.replace(/\D/g, '') || '100', 10))
        .filter((n: number) => !isNaN(n));
      const nextNum = existingNumeric.length > 0 ? Math.max(...existingNumeric) + 1 : 101;
      const numericId = `BR-${nextNum}`;

      const newBrand: any = {
        id: `br_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        numeric_id: numericId,
        brand_name: brandData.brand_name.trim(),
        company_legal_name: (brandData.company_legal_name || brandData.brand_name).trim(),
        logo_url: brandData.logo_url || '',
        website_url: brandData.website_url || '',
        industry: brandData.industry || 'General Consumer',
        sub_industry: brandData.sub_industry || '',
        tier: brandData.tier || 'High-Growth D2C',
        status: brandData.status || 'Active Client',
        account_manager: brandData.account_manager || auth.user?.full_name || 'Super Admin',
        primary_contact: {
          name: brandData.primary_contact?.name || 'Primary Contact',
          designation: brandData.primary_contact?.designation || 'Brand Manager',
          email: brandData.primary_contact?.email || '',
          phone: brandData.primary_contact?.phone || '',
          whatsapp: brandData.primary_contact?.whatsapp || brandData.primary_contact?.phone || '',
          linkedin: brandData.primary_contact?.linkedin || '',
          city: brandData.primary_contact?.city || 'Mumbai',
          address: brandData.primary_contact?.address || '',
        },
        secondary_contact: brandData.secondary_contact || null,
        gstin: brandData.gstin || '',
        pan_number: brandData.pan_number || '',
        billing_address: brandData.billing_address || '',
        payment_terms: brandData.payment_terms || '50% Advance, 50% on Live',
        target_audience_pref: brandData.target_audience_pref || '',
        social_profiles: brandData.social_profiles || { instagram: '', youtube: '', linkedin: '' },
        total_spend: 0,
        active_campaigns_count: 0,
        total_campaigns_count: 0,
        notes: brandData.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        campaigns: [],
      };

      // If initial campaign was provided during brand onboarding
      if (campaignData && campaignData.campaign_name) {
        const initialCampaign = {
          id: `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          campaign_name: campaignData.campaign_name.trim(),
          objective: campaignData.objective || 'Brand Awareness',
          promotion_type: campaignData.promotion_type || 'Integrated Shoutout (60-90s)',
          budget: Number(campaignData.budget || 100000),
          creator_payout_budget: Number(campaignData.creator_payout_budget || Number(campaignData.budget || 100000) * 0.85),
          status: campaignData.status || 'Brief Received',
          script_provided: Boolean(campaignData.script_provided),
          script_status: campaignData.script_status || (campaignData.script_provided ? 'Draft Submitted' : 'Not Applicable'),
          script_content: campaignData.script_content || '',
          talking_points: campaignData.talking_points || [],
          dos_and_donts: campaignData.dos_and_donts || '',
          mandatory_hashtags: campaignData.mandatory_hashtags || '#Sponsored #Ad',
          cta_link: campaignData.cta_link || '',
          coupon_code: campaignData.coupon_code || '',
          brand_assets_url: campaignData.brand_assets_url || '',
          target_creators_count: Number(campaignData.target_creators_count || 1),
          selected_creators: campaignData.selected_creators || [],
          start_date: campaignData.start_date || new Date().toISOString().split('T')[0],
          end_date: campaignData.end_date || '',
          created_at: new Date().toISOString(),
        };

        newBrand.campaigns.push(initialCampaign);
        newBrand.active_campaigns_count = 1;
        newBrand.total_campaigns_count = 1;
      }

      brands.unshift(newBrand);
      saveBrandsToFile(brands);

      return NextResponse.json({
        success: true,
        message: `Brand ${newBrand.brand_name} (${newBrand.numeric_id}) onboarded successfully.`,
        brand: newBrand,
      });
    }

    if (action === 'add_campaign') {
      if (!brandId) {
        return NextResponse.json({ success: false, error: 'Brand ID is required.' }, { status: 400 });
      }
      if (!campaignData?.campaign_name) {
        return NextResponse.json({ success: false, error: 'Campaign Name is required.' }, { status: 400 });
      }

      const brandIndex = brands.findIndex((b: any) => b.id === brandId || b.numeric_id === brandId);
      if (brandIndex === -1) {
        return NextResponse.json({ success: false, error: 'Brand partner not found.' }, { status: 404 });
      }

      const brand = brands[brandIndex];
      const newCampaign: any = {
        id: `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        campaign_name: campaignData.campaign_name.trim(),
        objective: campaignData.objective || 'Brand Awareness',
        promotion_type: campaignData.promotion_type || 'Integrated Shoutout (60-90s)',
        budget: Number(campaignData.budget || 100000),
        creator_payout_budget: Number(campaignData.creator_payout_budget || Number(campaignData.budget || 100000) * 0.85),
        status: campaignData.status || 'Brief Received',
        script_provided: Boolean(campaignData.script_provided),
        script_status: campaignData.script_status || (campaignData.script_provided ? 'Draft Submitted' : 'Not Applicable'),
        script_content: campaignData.script_content || '',
        talking_points: campaignData.talking_points || [],
        dos_and_donts: campaignData.dos_and_donts || '',
        mandatory_hashtags: campaignData.mandatory_hashtags || '#Sponsored #BrandPartner',
        cta_link: campaignData.cta_link || '',
        coupon_code: campaignData.coupon_code || '',
        brand_assets_url: campaignData.brand_assets_url || '',
        target_creators_count: Number(campaignData.target_creators_count || 1),
        selected_creators: campaignData.selected_creators || [],
        start_date: campaignData.start_date || new Date().toISOString().split('T')[0],
        end_date: campaignData.end_date || '',
        created_at: new Date().toISOString(),
      };

      if (!brand.campaigns) brand.campaigns = [];
      brand.campaigns.unshift(newCampaign);
      brand.total_campaigns_count = brand.campaigns.length;
      brand.active_campaigns_count = brand.campaigns.filter((c: any) => c.status !== 'Completed' && c.status !== 'Cancelled').length;
      brand.updated_at = new Date().toISOString();

      saveBrandsToFile(brands);

      return NextResponse.json({
        success: true,
        message: `Campaign "${newCampaign.campaign_name}" created for ${brand.brand_name}.`,
        campaign: newCampaign,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Update Brand partner or specific Campaign details
export async function PUT(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const body = await req.json();
    const { brandId, brandData, campaignId, campaignData } = body;
    const brands = getBrandsFromFile();

    const brandIndex = brands.findIndex((b: any) => b.id === brandId || b.numeric_id === brandId);
    if (brandIndex === -1) {
      return NextResponse.json({ success: false, error: 'Brand partner not found.' }, { status: 404 });
    }

    const brand = brands[brandIndex];

    // Case 1: Update Brand top-level info
    if (brandData) {
      brands[brandIndex] = {
        ...brand,
        brand_name: brandData.brand_name !== undefined ? brandData.brand_name.trim() : brand.brand_name,
        company_legal_name: brandData.company_legal_name !== undefined ? brandData.company_legal_name.trim() : brand.company_legal_name,
        logo_url: brandData.logo_url !== undefined ? brandData.logo_url : brand.logo_url,
        website_url: brandData.website_url !== undefined ? brandData.website_url : brand.website_url,
        industry: brandData.industry !== undefined ? brandData.industry : brand.industry,
        sub_industry: brandData.sub_industry !== undefined ? brandData.sub_industry : (brand.sub_industry || ''),
        tier: brandData.tier !== undefined ? brandData.tier : brand.tier,
        status: brandData.status !== undefined ? brandData.status : brand.status,
        account_manager: brandData.account_manager !== undefined ? brandData.account_manager : brand.account_manager,
        primary_contact: {
          ...brand.primary_contact,
          ...(brandData.primary_contact || {}),
        },
        secondary_contact: brandData.secondary_contact !== undefined ? brandData.secondary_contact : (brand.secondary_contact || null),
        gstin: brandData.gstin !== undefined ? brandData.gstin : brand.gstin,
        pan_number: brandData.pan_number !== undefined ? brandData.pan_number : (brand.pan_number || ''),
        billing_address: brandData.billing_address !== undefined ? brandData.billing_address : (brand.billing_address || ''),
        payment_terms: brandData.payment_terms !== undefined ? brandData.payment_terms : (brand.payment_terms || '50% Advance, 50% on Live'),
        target_audience_pref: brandData.target_audience_pref !== undefined ? brandData.target_audience_pref : (brand.target_audience_pref || ''),
        social_profiles: {
          ...(brand.social_profiles || {}),
          ...(brandData.social_profiles || {}),
        },
        notes: brandData.notes !== undefined ? brandData.notes : brand.notes,
        total_spend: brandData.total_spend !== undefined ? Number(brandData.total_spend) : brand.total_spend,
        updated_at: new Date().toISOString(),
      };
    }

    // Case 2: Update a specific Campaign inside this brand
    if (campaignId && campaignData) {
      if (!brand.campaigns) brand.campaigns = [];
      const campIndex = brand.campaigns.findIndex((c: any) => c.id === campaignId);

      if (campIndex === -1) {
        return NextResponse.json({ success: false, error: 'Campaign not found in brand dossier.' }, { status: 404 });
      }

      const existingCamp = brand.campaigns[campIndex];
      const updatedCamp = {
        ...existingCamp,
        ...campaignData,
        budget: campaignData.budget !== undefined ? Number(campaignData.budget) : existingCamp.budget,
        creator_payout_budget: campaignData.creator_payout_budget !== undefined ? Number(campaignData.creator_payout_budget) : existingCamp.creator_payout_budget,
      };

      // If campaign is marked completed, update brand's total_spend
      if (updatedCamp.status === 'Completed' && existingCamp.status !== 'Completed') {
        brand.total_spend = (Number(brand.total_spend) || 0) + Number(updatedCamp.budget || 0);
      }

      brand.campaigns[campIndex] = updatedCamp;
      brand.total_campaigns_count = brand.campaigns.length;
      brand.active_campaigns_count = brand.campaigns.filter((c: any) => c.status !== 'Completed' && c.status !== 'Cancelled').length;
      brand.updated_at = new Date().toISOString();
      brands[brandIndex] = brand;
    }

    saveBrandsToFile(brands);

    return NextResponse.json({
      success: true,
      message: 'Brand record updated successfully.',
      brand: brands[brandIndex],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a brand partner OR remove a campaign
export async function DELETE(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const url = new URL(req.url);
    const brandId = url.searchParams.get('brandId');
    const campaignId = url.searchParams.get('campaignId');

    if (!brandId) {
      return NextResponse.json({ success: false, error: 'Brand ID is required.' }, { status: 400 });
    }

    let brands = getBrandsFromFile();
    const brandIndex = brands.findIndex((b: any) => b.id === brandId || b.numeric_id === brandId);

    if (brandIndex === -1) {
      return NextResponse.json({ success: false, error: 'Brand partner not found.' }, { status: 404 });
    }

    // Delete entire brand
    if (!campaignId) {
      const removedBrand = brands[brandIndex];
      brands = brands.filter((b: any) => b.id !== brandId && b.numeric_id !== brandId);
      saveBrandsToFile(brands);
      return NextResponse.json({
        success: true,
        message: `Brand "${removedBrand.brand_name}" and its campaigns deleted successfully.`,
      });
    }

    // Delete single campaign
    const brand = brands[brandIndex];
    brand.campaigns = (brand.campaigns || []).filter((c: any) => c.id !== campaignId);
    brand.total_campaigns_count = brand.campaigns.length;
    brand.active_campaigns_count = brand.campaigns.filter((c: any) => c.status !== 'Completed' && c.status !== 'Cancelled').length;
    brand.updated_at = new Date().toISOString();
    brands[brandIndex] = brand;

    saveBrandsToFile(brands);

    return NextResponse.json({
      success: true,
      message: 'Campaign removed successfully.',
      brand,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
