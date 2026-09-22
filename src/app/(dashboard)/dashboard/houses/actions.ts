"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkVerificationStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { hasUnverified: false, hasVerified: false };

  const { data: tenants } = await supabase
    .from("tenants")
    .select("status")
    .eq("owner_id", user.id);

  if (!tenants || tenants.length === 0) return { hasUnverified: false, hasVerified: false };

  const hasUnverified = tenants.some(t => t.status === "UNVERIFIED");
  const hasVerified = tenants.some(t => t.status === "VERIFIED");

  return { hasUnverified, hasVerified };
}

export async function submitBoardingHouse(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const branchName = formData.get("branchName") as string;
  const branchAddress = formData.get("branchAddress") as string;

  // 1. Insert Kos Utama dengan status 'UNVERIFIED'
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      owner_id: user.id,
      name: name,
      address: address,
      status: "UNVERIFIED" // Ini yang akan dicek oleh admin
    })
    .select()
    .single();

  if (tenantError) {
    return { error: tenantError.message };
  }

  // 2. Jika ada data Extend (Cabang Baru), insert juga
  if (branchName && branchName.trim() !== "") {
    await supabase
      .from("tenants")
      .insert({
        owner_id: user.id,
        name: branchName,
        address: branchAddress,
        status: "UNVERIFIED"
      });
  }

  return { success: true };
}