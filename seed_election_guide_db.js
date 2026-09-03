// ============================================================
// SEED SCRIPT: Election Guide (@ElectionGuide) YouTube Master Creator Profile
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqesdjhpqdwjowdiinyi.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_RkTppq4iOQw3O8vtie3XEQ_5Ak387LY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedElectionGuide() {
  console.log("Seeding Election Guide (@ElectionGuide) YouTube Master Creator Profile into Supabase...");

  const profileId = 'd1000000-0000-4000-a000-000000000013';
  const rosterId = 'e3000000-0000-4000-b000-000000000013';

  // 1. Insert Profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: profileId,
    email: 'contact@electionguide.in',
    full_name: 'Election Guide',
    avatar_url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=150',
    user_type: 'creator',
    plan_tier: 'pro'
  }, { onConflict: 'id' });

  if (profileError) {
    console.warn("Profiles upsert note:", profileError.message);
  } else {
    console.log("✓ Profile record inserted for Election Guide");
  }

  // 2. Insert Creator Roster Record
  const electionGuideRoster = {
    id: rosterId,
    profile_id: profileId,
    display_name: '@ElectionGuide',
    tagline: 'भारत का #1 सरकारी प्रक्रिया Tutorial चैनल (India\'s #1 Government Process Tutorial Channel)',
    niche: 'Education',
    primary_category: 'Education',
    primary_niche: 'Government Process Guides',
    secondary_niche: 'Voter & Civic Tutorials',
    youtube_subs: '110K',
    youtube_num: 110000,
    youtube_subscribers: 110000,
    youtube_video_count: 217,
    youtube_total_views: 12500000,
    youtube_partner: true,
    insta_subs: '5K',
    insta_num: 5000,
    instagram_followers: 5000,
    total_reach: 115000,
    avd: '68%',
    location: 'Delhi, India',
    target_country: 'India',
    bio: 'India\'s #1 government process & election tutorial channel (@ElectionGuide). Provides step-by-step guides for Voter Helpline App, Voter ID registration (Form 6, Form 8), BLO/HLO apps, and official civic services for 110K+ subscribers.',
    is_featured: true,
    top_growing: true,
    show_on_roster: true,
    show_on_home: true,
    home_sequence: 21,
    contact_phone: '+91 9810011223',
    whatsapp_number: '+91 9810011223',
    business_email: 'contact@electionguide.in',
    youtube_url: 'https://www.youtube.com/@ElectionGuide',
    youtube_handle: '@ElectionGuide',
    insta_url: 'https://instagram.com/electionguide',
    insta_handle: 'electionguide',
    linkedin_url: 'https://linkedin.com/in/electionguide',
    linkedin_handle: 'Election Guide',
    twitter_url: 'https://x.com/ElectionGuide',
    twitter_handle: '@ElectionGuide',
    avg_views: 45000,
    yt_avg_views_per_video: 45000,
    yt_avg_watch_time_pct: 68.0,
    engagement_rate: 6.2,
    yt_engagement_rate: 6.2,
    primary_language: 'Hindi',
    content_language: 'Hindi',
    target_country: 'India',
    audience_gender_male: 75.0,
    audience_gender_female: 25.0,
    audience_age_18_24: 35.0,
    audience_age_25_34: 55.0,
    audience_india_pct: 98.0,
    rate_post: 15000,
    rate_video: 45000,
    rate_dedicated_video: 45000,
    rate_ig_reel: 15000,
    rate_youtube_short: 12000,
    manager_notes: 'India\'s #1 Government Process Tutorial channel. High credibility for civic, utility, and educational apps.',
    brand_categories: ['Education', 'EdTech', 'Government Apps', 'Utility Software', 'FinTech'],
    creator_score: 84.5,
    creator_tier: 'mid',
    is_verified_creator: true,
    profile_completeness_pct: 100,
    data_source: 'Manual',
    data_last_updated: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('creator_roster')
    .upsert(electionGuideRoster, { onConflict: 'id' })
    .select();

  if (error) {
    console.error("Roster upsert error:", error.message);
  } else {
    console.log("✓ Successfully seeded Election Guide (@ElectionGuide) into creator_roster DB table!");
  }
}

seedElectionGuide();
