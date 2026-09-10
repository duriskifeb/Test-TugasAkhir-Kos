import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StaffForm } from "./StaffForm";
import { Trash2, Clock, CheckCircle2, Shield } from "lucide-react";
import { removeStaff } from "./actions";

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Ambil data tenant dengan logic Multi-Cabang
  const { data: allTenants } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("owner_id", user.id);

  if (!allTenants || allTenants.length === 0) {
    redirect("/dashboard"); // Hanya pemilik kos yang boleh akses halaman ini
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const savedTenantId = cookieStore.get('active_tenant_id')?.value;
  
  let tenant = allTenants[0];
  if (savedTenantId && allTenants.some(t => t.id === savedTenantId)) {
    tenant = { id: savedTenantId };
  }

  // 2. Ambil data staf dari SEMUA tenant milik owner ini
  const tenantIds = allTenants.map((t) => t.id);
  const { data: staffs } = await supabase
    .from("tenant_staffs")
    .select("*, tenants(name)")
    .in("tenant_id", tenantIds)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Staf</h1>
        <p className="text-gray-500 mt-1">Kelola akses penjaga kos atau karyawan Anda untuk cabang tertentu.</p>
      </div>

      <StaffForm tenants={allTenants} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-400" />
            Daftar Karyawan Terdaftar
          </h3>
        </div>
        
        {staffs && staffs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {staffs.map((staff) => (
              <div key={staff.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{staff.name}</h4>
                  <p className="text-sm text-gray-500">{staff.email}</p>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      CABANG: {(staff as any).tenants?.name || "Tidak diketahui"}
                    </span>
                    {staff.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700">
                        <CheckCircle2 className="w-3 h-3" /> Aktif / Terdaftar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700">
                        <Clock className="w-3 h-3" /> Menunggu Registrasi
                      </span>
                    )}
                  </div>
                </div>

                <form action={removeStaff}>
                  <input type="hidden" name="id" value={staff.id} />
                  <button 
                    type="submit"
                    className="p-2.5 text-gray-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-semibold hidden sm:inline">Cabut Akses</span>
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            Belum ada karyawan yang ditambahkan.
          </div>
        )}
      </div>
    </div>
  );
}
