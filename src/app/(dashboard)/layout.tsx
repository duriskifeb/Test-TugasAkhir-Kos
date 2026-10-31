import { MobileNav, Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { Lock } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Baca path saat ini untuk mengecualikan layar "Verifikasi" jika owner ada di halaman Houses
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";
  const isHousesPage = pathname.includes("/dashboard/houses");

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Cek profile role, jika admin lempar ke admin dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin/dashboard");
  }

  // Cek apakah user punya kos (atau staff)
  let role = profile?.role || "tenant";
  let boardingHouse = null;
  let allTenants: any[] = [];
  let currentTenantId: string | null = null;

  // Check if they have a staff invite (requires RLS policy to allow reading their own email)
  const { data: staffData } = await supabase
    .from("tenant_staffs")
    .select("tenant_id, status")
    .eq("email", user.email ?? "")
    .maybeSingle();

  // Auto-correct role if they are actually staff
  if (staffData && role !== "staff") {
    role = "staff";
    if (staffData.status === "pending") {
      staffData.status = "active";
    }
  }

  if (role === "staff") {
    if (staffData && staffData.status === "active") {
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("id, status, name, subdomain")
        .eq("id", staffData.tenant_id)
        .maybeSingle();
      boardingHouse = tenantData;
      if (tenantData) {
        allTenants = [tenantData];
        currentTenantId = tenantData.id;
      }
    }
  } else {
    // Owner logic - Get ALL their tenants
    const { data: tenantsData } = await supabase
      .from("tenants")
      .select("id, status, name, subdomain")
      .eq("owner_id", user.id)
      .order('created_at', { ascending: true });
      
    if (tenantsData && tenantsData.length > 0) {
      allTenants = tenantsData;
      
      // Ambil active tenant dari cookie (dibuat oleh Topbar UI Switcher)
      const cookieStore = await cookies();
      const savedTenantId = cookieStore.get('active_tenant_id')?.value;
      
      if (savedTenantId && allTenants.some(t => t.id === savedTenantId)) {
        currentTenantId = savedTenantId;
        boardingHouse = allTenants.find(t => t.id === savedTenantId);
      } else {
        // Jika tidak ada cookie atau cookie tidak valid, pakai cabang pertama
        currentTenantId = allTenants[0].id;
        boardingHouse = allTenants[0];
      }
    }
  }

  const hasBoardingHouse = !!boardingHouse || allTenants.length > 0;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50 font-sans text-gray-900 md:flex-row">
      <Sidebar hasBoardingHouse={hasBoardingHouse} role={role} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar tenants={allTenants} currentTenantId={currentTenantId} />
        <MobileNav hasBoardingHouse={hasBoardingHouse} role={role} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {/* Tampilkan UI Verifikasi HANYA jika cabang saat ini beneran belum di verifikasi DAN kita tidak sedang di halaman manajemen Houses */}
          {boardingHouse?.status === 'UNVERIFIED' && !isHousesPage ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <span className="tile tile-pending mb-6 flex !aspect-square w-20 items-center justify-center">
                <Lock className="relative z-10 size-7 text-primary" />
              </span>
              <h2 className="mb-2 font-display text-2xl font-bold text-gray-900">Menunggu Konfirmasi Admin</h2>
              <p className="mb-6 max-w-md text-gray-600">
                Data kos &quot;{boardingHouse?.name}&quot; sudah tersimpan dan sedang menunggu konfirmasi Admin.
                Dashboard, Website Builder, dan data kos ini bisa dipakai setelah Admin mengonfirmasi.
              </p>
              {allTenants.length > 1 && (
                <p className="text-sm text-gray-500">
                  Gunakan menu cabang di bagian atas untuk beralih ke cabang kos Anda yang sudah diverifikasi.
                </p>
              )}
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
