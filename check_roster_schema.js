const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqesdjhpqdwjowdiinyi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_RkTppq4iOQw3O8vtie3XEQ_5Ak387LY'
);

async function check() {
  const { data, error } = await supabase.from('creator_roster').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else if (data && data.length > 0) {
    console.log("Existing creator_roster columns:", Object.keys(data[0]));
  } else {
    console.log("No rows in creator_roster, trying insert test...");
  }
}
check();
