"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Json } from "@/types/database.types";

type RoomStatus = "available" | "occupied" | "maintenance";

// Validasi form kamar yang dipakai bersama oleh createRoom dan updateRoom.
function parseRoomForm(formData: FormData) {
  const name = formData.get("name") as string;
  const priceStr = formData.get("price") as string;
  const status = formData.get("status") as string;
  const facilitiesString = formData.get("facilities") as string;

  if (!name || !priceStr) {
    return { error: "Nama kamar dan harga wajib diisi." };
  }

  const price = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
  if (isNaN(price)) {
    return { error: "Harga tidak valid." };
  }

  let facilities = [];
  try {
    facilities = facilitiesString ? JSON.parse(facilitiesString) : [];
  } catch (e) {
    facilities = [];
  }

  // Data tambahan kamar, semuanya opsional.
  const roomType = ((formData.get("room_type") as string) || "").trim().slice(0, 40) || null;
  const tenantTypeRaw = (formData.get("tenant_type") as string) || "";
  const tenantType = ["putra", "putri", "campur"].includes(tenantTypeRaw) ? tenantTypeRaw : null;
  const size = (key: string) => {
    const value = parseFloat((formData.get(key) as string) || "");
    return Number.isFinite(value) && value > 0 && value < 100 ? value : null;
  };

  return {
    name,
    price,
    status: (status || "available") as RoomStatus,
    facilities,
    roomType,
    tenantType,
    sizeLength: size("size_length"),
    sizeWidth: size("size_width"),
  };
}

export async function createRoom(formData: FormData) {
  const supabase = await createClient();
  const parsed = parseRoomForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { name, price, status, facilities, roomType, tenantType, sizeLength, sizeWidth } = parsed;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  let tenantId = null;

  if (profile?.role === "staff") {
    const { data: staffData } = await supabase
      .from("tenant_staffs")
      .select("tenant_id")
      .eq("email", user.email ?? "")
      .eq("status", "active")
      .maybeSingle();
    tenantId = staffData?.tenant_id;
  } else {
    // Multi-cabang support for owners using cookies
    const { data: allTenants } = await supabase
      .from("tenants")
      .select("id")
      .eq("owner_id", user.id);
      
    if (allTenants && allTenants.length > 0) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const savedTenantId = cookieStore.get('active_tenant_id')?.value;
      
      if (savedTenantId && allTenants.some(t => t.id === savedTenantId)) {
        tenantId = savedTenantId;
      } else {
        tenantId = allTenants[0].id;
      }
    }
  }

  if (!tenantId) {
    return { error: "Kos belum terdaftar." };
  }

  const { error } = await supabase.from("rooms").insert({
    boarding_house_id: tenantId,
    name,
    price,
    status,
    facilities: facilities as unknown as Json,
    room_type: roomType,
    tenant_type: tenantType,
    size_length: sizeLength,
    size_width: sizeWidth,
  });

  if (error) {
    console.error("Gagal menambah kamar:", error);
    return { error: "Terjadi kesalahan saat menyimpan data kamar." };
  }

  revalidatePath("/dashboard/rooms");
  return { success: true };
}

export async function deleteRoom(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  if (!id) throw new Error("ID kamar tidak valid.");

  // Soft delete: baris kamar tetap ada agar riwayat booking, penghuni, dan tagihan tidak hilang.
  const { error } = await supabase
    .from("rooms")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) {
    console.error("Gagal menghapus kamar:", error);
    throw new Error("Terjadi kesalahan saat menghapus kamar.");
  }

  revalidatePath("/dashboard/rooms");
  redirect("/dashboard/rooms");
}

export async function updateRoom(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  if (!id) return { error: "ID kamar tidak valid." };

  const parsed = parseRoomForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { name, price, status, facilities, roomType, tenantType, sizeLength, sizeWidth } = parsed;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Mengubah nama atau harga kamar tidak mengubah booking, penghuni, dan tagihan yang sudah dibuat:
  // nilai lama tersimpan sebagai snapshot di tabel transaksi masing-masing.
  const { data, error } = await supabase
    .from("rooms")
    .update({
      name,
      price,
      status,
      facilities: facilities as unknown as Json,
      room_type: roomType,
      tenant_type: tenantType,
      size_length: sizeLength,
      size_width: sizeWidth,
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error("Gagal mengubah kamar:", error);
    return { error: "Terjadi kesalahan saat menyimpan data kamar." };
  }
  if (!data || data.length === 0) {
    return { error: "Kamar tidak ditemukan atau Anda tidak memiliki akses." };
  }

  revalidatePath("/dashboard/rooms");
  return { success: true };
}
