import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMaintenanceReports } from "./actions";
import { MaintenanceClient } from "./MaintenanceClient";
import { cookies } from "next/headers";

export const metadata = {
  title: "Keluhan & Maintenance - Dashboard",
};

export default async function MaintenancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Tentukan tenantId berdasarkan role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let tenantId: string | null = null;

  if (profile?.role === "staff") {
    const { data: staff } = await supabase
      .from("tenant_staffs")
      .select("tenant_id")
      .eq("email", user.email ?? "")
      .eq("status", "active")
      .maybeSingle();
    tenantId = staff?.tenant_id || null;
  } else {
    const cookieStore = await cookies();
    const activeTenantId = cookieStore.get("active_tenant_id")?.value;
    const { data: allTenants } = await supabase
      .from("tenants")
      .select("id")
      .eq("owner_id", user.id);

    if (allTenants && allTenants.length > 0) {
      if (activeTenantId && allTenants.some(t => t.id === activeTenantId)) {
        tenantId = activeTenantId;
      } else {
        tenantId = allTenants[0].id;
      }
    }
  }

  if (!tenantId) redirect("/dashboard");

  // Fetch rooms untuk dropdown
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name")
    .eq("boarding_house_id", tenantId)
    .order("name", { ascending: true });

  // Fetch laporan keluhan
  const reports = await getMaintenanceReports();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <MaintenanceClient initialReports={reports} rooms={rooms || []} />
    </div>
  );
}
