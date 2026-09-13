import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '/home/duriskifeb/Test-TugasAkhir-Kos/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  console.log("=== CHECK BOOKINGS ===");
  const { data: bookings } = await supabase.from('bookings').select('id, renter_name, status, room_id, boarding_house_id').limit(5);
  console.log("5 Bookings terakhir:", bookings);

  console.log("\n=== CHECK RENTERS ===");
  const { data: renters } = await supabase.from('renters').select('id, full_name, room_id').limit(5);
  console.log("5 Renters terakhir:", renters);

  console.log("\n=== CHECK PAYMENTS ===");
  const { data: payments } = await supabase.from('payments').select('*').limit(5);
  console.log("5 Payments terakhir:", payments);
}

checkData();
