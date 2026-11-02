"use server";

import { createClient } from "@/lib/supabase/server";
import type { KosPayload } from "@/lib/kos-options";
import type { Json } from "@/types/database.types";

/**
 * Mendaftarkan kos pertama pemilik: kos, kamar, dan bagian halaman publik dibuat oleh satu fungsi
 * database (setup_boarding_house) dalam satu transaksi. Validasi utama ada di fungsi itu.
 */
export async function setupBoardingHouse(payload: KosPayload): Promise<{ error?: string; success?: true }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi Anda berakhir. Silakan masuk lagi." };

  const { error: documentSchemaError } = await supabase
    .from("tenants")
    .select("sku_document_path")
    .limit(0);

  if (documentSchemaError) {
    console.error("Kolom bukti SKU belum tersedia:", documentSchemaError);
    return { error: "Fitur bukti SKU belum siap. Jalankan migrasi database terbaru sebelum mendaftarkan kos." };
  }

  const { error } = await supabase.rpc("setup_boarding_house", { p_data: payload as unknown as Json });

  if (error) {
    console.error("Gagal mendaftarkan kos:", error);
    // Pesan dari fungsi database sudah berbahasa Indonesia dan aman ditampilkan.
    // Kode 22023 (data tidak valid), 23505 (link sudah dipakai), dan 28000 (belum masuk) berasal dari fungsi itu.
    if (["22023", "23505", "28000"].includes(error.code)) return { error: error.message };
    if (error.code === "PGRST202") {
      return { error: "Pendaftaran kos belum siap: migrasi database terbaru (setup_boarding_house) belum dijalankan." };
    }
    return { error: "Gagal menyimpan data kos. Silakan coba lagi." };
  }

  // Sengaja tanpa revalidatePath: itu membuat Next langsung memuat ulang halaman, lalu layout mengganti isinya dengan
  // layar "menunggu konfirmasi admin" dan popup "berhasil disimpan" ikut hilang. Wizard memuat ulang sendiri
  // (router.refresh) setelah pemilik menutup popup.
  return { success: true };
}
