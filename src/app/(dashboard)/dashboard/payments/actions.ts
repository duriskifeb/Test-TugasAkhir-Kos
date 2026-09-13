"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Mengambil data tagihan
export async function getPaymentsData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { payments: [], renters: [] };

  // Ambil tenant_id
  let tenantId = null;
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (tenant) {
    tenantId = tenant.id;
  } else {
    const { data: staff } = await supabase
      .from("tenant_staffs")
      .select("tenant_id")
      .eq("email", user.email || "")
      .single();
    if (!staff) return { payments: [], renters: [] };
    tenantId = staff.tenant_id;
  }

  // Fetch payments dan relasi ke renter & room
  const { data: payments, error: payError } = await supabase
    .from("payments")
    .select(`
      *,
      renters ( 
        full_name, 
        rooms ( name ) 
      )
    `)
    .eq("tenant_id", tenantId)
    .order("due_date", { ascending: false });

  // Fetch active renters untuk form tagihan baru
  const { data: renters, error: rentError } = await supabase
    .from("renters")
    .select(`id, full_name, rooms(name)`)
    .eq("tenant_id", tenantId)
    .eq("status", "active");

  return { 
    payments: payments || [], 
    renters: renters || []
  };
}

// Membuat tagihan baru
export async function createPayment(formData: FormData) {
  const supabase = await createClient();
  const tenantId = formData.get("tenantId") as string;
  const renterId = formData.get("renterId") as string;
  const amount = formData.get("amount") as string;
  const dueDate = formData.get("dueDate") as string;

  const { error } = await supabase.from("payments").insert({
    tenant_id: tenantId,
    renter_id: renterId,
    amount: parseFloat(amount),
    due_date: dueDate,
    status: "unpaid"
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/payments");
  return { success: true };
}

// Verifikasi Pembayaran (Ubah status jadi Lunas)
export async function verifyPayment(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("payments")
    .update({ 
      status: "paid", 
      paid_at: new Date().toISOString() 
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/payments");
  return { success: true };
}