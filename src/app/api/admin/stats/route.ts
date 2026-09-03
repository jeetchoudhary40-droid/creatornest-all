import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const submissionsPath = path.join(dataDir, 'submissions.json');
    const usersPath = path.join(dataDir, 'users.json');
    const rosterPath = path.join(dataDir, 'roster.json');
    const calcLeadsPath = path.join(dataDir, 'calculator_leads.json');

    const submissions = fs.existsSync(submissionsPath) ? JSON.parse(fs.readFileSync(submissionsPath, 'utf-8') || '[]') : [];
    const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf-8') || '[]') : [];
    const roster = fs.existsSync(rosterPath) ? JSON.parse(fs.readFileSync(rosterPath, 'utf-8') || '[]') : [];
    const calcLeads = fs.existsSync(calcLeadsPath) ? JSON.parse(fs.readFileSync(calcLeadsPath, 'utf-8') || '[]') : [];

    // Filter Brand Leads & Inquiries
    const brandInquiries = submissions.filter((s: any) => 
      s.role === 'brand' || 
      s.source?.toLowerCase().includes('brand') || 
      s.source?.toLowerCase().includes('contact') ||
      s.data?.['I am a']?.toLowerCase().includes('brand') ||
      s.data?.['Organization / Channel']
    );

    // Filter Creator Applications
    const creatorApplications = submissions.filter((s: any) => 
      s.role === 'creator' || 
      s.role === 'team' || 
      s.source?.toLowerCase().includes('homepage') || 
      s.data?.['I am a']?.toLowerCase().includes('creator') ||
      s.data?.['I am a']?.toLowerCase().includes('talent')
    );

    // Calculate aggregated stats
    const totalRosterCreators = roster.length;
    const totalBrands = brandInquiries.length + users.filter((u: any) => u.role === 'brand').length;
    const totalApplications = submissions.length;
    const totalCalculations = calcLeads.length;
    const totalAudienceReach = roster.reduce((acc: number, c: any) => acc + (Number(c.youtubeNum) || 0) + (Number(c.instaNum) || 0), 0);

    // Total Estimated Brand Pipeline Value
    const brandPipelineVal = roster.reduce((acc: number, c: any) => acc + (Number(c.avgViewsLast10) || 25000) * 1.5, 0);

    return NextResponse.json({
      success: true,
      stats: {
        total_creators: totalRosterCreators,
        total_brands: totalBrands,
        total_applications: totalApplications,
        total_calculator_leads: totalCalculations,
        total_users: users.length,
        total_audience_reach: totalAudienceReach,
        estimated_pipeline_value: Math.round(brandPipelineVal),
        active_roster_count: roster.filter((c: any) => c.show_on_roster !== false).length,
      },
      onboarded_creators: roster,
      brand_inquiries: brandInquiries,
      creator_applications: creatorApplications,
      calculator_leads: calcLeads,
      registered_users: users,
      recent_activity: submissions.slice(0, 10).map((s: any) => ({
        id: s.id,
        table_name: s.source || 'Application',
        action: `${s.role === 'brand' ? '🏢 Brand Inquiry' : '🎬 Creator Application'} from ${s.applicantName || s.data?.['Full Name'] || s.data?.['Name'] || 'Lead'}`,
        email: s.applicantEmail || s.data?.['Work Email'] || s.data?.['Email'] || '',
        created_at: s.timestamp || s.istTime || new Date().toISOString(),
      }))
    });
  } catch (err: any) {
    console.error('[ADMIN STATS API ERROR]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
