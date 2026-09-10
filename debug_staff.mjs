import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== CHECKING PROFILES ===");
  const { data: profiles } = await supabase.from('profiles').select('*').eq('email', 'karyawanpintuberkah@gmail.com');
  console.log("Profile:", profiles);

  console.log("\n=== CHECKING TENANT STAFFS ===");
  const { data: staffs } = await supabase.from('tenant_staffs').select('*').eq('email', 'karyawanpintuberkah@gmail.com');
  console.log("Staff Registration:", staffs);
  
  if (profiles && profiles.length > 0) {
      console.log("\nRole of user:", profiles[0].role);
  } else {
      console.log("\nUSER NOT FOUND IN PROFILES TABLE. Berarti saat signup trigger profile mungkin gagal atau email beda.");
  }
}
run();
