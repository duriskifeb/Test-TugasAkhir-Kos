import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  console.log("Updating existing pending staff to active...");
  const { data, error } = await supabase
    .from('tenant_staffs')
    .update({ status: 'active' })
    .eq('status', 'pending');
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success updating staff status.");
  }
}

fix();
