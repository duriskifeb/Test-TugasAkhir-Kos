"use client";

import { useState } from "react";
import { Loader2, Plus, Save } from "lucide-react";

type RoomFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean } | undefined>;
  submitLabel: string;
  room?: {
    id: string;
    name: string;
    price: number;
    status: string;
    facilities: unknown;
    room_type?: string | null;
    tenant_type?: string | null;
    size_length?: number | null;
    size_width?: number | null;
  };
};

const sizeOptions = Array.from({ length: 15 }, (_, i) => 3 + i * 0.5);

// Form kamar yang dipakai bersama halaman tambah dan halaman ubah.
export function RoomForm({ action, submitLabel, room }: RoomFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Facilities state
  const [facilities, setFacilities] = useState<string[]>(
    Array.isArray(room?.facilities) ? (room.facilities as string[]) : [],
  );
  const [newFacility, setNewFacility] = useState("");

  const handleAddFacility = () => {
    if (newFacility.trim() && !facilities.includes(newFacility.trim())) {
      setFacilities([...facilities, newFacility.trim()]);
      setNewFacility("");
    }
  };

  const handleRemoveFacility = (fac: string) => {
    setFacilities(facilities.filter((f) => f !== fac));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("facilities", JSON.stringify(facilities));

    try {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success) {
        window.location.href = "/dashboard/rooms";
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem.");
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {room && <input type="hidden" name="id" value={room.id} />}

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="room-name" className="mb-2 block text-sm font-bold text-gray-700">
              Nama / Tipe Kamar <span className="text-red-500">*</span>
            </label>
            <input
              id="room-name"
              type="text"
              name="name"
              defaultValue={room?.name}
              placeholder="Contoh: Kamar VIP A, Standard Room"
              required
              className="field"
            />
          </div>

          <div>
            <label htmlFor="room-price" className="mb-2 block text-sm font-bold text-gray-700">
              Harga per Bulan (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              id="room-price"
              type="number"
              name="price"
              defaultValue={room?.price}
              placeholder="1500000"
              required
              className="field"
            />
          </div>

          <div>
            <label htmlFor="room-status" className="mb-2 block text-sm font-bold text-gray-700">
              Status Ketersediaan <span className="text-red-500">*</span>
            </label>
            <select id="room-status" name="status" defaultValue={room?.status ?? "available"} className="field appearance-none">
              <option value="available">Tersedia (Bisa Disewa)</option>
              <option value="occupied">Terisi (Sudah Disewa)</option>
              <option value="maintenance">Perbaikan (Maintenance)</option>
            </select>
          </div>

          {/* Detail kamar, semuanya opsional */}
          <div className="border-t border-gray-100 pt-6 md:col-span-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label htmlFor="room-type" className="mb-2 block text-sm font-bold text-gray-700">
                  Tipe Kamar <span className="text-xs font-normal text-gray-500">(opsional)</span>
                </label>
                <input
                  id="room-type"
                  type="text"
                  name="room_type"
                  maxLength={40}
                  defaultValue={room?.room_type ?? ""}
                  placeholder="Contoh: Tipe A"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="room-tenant-type" className="mb-2 block text-sm font-bold text-gray-700">
                  Tipe Penyewa <span className="text-xs font-normal text-gray-500">(opsional)</span>
                </label>
                <select id="room-tenant-type" name="tenant_type" defaultValue={room?.tenant_type ?? ""} className="field appearance-none">
                  <option value="">Belum ditentukan</option>
                  <option value="putra">Putra</option>
                  <option value="putri">Putri</option>
                  <option value="campur">Campur</option>
                </select>
              </div>
              <div>
                <span className="mb-2 block text-sm font-bold text-gray-700">
                  Ukuran (meter) <span className="text-xs font-normal text-gray-500">(opsional)</span>
                </span>
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor="room-size-length">Panjang kamar</label>
                  <select id="room-size-length" name="size_length" defaultValue={room?.size_length ?? ""} className="field appearance-none">
                    <option value="">-</option>
                    {sizeOptions.map((n) => (
                      <option key={n} value={n}>{String(n).replace(".", ",")}</option>
                    ))}
                  </select>
                  <span aria-hidden className="text-gray-500">×</span>
                  <label className="sr-only" htmlFor="room-size-width">Lebar kamar</label>
                  <select id="room-size-width" name="size_width" defaultValue={room?.size_width ?? ""} className="field appearance-none">
                    <option value="">-</option>
                    {sizeOptions.map((n) => (
                      <option key={n} value={n}>{String(n).replace(".", ",")}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Fasilitas */}
          <div className="border-t border-gray-100 pt-6 md:col-span-2">
            <label htmlFor="room-facility" className="mb-2 block text-sm font-bold text-gray-700">
              Fasilitas Kamar
            </label>
            <div className="mb-3 flex gap-2">
              <input
                id="room-facility"
                type="text"
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFacility();
                  }
                }}
                placeholder="Contoh: AC, WiFi, Kasur Springbed..."
                className="field flex-1"
              />
              <button type="button" onClick={handleAddFacility} className="btn btn-secondary">
                Tambah
              </button>
            </div>

            {facilities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {facilities.map((fac, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 rounded-lg bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    {fac}
                    <button
                      type="button"
                      onClick={() => handleRemoveFacility(fac)}
                      aria-label={`Hapus fasilitas ${fac}`}
                      className="ml-1 text-primary hover:text-red-600"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-gray-100 pt-6">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? <Loader2 className="size-4 animate-spin" /> : room ? <Save className="size-4" /> : <Plus className="size-4" />}
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
