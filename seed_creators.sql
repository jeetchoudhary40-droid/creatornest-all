-- SQL Script to seed 10 dummy creators for UI visualization

-- We use DO block to generate UUIDs and insert into users, creators, and creator_platforms
DO $$
DECLARE
    user_id_1 UUID := gen_random_uuid();
    user_id_2 UUID := gen_random_uuid();
    user_id_3 UUID := gen_random_uuid();
    user_id_4 UUID := gen_random_uuid();
    user_id_5 UUID := gen_random_uuid();
    user_id_6 UUID := gen_random_uuid();
    user_id_7 UUID := gen_random_uuid();
    user_id_8 UUID := gen_random_uuid();
    user_id_9 UUID := gen_random_uuid();
    user_id_10 UUID := gen_random_uuid();
    
    creator_id_1 UUID := gen_random_uuid();
    creator_id_2 UUID := gen_random_uuid();
    creator_id_3 UUID := gen_random_uuid();
    creator_id_4 UUID := gen_random_uuid();
    creator_id_5 UUID := gen_random_uuid();
    creator_id_6 UUID := gen_random_uuid();
    creator_id_7 UUID := gen_random_uuid();
    creator_id_8 UUID := gen_random_uuid();
    creator_id_9 UUID := gen_random_uuid();
    creator_id_10 UUID := gen_random_uuid();
BEGIN

    -- 1. Insert into Users table
    INSERT INTO public.users (id, email, password_hash, full_name, role, is_active)
    VALUES 
    (user_id_1, 'tech.guru@example.com', 'dummyhash', 'Tech Guru', 'creator', true),
    (user_id_2, 'fashion.icon@example.com', 'dummyhash', 'Fashion Icon', 'creator', true),
    (user_id_3, 'gamer.pro@example.com', 'dummyhash', 'Gamer Pro', 'creator', true),
    (user_id_4, 'fitness.coach@example.com', 'dummyhash', 'Fitness Coach', 'creator', true),
    (user_id_5, 'foodie.explorer@example.com', 'dummyhash', 'Foodie Explorer', 'creator', true),
    (user_id_6, 'travel.vlogger@example.com', 'dummyhash', 'Travel Vlogger', 'creator', true),
    (user_id_7, 'finance.wiz@example.com', 'dummyhash', 'Finance Wiz', 'creator', true),
    (user_id_8, 'art.creator@example.com', 'dummyhash', 'Art Creator', 'creator', true),
    (user_id_9, 'music.producer@example.com', 'dummyhash', 'Music Producer', 'creator', true),
    (user_id_10, 'comedy.skits@example.com', 'dummyhash', 'Comedy Skits', 'creator', true);

    -- 2. Insert into Creators table
    INSERT INTO public.creators (
        id, user_id, full_name, creator_type, primary_platform, status, virtual_id, 
        primary_category, pricing_tier, authenticity_score, brand_safety_score, 
        talent_index_score, deliverable_pricing
    )
    VALUES
    (creator_id_1, user_id_1, 'Tech Guru', 'youtuber', 'youtube', 'active', 'CN-2605-0001', 'Technology', 'macro', 92.5, 98.0, 95.0, '{"youtube_integration": 120000, "dedicated_video": 300000}'),
    (creator_id_2, user_id_2, 'Fashion Icon', 'instagrammer', 'instagram', 'active', 'CN-2605-0002', 'Fashion', 'mega', 88.0, 95.0, 89.0, '{"instagram_reel": 150000, "story_post": 40000}'),
    (creator_id_3, user_id_3, 'Gamer Pro', 'gamer', 'youtube', 'active', 'CN-2605-0003', 'Gaming', 'celebrity', 95.0, 80.0, 97.0, '{"live_stream": 500000, "shoutout": 100000}'),
    (creator_id_4, user_id_4, 'Fitness Coach', 'trainer', 'instagram', 'active', 'CN-2605-0004', 'Fitness', 'micro', 96.0, 99.0, 85.0, '{"instagram_reel": 20000, "story_post": 5000}'),
    (creator_id_5, user_id_5, 'Foodie Explorer', 'youtuber', 'youtube', 'active', 'CN-2605-0005', 'Food', 'macro', 82.0, 100.0, 90.0, '{"restaurant_visit": 80000, "youtube_integration": 90000}'),
    (creator_id_6, user_id_6, 'Travel Vlogger', 'youtuber', 'youtube', 'active', 'CN-2605-0006', 'Travel', 'micro', 90.0, 95.0, 82.0, '{"dedicated_vlog": 60000}'),
    (creator_id_7, user_id_7, 'Finance Wiz', 'expert', 'twitter', 'active', 'CN-2605-0007', 'Finance', 'macro', 98.0, 99.0, 94.0, '{"twitter_thread": 45000}'),
    (creator_id_8, user_id_8, 'Art Creator', 'artist', 'instagram', 'active', 'CN-2605-0008', 'Art', 'nano', 99.0, 100.0, 75.0, '{"custom_artwork": 15000, "instagram_reel": 5000}'),
    (creator_id_9, user_id_9, 'Music Producer', 'artist', 'youtube', 'active', 'CN-2605-0009', 'Music', 'micro', 85.0, 90.0, 80.0, '{"bgm_sponsorship": 25000}'),
    (creator_id_10, user_id_10, 'Comedy Skits', 'youtuber', 'facebook', 'active', 'CN-2605-0010', 'Comedy', 'mega', 75.0, 60.0, 91.0, '{"facebook_video": 200000, "instagram_reel": 150000}');

    -- 3. Insert into Creator Platforms table
    INSERT INTO public.creator_platforms (creator_id, platform, handle, followers, average_view_duration, platform_authenticity_score, platform_niche)
    VALUES
    (creator_id_1, 'youtube', '@techguru', 1500000, 320, 93.0, 'Consumer Tech'),
    (creator_id_2, 'instagram', '@fashionicon', 3200000, 15, 87.0, 'Luxury Fashion'),
    (creator_id_3, 'youtube', '@gamerpro', 5000000, 600, 96.0, 'PC Gaming'),
    (creator_id_4, 'instagram', '@fitcoach', 85000, 20, 97.0, 'Home Workouts'),
    (creator_id_5, 'youtube', '@foodieexp', 1200000, 410, 80.0, 'Street Food'),
    (creator_id_6, 'youtube', '@travelvlog', 250000, 520, 91.0, 'Budget Travel'),
    (creator_id_7, 'twitter', '@financewiz', 450000, 0, 99.0, 'Stock Market'),
    (creator_id_8, 'instagram', '@artcreator', 15000, 30, 99.5, 'Digital Art'),
    (creator_id_9, 'youtube', '@musicprod', 95000, 180, 84.0, 'Beat Making'),
    (creator_id_10, 'facebook', '@comedyskits', 4000000, 90, 72.0, 'Sketch Comedy');

END $$;
