import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/home/duriskifeb/Test-TugasAkhir-Kos/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  console.log("Mencoba insert manual ke renters untuk melihat error aslinya...");
  
  const { data, error } = await supabase.from('renters').insert({
    tenant_id: '9535f2e6-f029-43c4-9ad0-8f4287eca1e0', // ID kos pintu berkah
    room_id: 'c461b4c0-5f46-4fc0-a111-93388b8367a4', // ID kamar dari booking 'asre'
    full_name: 'Testing Tembus',
    phone_number: '08123456789',
    check_in_date: '2026-09-14',
    status: 'active'
  }).select();

  if (error) {
    console.error("ERROR INSERT:", error);
  } else {
    console.log("INSERT BERHASIL:", data);
  }
}

testInsert();
