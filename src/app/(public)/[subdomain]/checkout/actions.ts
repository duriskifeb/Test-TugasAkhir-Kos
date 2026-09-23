"use server";

import { createClient } from "@/lib/supabase/server";

export async function processBookingAndRegistration(formData: FormData) {
  const supabase = await createClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const startDate = formData.get("start_date") as string;
  
  // Ambil ID dari database, BUKAN dari hardcode form (Bypass RLS error FK violation)
  const { data: firstTenant } = await supabase.from('tenants').select('id').limit(1).single();
  const { data: firstRoom } = await supabase.from('rooms').select('id').limit(1).single();

  if (!firstTenant || !firstRoom) {
     return { error: "Data kos atau kamar tidak ditemukan di database. Pastikan kos dan kamar sudah dibuat terlebih dahulu oleh Pemilik." };
  }

  try {
    // 1. Cek apakah user sudah login atau belum punya akun
    const { data: { user } } = await supabase.auth.getUser();
    let finalUserId = user?.id;

    if (!finalUserId) {
      // REGISTRASI OTOMATIS (UC_RegSass)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: "renter"
          }
        }
      });

      if (authError) return { error: authError.message };
      if (!authData.user) return { error: "Gagal membuat akun" };
      
      finalUserId = authData.user.id;
      
      // PAKSA OVERWRITE ROLE DI TABEL PROFILES MENJADI RENTER
      // Ini mengatasi bug trigger handle_new_user yang telat membaca meta-data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'renter' })
        .eq('id', finalUserId);
        
      if (profileError) {
        console.error("Gagal menimpa role menjadi renter:", profileError);
      }
    }

    // 2. BUAT REKAMAN BOOKING (Sesuai Skema Database Asli)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        boarding_house_id: firstTenant.id,
        room_id: firstRoom.id,
        renter_name: fullName,
        renter_phone: phone,
        renter_email: email,
        planned_check_in: startDate,
        status: 'pending'
      })
      .select()
      .single();

    if (bookingError) return { error: bookingError.message };

    return { success: true, bookingId: booking.id };
  } catch (err: any) {
    return { error: err.message };
  }
}