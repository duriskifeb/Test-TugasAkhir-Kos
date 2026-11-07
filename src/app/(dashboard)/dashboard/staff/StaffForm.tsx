"use client";

import { useState } from "react";
import { addStaff } from "./actions";
import { Loader2, Plus, UserPlus } from "lucide-react";

export function StaffForm({ tenants }: { tenants: { id: string; name: string }[] }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    try {
      const result = await addStaff(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result?.success) {
        setMessage({ type: "success", text: result.success });
        (e.target as HTMLFormElement).reset(); // Clear form
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-soft text-primary rounded-xl flex items-center justify-center shrink-0">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Undang Karyawan Baru</h2>
          <p className="text-sm text-gray-500">Pengelola akan menerima email untuk membuat kata sandi dan masuk ke akun.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Contoh: Budi Santoso"
              className="field"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email Aktif</label>
            <input
              type="email"
              name="email"
              required
              placeholder="budi@example.com"
              className="field"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Cabang Kos</label>
            <select
              name="tenant_id"
              required
              className="field"
            >
              <option value="">-- Pilih Cabang yang Akan Ditugaskan --</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">Staf hanya bisa melihat dan mengelola data pada cabang yang dipilih ini.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Kirim Undangan
          </button>
        </div>
      </form>
    </div>
  );
}
