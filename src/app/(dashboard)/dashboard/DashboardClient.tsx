"use client";

import { 
  Calendar, 
  ArrowRight,
  PlusSquare,
  Home,
  UserPlus,
  AlertTriangle,
  BedDouble,
  Users,
  CreditCard,
  TrendingUp
} from "lucide-react";
import { useState } from "react";
import { OnboardingWizard } from "@/components/modules/OnboardingWizard";
import Link from "next/link";

export function DashboardClient({ 
  boardingHouse,
  userName,
  role = "tenant",
  metrics
}: { 
  boardingHouse: { id: string; status: string } | null;
  userName: string;
  role?: string;
  metrics?: {
    occupancyRate: number;
    monthlyRevenue: number;
    availableRooms: number;
    totalRooms: number;
    pendingBookings: number;
    newTenants: number;
  };
}) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Jika Belum Punya Kos
  if (!boardingHouse) {
    if (role === "staff") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
            <UserPlus className="w-10 h-10 text-[#3b23c6]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Selamat Datang, Staf!</h1>
          <p className="text-gray-500 max-w-md mb-8 text-base">
            Akun Anda belum ditugaskan untuk mengelola properti kos manapun. Silakan hubungi Pemilik Kos untuk menambahkan Anda ke dalam sistem mereka.
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <Home className="w-10 h-10 text-[#3b23c6]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Selamat Datang, {userName}!</h1>
        <p className="text-gray-500 max-w-md mb-8 text-base">
          Anda selangkah lagi untuk mengelola bisnis kos Anda dengan lebih mudah. Mari mulai dengan mendaftarkan properti kos pertama Anda.
        </p>
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="bg-[#3b23c6] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#321ca8] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <PlusSquare className="w-5 h-5" />
          Daftarkan Kos Pertama Anda
        </button>

        <OnboardingWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      </div>
    );
  }

  // Jika Sudah Punya Kos
  const isUnverified = boardingHouse.status === 'UNVERIFIED';

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      
      {/* Banner UNVERIFIED */}
      {isUnverified && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-4 items-start shadow-sm">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-800">Menunggu Verifikasi Admin</h3>
            <p className="text-sm text-amber-700 mt-1">
              Kos Anda telah berhasil didaftarkan namun saat ini belum ditinjau oleh Admin. Anda tetap bisa mengatur kamar dan fasilitas, namun fitur publikasi website sementara ditahan hingga proses verifikasi selesai.
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Selamat datang, {userName} 👋</h1>
          <p className="text-gray-500 mt-1">Berikut ringkasan operasional kos Anda hari ini.</p>
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-2 px-3 shadow-sm gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        
        {/* Metric 1 - Tingkat Hunian */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-semibold text-gray-500 mb-1">Tingkat Hunian</h3>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-[#3b23c6]">{metrics?.occupancyRate || 0}%</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#3b23c6] h-full rounded-full transition-all duration-1000" style={{ width: `${metrics?.occupancyRate || 0}%` }} />
          </div>
        </div>

        {/* Metric 2 - Pendapatan Bulan Ini */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-semibold text-gray-500 mb-1">Pendapatan Bulan Ini</h3>
          <span className="text-xl font-bold text-gray-900">
            {formatRupiah(metrics?.monthlyRevenue || 0)}
          </span>
        </div>

        {/* Metric 3 - Kamar Tersedia */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-semibold text-gray-500 mb-1">Kamar Tersedia</h3>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-gray-900">{metrics?.availableRooms || 0}</span>
            <span className="text-xs text-gray-500 mb-1">/ {metrics?.totalRooms || 0} total</span>
          </div>
        </div>

        {/* Metric 4 - Booking Menunggu (Highlighted) */}
        <div className="bg-[#f5f3ff] border border-[#d8b4fe] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[#3b23c6] mb-1">Booking Menunggu</h3>
          <span className="text-2xl font-bold text-gray-900">{metrics?.pendingBookings || 0}</span>
          <Link href="/dashboard/bookings" className="flex items-center text-xs font-bold text-[#3b23c6] hover:underline mt-2">
            Tinjau semua <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        {/* Metric 5 - Penghuni Aktif */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-semibold text-gray-500 mb-1">Penghuni Aktif</h3>
          <span className="text-2xl font-bold text-gray-900">{metrics?.newTenants || 0}</span>
        </div>

        {/* Metric 6 - Estimasi Profit */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-semibold text-gray-500 mb-1">Est. Profit (85%)</h3>
          <span className="text-xl font-bold text-gray-900">
            {formatRupiah((metrics?.monthlyRevenue || 0) * 0.85)}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Ringkasan Status Operasional */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Ringkasan Operasional</h2>
                <p className="text-sm text-gray-500 mt-1">Status kamar dan penghuni kos Anda saat ini.</p>
              </div>
              <TrendingUp className="w-5 h-5 text-[#3b23c6]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Kamar */}
              <div className="bg-indigo-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#3b23c6] rounded-full flex items-center justify-center shrink-0">
                  <BedDouble className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-700">Total Kamar</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalRooms || 0}</p>
                </div>
              </div>
              {/* Penghuni Aktif */}
              <div className="bg-green-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-700">Penghuni Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.newTenants || 0}</p>
                </div>
              </div>
              {/* Pendapatan */}
              <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-700">Pendapatan Bulan Ini</p>
                  <p className="text-lg font-bold text-gray-900">{formatRupiah(metrics?.monthlyRevenue || 0)}</p>
                </div>
              </div>
            </div>
            {/* Progress Bar Hunian */}
            <div className="mt-6">
              <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                <span>Tingkat Hunian Keseluruhan</span>
                <span className="text-[#3b23c6]">{metrics?.occupancyRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#3b23c6] h-full rounded-full transition-all duration-1000"
                  style={{ width: `${metrics?.occupancyRate || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{(metrics?.totalRooms || 0) - (metrics?.availableRooms || 0)} kamar terisi</span>
                <span>{metrics?.availableRooms || 0} kamar kosong</span>
              </div>
            </div>
          </div>

          {/* Panduan Alur Sistem */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Alur Sistem Kos</h2>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              {[
                { icon: "🌐", label: "Calon Penyewa", desc: "Lihat website & isi form booking" },
                { icon: "📋", label: "Pengajuan Booking", desc: "Owner/Staf tinjau & setujui" },
                { icon: "🏠", label: "Penghuni Aktif", desc: "Otomatis terdaftar" },
                { icon: "💳", label: "Tagihan Dibuat", desc: "Otomatis muncul di Pembayaran" },
              ].map((item, i, arr) => (
                <div key={i} className="flex sm:flex-col items-center gap-2 flex-1">
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center w-full">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="text-xs font-bold text-gray-800">{item.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-gray-300 font-bold text-lg sm:hidden">↓</span>
                  )}
                  {i < arr.length - 1 && (
                    <span className="text-gray-300 font-bold text-lg hidden sm:block">›</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          
          {/* Promo Card - Website Builder (hanya untuk Owner) */}
          {role !== "staff" && (
            <div className="bg-[#4f46e5] rounded-2xl p-6 shadow-lg text-white">
              <h2 className="text-xl font-bold mb-2">Publikasikan Website Kos</h2>
              <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
                Buat halaman promosi kos yang menarik dan profesional. Tanpa perlu keahlian coding.
              </p>
              {isUnverified ? (
                <>
                  <button
                    disabled
                    className="w-full bg-white text-[#4f46e5] font-bold py-3 px-4 rounded-xl text-sm opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Buka Kustomisasi Website
                  </button>
                  <p className="text-[10px] text-center mt-2 opacity-80">
                    Tersedia setelah akun Anda diverifikasi
                  </p>
                </>
              ) : (
                <Link
                  href="/dashboard/website-builder"
                  className="w-full bg-white text-[#4f46e5] font-bold py-3 px-4 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Buka Kustomisasi Website
                </Link>
              )}
            </div>
          )}

          {/* Aksi Cepat */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="space-y-3">
              {role !== "staff" && (
                <Link href="/dashboard/houses" className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#3b23c6] hover:bg-[#f5f3ff] transition-all group">
                  <Home className="w-5 h-5 text-[#3b23c6]" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Kelola Kos</span>
                </Link>
              )}
              <Link href="/dashboard/rooms" className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#3b23c6] hover:bg-[#f5f3ff] transition-all group">
                <BedDouble className="w-5 h-5 text-[#3b23c6]" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Kelola Kamar</span>
              </Link>
              <Link href="/dashboard/bookings" className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#3b23c6] hover:bg-[#f5f3ff] transition-all group">
                <PlusSquare className="w-5 h-5 text-[#3b23c6]" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex items-center gap-2">
                  Tinjau Pengajuan Booking
                  {(metrics?.pendingBookings || 0) > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {metrics?.pendingBookings}
                    </span>
                  )}
                </span>
              </Link>
              <Link href="/dashboard/payments" className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#3b23c6] hover:bg-[#f5f3ff] transition-all group">
                <CreditCard className="w-5 h-5 text-[#3b23c6]" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Kelola Pembayaran</span>
              </Link>
              {role !== "staff" && (
                <Link href="/dashboard/tenants" className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#3b23c6] hover:bg-[#f5f3ff] transition-all group">
                  <Users className="w-5 h-5 text-[#3b23c6]" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Kelola Penghuni</span>
                </Link>
              )}
            </div>
          </div>

          {/* Fitur Platform */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Fitur Platform</h2>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="flex items-center gap-2"><span className="text-green-500">✅</span> Sistem SaaS Multi-Tenant</p>
              <p className="flex items-center gap-2"><span className="text-green-500">✅</span> Kustomisasi Website Builder</p>
              <p className="flex items-center gap-2"><span className="text-green-500">✅</span> Manajemen Booking & Penghuni</p>
              <p className="flex items-center gap-2"><span className="text-green-500">✅</span> Tagihan Otomatis dari Booking</p>
              <p className="flex items-center gap-2"><span className="text-green-500">✅</span> Role-Based Access Control</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
