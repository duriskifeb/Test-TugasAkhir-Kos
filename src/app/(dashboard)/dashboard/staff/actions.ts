"use server";

import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addStaff(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const selectedTenantId = String(formData.get("tenant_id") ?? "");

  if (!name || !email || !selectedTenantId) {
    return { error: "Nama, email, dan cabang kos wajib diisi." };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi.");
    return { error: "Undangan email belum dapat dikirim karena konfigurasi server belum lengkap." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: verifyTenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("id", selectedTenantId)
    .eq("owner_id", user.id)
    .single();

  if (!verifyTenant) {
    return { error: "Cabang kos tidak valid atau Anda tidak memiliki akses ke cabang ini." };
  }

  const { error: insertError } = await supabase.from("tenant_staffs").insert({
    tenant_id: selectedTenantId,
    name,
    email,
    status: "pending",
  });

  if (insertError) {
    console.error("Gagal membuat undangan staf:", insertError);
    if (insertError.code === "23505") {
      return { error: "Email ini sudah diundang sebagai staf." };
    }
    return { error: "Terjadi kesalahan saat mengundang staf." };
  }

  const adminClient = createSupabaseAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name: name, role: "staff" },
    redirectTo: new URL("/auth/callback", siteUrl).toString(),
  });

  if (inviteError) {
    console.error("Gagal mengirim email undangan staf:", inviteError.message);
    const { error: cleanupError } = await supabase
      .from("tenant_staffs")
      .delete()
      .eq("tenant_id", selectedTenantId)
      .eq("email", email);

    if (cleanupError) {
      console.error("Gagal membatalkan undangan staf yang emailnya tidak terkirim:", cleanupError);
    }

    return {
      error: cleanupError
        ? "Email undangan gagal dikirim dan data undangan belum dapat dibatalkan. Hubungi administrator."
        : "Email undangan gagal dikirim. Pastikan konfigurasi email Supabase sudah benar lalu coba lagi.",
    };
  }

  revalidatePath("/dashboard/staff");
  return { success: "Undangan berhasil dikirim. Pengelola dapat membuat kata sandi melalui tautan di email." };
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
