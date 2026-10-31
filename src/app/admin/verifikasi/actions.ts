"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Admin memverifikasi kos (VERIFIED) atau mencabut verifikasinya (UNVERIFIED), lalu kembali ke daftar dengan pesan hasil. */
export async function setTenantStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const to = formData.get("to") === "VERIFIED" ? "VERIFIED" : "UNVERIFIED";
  if (!UUID.test(id)) redirect("/admin/verifikasi?hasil=gagal");

  const supabase = await createClient();
  if (!(await isAdmin(supabase))) redirect("/admin/verifikasi?hasil=gagal");

  // select() agar tahu apakah ada baris yang benar-benar berubah (RLS bisa menolak tanpa galat).
  const { data, error } = await supabase.from("tenants").update({ status: to }).eq("id", id).select("id");
  if (error || !data?.length) redirect("/admin/verifikasi?hasil=gagal");

  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/dashboard");
  redirect(`/admin/verifikasi?hasil=${to === "VERIFIED" ? "terverifikasi" : "dicabut"}`);
}
