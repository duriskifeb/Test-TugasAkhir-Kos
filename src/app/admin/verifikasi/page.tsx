import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { setTenantStatus } from "./actions";

const hasilPesan: Record<string, { text: string; tone: "ok" | "error" }> = {
  terverifikasi: { text: "Kos berhasil diverifikasi. Pemilik kini bisa memakai dashboard dan website kosnya.", tone: "ok" },
  dicabut: { text: "Verifikasi kos dicabut. Kos kembali berstatus menunggu verifikasi.", tone: "ok" },
  gagal: { text: "Perubahan status gagal disimpan. Pastikan Anda masuk sebagai admin, lalu coba lagi.", tone: "error" },
};

export default async function AdminVerifikasiPage({ searchParams }: { searchParams: Promise<{ hasil?: string }> }) {
  const { hasil } = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenants")
    .select(
      `
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
    `,
    )
    .order("created_at", { ascending: false });

  // Yang menunggu verifikasi tampil paling atas, lalu yang terbaru.
  const boardingHouses = (data ?? []).slice().sort((a, b) => Number(b.status !== "VERIFIED") - Number(a.status !== "VERIFIED"));
  const pending = boardingHouses.filter((bh) => bh.status !== "VERIFIED").length;
  const notice = hasil ? hasilPesan[hasil] : undefined;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Validasi Pemilik Kos</h1>
          <p className="text-gray-500 mt-1">Periksa data kos yang didaftarkan pemilik, lalu verifikasi.</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
            pending > 0 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {pending > 0 ? <Clock className="size-4" /> : <CheckCircle2 className="size-4" />}
          {pending > 0 ? `${pending} menunggu verifikasi` : "Semua sudah diverifikasi"}
        </span>
      </div>

      {notice && (
        <div
          role="status"
          className={`rounded-lg border p-4 text-sm font-medium ${
            notice.tone === "ok" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          Error database: {error.message}
          <br />
          <span className="text-xs">
            (Ini berarti akun admin Anda tidak diizinkan membaca tabel tenants karena aturan Row Level Security di database).
          </span>
        </div>
      )}

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
              {boardingHouses.length > 0 ? (
                boardingHouses.map((bh) => {
                  const owner = Array.isArray(bh.profiles) ? bh.profiles[0] : bh.profiles;
                  const verified = bh.status === "VERIFIED";
                  return (
                    <tr key={bh.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div>{bh.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">/kos/{bh.subdomain || "-"}</div>
                      </td>
                      <td className="px-6 py-4">{owner?.full_name || "Unknown"}</td>
                      <td className="px-6 py-4">
                        <div>{owner?.email || "-"}</div>
                        <div className="text-xs text-gray-500">{owner?.phone || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(bh.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        {verified ? (
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Menunggu Verifikasi
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/verifikasi/${bh.id}`}
                            aria-label={`Periksa data ${bh.name}`}
                            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          >
                            Periksa Data
                          </Link>
                          <form action={setTenantStatus}>
                            <input type="hidden" name="id" value={bh.id} />
                            <input type="hidden" name="to" value={verified ? "UNVERIFIED" : "VERIFIED"} />
                            <button
                              type="submit"
                              aria-label={`${verified ? "Cabut akses" : "Verifikasi"} ${bh.name}`}
                              className={`inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                                verified ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50" : "bg-primary text-white hover:bg-primary-hover"
                              }`}
                            >
                              {verified ? "Cabut Akses" : "Verifikasi"}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
