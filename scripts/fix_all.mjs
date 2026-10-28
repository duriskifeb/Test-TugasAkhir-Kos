import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Forcing update all tenant_staffs to active...");
  await supabase.from('tenant_staffs').update({ status: 'active' }).neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log("Forcing update all lowercase emails...");
  const { data: staffs } = await supabase.from('tenant_staffs').select('*');
  if(staffs) {
    for(const s of staffs) {
      if(s.email) {
        await supabase.from('tenant_staffs').update({ email: s.email.toLowerCase() }).eq('id', s.id);
      }
    }
  }
}
run();
