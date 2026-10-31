import { createClient } from "@/lib/supabase/server";
import { Users, Home, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardOverview() {
  const supabase = await createClient();

  // 1. Fetch statistics
  const { count: totalTenants } = await supabase
    .from("tenants")
    .select("*", { count: "exact", head: true });

  const { count: verifiedTenants } = await supabase
    .from("tenants")
    .select("*", { count: "exact", head: true })
    .eq("status", "VERIFIED");

  const { count: unverifiedTenants } = await supabase
    .from("tenants")
    .select("*", { count: "exact", head: true })
    .eq("status", "UNVERIFIED");

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "owner");

  // 2. Fetch latest 5 registrations
  const { data: latestTenants } = await supabase
    .from("tenants")
    .select(
      `
      id,
      name,
      status,
      created_at,
      profiles!tenants_owner_id_fkey (full_name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  // Growth Analytics (Dummy data based on total tenants)
  const growthData = [
    { month: "Apr", value: Math.floor((totalTenants || 0) * 0.1) },
    { month: "Mei", value: Math.floor((totalTenants || 0) * 0.2) },
    { month: "Jun", value: Math.floor((totalTenants || 0) * 0.4) },
    { month: "Jul", value: Math.floor((totalTenants || 0) * 0.6) },
    { month: "Ags", value: Math.floor((totalTenants || 0) * 0.8) },
    { month: "Sep", value: totalTenants || 0 },
  ];

  const stats = [
    {
      name: "Total Pemilik Kos",
      value: totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Total Kos (Tenant)",
      value: totalTenants || 0,
      icon: Home,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      name: "Kos Terverifikasi",
      value: verifiedTenants || 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      name: "Menunggu Verifikasi",
      value: unverifiedTenants || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ringkasan Sistem</h1>
        <p className="text-gray-500 mt-1">
          Pantau statistik pendaftaran dan stabilitas platform Anda.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                {stat.name}
              </h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri (Grafik Analitik) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Analitik Pertumbuhan Kos Terdaftar
            </h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {growthData.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center w-full gap-2"
                >
                  <div className="w-full bg-gray-100 rounded-t-sm flex items-end justify-center relative group">
                    <div
                      className="w-full bg-primary rounded-t-sm transition-all duration-500 hover:bg-primary-hover"
                      style={{
                        height: `${Math.max(item.value > 0 ? (item.value / growthData[growthData.length - 1].value) * 100 : 5, 5)}%`,
                        minHeight: "20px",
                      }}
                    >
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-primary text-white text-xs py-1 px-2 rounded transition-opacity shadow-lg">
                        {item.value} Kos
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Kanan (Pendaftar Terbaru) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">
                Pendaftaran Terbaru
              </h2>
              <Link
                href="/admin/verifikasi"
                className="text-sm text-gray-900 font-medium hover:underline"
              >
                Lihat Semua &rarr;
              </Link>
            </div>
            <div className="p-0">
              {latestTenants && latestTenants.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {latestTenants.map((tenant: any) => (
                    <li
                      key={tenant.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {tenant.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Oleh: {tenant.profiles?.full_name || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {new Date(tenant.created_at).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short" },
                          )}
                        </span>
                        {tenant.status === "VERIFIED" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700">
                            Unverified
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Belum ada aktivitas pendaftaran.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
