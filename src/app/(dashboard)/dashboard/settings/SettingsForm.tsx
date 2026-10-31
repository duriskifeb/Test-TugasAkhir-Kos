"use client";

import { useState } from "react";
import { updateTenantProfile } from "./actions";
import { Loader2, Save, Home, MapPin, AlignLeft, Globe, CheckCircle2, XCircle } from "lucide-react";

export function SettingsForm({ tenant }: { tenant: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    try {
      const result = await updateTenantProfile(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result?.success) {
        setMessage({ type: "success", text: result.success });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="id" value={tenant.id} />
      
      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" /> : <XCircle className="w-5 h-5 mt-0.5 shrink-0" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Kos */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Home className="w-4 h-4 text-gray-500" />
            Nama Kos / Properti <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            defaultValue={tenant.name}
            required
            className="field"
          />
        </div>

        {/* Subdomain */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            Subdomain Website <span className="text-red-500">*</span>
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-primary transition-all bg-gray-50 focus-within:bg-white">
            <input
              type="text"
              name="subdomain"
              defaultValue={tenant.subdomain}
              required
              className="w-full bg-transparent border-none px-4 py-3 text-sm outline-none"
            />
            <div className="bg-gray-100 border-l border-gray-200 px-4 py-3 text-sm text-gray-500 font-bold flex items-center">
              .saaskos.com
            </div>
          </div>
        </div>

        {/* Alamat Lengkap */}
        <div className="group md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            Alamat Lengkap
          </label>
          <textarea
            name="address"
            defaultValue={tenant.address || ""}
            rows={2}
            className="field resize-none"
          />
        </div>

        {/* Deskripsi */}
        <div className="group md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-gray-500" />
            Fasilitas Umum & Deskripsi
          </label>
          <textarea
            name="description"
            defaultValue={tenant.description || ""}
            rows={4}
            className="field resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}
