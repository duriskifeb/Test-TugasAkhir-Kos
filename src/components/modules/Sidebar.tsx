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
  BarChart3,
  UserCog,
  MonitorSmartphone,
  Settings,
  HelpCircle,
  Wrench
} from "lucide-react";

const allNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Boarding Houses", href: "/dashboard/houses", icon: Home, adminOnly: true },
  { name: "Rooms", href: "/dashboard/rooms", icon: BedDouble },
  { name: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
  { name: "Tenants", href: "/dashboard/tenants", icon: Users },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Keluhan", href: "/dashboard/maintenance", icon: Wrench },
  { name: "Staff Management", href: "/dashboard/staff", icon: UserCog, adminOnly: true },
];

export function Sidebar({ hasBoardingHouse = true, role = "tenant" }: { hasBoardingHouse?: boolean, role?: string }) {
  const pathname = usePathname();

  // Filter navigasi berdasarkan role. "staff" tidak melihat menu adminOnly
  const mainNavItems = allNavItems.filter(item => {
    if (role === "staff" && item.adminOnly) return false;
    return true;
  });

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

        {/* Website Builder Special Button */}
        {hasBoardingHouse && role !== "staff" && (
          <div className="pt-4 pb-2">
            <Link
              href="/dashboard/website-builder"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-[#ede9fe] text-[#3b23c6] hover:bg-[#ddd6fe] transition-colors"
            >
              <MonitorSmartphone className="w-5 h-5 text-[#3b23c6]" />
              Website Builder
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
        <Link
          href="/dashboard/support"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-gray-500" />
          Support
        </Link>
      </div>
    </aside>
  );
}
