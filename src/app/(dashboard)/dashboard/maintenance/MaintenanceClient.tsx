"use client";

import { useState } from "react";
import { Wrench, Plus, AlertTriangle, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { createMaintenanceReport, updateMaintenanceStatus } from "./actions";

interface Room {
  id: string;
  name: string;
}

interface Report {
  id: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  rooms?: { name: string } | null;
}

export function MaintenanceClient({ initialReports, rooms }: { initialReports: Report[], rooms: Room[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200"><CheckCircle2 className="w-3 h-3" /> Selesai</span>;
      case "in_progress":
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200"><Clock className="w-3 h-3" /> Ditangani</span>;
      default:
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200"><AlertTriangle className="w-3 h-3" /> Baru/Terbuka</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">Prioritas Tinggi</span>;
      case "low":
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold uppercase">Prioritas Rendah</span>;
      default:
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase">Prioritas Sedang</span>;
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createMaintenanceReport(formData);
    if (res.success) {
      setIsModalOpen(false);
      window.location.reload();
    } else {
      alert("Gagal membuat laporan: " + res.error);
    }
    setIsLoading(false);
  }

  async function handleStatusUpdate(id: string, newStatus: string) {
    setUpdatingId(id);
    const formData = new FormData();
    formData.append("id", id);
    formData.append("status", newStatus);
    await updateMaintenanceStatus(formData);
    setUpdatingId(null);
    window.location.reload();
  }

  const openCount = initialReports.filter(r => r.status === "open").length;
  const inProgressCount = initialReports.filter(r => r.status === "in_progress").length;
  const resolvedCount = initialReports.filter(r => r.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pelaporan Keluhan & Maintenance</h1>
          <p className="text-gray-500 mt-1">
            Catat dan kelola laporan kerusakan fasilitas dari penghuni kos.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b23c6] text-white rounded-lg font-medium hover:bg-[#321ca8] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Laporan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <div>
            <p className="text-xs font-semibold text-red-700">Laporan Baru/Terbuka</p>
            <p className="text-2xl font-bold text-red-900">{openCount}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
          <Clock className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-xs font-semibold text-blue-700">Sedang Ditangani</p>
            <p className="text-2xl font-bold text-blue-900">{inProgressCount}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-xs font-semibold text-green-700">Selesai Ditangani</p>
            <p className="text-2xl font-bold text-green-900">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Tabel Laporan */}
      {initialReports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Laporan Keluhan</h3>
          <p className="text-gray-500 max-w-md">
            Tambahkan laporan kerusakan atau keluhan fasilitas dari penghuni untuk ditindaklanjuti.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">Tanggal</th>
                <th className="p-4">Kamar</th>
                <th className="p-4">Deskripsi Keluhan</th>
                <th className="p-4">Prioritas</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialReports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm text-gray-600 font-medium whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-sm font-semibold text-gray-800">
                    {r.rooms?.name || <span className="text-gray-400 font-normal italic">Area Umum</span>}
                  </td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs">
                    <p className="line-clamp-2">{r.description}</p>
                  </td>
                  <td className="p-4">
                    {getPriorityBadge(r.priority)}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(r.status)}
                    {r.resolved_at && (
                      <div className="text-[10px] text-gray-400 mt-1">
                        Selesai: {new Date(r.resolved_at).toLocaleDateString('id-ID')}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {updatingId === r.id ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-auto text-gray-400" />
                    ) : r.status === "open" ? (
                      <button
                        onClick={() => handleStatusUpdate(r.id, "in_progress")}
                        className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-bold rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors"
                      >
                        Tangani
                      </button>
                    ) : r.status === "in_progress" ? (
                      <button
                        onClick={() => handleStatusUpdate(r.id, "resolved")}
                        className="text-xs bg-green-50 text-green-700 border border-green-200 font-bold rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors"
                      >
                        Tandai Selesai
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

      {/* Modal Form Tambah Laporan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Tambah Laporan Keluhan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kamar (Opsional)</label>
                <select name="roomId" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6]">
                  <option value="">-- Area Umum / Tidak Spesifik --</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Keluhan / Kerusakan</label>
                <textarea
                  required
                  name="description"
                  rows={4}
                  placeholder="Contoh: Kipas angin di kamar 101 tidak berfungsi sejak tanggal 10 September..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prioritas</label>
                <select name="priority" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6]">
                  <option value="low">Rendah — Tidak mendesak</option>
                  <option value="medium" selected>Sedang — Perlu segera ditangani</option>
                  <option value="high">Tinggi — Mengganggu kenyamanan</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3b23c6] text-white rounded-xl font-medium hover:bg-[#321ca8] transition-colors disabled:opacity-70">
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
