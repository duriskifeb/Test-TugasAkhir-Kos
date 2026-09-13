import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Cek profile role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "owner";
  let boardingHouse: { id: string; status: string } | null = null;
  let tenantId = null;

  if (role === "staff") {
    const { data: staffData } = await supabase
      .from("tenant_staffs")
      .select("tenant_id")
      .eq("email", user.email ?? "")
      .eq("status", "active")
      .maybeSingle();
      
    if (staffData) {
      tenantId = staffData.tenant_id;
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("id, status")
        .eq("id", tenantId)
        .maybeSingle();
      if (tenantData) {
        boardingHouse = { id: tenantData.id, status: tenantData.status ?? "UNVERIFIED" };
      }
    }
  } else {
    // OWNER LOGIC: Retrieve the correct active tenant from cookie or fallback to first tenant
    const { data: allTenants } = await supabase
      .from("tenants")
      .select("id, status")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true });
      
    if (allTenants && allTenants.length > 0) {
      // Ambil ID dari cookies yang dikirim oleh client/browser
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const savedTenantId = cookieStore.get('active_tenant_id')?.value;
      
      let activeTenant = null;
      if (savedTenantId) {
        activeTenant = allTenants.find(t => t.id === savedTenantId);
      }
      
      // Jika cookie tidak valid/tidak ada, pakai tenant yang pertama dibuat
      if (!activeTenant) {
        activeTenant = allTenants[0];
      }

      boardingHouse = { id: activeTenant.id, status: activeTenant.status ?? "UNVERIFIED" };
      tenantId = activeTenant.id;
    }
  }

  const userName = user.user_metadata?.full_name?.split(" ")[0] || "Owner";

  // Fetch metrics if boarding house exists
  const metrics = {
    occupancyRate: 0,
    monthlyRevenue: 0,
    availableRooms: 0,
    totalRooms: 0,
    pendingBookings: 0,
    newTenants: 0
  };

  if (tenantId) {
    // 1. Rooms data (total and available)
    const { data: rooms } = await supabase
      .from("rooms")
      .select("status")
      .eq("boarding_house_id", tenantId);
    
    if (rooms) {
      metrics.totalRooms = rooms.length;
      metrics.availableRooms = rooms.filter(r => r.status === 'available').length;
      const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
      metrics.occupancyRate = metrics.totalRooms > 0 
        ? Math.round((occupiedRooms / metrics.totalRooms) * 100) 
        : 0;
    }

    // 2. Payments data (Monthly revenue - assuming paid this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    
    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .eq("tenant_id", tenantId)
      .eq("status", "paid")
      .gte("paid_at", startOfMonth.toISOString());
    
    if (payments) {
      metrics.monthlyRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    }

    // 3. Active Tenants
    const { count: newTenantsCount } = await supabase
      .from("renters")
      .select("*", { count: 'exact', head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "active");
    metrics.newTenants = newTenantsCount || 0;

    // 4. Pending Bookings
    const { count: pendingCount } = await supabase
      .from("bookings")
      .select("*", { count: 'exact', head: true })
      .eq("boarding_house_id", tenantId)
      .eq("status", "pending");
    metrics.pendingBookings = pendingCount || 0;
  }

  return (
    <DashboardClient 
      boardingHouse={boardingHouse} 
      userName={userName} 
      role={role}
      metrics={metrics}
    />
  );
}
