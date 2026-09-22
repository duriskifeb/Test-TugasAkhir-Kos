"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadPaymentReceipt(bookingId: string, formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("receipt_file") as File;

  if (!file) {
    return { error: "File bukti pembayaran tidak ditemukan." };
  }

  try {
    // 1. Dapatkan user ID yang sedang login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User tidak terautentikasi" };

    // 2. Upload gambar ke Storage bucket bernama 'payments'
    const fileExt = file.name.split('.').pop();
    const fileName = `${bookingId}-${Math.random()}.${fileExt}`;
    
    // (Bypass upload sementara jika bucket belum disetting - simulasi DB simpan nama file)
    // Di aplikasi nyata: await supabase.storage.from('payments').upload(fileName, file);
    
    // 3. Update tabel bookings (atau tabel payments jika Anda punya)
    // Karena di skema asli Anda belum ada tabel khusus payments, kita manfaatkan update status booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'approved', // Simulasi langsung ke approved atau butuh tabel baru
        additional_notes: `BUKTI_UPLOADED: ${fileName}` 
      })
      .eq('id', bookingId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
