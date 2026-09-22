"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Building, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { submitBoardingHouse, checkVerificationStatus } from "./actions";

export default function DaftarKosPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Fungsi untuk memuat ulang form kosong agar pemilik bisa daftar cabang lagi
  const handleDaftarLagi = () => {
    setSuccess(false);
    setIsVerified(false);
  };

  useEffect(() => {
    async function loadStatus() {
      const status = await checkVerificationStatus();
      if (status.hasUnverified) {
        setSuccess(true);
        setIsVerified(false);
      } else if (status.hasVerified) {
        setSuccess(true);
        setIsVerified(true);
      }
      setCheckingStatus(false);
    }
    loadStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    const formData = new FormData(e.currentTarget);
    const result = await submitBoardingHouse(formData);
    
    if (result.error) {
      setErrorMsg(result.error);
      setLoading(false);
    } else if (result.success) {
      setSuccess(true);
      setIsVerified(false); // Setelah disubmit, pasti berstatus UNVERIFIED
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return <div className="p-8 text-center text-gray-500">Memuat status pendaftaran...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building className="w-6 h-6 text-[#3b23c6]" /> Daftarkan Kos & Cabang Baru
        </h1>
        <p className="text-gray-500 mt-1">
          Daftarkan properti kos utama Anda. Anda juga bisa mendaftarkan cabang baru di form ini (Extend).
        </p>
      </div>

      {success && !isVerified ? (
        <div className="border rounded-xl p-8 text-center flex flex-col items-center bg-green-50 border-green-200">
          <CheckCircle2 className="w-12 h-12 mb-3 text-green-600" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Pendaftaran Berhasil Dikirim</h2>
          <p className="text-sm text-gray-600 mb-6">
            Data kos Anda (dan cabangnya jika ada) telah dikirim ke sistem. <br/>
            <strong>(Include Relasi UML):</strong> Harap tunggu karena saat ini sistem sedang memproses antrean agar Admin Super memverifikasi data Anda.
          </p>
          <div className="flex items-center justify-center p-3 bg-white border border-gray-200 rounded-lg animate-pulse gap-3">
             <div className="w-4 h-4 border-2 border-[#3b23c6] border-t-transparent rounded-full animate-spin"></div>
             <span className="text-sm font-medium text-gray-700">Menunggu Verifikasi Admin...</span>
          </div>
        </div>
      ) : success && isVerified ? (
        <div className="space-y-6">
          <div className="border rounded-xl p-8 text-center flex flex-col items-center bg-blue-50 border-blue-200">
            <CheckCircle2 className="w-12 h-12 mb-3 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Pendaftaran Telah Diverifikasi</h2>
            <p className="text-sm text-gray-600 mb-6">
              Selamat! Pendaftaran kos Anda telah disetujui oleh Admin Super. Anda sudah bisa menggunakan fitur lainnya.
            </p>
            <button 
              onClick={handleDaftarLagi}
              className="bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Daftarkan Properti / Cabang Lainnya
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}
          
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <h2 className="text-lg font-semibold text-gray-900">Data Kos Utama</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Properti / Kos</label>
              <input type="text" name="name" required placeholder="Contoh: Kos Pintu Berkah Indah" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b23c6]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
              <textarea name="address" required rows={3} placeholder="Jalan Raya No 123..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b23c6]"></textarea>
            </div>
          </div>

          {/* Extend: Tambah Cabang Baru */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  Daftarkan Cabang Kos Baru <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">Opsional (Extend)</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Apakah Anda memiliki cabang lain yang ingin didaftarkan sekaligus?</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Cabang (Kosongkan jika tidak ada)</label>
                  <input type="text" name="branchName" placeholder="Contoh: Kos Pintu Berkah Cabang Selatan" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b23c6]" />
               </div>
               <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Cabang</label>
                  <textarea name="branchAddress" rows={2} placeholder="Jalan Mawar No 45..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b23c6]"></textarea>
               </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#3b23c6] hover:bg-[#2d1b99] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                 <>Memproses...</>
              ) : (
                 <><PlusCircle className="w-4 h-4" /> Daftarkan Kos</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}