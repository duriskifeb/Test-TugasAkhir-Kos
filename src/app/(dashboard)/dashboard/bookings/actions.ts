"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getBookings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", data: null };

  const { data: profile } = await supabase.from("profiles").select("role, email").eq("id", user.id).single();
  let tenantId = null;

  if (profile?.role === "staff") {
    const { data: staffData } = await supabase
      .from("tenant_staffs")
      .select("tenant_id")
      .eq("email", user.email || "")
      .maybeSingle();
      
    tenantId = staffData?.tenant_id;
  } else {
    // Owner logic with multi-branch support via cookies
    const cookieStore = await cookies();
    const activeTenantId = cookieStore.get("active_tenant_id")?.value;

    const { data: allTenants } = await supabase
      .from("tenants")
      .select("id")
      .eq("owner_id", user.id);

    if (allTenants && allTenants.length > 0) {
      if (activeTenantId && allTenants.some(t => t.id === activeTenantId)) {
        tenantId = activeTenantId;
      } else {
        tenantId = allTenants[0].id;
      }
    }
  }

  if (!tenantId) return { error: "Tenant not found", data: null };

  // Fetch bookings WITH room details
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      rooms ( name, price )
    `)
    .eq("boarding_house_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch bookings error details:", JSON.stringify(error, null, 2));
    return { error: error.message || "Failed to fetch bookings", data: null };
  }

  return { error: null, data, tenantId };
}

export async function updateBookingStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as "pending" | "approved" | "rejected";

  if (!id || !status) return { error: "Invalid data" };

  const supabase = await createClient();
  
  // 1. Ambil detail booking yang sedang di-update
  const { data: bookingData, error: fetchError } = await supabase
    .from("bookings")
    .select(`*, rooms(price)`)
    .eq("id", id)
    .single();

  if (fetchError || !bookingData) return { error: "Booking tidak ditemukan" };

  // 2. Ubah status di tabel bookings
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);

  if (updateError) return { error: updateError.message };

  // 3. JIKA APPROVED: Jalankan Otomatisasi 3 Langkah
  if (status === "approved") {
    
    // a. Buat data Penghuni Aktif (Renters)
    const { data: newRenter, error: renterError } = await supabase
      .from("renters")
      .insert({
        boarding_house_id: bookingData.boarding_house_id,
        room_id: bookingData.room_id,
        name: bookingData.renter_name,
        phone: bookingData.renter_phone,
        start_date: bookingData.planned_check_in, // gunakan rencana check-in sebagai tanggal mulai
        status: "active"
      })
      .select()
      .single();

    if (renterError) {
       console.error("Gagal membuat penghuni otomatis:", renterError);
       // Walau gagal insert penghuni, status booking tetap approved. Idealnya ada trigger, tapi kita biarkan lanjut.
    } else {
        // b. Ubah status kamar menjadi Terisi (Occupied)
        await supabase
          .from("rooms")
          .update({ status: "occupied" })
          .eq("id", bookingData.room_id);

        // c. Otomatis buat 1 tagihan sewa bulanan pertama
        // Hitung tanggal jatuh tempo (contoh: 7 hari setelah rencana check-in)
        const checkInDate = new Date(bookingData.planned_check_in);
        const dueDate = new Date(checkInDate);
        dueDate.setDate(dueDate.getDate() + 7);
        
        // Asumsi harga per bulan didapat dari relasi `rooms` yang kita SELECT di awal (rooms.price)
        // PGlite/Supabase returns relation as array or object depending on schema. 
        const roomPrice = Array.isArray(bookingData.rooms) 
            ? bookingData.rooms[0]?.price 
            : bookingData.rooms?.price;

        if (newRenter && roomPrice) {
            await supabase
              .from("payments")
              .insert({
                boarding_house_id: bookingData.boarding_house_id,
                room_id: bookingData.room_id,
                renter_id: newRenter.id,
                amount: roomPrice,
                due_date: dueDate.toISOString().split('T')[0],
                status: "pending" // Belum lunas
              });
        }
    }
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard/tenants");
  revalidatePath("/dashboard/payments");
  
  return { success: true };
}
