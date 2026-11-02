"use client";

import { LogOut, ChevronDown, Home } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Topbar({
  isAdmin = false,
  tenants = [],
  currentTenantId = null,
  role = "owner",
}: {
  isAdmin?: boolean;
  tenants?: any[];
  currentTenantId?: string | null;
  role?: string;
}) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const tenantDropdownRef = useRef<HTMLDivElement>(null);

  const [userProfile, setUserProfile] = useState<{ name: string; email: string; initials: string } | null>(null);

  const activeTenant = tenants.find((t) => t.id === currentTenantId);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || "Pemilik Kos";
        const email = user.email || "";
        // Ambil inisial (1-2 huruf pertama)
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        setUserProfile({ name, email, initials });
      }
    }
    loadUser();
  }, []);

  // Menutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (tenantDropdownRef.current && !tenantDropdownRef.current.contains(event.target as Node)) {
        setIsTenantDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSwitchTenant = (tenantId: string) => {
    document.cookie = `active_tenant_id=${tenantId}; path=/`;
    setIsTenantDropdownOpen(false);
    router.refresh(); // Refresh halaman agar layout mengambil tenant baru
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-4">
        {/* Tampilan Nama Kos Khusus Staf/Pengelola (Statis, 1 Kos yang Ditugaskan) */}
        {!isAdmin && tenants.length > 0 && role === "staff" && (
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 select-none">
            <span className="flex size-6 items-center justify-center rounded bg-primary-soft text-primary">
              <Home className="size-3.5" />
            </span>
            <span className="max-w-[150px] truncate text-sm font-semibold text-gray-800 sm:max-w-[240px]">
              {activeTenant?.name || "Kos"}
            </span>
          </div>
        )}

        {/* Tenant Switcher Dropdown (Khusus Pemilik Kos: Multi-Cabang) */}
        {!isAdmin && tenants.length > 0 && role !== "staff" && (
          <div className="relative" ref={tenantDropdownRef}>
            <button
              onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
              aria-haspopup="listbox"
              aria-expanded={isTenantDropdownOpen}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
            >
              <span className="flex size-6 items-center justify-center rounded bg-primary-soft text-primary">
                <Home className="size-3.5" />
              </span>
              <span className="max-w-[150px] truncate text-sm font-semibold text-gray-800 sm:max-w-[220px]">
                {activeTenant?.name || "Pilih Cabang"}
              </span>
              <ChevronDown className="size-4 text-gray-500" />
            </button>

            {isTenantDropdownOpen && (
              <div className="absolute left-0 z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white py-2 shadow-pop">
                <div className="mb-2 border-b border-gray-100 px-3 pb-2 text-xs font-semibold text-gray-500">
                  Cabang Kos Anda
                </div>
                <div className="max-h-[300px] overflow-y-auto px-2">
                  {tenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => handleSwitchTenant(tenant.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        tenant.id === currentTenantId
                          ? "bg-primary-soft font-semibold text-primary"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Home className="size-4 opacity-70" />
                      <div className="flex-1 truncate">
                        {tenant.name}
                        {tenant.status === "UNVERIFIED" && (
                          <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                            Menunggu
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-2 border-t border-gray-100 px-3 pt-2">
                  <button
                    onClick={() => {
                      setIsTenantDropdownOpen(false);
                      router.push("/dashboard/houses");
                    }}
                    className="w-full py-1 text-center text-sm font-medium text-primary hover:text-primary-hover"
                  >
                    + Kelola / Tambah Cabang
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isAdmin && <span className="text-sm font-semibold text-gray-700">Admin Platform</span>}
      </div>

      {/* Avatar Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-label="Menu akun"
          aria-haspopup="menu"
          aria-expanded={isDropdownOpen}
          className="flex size-9 items-center justify-center rounded-full bg-primary-tint text-sm font-bold text-primary transition-colors hover:bg-blue-200"
        >
          {userProfile?.initials || "U"}
        </button>

        {isDropdownOpen && (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-pop"
          >
            <div className="border-b border-gray-100 px-4 py-2">
              <p className="truncate text-sm font-semibold text-gray-900">{userProfile?.name || "Memuat..."}</p>
              <p className="truncate text-xs text-gray-500">{userProfile?.email || ""}</p>
            </div>
            <div className="py-1">
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-50"
              >
                <LogOut className="size-4" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
