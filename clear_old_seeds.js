const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bqesdjhpqdwjowdiinyi.supabase.co';
const supabaseKey = 'sb_publishable_RkTppq4iOQw3O8vtie3XEQ_5Ak387LY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  console.log("Signing in as admin...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@creatornest.in',
    password: 'admin1234'
  });

  if (authError) {
    console.error("Auth failed:", authError.message);
    console.log("Proceeding with direct deletion...");
  } else {
    console.log("Signed in successfully.");
  }

  console.log("Cleaning market_items...");
  const { error: itemsError } = await supabase
    .from('market_items')
    .delete()
    .neq('title', 'XYZ_NEVER_EXISTENT_TITLE');
    
  if (itemsError) {
    console.error("Error deleting from market_items:", itemsError.message);
  } else {
    console.log("Successfully cleared market_items.");
  }

  console.log("Cleaning creator_roster...");
  const { error: rosterError } = await supabase
    .from('creator_roster')
    .delete()
    .neq('location', 'XYZ_NEVER_EXISTENT_LOCATION');

  if (rosterError) {
    console.error("Error deleting from creator_roster:", rosterError.message);
  } else {
    console.log("Successfully cleared creator_roster.");
  }
}

clean();
