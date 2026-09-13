import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/home/duriskifeb/Test-TugasAkhir-Kos/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testPayment() {
  console.log("Mencoba insert manual ke payments berdasarkan Renter 'kamar Aasw' yang baru saja berhasil masuk...");
  
  const newPayment = {
    tenant_id: '9535f2e6-f029-43c4-9ad0-8f4287eca1e0',
    renter_id: 'aabdfe2f-6957-4ffb-9b28-29cfbf5c7ec9', // ID dari 'kamar Aasw'
    amount: 1200000,
    due_date: '2026-10-07',
    status: 'unpaid'
  };

  const { data, error } = await supabase.from('payments').insert(newPayment).select();

  if (error) {
    console.error("ERROR INSERT PAYMENTS:", error);
  } else {
    console.log("INSERT PAYMENTS BERHASIL:", data);
  }
}
testPayment();
