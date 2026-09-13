"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Fingerprint, 
  LayoutDashboard, 
  ShieldCheck, 
  Users
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Validasi Kos", href: "/admin/verifikasi", icon: ShieldCheck },
    { name: "Manajemen Pengguna", href: "/admin/users", icon: Users },
  ];

  return (
    <aside className="w-64 border-r border-gray-100 bg-white flex flex-col hidden md:flex shrink-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
            <Fingerprint className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-900 tracking-tight leading-none">Super Admin</span>
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Platform</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="mb-4 px-3">
          <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Menu Utama</span>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${isActive 
                  ? "bg-black text-white shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-black"}`} />
              {item.name}
              
              {isActive && (
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-black rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
