"use client";

import { useEffect, useState } from "react";
import { Check, X, BedDouble, Edit2, Loader2 } from "lucide-react";
import type { Database } from "@/types/database.types";
import { createClient } from "@/lib/supabase/client";
import { updateStaffRoomStatus } from "./actions";

type RoomStatus = Database["public"]["Enums"]["room_status"];

type StaffRoom = {
  id: string;
  name: string;
  price: number;
  status: RoomStatus;
  tenants: { name: string } | null;
};

const statusLabels: Record<RoomStatus, string> = {
  available: "Tersedia",
  occupied: "Terisi",
  maintenance: "Maintenance",
};

// Modul Kamar Khusus Pengelola (Staf)
export default function StaffRoomsPage() {
  const [rooms, setRooms] = useState<StaffRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<StaffRoom | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus>("available");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        const supabase = createClient();
        // Dalam implementasi nyata, staf hanya bisa melihat kamar di kos tempat dia ditugaskan
        const { data, error } = await supabase.from("rooms").select(`
          id, name, price, status,
          tenants (name)
        `).is("deleted_at", null).order("created_at", { ascending: false });

        if (error) {
          console.error("Gagal menarik data kamar:", error);
          return;
        }
        setRooms((data ?? []) as StaffRoom[]);
      } catch (err) {
        console.error("Gagal menarik data kamar:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  const openStatusEditor = (room: StaffRoom) => {
    setEditingRoom(room);
    setSelectedStatus(room.status);
    setSaveError(null);
  };

  const saveStatus = async () => {
    if (!editingRoom) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await updateStaffRoomStatus(editingRoom.id, selectedStatus);
      if (result.error) {
        setSaveError(result.error);
        return;
      }

      setRooms((currentRooms) =>
        currentRooms.map((room) =>
          room.id === editingRoom.id ? { ...room, status: selectedStatus } : room
        )
      );
      setEditingRoom(null);
    } catch (error) {
      console.error("Gagal menyimpan status kamar:", error);
      setSaveError("Terjadi kesalahan saat menyimpan status kamar.");
    } finally {
      setIsSaving(false);
    }
  };

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
                      {statusLabels[room.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openStatusEditor(room)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Status"
                      aria-label={`Edit status kamar ${room.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) setEditingRoom(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-room-status-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="edit-room-status-title" className="text-lg font-bold text-gray-900">
                  Edit Status Kamar
                </h2>
                <p className="mt-1 text-sm text-gray-500">{editingRoom.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                disabled={isSaving}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Tutup dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            <label htmlFor="room-status" className="mt-5 block text-sm font-medium text-gray-700">
              Status kamar
            </label>
            <select
              id="room-status"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as RoomStatus)}
              className="field mt-1"
              disabled={isSaving}
            >
              {(Object.entries(statusLabels) as [RoomStatus, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {saveError && (
              <p role="alert" className="mt-3 text-sm text-red-600">{saveError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                disabled={isSaving}
                className="btn btn-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveStatus}
                disabled={isSaving || selectedStatus === editingRoom.status}
                className="btn btn-primary"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}