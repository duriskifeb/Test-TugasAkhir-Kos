import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { Home } from "lucide-react";

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
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
      <Sidebar hasBoardingHouse={hasBoardingHouse} role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar tenants={allTenants} currentTenantId={currentTenantId} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#fafafa]">
          {/* Tampilkan UI Verifikasi HANYA jika cabang saat ini beneran belum di verifikasi DAN kita tidak sedang di halaman manajemen Houses */}
          {boardingHouse?.status === 'UNVERIFIED' && !isHousesPage ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-24 h-24 mb-6 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cabang Kos Sedang Diverifikasi</h2>
              <p className="text-gray-500 max-w-md mb-6">
                Cabang kos "{boardingHouse?.name}" sedang dalam antrean verifikasi oleh Admin. 
                Anda tidak dapat mengakses Builder atau data untuk cabang ini sampai diverifikasi.
              </p>
              {allTenants.length > 1 && (
                <p className="text-sm text-gray-400">
                  Gunakan menu dropdown di atas (Topbar) untuk beralih ke cabang kos Anda yang diverifikasi.
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
