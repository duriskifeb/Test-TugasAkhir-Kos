"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { DollarSign, TrendingUp, Calendar, AlertCircle, BarChart3 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

// Nama bulan dalam Bahasa Indonesia
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Ags", "Sep", "Okt", "Nov", "Des",
];

export default function FinancialReportPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
    monthlyRevenue: Array(12).fill(0) as number[],
    occupiedRooms: 0,
    availableRooms: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Ambil semua tenant milik owner
        const { data: tenants } = await supabase
          .from("tenants")
          .select("id")
          .eq("owner_id", user.id);

        if (!tenants || tenants.length === 0) {
          setLoading(false);
          return;
        }

        const tenantIds = tenants.map((t) => t.id);

        // Ambil data payments (pendapatan sewa)
        const { data: payments } = await supabase
          .from("payments")
          .select("amount, status, paid_at, created_at")
          .in("tenant_id", tenantIds);

        // Ambil data bookings
        const { data: bookings } = await supabase
          .from("bookings")
          .select("status, created_at")
          .in("boarding_house_id", tenantIds);

        // Ambil data kamar
        const { data: rooms } = await supabase
          .from("rooms")
          .select("status")
          .in("boarding_house_id", tenantIds);

        // Hitung total revenue & breakdown bulanan dari payments
        let totalRevenue = 0;
        let paidCount = 0;
        let pendingCount = 0;
        const monthlyRevenue = Array(12).fill(0) as number[];

        if (payments) {
          payments.forEach((p) => {
            if (p.status === "paid") {              const amount = Number(p.amount || 0);
              totalRevenue += amount;
              paidCount++;
              // Kelompokkan per bulan berdasarkan paid_at
              const date = new Date(p.paid_at || p.created_at);
              const month = date.getMonth(); // 0-11
              monthlyRevenue[month] += amount;
            } else {
              pendingCount++;
            }
          });
        }

        // Hitung dari bookings juga jika payments kosong
        if (paidCount === 0 && bookings) {
          bookings.forEach((b) => {
            if (b.status === "approved" || (b.status as string) === "verified") {
              paidCount++;
            } else if (b.status === "pending") {
              pendingCount++;
            }
          });
        }

        // Hitung status kamar
        const occupiedRooms = rooms?.filter((r) => r.status === "occupied").length || 0;
        const availableRooms = rooms?.filter((r) => r.status === "available").length || 0;

        setReportData({
          totalRevenue,
          paidCount,
          pendingCount,
          monthlyRevenue,
          occupiedRooms,
          availableRooms,
        });
      } catch (error) {
        console.error("Gagal menarik data laporan:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  // Data untuk Bar Chart - Pendapatan Bulanan
  const barChartData = {
    labels: MONTH_NAMES,
    datasets: [
      {
        label: "Pendapatan (Rp)",
        data: reportData.monthlyRevenue,
        backgroundColor: "rgba(59, 35, 198, 0.75)",
        borderColor: "#3b23c6",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${formatRupiah(ctx.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: {
          callback: (value: any) => {
            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}jt`;
            if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
            return value;
          },
        },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // Data untuk Line Chart - Tren Pendapatan
  const lineChartData = {
    labels: MONTH_NAMES,
    datasets: [
      {
        label: "Tren Pendapatan",
        data: reportData.monthlyRevenue,
        borderColor: "#3b23c6",
        backgroundColor: "rgba(59, 35, 198, 0.08)",
        borderWidth: 2.5,
        pointBackgroundColor: "#3b23c6",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${formatRupiah(ctx.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: {
          callback: (value: any) => {
            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}jt`;
            if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
            return value;
          },
        },
      },
      x: { grid: { display: false } },
    },
  };

  // Data untuk Doughnut Chart - Status Kamar
  const doughnutData = {
    labels: ["Kamar Terisi", "Kamar Tersedia"],
    datasets: [
      {
        data: [reportData.occupiedRooms, reportData.availableRooms],
        backgroundColor: ["#3b23c6", "#e0e7ff"],
        borderColor: ["#3b23c6", "#c7d2fe"],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 16,
          font: { size: 12, weight: "bold" as const },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">
        Memuat data laporan keuangan...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#3b23c6]" />
          Laporan Keuangan
        </h1>
        <p className="text-gray-500 mt-1">
          Ringkasan pendapatan dan analitik dari seluruh cabang kos Anda.
        </p>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Pendapatan */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatRupiah(reportData.totalRevenue)}
          </h3>
          <p className="text-xs text-gray-400 mt-1">Akumulasi semua cabang</p>
        </div>

        {/* Transaksi Lunas */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Transaksi Lunas</p>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {reportData.paidCount} <span className="text-base font-normal text-gray-400">pembayaran</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">Status: paid / verified</p>
        </div>

        {/* Menunggu Pembayaran */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Menunggu Pembayaran</p>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {reportData.pendingCount} <span className="text-base font-normal text-gray-400">transaksi</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">Belum lunas / menunggu verifikasi</p>
        </div>
      </div>

      {/* Baris Chart Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Bar Chart - Pendapatan per Bulan */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Pendapatan Per Bulan
          </h2>
          <p className="text-xs text-gray-400 mb-5">Distribusi pendapatan dalam setahun penuh</p>
          <div className="h-64">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart - Status Kamar */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 flex flex-col">
          <h2 className="text-base font-bold text-gray-900 mb-1">Tingkat Hunian</h2>
          <p className="text-xs text-gray-400 mb-4">Status kamar seluruh cabang</p>
          <div className="flex-1 flex items-center justify-center" style={{ minHeight: "200px" }}>
            {(reportData.occupiedRooms + reportData.availableRooms) > 0 ? (
              <div className="w-full h-52">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center">Belum ada data kamar</p>
            )}
          </div>
          {(reportData.occupiedRooms + reportData.availableRooms) > 0 && (
            <div className="mt-4 text-center">
              <span className="text-2xl font-bold text-[#3b23c6]">
                {Math.round(
                  (reportData.occupiedRooms /
                    (reportData.occupiedRooms + reportData.availableRooms)) *
                    100
                )}%
              </span>
              <p className="text-xs text-gray-400 mt-1">Tingkat Hunian</p>
            </div>
          )}
        </div>
      </div>

      {/* Line Chart - Tren Pendapatan */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">Tren Pendapatan Tahunan</h2>
        <p className="text-xs text-gray-400 mb-5">Pola pertumbuhan pendapatan sepanjang tahun</p>
        <div className="h-64">
          <Line data={lineChartData} options={lineChartOptions as any} />
        </div>
      </div>
    </div>
  );
}
