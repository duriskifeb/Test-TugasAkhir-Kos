"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export async function verifyTenantAction(formData: FormData) {
  const supabase = await createClient();
  const tenantId = formData.get("tenantId") as string;

  if (tenantId && (await isAdmin(supabase))) {
    await supabase
      .from("tenants")
      .update({ status: "VERIFIED" })
      .eq("id", tenantId);
      
    revalidatePath("/admin/dashboard/verifications");
  }
}
