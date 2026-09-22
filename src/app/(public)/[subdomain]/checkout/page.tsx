"use client";

import { useState } from "react";
import { processBookingAndRegistration } from "./actions";
import { CheckCircle2, BedDouble, User, CreditCard, ShieldCheck } from "lucide-react";

export default function CheckoutPage({ params }: { params: { subdomain: string } }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    // Hardcode tenant_id dan room_id sementara untuk keperluan testing
    // Di aplikasi nyata, data ini dikirim via URL parameter atau State
    formData.append("tenant_id", "12345678-1234-1234-1234-123456789012"); 
    formData.append("room_id", "12345678-1234-1234-1234-123456789012");
    formData.append("total_price", "1500000");

    const result = await processBookingAndRegistration(formData);

    if (result.error) {
      setErrorMsg(result.error);
      setLoading(false);
    } else if (result.success) {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Berhasil!</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Pemesanan Anda telah tercatat. Kami juga telah membuatkan akun untuk Anda secara otomatis. 
            Silakan cek email Anda untuk detail pesanan.
          </p>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-left">
            <h3 className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Langkah Selanjutnya (UML: Unggah Bukti)
            </h3>
            <p className="text-sm text-blue-800">
              Silakan login ke aplikasi menggunakan email & password yang baru saja Anda buat untuk <strong>mengunggah bukti pembayaran</strong>.
            </p>
          </div>
          <button onClick={() => window.location.href = '/login'} className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition-colors">
            Login ke Dashboard Penyewa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Form Booking & Register Otomatis */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 bg-[#3b23c6] text-white">
              <h2 className="text-xl font-bold">Form Pemesanan & Data Diri</h2>
              <p className="text-sm text-blue-100 mt-1 opacity-90">
                Lengkapi form ini. Sistem akan otomatis membuatkan akun penyewa untuk Anda (UC_RegSass).
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" /> Data Diri & Akun Baru
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input type="text" name="full_name" required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-[#3b23c6] focus:border-[#3b23c6]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
                    <input type="tel" name="phone" required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-[#3b23c6] focus:border-[#3b23c6]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                    <input type="email" name="email" required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-[#3b23c6] focus:border-[#3b23c6]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buat Password</label>
                    <input type="password" name="password" required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-[#3b23c6] focus:border-[#3b23c6]" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 my-6"></div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-gray-500" /> Detail Sewa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mulai Sewa (Tgl Masuk)</label>
                    <input type="date" name="start_date" required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-[#3b23c6] focus:border-[#3b23c6]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durasi Sewa</label>
                    <select name="duration" required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-[#3b23c6] focus:border-[#3b23c6]">
                      <option value="1">1 Bulan</option>
                      <option value="3">3 Bulan</option>
                      <option value="6">6 Bulan</option>
                      <option value="12">1 Tahun</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-[#3b23c6] hover:bg-[#2d1b99] text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Selesaikan Pemesanan'}
              </button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Ringkasan Pemesanan */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#3b23c6]" /> Ringkasan
            </h3>
            
            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=200" alt="Kamar" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Kamar Tipe A - AC & WiFi</h4>
                <p className="text-xs text-gray-500 mt-1">Sisa 2 Kamar</p>
              </div>
            </div>

            <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Harga Sewa (1 Bulan)</span>
                <span className="font-medium text-gray-900">Rp 1.500.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Biaya Admin Platform</span>
                <span className="font-medium text-green-600">Gratis</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-900">Total Pembayaran</span>
              <span className="font-bold text-xl text-[#3b23c6]">Rp 1.500.000</span>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 leading-relaxed border border-blue-100">
              Dengan menyelesaikan pemesanan ini, Anda akan dibuatkan akun <strong>Penyewa</strong> secara otomatis.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}