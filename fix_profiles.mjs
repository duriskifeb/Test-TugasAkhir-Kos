import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Ambil user dari auth (Superadmin/Service Role bisa bypass)
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError || !users) {
      console.log("Could not fetch auth users. Ensure you are using SUPABASE_SERVICE_ROLE_KEY");
      return;
  }
  
  console.log("Found", users.users.length, "users in auth.");
  
  for (const u of users.users) {
      if (u.email) {
          await supabase.from('profiles').update({ email: u.email }).eq('id', u.id);
      }
  }
  console.log("Finished updating profiles with emails.");
}
run();
