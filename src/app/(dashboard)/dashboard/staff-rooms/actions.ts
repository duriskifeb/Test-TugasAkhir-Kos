"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type RoomStatus = Database["public"]["Enums"]["room_status"];

const roomStatuses: RoomStatus[] = ["available", "occupied", "maintenance"];

export async function updateStaffRoomStatus(roomId: string, status: RoomStatus) {
  if (!roomId || !roomStatuses.includes(status)) {
    return { error: "Data perubahan status kamar tidak valid." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda berakhir. Silakan masuk kembali." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Gagal memeriksa akses staf:", profileError);
    return { error: "Tidak dapat memeriksa akses akun Anda." };
  }
  if (profile?.role !== "staff") {
    return { error: "Hanya staf terdaftar yang dapat mengubah status kamar." };
  }

  const { data: updatedRoom, error } = await supabase
    .from("rooms")
    .update({ status })
    .eq("id", roomId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Gagal mengubah status kamar staf:", error);
    return { error: "Status kamar gagal disimpan. Silakan coba lagi." };
  }
  if (!updatedRoom) {
    return { error: "Kamar tidak ditemukan atau Anda tidak memiliki akses." };
  }

  revalidatePath("/dashboard/staff-rooms");
  return { success: true };
}
