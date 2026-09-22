import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminVerifikasiPage() {
  const supabase = await createClient();

  // DEBUGGING: Cek siapa yang sedang login dan RLS nya
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

  // Fetch all boarding houses (tenants table) and their owner details
  // Kita kembalikan ke client normal karena env variable service key tidak ada
  const { data: boardingHouses, error } = await supabase
    .from("tenants")
    .select(`
      id,
      name,
      subdomain,
      status,
      created_at,
      owner_id,
      profiles!tenants_owner_id_fkey (
        full_name,
        email,
        phone
      )
    `)
    .order("created_at", { ascending: false });

  // Server action to verify or unverify
  async function toggleVerification(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const currentStatus = formData.get("current_status") as string;
    const newStatus = currentStatus === "VERIFIED" ? "UNVERIFIED" : "VERIFIED";

    await supabase
      .from("tenants")
      .update({ status: newStatus })
      .eq("id", id);
      
    revalidatePath("/admin/verifikasi");
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Validasi Pemilik Kos</h1>
          <p className="text-gray-500 mt-1">Kelola dan verifikasi pendaftaran cabang kos baru (Tenant).</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          Error database: {error.message} 
          <br/>
          <span className="text-xs">
            (Ini berarti akun admin Anda tidak diizinkan membaca tabel tenants karena aturan Row Level Security di database).
          </span>
        </div>
      )}

      {/* Kotak Debugging untuk memastikan Role Admin */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded mb-4">
        <strong>Debug Info:</strong> Email: {user?.email || 'Belum Login'} | Role DB: {profile?.role || 'Tidak ditemukan'} | Total Data Terbaca: {boardingHouses?.length || 0}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Kos</th>
                <th className="px-6 py-4 font-semibold">Pemilik</th>
                <th className="px-6 py-4 font-semibold">Kontak</th>
                <th className="px-6 py-4 font-semibold">Tanggal Daftar</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {boardingHouses && boardingHouses.length > 0 ? (
                boardingHouses.map((bh: any) => (
                  <tr key={bh.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div>{bh.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{bh.subdomain || 'kosong'}.domain.com</div>
                    </td>
                    <td className="px-6 py-4">{bh.profiles?.full_name || "Unknown"}</td>
                    <td className="px-6 py-4">
                      <div>{bh.profiles?.email || "-"}</div>
                      <div className="text-xs text-gray-400">{bh.profiles?.phone || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(bh.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {bh.status === "VERIFIED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={toggleVerification}>
                        <input type="hidden" name="id" value={bh.id} />
                        <input type="hidden" name="current_status" value={bh.status} />
                        <button
                          type="submit"
                          className={`inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                            bh.status === "VERIFIED"
                              ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                              : "bg-black text-white hover:bg-gray-800"
                          }`}
                        >
                          {bh.status === "VERIFIED" ? "Cabut Akses" : "Verifikasi"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada pendaftaran kos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
