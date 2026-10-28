"use client";

import { useState } from "react";
import { setupBoardingHouse } from "@/app/(dashboard)/dashboard/actions";
import { Loader2, Home, MapPin, AlignLeft, Globe, Sparkles, Building2 } from "lucide-react";

export function OnboardingWizard({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await setupBoardingHouse(formData);
      onClose(); // Close modal on success
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] border border-white/20 relative">
        
        {/* Dekorasi Glow di Kiri Atas */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header - Fixed/Tidak Ikut Scroll */}
        <div className="relative shrink-0 bg-gradient-to-br from-[#3b23c6] via-[#4d32e0] to-[#6d51fa] p-8 text-white overflow-hidden">
          {/* Pattern Background */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem]" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
              Daftarkan Kos Anda <Sparkles className="w-5 h-5 text-amber-300" />
            </h2>
            <p className="text-indigo-100 text-sm max-w-sm font-medium">
              Lengkapi informasi dasar di bawah ini untuk memulai keajaiban manajemen properti Anda.
            </p>
          </div>
        </div>

        {/* Form Area - Bisa di-Scroll jika layar kecil */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <form id="onboarding-form" onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Nama Kos */}
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2 transition-colors group-focus-within:text-[#3b23c6]">
                  <Home className="w-4 h-4 text-slate-400 group-focus-within:text-[#3b23c6]" />
                  Nama Kos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Misal: Kos Melati Asri"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-[#3b23c6]/10 focus:border-[#3b23c6] outline-none transition-all placeholder:text-slate-400 hover:border-slate-300"
                />
              </div>

              {/* Subdomain */}
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2 transition-colors group-focus-within:text-[#3b23c6]">
                  <Globe className="w-4 h-4 text-slate-400 group-focus-within:text-[#3b23c6]" />
                  Subdomain Website <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
                </label>
                <div className="flex rounded-2xl overflow-hidden border border-slate-200 focus-within:border-[#3b23c6] focus-within:ring-4 focus-within:ring-[#3b23c6]/10 transition-all hover:border-slate-300 bg-slate-50 focus-within:bg-white">
                  <input
                    type="text"
                    name="subdomain"
                    placeholder="kos-melati-asri"
                    className="w-full bg-transparent border-none px-5 py-4 text-sm font-medium outline-none placeholder:text-slate-400"
                  />
                  <div className="bg-slate-100/50 border-l border-slate-200 px-5 py-4 text-sm text-slate-500 font-bold flex items-center">
                    .pintuberkah.com
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium px-1">
                  Biarkan kosong jika ingin dibuat otomatis dari nama kos Anda.
                </p>
              </div>

              {/* Alamat Lengkap */}
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2 transition-colors group-focus-within:text-[#3b23c6]">
                  <MapPin className="w-4 h-4 text-slate-400 group-focus-within:text-[#3b23c6]" />
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  placeholder="Jl. Mawar No. 123, Kota, Provinsi..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-[#3b23c6]/10 focus:border-[#3b23c6] outline-none transition-all placeholder:text-slate-400 resize-none hover:border-slate-300"
                />
              </div>

              {/* Deskripsi */}
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2 transition-colors group-focus-within:text-[#3b23c6]">
                  <AlignLeft className="w-4 h-4 text-slate-400 group-focus-within:text-[#3b23c6]" />
                  Fasilitas & Deskripsi Singkat <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Ceritakan sedikit tentang kos Anda. Contoh: Kos khusus putra, WiFi kencang, kamar mandi dalam, akses 24 jam..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-[#3b23c6]/10 focus:border-[#3b23c6] outline-none transition-all placeholder:text-slate-400 resize-none hover:border-slate-300"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer / Buttons - Fixed di Bawah */}
        <div className="shrink-0 bg-white border-t border-slate-100 p-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="order-2 sm:order-1 sm:w-1/3 px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            type="submit"
            form="onboarding-form"
            disabled={loading}
            className="order-1 sm:order-2 sm:w-2/3 bg-[#3b23c6] text-white rounded-2xl px-6 py-4 font-bold text-sm hover:bg-[#2d1b99] hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Simpan & Lanjutkan</span>
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
}
