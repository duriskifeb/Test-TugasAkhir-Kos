"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyTenantAction(formData: FormData) {
  const supabase = await createClient();
  const tenantId = formData.get("tenantId") as string;

  if (tenantId) {
    await supabase
      .from("tenants")
      .update({ status: "VERIFIED" })
      .eq("id", tenantId);
      
    revalidatePath("/admin/dashboard/verifications");
  }
}