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
  LineChart,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

type NavItem = { name: string; href: string; icon: LucideIcon; showFor: string[] };

// Navigasi mengikuti Use Case Diagram + Website Builder.
const allNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, showFor: ["owner", "staff"] },

  // Khusus Pemilik
  { name: "Daftarkan Kos", href: "/dashboard/houses", icon: Home, showFor: ["owner"] },
  { name: "Kelola Data Kamar & Harga", href: "/dashboard/rooms", icon: BedDouble, showFor: ["owner"] },
  { name: "Lihat Laporan Keuangan", href: "/dashboard/financial-report", icon: LineChart, showFor: ["owner"] },
  { name: "Kelola Akun Staf", href: "/dashboard/staff", icon: UserCog, showFor: ["owner"] },

  // Khusus Pengelola
  { name: "Kelola Data Kamar & Harga", href: "/dashboard/staff-rooms", icon: BedDouble, showFor: ["staff"] },
  { name: "Kelola Data Penyewa Aktif", href: "/dashboard/renters-active", icon: Users, showFor: ["staff"] },
  { name: "Tindak Lanjut Komplain", href: "/dashboard/maintenance", icon: Wrench, showFor: ["staff"] },
  { name: "Verifikasi Pembayaran", href: "/dashboard/payments", icon: CreditCard, showFor: ["staff"] },
  { name: "Pengajuan Booking", href: "/dashboard/bookings", icon: CalendarCheck, showFor: ["staff"] },
];

const builderItem: NavItem = {
  name: "Kustomisasi Website",
  href: "/dashboard/website-builder",
  icon: MonitorSmartphone,
  showFor: ["owner"],
};

const settingsItem: NavItem = {
  name: "Pengaturan",
  href: "/dashboard/settings",
  icon: Settings,
  showFor: ["owner", "staff"],
};

function itemsFor(role: string) {
  const main = allNavItems.filter((item) => item.showFor.includes(role));
  const builder = role === "owner" ? [builderItem] : [];
  return { main, builder };
}

// Sebelum kos terdaftar, menu tetap terlihat tetapi tidak bisa dibuka.
const lockedHint = "Daftarkan kos terlebih dahulu";

export function Sidebar({
  hasBoardingHouse = true,
  role = "owner",
}: {
  hasBoardingHouse?: boolean;
  role?: string;
}) {
  const pathname = usePathname();
  const locked = !hasBoardingHouse;
  const { main, builder } = itemsFor(role);

  // Penyewa dan peran lain tidak punya menu dashboard; jangan tampilkan sidebar kosong.
  if (role !== "owner" && role !== "staff") return null;

  const link = (item: NavItem) => {
    const isActive = pathname === item.href;

    if (locked) {
      const isCurrent = item.href === "/dashboard";
      return (
        <div
          key={item.name + item.href}
          aria-disabled="true"
          aria-current={isCurrent ? "page" : undefined}
          title={lockedHint}
          className={`flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium select-none ${
            isCurrent ? "bg-primary-soft text-primary" : "text-gray-500"
          }`}
        >
          <item.icon className={`size-[18px] shrink-0 ${isCurrent ? "" : "opacity-60"}`} />
          <span className="flex-1">{item.name}</span>
          {isCurrent && <span aria-hidden className="size-2 rotate-45 rounded-[2px] bg-primary" />}
        </div>
      );
    }

    return (
      <Link
        key={item.name + item.href}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-primary-soft text-primary"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <item.icon className="size-[18px] shrink-0" />
        <span className="flex-1">{item.name}</span>
        {isActive && <span aria-hidden className="size-2 rotate-45 rounded-[2px] bg-primary" />}
      </Link>
    );
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="flex h-16 items-center border-b border-gray-200 px-5">
        <Logo href="/dashboard" asLink={!locked} />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {main.map(link)}
        {builder.length > 0 && (
          <div className="mt-3 border-t border-gray-100 pt-3">{builder.map(link)}</div>
        )}
      </nav>

      <div className="border-t border-gray-100 p-3">{link(settingsItem)}</div>
    </aside>
  );
}

/** Navigasi horizontal untuk layar kecil, menggantikan sidebar yang disembunyikan di bawah md. */
export function MobileNav({
  hasBoardingHouse = true,
  role = "owner",
}: {
  hasBoardingHouse?: boolean;
  role?: string;
}) {
  const pathname = usePathname();
  const locked = !hasBoardingHouse;
  const { main, builder } = itemsFor(role);
  const items = [...main, ...builder, settingsItem];

  if (role !== "owner" && role !== "staff") return null;

  return (
    <nav
      aria-label="Menu utama"
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 md:hidden"
    >
      {items.map((item) => {
        const isActive = pathname === item.href;

        if (locked) {
          const isCurrent = item.href === "/dashboard";
          return (
            <span
              key={item.name + item.href}
              aria-disabled="true"
              aria-current={isCurrent ? "page" : undefined}
              title={lockedHint}
              className={`flex shrink-0 cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium select-none ${
                isCurrent ? "bg-primary-soft text-primary" : "text-gray-500"
              }`}
            >
              <item.icon className={`size-4 ${isCurrent ? "" : "opacity-60"}`} />
              {item.name}
            </span>
          );
        }

        return (
          <Link
            key={item.name + item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              isActive ? "bg-primary-soft text-primary" : "text-gray-600"
            }`}
          >
            <item.icon className="size-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
