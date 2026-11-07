"use client";

import {
  Calendar,
  ArrowRight,
  PlusSquare,
  Home,
  UserPlus,
  AlertTriangle,
  BedDouble,
} from "lucide-react";
import { useState } from "react";
import { OnboardingWizard } from "@/components/dashboard/OnboardingWizard";
import { StatusLegend } from "@/components/ui/StatusTile";
import Link from "next/link";

const MAX_TILES = 72;

export function DashboardClient({
  boardingHouse,
  userName,
  role = "tenant",
  metrics,
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
        <div className="flex min-h-[80dvh] flex-1 flex-col items-center justify-center p-6 text-center">
          <span className="tile tile-pending mb-6 flex w-20 items-center justify-center">
            <UserPlus className="relative z-10 size-8 text-primary" />
          </span>
          <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-gray-900">Selamat Datang, Staf</h1>
          <p className="max-w-md text-base text-gray-600">
            Akun Anda belum ditugaskan untuk mengelola properti kos manapun. Silakan hubungi Pemilik Kos untuk
            menambahkan Anda ke dalam sistem mereka.
          </p>
        </div>
      );
    }

    return (
      <div className="flex min-h-[80dvh] flex-1 flex-col items-center justify-center p-6 text-center">
        <span className="tile tile-available mb-6 flex w-20 items-center justify-center">
          <Home className="relative z-10 size-8 text-primary" />
        </span>
        <p className="mb-2 text-sm font-semibold text-primary">Selamat datang, {userName}</p>
        <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-gray-900">
          Daftarkan kos pertama Anda
        </h1>
        <p className="mb-8 max-w-md text-base text-gray-600">
          Mulai dengan mendaftarkan properti kos Anda. Setelah itu menu di samping terbuka, dan Anda bisa mengelola
          kamar, laporan, staf, dan website kos.
        </p>
        {isWizardOpen ? (
          <div className="w-full text-left">
            <OnboardingWizard
              isOpen
              inline
              onClose={() => setIsWizardOpen(false)}
            />
          </div>
        ) : (
          <button onClick={() => setIsWizardOpen(true)} className="btn btn-primary btn-lg">
            <PlusSquare className="size-5" />
            Daftarkan Kos Pertama Anda
          </button>
        )}
      </div>
    );
  }

  // Jika Sudah Punya Kos
  const isUnverified = boardingHouse.status === "UNVERIFIED";

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

  const totalRooms = metrics?.totalRooms || 0;
  const availableRooms = metrics?.availableRooms || 0;
  const occupiedRooms = Math.max(totalRooms - availableRooms, 0);
  const shownTiles = Math.min(totalRooms, MAX_TILES);
  // Ubin dibentuk dari angka kamar yang ada: terisi dulu, sisanya kosong.
  const tiles = Array.from({ length: shownTiles }, (_, i) => (i < occupiedRooms ? "occupied" : "available"));

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      {/* Banner UNVERIFIED */}
      {isUnverified && (
        <div className="mb-8 flex items-start gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 size-6 shrink-0 text-amber-700" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900">Menunggu Verifikasi Admin</h3>
            <p className="mt-1 text-sm text-amber-900">
              Kos Anda telah berhasil didaftarkan namun saat ini belum ditinjau oleh Admin. Anda tetap bisa mengatur
              kamar dan fasilitas, namun fitur publikasi website sementara ditahan hingga proses verifikasi selesai.
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">Selamat datang, {userName}</h1>
          <p className="mt-1 text-gray-600">Berikut ringkasan operasional kos Anda hari ini.</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2">
          <Calendar className="size-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Ringkasan angka: satu panel, enam sel */}
      <dl className="card mb-8 grid grid-cols-2 divide-gray-200 md:grid-cols-3 lg:grid-cols-6 lg:divide-x [&>div]:border-b [&>div]:border-gray-200 lg:[&>div]:border-b-0">
        <div className="p-4">
          <dt className="text-xs font-semibold text-gray-600">Tingkat Hunian</dt>
          <dd className="mt-1 font-mono text-2xl font-bold text-primary">{metrics?.occupancyRate || 0}%</dd>
        </div>
        <div className="p-4">
          <dt className="text-xs font-semibold text-gray-600">Pendapatan Bulan Ini</dt>
          <dd className="mt-1 font-mono text-lg font-bold text-gray-900">{formatRupiah(metrics?.monthlyRevenue || 0)}</dd>
        </div>
        <div className="p-4">
          <dt className="text-xs font-semibold text-gray-600">Kamar Tersedia</dt>
          <dd className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-gray-900">{availableRooms}</span>
            <span className="text-xs text-gray-600">/ {totalRooms} total</span>
          </dd>
        </div>
        <div className="bg-primary-soft p-4">
          <dt className="text-xs font-bold text-primary">Booking Menunggu</dt>
          <dd className="mt-1 font-mono text-2xl font-bold text-gray-900">{metrics?.pendingBookings || 0}</dd>
          <Link
            href="/dashboard/bookings"
            className="mt-1 inline-flex items-center text-xs font-bold text-primary hover:underline"
          >
            Tinjau semua <ArrowRight className="ml-1 size-3" />
          </Link>
        </div>
        <div className="p-4">
          <dt className="text-xs font-semibold text-gray-600">Penghuni Aktif</dt>
          <dd className="mt-1 font-mono text-2xl font-bold text-gray-900">{metrics?.newTenants || 0}</dd>
        </div>
        <div className="p-4">
          <dt className="text-xs font-semibold text-gray-600">Est. Profit (85%)</dt>
          <dd className="mt-1 font-mono text-lg font-bold text-gray-900">
            {formatRupiah((metrics?.monthlyRevenue || 0) * 0.85)}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Kolom kiri (2/3) */}
        <div className={`space-y-8 ${role === "staff" ? "lg:col-span-3" : "lg:col-span-2"}`}>
          <section className="card p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-gray-900">Denah Hunian</h2>
                <p className="mt-1 text-sm text-gray-600">Satu ubin mewakili satu kamar.</p>
              </div>
              <StatusLegend counts={{ occupied: occupiedRooms, available: availableRooms }} />
            </div>

            {shownTiles > 0 ? (
              <>
                <div className="grid grid-cols-6 gap-2 rounded-xl bg-gray-200 p-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
                  {tiles.map((status, i) => (
                    <span key={i} aria-hidden className={`tile tile-${status}`} />
                  ))}
                </div>
                {totalRooms > MAX_TILES && (
                  <p className="mt-2 text-xs text-gray-600">
                    Menampilkan {MAX_TILES} dari {totalRooms} kamar.
                  </p>
                )}
                <p className="sr-only">
                  {occupiedRooms} kamar terisi dan {availableRooms} kamar kosong dari {totalRooms} kamar.
                </p>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <BedDouble className="mx-auto mb-3 size-8 text-gray-500" />
                <p className="font-semibold text-gray-900">Belum ada kamar</p>
                <p className="mt-1 text-sm text-gray-600">Tambahkan kamar pertama agar denah hunian muncul di sini.</p>
                <Link href="/dashboard/rooms" className="btn btn-primary mt-4">
                  Kelola Kamar
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Kolom kanan (1/3), hanya pemilik */}
        {role !== "staff" && (
          <div>
            <section className="card border-primary-tint bg-primary-soft p-6">
              <h2 className="mb-2 font-display text-xl font-bold text-gray-900">Publikasikan Website Kos</h2>
              <p className="mb-5 text-sm leading-relaxed text-gray-700">
                Buat halaman promosi kos yang menarik dan profesional. Tanpa perlu keahlian coding.
              </p>
              {isUnverified ? (
                <>
                  <button disabled className="btn btn-primary w-full">
                    <Home className="size-4" />
                    Buka Kustomisasi Website
                  </button>
                  <p className="mt-2 text-center text-xs text-gray-600">Tersedia setelah akun Anda diverifikasi</p>
                </>
              ) : (
                <Link href="/dashboard/website-builder" className="btn btn-primary w-full">
                  <Home className="size-4" />
                  Buka Kustomisasi Website
                </Link>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
