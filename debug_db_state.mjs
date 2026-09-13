import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/home/duriskifeb/Test-TugasAkhir-Kos/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkState() {
  console.log("=== 1. LAST 3 BOOKINGS ===");
  const { data: b } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(3);
  console.log(b);

  console.log("\n=== 2. LAST 3 RENTERS ===");
  const { data: r } = await supabase.from('renters').select('*').order('created_at', { ascending: false }).limit(3);
  console.log(r);

  console.log("\n=== 3. LAST 3 PAYMENTS ===");
  const { data: p } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(3);
  console.log(p);
}
checkState();
