import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '/home/duriskifeb/Test-TugasAkhir-Kos/.env.local' });

// Using ANON KEY since SERVICE_ROLE might be empty in .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkData() {
  console.log("=== CHECK BOOKINGS ===");
  const { data: bookings } = await supabase.from('bookings').select('id, renter_name, status, room_id, boarding_house_id').order('created_at', { ascending: false }).limit(3);
  console.log(bookings);

  console.log("\n=== CHECK RENTERS ===");
  const { data: renters } = await supabase.from('renters').select('id, full_name, room_id').order('created_at', { ascending: false }).limit(3);
  console.log(renters);

  console.log("\n=== CHECK PAYMENTS ===");
  const { data: payments } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(3);
  console.log(payments);
}

checkData();
