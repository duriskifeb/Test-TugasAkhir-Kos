import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { revalidatePath } from "next/cache";
import { verifyTenantAction } from "./actions";

export default async function AdminVerificationsPage() {
  const supabase = await createClient();

  // DEBUGGING: Cek siapa yang sedang login
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

  // Ambil SEMUA tenant (menggunakan master service key auth jika RLS bermasalah)
  // Untuk sementara, kita buat query biasa, jika tidak muncul, berarti data memang tidak masuk.
  const { data: kosRequests, error } = await supabase
    .from("tenants")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });

  const unverifiedRequests = kosRequests ? kosRequests.filter((req: any) => req.status === "UNVERIFIED") : [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-green-600" />
          Verifikasi Pendaftaran Kos
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Halaman Super Admin untuk memverifikasi pendaftaran kos dan cabang baru yang diajukan oleh Pemilik.
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded">
          <strong>Debug Info:</strong> Email Login: {user?.email} | Role Database: {profile?.role}
        </div>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            Error fetching data: {error.message}
          </div>
        )}
        
        {unverifiedRequests && unverifiedRequests.length > 0 ? (
          unverifiedRequests.map((req: any) => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{req.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Pemilik: {req.profiles?.full_name || "Tidak diketahui"} • Alamat: {req.address}</p>
                </div>
                
                <div>
                  <form action={verifyTenantAction}>
                    <input type="hidden" name="tenantId" value={req.id} />
                    <div className="flex gap-2">
                      <button 
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Verifikasi & Setujui
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Tidak ada pendaftaran kos baru yang menunggu verifikasi saat ini.
            <br/>
            <span className="text-xs mt-2 opacity-50">Total data di database: {kosRequests?.length || 0} tenant(s).</span>
          </div>
        )}
      </div>
    </div>
  );
}