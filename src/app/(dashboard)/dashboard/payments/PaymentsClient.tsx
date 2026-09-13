"use client";

import { useState } from "react";
import { Banknote, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { verifyPayment } from "./actions";

export default function PaymentsClient({ initialPayments, renters, tenantId }: { initialPayments: any[], renters: any[], tenantId: string }) {
  const [payments, setPayments] = useState(initialPayments);
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === 'paid') {
      return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200"><CheckCircle className="w-3 h-3" /> Lunas</span>;
    }
    
    const isOverdue = new Date(dueDate) < new Date();
    if (isOverdue) {
      return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200"><AlertCircle className="w-3 h-3" /> Jatuh Tempo</span>;
    }

    return <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-200"><Clock className="w-3 h-3" /> Belum Lunas</span>;
  };

  const handleVerify = async (id: string) => {
    if (!confirm("Verifikasi bahwa tagihan ini telah LUNAS?")) return;
    const res = await verifyPayment(id);
    if (res.success) {
      window.location.reload();
    }
  };

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalUnpaid = payments.filter(p => p.status === 'unpaid').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Tagihan & Pembayaran</h1>
          <p className="text-gray-500 mt-1">
            Tagihan sewa dibuat otomatis saat booking disetujui. Verifikasi pembayaran dari penghuni kos di sini.
          </p>
        </div>
        <a
          href="/dashboard/bookings"
          className="flex items-center gap-2 px-4 py-2 bg-[#3b23c6] text-white rounded-lg font-medium hover:bg-[#321ca8] transition-colors text-sm"
        >
          Tinjau Booking
        </a>
      </div>

      {/* Info Banner: Alur Tagihan */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
        <span className="text-indigo-500 text-xl mt-0.5">ℹ️</span>
        <div className="text-sm text-indigo-800">
          <strong>Alur Tagihan Otomatis:</strong> Tagihan sewa akan otomatis terbuat saat Anda menyetujui (Approve) pengajuan booking dari calon penyewa. Anda hanya perlu memverifikasi status lunas setelah penyewa melakukan pembayaran.
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Total Terbayar Lunas</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalPaid)}</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Total Belum Dibayar</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalUnpaid)}</div>
          </div>
        </div>
      </div>

      {/* Tabel Tagihan */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center mt-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Banknote className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Tagihan</h3>
          <p className="text-gray-500 max-w-md">
            Tagihan akan muncul otomatis setelah pengajuan booking dari calon penyewa disetujui. Tinjau pengajuan booking terlebih dahulu.
          </p>
          <a href="/dashboard/bookings" className="mt-4 px-5 py-2.5 bg-[#3b23c6] text-white text-sm font-bold rounded-lg hover:bg-[#321ca8] transition-colors">
            Tinjau Booking
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">Tanggal Tempo</th>
                <th className="p-4">Penghuni / Kamar</th>
                <th className="p-4">Nominal</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm text-gray-600 font-medium">
                    {new Date(p.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{p.renters?.full_name || "Tidak Diketahui"}</div>
                    <div className="text-xs text-gray-500">{p.renters?.rooms?.name || "Kamar ?"}</div>
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(p.status, p.due_date)}
                    {p.status === 'paid' && p.paid_at && (
                      <div className="text-[10px] text-gray-400 mt-1">
                        Tgl bayar: {new Date(p.paid_at).toLocaleDateString('id-ID')}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {p.status === 'unpaid' ? (
                      <button
                        onClick={() => handleVerify(p.id)}
                        className="text-xs bg-green-50 text-green-700 border border-green-200 font-bold rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors"
                      >
                        Verifikasi Lunas
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
