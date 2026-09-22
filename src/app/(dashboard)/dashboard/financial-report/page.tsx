"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DollarSign, TrendingUp, Calendar, AlertCircle } from "lucide-react";

export default function FinancialReportPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    paidBookings: 0,
    pendingBookings: 0
  });
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        // Mengambil data pengguna yang login
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Mendapatkan tenant_id (kos) milik owner ini
        const { data: tenants } = await supabase
          .from("tenants")
          .select("id")
          .eq("owner_id", user.id);

        if (!tenants || tenants.length === 0) {
            setLoading(false);
            return;
        }

        const tenantIds = tenants.map(t => t.id);

        // Menarik data booking/pembayaran yang terkait dengan kos milik owner
        // Asumsi struktur database bookings: status (paid/pending), total_amount, tenant_id
        const { data: bookings } = await supabase
          .from("bookings")
          .select("status, total_amount, tenant_id")
          .in("tenant_id", tenantIds);

        if (bookings) {
          let revenue = 0;
          let paid = 0;
          let pending = 0;

          bookings.forEach(b => {
            if (b.status === "paid" || b.status === "verified") {
              revenue += Number(b.total_amount || 0);
              paid += 1;
            } else {
              pending += 1;
            }
          });

          setReportData({
            totalRevenue: revenue,
            paidBookings: paid,
            pendingBookings: pending
          });
        }
      } catch (error) {
        console.error("Gagal menarik data laporan:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Memuat data laporan keuangan...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
        <p className="text-gray-500 mt-1">Ringkasan pendapatan dari seluruh cabang kos Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card Total Pendapatan */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pendapatan (Bersih)</p>
              <h3 className="text-2xl font-bold text-gray-900">
                Rp {reportData.totalRevenue.toLocaleString("id-ID")}
              </h3>
            </div>
          </div>
        </div>

        {/* Card Pembayaran Selesai */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Transaksi Lunas</p>
              <h3 className="text-2xl font-bold text-gray-900">{reportData.paidBookings} Booking</h3>
            </div>
          </div>
        </div>

        {/* Card Menunggu Pembayaran */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Menunggu Pembayaran</p>
              <h3 className="text-2xl font-bold text-gray-900">{reportData.pendingBookings} Booking</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Area Chart/Tabel Dummy untuk Estetika UI */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" /> Riwayat Transaksi Bulan Ini
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
             <p className="text-gray-400 text-sm">Visualisasi grafik akan ditampilkan di sini.</p>
          </div>
      </div>
    </div>
  );
}