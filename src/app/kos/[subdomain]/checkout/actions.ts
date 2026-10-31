"use server";

import { createClient } from "@/lib/supabase/server";

export async function processBookingAndRegistration(formData: FormData) {
  const supabase = await createClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const startDate = formData.get("start_date") as string;
  
  // Kos dan kamar ditentukan dari pilihan penyewa (subdomain + id kamar), lalu diverifikasi di database.
  // Harga dan nama tidak diambil dari form: snapshot disalin oleh database saat booking dibuat.
  const subdomain = formData.get("subdomain") as string;
  const roomId = formData.get("room_id") as string;

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('subdomain', subdomain)
    .eq('status', 'VERIFIED')
    .maybeSingle();
  if (!tenant) return { error: "Kos tidak ditemukan." };

  const { data: room } = await supabase
    .from('rooms')
    .select('id')
    .eq('id', roomId)
    .eq('boarding_house_id', tenant.id)
    .eq('status', 'available')
    .is('deleted_at', null)
    .maybeSingle();
  if (!room) return { error: "Kamar yang dipilih sudah tidak tersedia." };

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
      
      // Update role di tabel profiles menjadi renter
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'renter' })
        .eq('id', finalUserId);
        
      if (profileError) {
        console.error("Gagal menimpa role menjadi renter:", profileError);
      }
    }

    // 2. Buat rekaman booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        boarding_house_id: tenant.id,
        room_id: room.id,
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
