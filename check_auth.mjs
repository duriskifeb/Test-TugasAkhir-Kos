import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Login sebagai staf
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'karyawanpintuberkah@gmail.com',
    password: 'password' // asumsi password jika bisa (jika tidak, kita akan bypass manual logic server)
  });
  
  console.log("Login:", loginError ? loginError.message : "Success");
}
run();
