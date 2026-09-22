"use client";

import { useEffect, useState } from "react";
import { uploadPaymentReceipt } from "./actions";
import { Upload, CheckCircle2, AlertCircle, FileImage } from "lucide-react";

export default function RenterDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingId, setBookingId] = useState<string>("SIMULASI-BOOKING-ID-123");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await uploadPaymentReceipt(bookingId, formData);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Penyewa</h1>
        <p className="text-gray-500 mt-2">Selamat datang! Selesaikan pembayaran Anda dan ajukan komplain di sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Modul 1: Unggah Bukti (UC_UnggahBukti) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 p-6 bg-indigo-50/50">
            <h2 className="text-xl font-bold text-gray-900">Tagihan & Pembayaran</h2>
            <p className="text-sm text-gray-500 mt-1">Status: <span className="font-semibold text-orange-500">Menunggu Pembayaran</span></p>
          </div>
          
          <div className="p-6">
            {success ? (
              <div className="text-center py-6">
                 <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle2 className="w-8 h-8" />
                 </div>
                 <h4 className="text-lg font-bold text-gray-900">Bukti Terkirim!</h4>
                 <p className="text-gray-500 text-sm mt-2">
                   (Include Relasi): Harap tunggu Pengelola Kos memverifikasi pembayaran Anda.
                 </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center hover:bg-gray-100 transition-colors">
                  <input type="file" name="receipt_file" accept="image/*" required className="hidden" id="receipt-upload" />
                  <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600">
                      <FileImage className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-indigo-600 font-semibold hover:underline">Klik untuk Unggah</span>
                      <span className="text-gray-500 text-sm block">Foto struk/bukti transfer (JPG, PNG)</span>
                    </div>
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5" />
                  {loading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Modul 2: Komplain (UC_Komplain) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="border-b border-gray-100 p-6 bg-red-50/50">
             <h2 className="text-xl font-bold text-gray-900">Pusat Bantuan</h2>
             <p className="text-sm text-gray-500 mt-1">Ajukan keluhan atau komplain kerusakan fasilitas.</p>
           </div>
           <div className="p-6 flex flex-col items-center justify-center text-center h-48">
              <p className="text-sm text-gray-500 mb-4">Fitur komplain akan terbuka setelah pembayaran Anda diverifikasi oleh Pengelola.</p>
              <button disabled className="px-6 py-2 bg-gray-100 text-gray-400 font-semibold rounded-lg cursor-not-allowed">
                Ajukan Komplain
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}