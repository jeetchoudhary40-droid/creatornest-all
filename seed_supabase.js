const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bqesdjhpqdwjowdiinyi.supabase.co';
const supabaseKey = 'sb_publishable_RkTppq4iOQw3O8vtie3XEQ_5Ak387LY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const categories = ['Technology', 'Fashion', 'Gaming', 'Fitness', 'Food', 'Travel', 'Finance', 'Art', 'Music', 'Comedy'];
  const tiers = ['macro', 'mega', 'celebrity', 'micro', 'macro', 'micro', 'macro', 'nano', 'micro', 'mega'];
  const platforms = ['youtube', 'instagram', 'youtube', 'instagram', 'youtube', 'youtube', 'twitter', 'instagram', 'youtube', 'facebook'];

  for (let i = 0; i < 10; i++) {
    const virtualId = `CN-S${Math.random().toString().substring(2, 8)}`;
    const newMetadata = {
      primary_category: categories[i],
      pricing_tier: tiers[i],
      authenticity_score: 90 + (i % 10),
      brand_safety_score: 85 + (i % 10),
      deliverable_pricing: { [platforms[i]]: 50000 + (i * 10000) },
      total_followers: 100000 * (i + 1),
      virtual_id: virtualId
    };

    const email = `creator_${Date.now()}_${i}@example.com`;
    const fullName = `${categories[i]} Creator ${i + 1}`;

    const { data, error } = await supabase.from('users').insert([{
      email: email,
      full_name: fullName,
      role: 'creator',
      onboarding_data: newMetadata
    }]);

    if (error) {
      console.error('Error inserting', i, error.message);
    } else {
      console.log('Inserted', fullName);
    }
  }
}

seed();
