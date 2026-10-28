import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  const staff = users?.users.find(u => u.email === 'karyawanpintuberkah@gmail.com');
  console.log("Auth User:", staff);
  
  const { data: staffData } = await supabase
      .from("tenant_staffs")
      .select("*")
      .eq("email", "karyawanpintuberkah@gmail.com");
      
  console.log("\nTenant Staff Entry:", staffData);
}
run();
