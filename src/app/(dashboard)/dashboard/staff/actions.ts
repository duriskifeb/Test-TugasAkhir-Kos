"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addStaff(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string).toLowerCase();

  if (!name || !email) {
    return { error: "Nama dan email wajib diisi." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Get tenant ID (Multi-Cabang Support)
  const { data: allTenants } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id);

  if (!allTenants || allTenants.length === 0) {
    return { error: "Kos belum terdaftar." };
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const savedTenantId = cookieStore.get('active_tenant_id')?.value;
  
  let tenantId = allTenants[0].id;
  if (savedTenantId && allTenants.some(t => t.id === savedTenantId)) {
    tenantId = savedTenantId;
  }
  
  const tenant = { id: tenantId };

  const { error } = await supabase.from("tenant_staffs").insert({
    tenant_id: tenant.id,
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
