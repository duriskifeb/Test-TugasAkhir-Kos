import { createClient } from "@/lib/supabase/server";
import { Users, Plus, Trash2 } from "lucide-react";
import { addTenant, removeTenant } from "./actions";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function TenantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Dapatkan tenant_id untuk user ini (owner atau staff)
  let tenantId = null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  
  if (profile?.role === "staff") {
    const { data: staffData } = await supabase.from("tenant_staffs").select("tenant_id").eq("email", user.email ?? "").eq("status", "active").single();
    tenantId = staffData?.tenant_id;
  } else {
    const { data: tenantData } = await supabase.from("tenants").select("id").eq("owner_id", user.id).maybeSingle();
    tenantId = tenantData?.id;
  }

  if (!tenantId) return <div>Data Kos Tidak Ditemukan.</div>;

  // Fetch Renters
  const { data: renters } = await supabase
    .from("renters")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  // Fetch Available Rooms
  const { data: availableRooms } = await supabase
    .from("rooms")
    .select("id, name")
    .eq("boarding_house_id", tenantId)
    .eq("status", "available")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Penghuni (Tenants)</h1>
          <p className="text-gray-500 mt-1">
            Kelola data diri penyewa yang menghuni kamar di kos Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Form Tambah Penghuni */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Tambah Penghuni Baru
            </h2>
            <form action={addTenant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" name="fullName" required className="field" placeholder="Budi Santoso" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon / WA</label>
                <input type="text" name="phoneNumber" className="field" placeholder="08123456789" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Masuk (Check-In)</label>
                <input type="date" name="checkInDate" required className="field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kamar</label>
                <select name="roomId" required className="field">
                  <option value="">-- Pilih Kamar Kosong --</option>
                  {availableRooms?.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
                {(!availableRooms || availableRooms.length === 0) && (
                  <p className="text-xs text-red-500 mt-1">Tidak ada kamar kosong yang tersedia.</p>
                )}
              </div>
              <SubmitButton label="Simpan Penghuni" pendingLabel="Menyimpan..." />
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Daftar Penghuni */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="text-base font-bold text-gray-900">Daftar Penghuni Saat Ini</h2>
            </div>
            
            {(!renters || renters.length === 0) ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Penghuni</h3>
                <p className="text-gray-500 max-w-md">
                  Anda belum mendaftarkan penghuni mana pun ke dalam sistem. Tambahkan penghuni pertama Anda di form sebelah kiri.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {renters.map(renter => (
                  <li key={renter.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        {renter.full_name}
                        {renter.status === "active" ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">AKTIF</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">PINDAH KELUAR</span>
                        )}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Kamar: <strong>{renter.room_name_snapshot || "-"}</strong></span>
                        <span>WA: {renter.phone_number || "-"}</span>
                        <span>Check-In: {new Date(renter.check_in_date).toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>
                    {renter.status === "active" && (
                      <form action={removeTenant}>
                        <input type="hidden" name="id" value={renter.id} />
                        <input type="hidden" name="roomId" value={renter.room_id ?? ""} />
                        <button 
                          title="Tandai Pindah Keluar"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Pindah Keluar</span>
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
