const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
let supabaseUrl = '';
let supabaseKey = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  console.log('Registering admin@creatornest.com...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@creatornest.com',
    password: 'password123',
    options: {
      data: {
        role: 'admin',
        full_name: 'System Admin'
      }
    }
  });

  if (error) {
    console.error('Error signing up:', error.message);
  } else {
    console.log('Sign up successful:', data.user?.id);
    
    // Now try to ensure the role in public.users is admin (might fail due to RLS)
    if (data.user) {
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', data.user.id);
        
      if (updateError) {
        console.error('Error updating user role (RLS might be blocking):', updateError.message);
      } else {
        console.log('User role updated to admin.');
      }
    }
  }
}

setupAdmin();
