"use client";

import { Search, Bell, HelpCircle, LogOut, ChevronDown, Home } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Topbar({ 
  isAdmin = false,
  tenants = [],
  currentTenantId = null
}: { 
  isAdmin?: boolean;
  tenants?: any[];
  currentTenantId?: string | null;
}) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tenantDropdownRef = useRef<HTMLDivElement>(null);
  
  const [userProfile, setUserProfile] = useState<{name: string, email: string, initials: string} | null>(null);

  const activeTenant = tenants.find(t => t.id === currentTenantId);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || "Pemilik Kos";
        const email = user.email || "";
        // Ambil inisial (1-2 huruf pertama)
        const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
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
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-50">
      
      <div className="flex flex-1 items-center gap-4">
        {/* Tenant Switcher (Multi-Cabang) */}
        {!isAdmin && tenants.length > 0 && (
          <div className="relative" ref={tenantDropdownRef}>
            <button 
              onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded flex items-center justify-center">
                <Home className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold text-gray-800 max-w-[150px] truncate">
                {activeTenant?.name || "Pilih Cabang"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isTenantDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 pb-2 mb-2 border-b border-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Cabang Kos Anda
                </div>
                <div className="max-h-[300px] overflow-y-auto px-2">
                  {tenants.map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => handleSwitchTenant(tenant.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm transition-colors ${
                        tenant.id === currentTenantId 
                          ? "bg-indigo-50 text-indigo-700 font-semibold" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Home className="w-4 h-4 opacity-70" />
                      <div className="flex-1 truncate">
                        {tenant.name}
                        {tenant.status === 'UNVERIFIED' && (
                          <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                            Menunggu
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-3 pt-2 mt-2 border-t border-gray-50">
                  <button 
                    onClick={() => {
                      setIsTenantDropdownOpen(false);
                      router.push("/dashboard/houses");
                    }}
                    className="w-full text-center text-sm font-medium text-[#3b23c6] hover:text-[#2a1796] py-1"
                  >
                    + Kelola / Tambah Cabang
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search properties, tenants, or invoices..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f3f4f6] border-transparent rounded-full text-sm focus:border-[#3b23c6] focus:bg-white focus:ring-1 focus:ring-[#3b23c6] outline-none transition-all placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 ml-4">
        {/* Icons */}
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-900 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-900 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Support Text */}
        <span className="text-sm font-medium text-gray-700 hidden lg:block cursor-pointer hover:text-black">
          Support
        </span>

        {/* Upgrade Button */}
        {!isAdmin && (
          <button className="hidden sm:block bg-[#3b23c6] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#2a1796] transition-colors shadow-sm">
            Upgrade
          </button>
        )}

        {/* Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3b23c6] focus:ring-offset-2 hover:border-gray-300 transition-colors"
          >
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
              {userProfile?.initials || "U"}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{userProfile?.name || "Loading..."}</p>
                <p className="text-xs text-gray-500 truncate">{userProfile?.email || ""}</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
