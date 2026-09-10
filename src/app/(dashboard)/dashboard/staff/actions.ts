"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addStaff(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string).toLowerCase();
  const selectedTenantId = formData.get("tenant_id") as string;

  if (!name || !email || !selectedTenantId) {
    return { error: "Nama, email, dan cabang kos wajib diisi." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verifikasi apakah tenantId yang dipilih benar-benar milik owner ini
  const { data: verifyTenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("id", selectedTenantId)
    .eq("owner_id", user.id)
    .single();

  if (!verifyTenant) {
    return { error: "Cabang kos tidak valid atau Anda tidak memiliki akses ke cabang ini." };
  }

  const { error } = await supabase.from("tenant_staffs").insert({
    tenant_id: selectedTenantId,
    name,
    email,
    status: "active" // Langsung diubah menjadi aktif saat ditambahkan
  });

  if (error) {
    console.error("Gagal menambah staf:", error);
    if (error.code === '23505') { // Unique violation
      return { error: "Email ini sudah diundang sebagai staf." };
    }
    return { error: "Terjadi kesalahan saat mengundang staf." };
  }

  revalidatePath("/dashboard/staff");
  return { success: "Undangan staf berhasil dibuat!" };
}

export async function removeStaff(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  if (!id) throw new Error("ID staf tidak valid.");

  const { error } = await supabase.from("tenant_staffs").delete().eq("id", id);
  
  if (error) {
    console.error("Gagal menghapus staf:", error);
    throw new Error("Terjadi kesalahan saat menghapus staf.");
  }

  revalidatePath("/dashboard/staff");
  redirect("/dashboard/staff");
}
