"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  BedDouble,
  CalendarCheck,
  Users,
  CreditCard,
  UserCog,
  MonitorSmartphone,
  Settings,
  Wrench,
  LineChart
} from "lucide-react";

export function Sidebar({ hasBoardingHouse = true, role = "owner" }: { hasBoardingHouse?: boolean, role?: string }) {
  const pathname = usePathname();

  // Definisikan Navigasi berdasarkan Use Case Diagram + Penambahan Website Builder
  const allNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, showFor: ["owner", "staff"] },
    
    // Khusus Pemilik (Berdasarkan Use Case Kiri)
    { name: "Daftarkan Kos", href: "/dashboard/houses", icon: Home, showFor: ["owner"] },
    { name: "Kelola Data Kamar & Harga", href: "/dashboard/rooms", icon: BedDouble, showFor: ["owner"] },
    { name: "Lihat Laporan Keuangan", href: "/dashboard/financial-report", icon: LineChart, showFor: ["owner"] },
    { name: "Kelola Akun Staf", href: "/dashboard/staff", icon: UserCog, showFor: ["owner"] },
    
    // Khusus Pengelola (Berdasarkan Use Case Tengah)
    { name: "Kelola Data Kamar & Harga", href: "/dashboard/staff-rooms", icon: BedDouble, showFor: ["staff"] },
    { name: "Kelola Data Penyewa Aktif", href: "/dashboard/renters-active", icon: Users, showFor: ["staff"] },
    { name: "Tindak Lanjut Komplain", href: "/dashboard/maintenance", icon: Wrench, showFor: ["staff"] },
    { name: "Verifikasi Pembayaran", href: "/dashboard/payments", icon: CreditCard, showFor: ["staff"] },
    { name: "Pengajuan Booking", href: "/dashboard/bookings", icon: CalendarCheck, showFor: ["staff"] }, // Asumsi tambahan untuk proses sewa
  ];

  // Filter navigasi berdasarkan role
  const mainNavItems = allNavItems.filter(item => item.showFor.includes(role));

  return (
    <aside className="w-64 min-h-screen bg-[#f8f9fa] border-r border-gray-200 flex flex-col hidden md:flex">
      {/* Logo Area */}
      <div className="h-20 flex flex-col justify-center px-6 mb-4">
        <h1 className="text-xl font-bold text-[#3b23c6] leading-tight">PintuBerkah</h1>
        <span className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">Management Suite</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {hasBoardingHouse && mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                ? "bg-[#ede9fe] text-[#3b23c6]"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-[#3b23c6]" : "text-gray-500"}`} />
              {item.name}
            </Link>
          );
        })}

        {/* Website Builder Special Button (Khusus Owner / Nilai Jual SaaS) */}
        {hasBoardingHouse && role === "owner" && (
          <div className="pt-4 pb-2">
            <Link
              href="/dashboard/website-builder"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-[#ede9fe] text-[#3b23c6] hover:bg-[#ddd6fe] transition-colors"
            >
              <MonitorSmartphone className="w-5 h-5 text-[#3b23c6]" />
              Kustomisasi Website
            </Link>
          </div>
        )}
      </nav>

      {/* Footer Navigation */}
      <div className="p-3 mt-auto space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-500" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
