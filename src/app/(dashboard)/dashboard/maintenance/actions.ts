"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Ambil tenant_id aktif (owner atau staff)
async function getActiveTenantId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "staff") {
    const { data: staff } = await supabase
      .from("tenant_staffs")
      .select("tenant_id")
      .eq("email", user.email || "")
      .eq("status", "active")
      .maybeSingle();
    return staff?.tenant_id || null;
  } else {
    const cookieStore = await cookies();
    const activeTenantId = cookieStore.get("active_tenant_id")?.value;
    const { data: allTenants } = await supabase
      .from("tenants")
      .select("id")
      .eq("owner_id", user.id);
    if (!allTenants || allTenants.length === 0) return null;
    if (activeTenantId && allTenants.some((t) => t.id === activeTenantId)) {
      return activeTenantId;
    }
    return allTenants[0].id;
  }
}

// Ambil semua laporan keluhan
export async function getMaintenanceReports() {
  const supabase = await createClient();
  const tenantId = await getActiveTenantId();
  if (!tenantId) return [];

  const { data, error } = await supabase
    .from("maintenance_reports")
    .select(`*, rooms(name), renters(full_name)`)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching maintenance:", error);
    return [];
  }
  return data || [];
}

// Tambah laporan keluhan baru (bisa dari staff maupun owner)
export async function createMaintenanceReport(formData: FormData) {
  const supabase = await createClient();
  const tenantId = await getActiveTenantId();
  if (!tenantId) return { error: "Tidak terautentikasi" };

  const roomId = formData.get("roomId") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;

  const { error } = await supabase.from("maintenance_reports").insert({
    tenant_id: tenantId,
    room_id: roomId || null,
    description,
    priority: priority || "medium",
    status: "open",
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/maintenance");
  return { success: true };
}

// Update status laporan (open → in_progress → resolved)
export async function updateMaintenanceStatus(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("maintenance_reports")
    .update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/maintenance");
  return { success: true };
}
