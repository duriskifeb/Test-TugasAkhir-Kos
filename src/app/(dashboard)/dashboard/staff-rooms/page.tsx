"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BedDouble, Plus, Edit2, Trash2 } from "lucide-react";

// Modul Kamar Khusus Pengelola (Staf)
export default function StaffRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        // Dalam implementasi nyata, staf hanya bisa melihat kamar di kos tempat dia ditugaskan
        const { data, error } = await supabase.from("rooms").select(`
          id, name, price, status,
          tenants (name)
        `).order("created_at", { ascending: false });

        if (data) setRooms(data);
      } catch (err) {
        console.error("Gagal menarik data kamar:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Kamar (Akses Pengelola)</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau status dan ketersediaan kamar harian.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
           <div className="p-8 text-center text-gray-500 animate-pulse">Memuat data...</div>
        ) : rooms.length === 0 ? (
           <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <BedDouble className="w-12 h-12 mb-3 text-gray-300" />
              <p>Belum ada kamar yang terdaftar di kos ini.</p>
           </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Nama Kamar</th>
                <th className="px-6 py-4 font-medium">Cabang Kos</th>
                <th className="px-6 py-4 font-medium">Harga / Bulan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{room.name}</td>
                  <td className="px-6 py-4 text-gray-600">{room.tenants?.name || "-"}</td>
                  <td className="px-6 py-4 text-gray-600">Rp {Number(room.price).toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      room.status === 'available' ? 'bg-green-100 text-green-800' : 
                      room.status === 'occupied' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {room.status === 'available' ? 'Tersedia' : room.status === 'occupied' ? 'Terisi' : 'Maintenance'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {/* Staf mungkin hanya bisa melihat atau edit status, tidak bisa menghapus */}
                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Status">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}