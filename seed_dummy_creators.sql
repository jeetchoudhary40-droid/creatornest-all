-- ====================================================================================
-- SEED SCRIPT: Insert 10 highly detailed Creator Profiles & CRM records
-- Run this in the Supabase SQL Editor
-- ====================================================================================

-- 1. Insert Profile records (or update if already existing)
INSERT INTO public.profiles (id, email, full_name, avatar_url, user_type, plan_tier)
VALUES
  -- 1. Rohan Sharma (Gaming)
  ('d1000000-0000-4000-a000-000000000001', 'rohan@creatornest.in', 'Rohan Sharma', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 'creator', 'free'),
  -- 2. Neha Kapoor (Fashion)
  ('d1000000-0000-4000-a000-000000000002', 'neha@creatornest.in', 'Neha Kapoor', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'creator', 'free'),
  -- 3. Kabir Mehta (Finance)
  ('d1000000-0000-4000-a000-000000000003', 'kabir@creatornest.in', 'Kabir Mehta', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'creator', 'free'),
  -- 4. Ananya Sen (Travel)
  ('d1000000-0000-4000-a000-000000000004', 'ananya@creatornest.in', 'Ananya Sen', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'creator', 'free'),
  -- 5. Amit Patel (Tech)
  ('d1000000-0000-4000-a000-000000000005', 'amit@creatornest.in', 'Amit Patel', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'creator', 'free'),
  -- 6. Priya Nair (Beauty)
  ('d1000000-0000-4000-a000-000000000006', 'priya@creatornest.in', 'Priya Nair', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'creator', 'free'),
  -- 7. Vikram Singh (Fitness)
  ('d1000000-0000-4000-a000-000000000007', 'vikram@creatornest.in', 'Vikram Singh', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'creator', 'free'),
  -- 8. Divya Reddy (Food)
  ('d1000000-0000-4000-a000-000000000008', 'divya@creatornest.in', 'Divya Reddy', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'creator', 'free'),
  -- 9. Samir Verma (Comedy)
  ('d1000000-0000-4000-a000-000000000009', 'samir@creatornest.in', 'Samir Verma', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'creator', 'free'),
  -- 10. Aarav Bhatia (Music)
  ('d1000000-0000-4000-a000-000000000010', 'aarav@creatornest.in', 'Aarav Bhatia', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'creator', 'free'),
  -- 11. Kavya Nair (Tech & AI)
  ('d1000000-0000-4000-a000-000000000011', 'kavya@creatornest.in', 'Kavya Nair', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'creator', 'pro'),
  -- 12. Devansh Malhotra (Fitness & Biohacking)
  ('d1000000-0000-4000-a000-000000000012', 'devansh@creatornest.in', 'Devansh Malhotra', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'creator', 'pro'),
  -- 13. Election Guide (Govt Services & Civics Tutorial)
  ('d1000000-0000-4000-a000-000000000013', 'contact@electionguide.in', 'Election Guide', 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=150', 'creator', 'pro')
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  user_type = EXCLUDED.user_type;

-- 2. Insert Creator Roster & CRM records
INSERT INTO public.creator_roster (
  id, profile_id, niche, youtube_subs, youtube_num, insta_subs, insta_num, avd, location, bio,
  is_featured, top_growing, show_on_roster, show_on_home, home_sequence,
  contact_phone, whatsapp_number, business_email,
  youtube_url, youtube_handle, insta_url, insta_handle, linkedin_url, linkedin_handle, twitter_url, twitter_handle, tiktok_url, tiktok_handle,
  avg_views, engagement_rate, primary_language, target_country,
  audience_gender_male, audience_gender_female, audience_age_18_24, audience_age_25_34,
  rate_post, rate_video, manager_notes, brand_categories
) VALUES
  -- 1. Rohan Sharma (Gaming)
  (
    'e3000000-0000-4000-b000-000000000001', 'd1000000-0000-4000-a000-000000000001', 'Gaming', '1.5M', 1500000, '450K', 450000, '4m 12s', 'Bangalore, India', 
    'Full-time gaming content creator specialising in PC build advice and competitive tournament streams.',
    true, true, true, true, 1,
    '+91 9876543210', '+91 9876543210', 'business@rohangaming.in',
    'https://youtube.com/@rohangaming', '@rohangaming', 'https://instagram.com/rohangaming', 'rohangaming_official', 'https://linkedin.com/in/rohangaming', 'Rohan Sharma', 'https://x.com/rohangaming', '@rohangaming', 'https://tiktok.com/@rohangaming', '@rohangaming',
    85000, 5.4, 'Hindi, English', 'India',
    75.0, 25.0, 45.0, 40.0,
    40000, 120000, 'Highly active during weekends. Prompt communicator.', '["Gaming Accessories", "Energy Drink", "PC Components"]'::jsonb
  ),
  -- 2. Neha Kapoor (Fashion)
  (
    'e3000000-0000-4000-b000-000000000002', 'd1000000-0000-4000-a000-000000000002', 'Fashion & Lifestyle', '120K', 120000, '850K', 850000, '82%', 'Delhi, India', 
    'Styling hacks, lookbooks, and sustainable fashion choices for Gen Z and Millennials.',
    true, false, true, true, 2,
    '+91 9811223344', '+91 9811223344', 'collab@nehastyles.com',
    'https://youtube.com/@nehastyles', '@nehastyles', 'https://instagram.com/nehastyles', 'nehastyles_official', 'https://linkedin.com/in/nehastyles', 'Neha Kapoor', 'https://x.com/nehastyles', '@nehastyles', '', '',
    140000, 6.8, 'English', 'India',
    15.0, 85.0, 55.0, 30.0,
    60000, 90000, 'Prefers visual briefs. Expects 50% advance payment.', '["Apparel", "Footwear", "Sustainable Brands"]'::jsonb
  ),
  -- 3. Kabir Mehta (Finance)
  (
    'e3000000-0000-4000-b000-000000000003', 'd1000000-0000-4000-a000-000000000003', 'Finance', '600K', 600000, '150K', 150000, '5m 45s', 'Mumbai, India', 
    'Simplifying investing, personal finance, tax savings, and passive income generation.',
    true, true, true, true, 3,
    '+91 9922334455', '+91 9922334455', 'contact@kabirfinance.in',
    'https://youtube.com/@kabirfinance', '@kabirfinance', 'https://instagram.com/kabirfinance', 'kabirfinance', 'https://linkedin.com/in/kabirmehta', 'Kabir Mehta', 'https://x.com/kabirmehta', '@kabirmehta', '', '',
    75000, 4.2, 'Hindi, English', 'India',
    65.0, 35.0, 30.0, 50.0,
    80000, 200000, 'Requires compliance check before final script. Hard timelines.', '["Mutual Funds", "Insurance", "Credit Cards"]'::jsonb
  ),
  -- 4. Ananya Sen (Travel)
  (
    'e3000000-0000-4000-b000-000000000004', 'd1000000-0000-4000-a000-000000000004', 'Travel & Vlog', '500K', 500000, '350K', 350000, '6m 10s', 'Kolkata, India', 
    'Exploring hidden gems across India and offbeat backpacking trails worldwide.',
    false, true, true, true, 4,
    '+91 9830098300', '+91 9830098300', 'booking@ananyawanders.com',
    'https://youtube.com/@ananyawanders', '@ananyawanders', 'https://instagram.com/ananyawanders', 'ananyawanders', 'https://linkedin.com/in/ananya-sen', 'Ananya Sen', '', '', '', '',
    110000, 5.9, 'English, Bengali', 'India',
    48.0, 52.0, 40.0, 45.0,
    35000, 100000, 'Often traveling with limited network. Allow 48 hours for replies.', '["Hotels", "Luggage", "Booking Apps"]'::jsonb
  ),
  -- 5. Amit Patel (Tech & Gadgets)
  (
    'e3000000-0000-4000-b000-000000000005', 'd1000000-0000-4000-a000-000000000005', 'Tech & Gadgets', '2.2M', 2200000, '300K', 300000, '3m 50s', 'Ahmedabad, India', 
    'Unbiased, quick, and practical reviews of smartphones, laptops, and smart devices.',
    true, false, true, true, 5,
    '+91 9722334455', '+91 9722334455', 'reviews@amitpatel.in',
    'https://youtube.com/@amitreviews', '@amitreviews', 'https://instagram.com/amitreviews', 'amitreviews', 'https://linkedin.com/in/amitreviews', 'Amit Patel', 'https://x.com/amitreviews', '@amitreviews', '', '',
    290000, 3.8, 'Hindi', 'India',
    82.0, 18.0, 50.0, 35.0,
    100000, 300000, 'Requires physical product review unit. Demands clear brief.', '["Smartphones", "Audio Brands", "Tech Accessories"]'::jsonb
  ),
  -- 6. Priya Nair (Beauty)
  (
    'e3000000-0000-4000-b000-000000000006', 'd1000000-0000-4000-a000-000000000006', 'Beauty & Cosmetics', '180K', 180000, '500K', 500000, '78%', 'Chennai, India', 
    'Skincare science, clean beauty routines, and South Indian bridal makeup guides.',
    false, false, true, true, 6,
    '+91 9444012345', '+91 9444012345', 'beauty@priyanair.com',
    'https://youtube.com/@priyabeauty', '@priyabeauty', 'https://instagram.com/priyabeauty', 'priyabeauty_makeup', 'https://linkedin.com/in/priyabeauty', 'Priya Nair', '', '', '', '',
    65000, 7.2, 'Tamil, English', 'India',
    8.0, 92.0, 60.0, 25.0,
    45000, 85000, 'Does not promote chemical peeling or uncertified cosmetics.', '["Skincare", "Cosmetics", "Haircare"]'::jsonb
  ),
  -- 7. Vikram Singh (Fitness)
  (
    'e3000000-0000-4000-b000-000000000007', 'd1000000-0000-4000-a000-000000000007', 'Fitness & Health', '250K', 250000, '620K', 620000, '74%', 'Pune, India', 
    'Calisthenics tutorials, diet planning, and home workouts without heavy equipment.',
    false, true, true, true, 7,
    '+91 9822012345', '+91 9822012345', 'fitness@vikramsingh.fit',
    'https://youtube.com/@vikramfit', '@vikramfit', 'https://instagram.com/vikramfit', 'vikramfit', '', '', 'https://x.com/vikramfit', '@vikramfit', '', '',
    95000, 4.9, 'Marathi, Hindi, English', 'India',
    70.0, 30.0, 45.0, 40.0,
    50000, 110000, 'Certified trainer. Will only promote lab-tested supplements.', '["Activewear", "Supplements", "Fitness Apps"]'::jsonb
  ),
  -- 8. Divya Reddy (Food & Cooking)
  (
    'e3000000-0000-4000-b000-000000000008', 'd1000000-0000-4000-a000-000000000008', 'Food & Cooking', '1.1M', 1100000, '300K', 300000, '5m 15s', 'Hyderabad, India', 
    'Traditional South Indian recipes made simple for modern, busy kitchens.',
    true, false, true, true, 8,
    '+91 9000012345', '+91 9000012345', 'kitchen@divyareddy.in',
    'https://youtube.com/@divyaskitchen', '@divyaskitchen', 'https://instagram.com/divyaskitchen', 'divyaskitchen', '', '', '', '', '', '',
    180000, 5.1, 'Telugu, English', 'India',
    35.0, 65.0, 25.0, 55.0,
    40000, 130000, 'Excellent response rates. Delivers content within 5 days.', '["Kitchen Appliances", "Spices", "Food Delivery Apps"]'::jsonb
  ),
  -- 9. Samir Verma (Comedy)
  (
    'e3000000-0000-4000-b000-000000000009', 'd1000000-0000-4000-a000-000000000009', 'Comedy', '3.4M', 3400000, '1.2M', 1200000, '2m 10s', 'Mumbai, India', 
    'Middle-class family skits and relatable corporate humor that will make you roll on the floor.',
    true, true, true, true, 9,
    '+91 9820012345', '+91 9820012345', 'colabs@samirverma.in',
    'https://youtube.com/@samirskits', '@samirskits', 'https://instagram.com/samirskits', 'samirskits', '', '', 'https://x.com/samirskits', '@samirskits', 'https://tiktok.com/@samirskits', '@samirskits',
    650000, 8.5, 'Hindi', 'India',
    52.0, 48.0, 55.0, 35.0,
    150000, 450000, 'Extremely popular for product placements. Content goes viral quickly.', '["FMCG", "E-commerce", "Entertainment Apps"]'::jsonb
  ),
  -- 10. Aarav Bhatia (Music)
  (
    'e3000000-0000-4000-b000-000000000010', 'd1000000-0000-4000-a000-000000000010', 'Entertainment', '400K', 400000, '200K', 200000, '3m 15s', 'Amritsar, India', 
    'Acoustic covers, indie pop originals, and behind-the-scenes music production vlogs.',
    false, false, true, true, 10,
    '+91 9814012345', '+91 9814012345', 'aarav@bhatiamusic.com',
    'https://youtube.com/@aaravmusic', '@aaravmusic', 'https://instagram.com/aaravmusic', 'aaravmusic', '', '', 'https://x.com/aaravmusic', '@aaravmusic', '', '',
    45000, 6.2, 'Punjabi, Hindi, English', 'India',
    50.0, 50.0, 65.0, 25.0,
    30000, 80000, 'Excellent audio recording equipment. Perfect for audio-visual ads.', '["Headphones", "Musical Instruments", "Audio Apps"]'::jsonb
  ),
  -- 11. Kavya Nair (Tech & AI)
  (
    'e3000000-0000-4000-b000-000000000011', 'd1000000-0000-4000-a000-000000000011', 'Tech & Gadgets', '1.8M', 1800000, '950K', 950000, '7m 20s', 'Bangalore, India', 
    'AI researcher & tech innovator creating deep dives on Generative AI, developer tools, and SaaS automation for 2.7M+ tech enthusiasts.',
    true, true, true, true, 11,
    '+91 9845012345', '+91 9845012345', 'business@kavyanair.tech',
    'https://youtube.com/@kavya_ai', '@kavya_ai', 'https://instagram.com/kavya.tech', 'kavya.tech', 'https://linkedin.com/in/kavyanair', 'Kavya Nair', 'https://x.com/kavyanair_ai', '@kavyanair_ai', '', '',
    210000, 7.8, 'English, Hindi', 'India',
    72.0, 28.0, 40.0, 48.0,
    70000, 220000, 'High technical authority. Excellent for SaaS product integrations and developer tools.', '["AI Tools", "SaaS", "Laptops", "EdTech"]'::jsonb
  ),
  -- 12. Devansh Malhotra (Fitness & Biohacking)
  (
    'e3000000-0000-4000-b000-000000000012', 'd1000000-0000-4000-a000-000000000012', 'Fitness & Health', '2.5M', 2500000, '600K', 600000, '6m 45s', 'Delhi, India', 
    'Biohacking enthusiast and sports nutritionist delivering science-backed workout routines and clean eating protocols.',
    true, true, true, true, 12,
    '+91 9811098765', '+91 9811098765', 'collab@devanshfitness.in',
    'https://youtube.com/@devanshfit', '@devanshfit', 'https://instagram.com/devansh_malhotra', 'devansh_malhotra', 'https://linkedin.com/in/devanshmalhotra', 'Devansh Malhotra', 'https://x.com/devansh_fit', '@devansh_fit', '', '',
    320000, 6.4, 'Hindi, English', 'India',
    68.0, 32.0, 52.0, 38.0,
    55000, 180000, 'Strong athletic engagement. Requires certified product lab reports before endorsing supplements.', '["Sports Nutrition", "Wearables", "Gym Equipment", "Wellness Apps"]'::jsonb
  ),
  -- 13. Election Guide (@ElectionGuide)
  (
    'e3000000-0000-4000-b000-000000000013', 'd1000000-0000-4000-a000-000000000013', 'Education', '110K', 110000, '5K', 5000, '5m 12s', 'Delhi, India', 
    'India''s #1 government process & election tutorial channel (@ElectionGuide). Provides step-by-step guides for Voter Helpline App, Voter ID registration (Form 6, Form 8), BLO/HLO apps, and official civic services for 110K+ subscribers.',
    true, true, true, true, 13,
    '+91 9810011223', '+91 9810011223', 'contact@electionguide.in',
    'https://youtube.com/@ElectionGuide', '@ElectionGuide', 'https://instagram.com/electionguide', 'electionguide', 'https://linkedin.com/in/electionguide', 'Election Guide', 'https://x.com/ElectionGuide', '@ElectionGuide', '', '',
    45000, 6.2, 'Hindi', 'India',
    75.0, 25.0, 35.0, 55.0,
    15000, 45000, 'India''s #1 Government Process Tutorial channel. Excellent for civic, EdTech, and utility app campaigns.', '["Education", "EdTech", "Government Apps", "Utility Software", "FinTech"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  niche = EXCLUDED.niche,
  youtube_subs = EXCLUDED.youtube_subs,
  youtube_num = EXCLUDED.youtube_num,
  insta_subs = EXCLUDED.insta_subs,
  insta_num = EXCLUDED.insta_num,
  avd = EXCLUDED.avd,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio,
  is_featured = EXCLUDED.is_featured,
  top_growing = EXCLUDED.top_growing,
  show_on_roster = EXCLUDED.show_on_roster,
  show_on_home = EXCLUDED.show_on_home,
  home_sequence = EXCLUDED.home_sequence,
  contact_phone = EXCLUDED.contact_phone,
  whatsapp_number = EXCLUDED.whatsapp_number,
  business_email = EXCLUDED.business_email,
  youtube_url = EXCLUDED.youtube_url,
  youtube_handle = EXCLUDED.youtube_handle,
  insta_url = EXCLUDED.insta_url,
  insta_handle = EXCLUDED.insta_handle,
  linkedin_url = EXCLUDED.linkedin_url,
  linkedin_handle = EXCLUDED.linkedin_handle,
  twitter_url = EXCLUDED.twitter_url,
  twitter_handle = EXCLUDED.twitter_handle,
  tiktok_url = EXCLUDED.tiktok_url,
  tiktok_handle = EXCLUDED.tiktok_handle,
  avg_views = EXCLUDED.avg_views,
  engagement_rate = EXCLUDED.engagement_rate,
  primary_language = EXCLUDED.primary_language,
  target_country = EXCLUDED.target_country,
  audience_gender_male = EXCLUDED.audience_gender_male,
  audience_gender_female = EXCLUDED.audience_gender_female,
  audience_age_18_24 = EXCLUDED.audience_age_18_24,
  audience_age_25_34 = EXCLUDED.audience_age_25_34,
  rate_post = EXCLUDED.rate_post,
  rate_video = EXCLUDED.rate_video,
  manager_notes = EXCLUDED.manager_notes,
  brand_categories = EXCLUDED.brand_categories;

SELECT '12 detailed creator profiles & CRM records seeded successfully!' as status;
