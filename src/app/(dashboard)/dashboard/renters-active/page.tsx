"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, Users } from "lucide-react";

export default function RentersActivePage() {
  const [loading, setLoading] = useState(true);
  const [renters, setRenters] = useState<any[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [verifying, setVerifying] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // Implementasi Relasi <<include>> Login (Verifikasi Sesi/Keamanan)
  const handleVerifySession = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setAuthError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Sesi tidak valid");

      // Coba sign in ulang untuk memastikan password benar (simulasi include login)
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordInput,
      });

      if (error) {
        setAuthError("Kata sandi salah. Verifikasi gagal.");
      } else {
        setIsVerified(true);
        fetchRentersData(); // Jika lolos verifikasi, baru tarik data
      }
    } catch (err: any) {
      setAuthError(err.message || "Terjadi kesalahan keamanan");
    } finally {
      setVerifying(false);
    }
  };

  const fetchRentersData = async () => {
    setLoading(true);
    // Dummy Data Penyewa (karena struktur tabel detail penyewa mungkin gabung dengan booking/user)
    // Di aplikasi nyata, join dengan tabel profil penyewa
    setTimeout(() => {
        setRenters([
            { id: 1, name: "Budi Santoso", room: "Kamar A1", phone: "0812345678", date_in: "2023-10-01" },
            { id: 2, name: "Siti Aminah", room: "Kamar B2", phone: "0898765432", date_in: "2023-11-15" }
        ]);
        setLoading(false);
    }, 1000);
  };

  if (!isVerified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-center mb-4">
             <div className="p-4 bg-red-50 rounded-full">
                <ShieldAlert className="w-8 h-8 text-red-600" />
             </div>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Verifikasi Keamanan (Include Login)</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Data penyewa bersifat rahasia. Sesuai prosedur sistem, Anda harus memasukkan ulang kata sandi sebelum mengakses halaman ini.
          </p>

          <form onSubmit={handleVerifySession} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan kata sandi akun Anda"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {authError && <p className="text-red-500 text-xs">{authError}</p>}
            <button
              type="submit"
              disabled={verifying}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {verifying ? "Memverifikasi..." : "Lanjutkan"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" /> Data Penyewa Aktif
        </h1>
        <p className="text-sm text-gray-500 mt-1">Daftar penghuni kos yang masih aktif menyewa saat ini.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse">Memuat data penghuni...</div>
        ) : (
            <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Nama Penghuni</th>
                <th className="px-6 py-4 font-medium">Nomor Kamar</th>
                <th className="px-6 py-4 font-medium">Kontak</th>
                <th className="px-6 py-4 font-medium">Tanggal Masuk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {renters.map((renter) => (
                <tr key={renter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{renter.name}</td>
                  <td className="px-6 py-4 font-semibold text-blue-600">{renter.room}</td>
                  <td className="px-6 py-4 text-gray-600">{renter.phone}</td>
                  <td className="px-6 py-4 text-gray-600">{renter.date_in}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}