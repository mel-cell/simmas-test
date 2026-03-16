const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function alter() {
  const { data, error } = await supabase.rpc('create_generic_user_bypassing_auth', {
    p_email: 'dummyx@test.com', p_password: 'test', p_nama: 'test', p_role: 'admin', p_is_verified: true
  });
  console.log("Error? We can't really run DDL from RPC easily unless defined. Let's create an SQL file for the user instead.");
}
alter();
