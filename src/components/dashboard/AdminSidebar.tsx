"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const navItems = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Validasi Kos", href: "/admin/verifikasi", icon: ShieldCheck },
  { name: "Manajemen Pengguna", href: "/admin/users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
          <Logo href="/admin/dashboard" />
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold text-gray-500">Admin Platform</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
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
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav
        aria-label="Menu admin"
        className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 md:hidden"
      >
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              pathname === item.href ? "bg-primary-soft text-primary" : "text-gray-600"
            }`}
          >
            <item.icon className="size-4" />
            {item.name}
          </Link>
        ))}
      </nav>
    </>
  );
}
