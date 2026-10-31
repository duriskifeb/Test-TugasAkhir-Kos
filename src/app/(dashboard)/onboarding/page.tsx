"use client";

import { useState } from "react";
import { createTenant } from "./actions";
import { Building2, Globe, AlertCircle, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await createTenant(formData);
            // Jika ada error dari server
            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
            }
            // Jika sukses, actions.ts akan melakukan redirect
        } catch (err) {
            setError("Terjadi kesalahan jaringan.");
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Daftarkan Kos Anda</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Langkah pertama untuk mengelola kos dan membuat website promosi otomatis Anda.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form action={handleSubmit} className="space-y-6">
                    {/* Input Nama Kos */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-900">
                            Nama Kos / Properti
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Nama ini akan menjadi judul utama pada sistem dan website Anda.
                        </p>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Building2 className="h-4 w-4 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Cth: Kos Sejahtera Indah"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Input Subdomain */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-900">
                            Pilih Link Website (Subdomain)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Ini adalah alamat link unik yang bisa dibagikan ke calon penyewa Anda.
                        </p>
                        <div className="flex shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all">
                            <div className="pl-3.5 pr-2 py-2.5 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                                <Globe className="h-4 w-4 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                name="subdomain"
                                required
                                placeholder="kos-berkah"
                                className="w-full px-3 py-2.5 bg-gray-50 focus:bg-white outline-none text-sm"
                            />
                            <div className="px-4 py-2.5 bg-gray-100 border-l border-gray-200 text-gray-500 text-sm font-medium flex items-center">
                                .saaskos.com
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Hanya gunakan huruf, angka, dan tanda hubung (-)
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full"
                    >
                        {isLoading ? "Menyimpan Data..." : "Selesaikan Pendaftaran"}
                        {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
