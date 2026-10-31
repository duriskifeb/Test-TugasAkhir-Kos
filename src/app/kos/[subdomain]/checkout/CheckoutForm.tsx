"use client";

import Link from "next/link";
import { useState } from "react";
import { processBookingAndRegistration } from "./actions";
import { CheckCircle2, BedDouble, User, CreditCard, ShieldCheck } from "lucide-react";

type Room = { id: string; name: string; price: number } | null;

const durations = [
  { value: 1, label: "1 Bulan" },
  { value: 3, label: "3 Bulan" },
  { value: 6, label: "6 Bulan" },
  { value: 12, label: "1 Tahun" },
];

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export function CheckoutForm({
  subdomain,
  tenant,
  room,
}: {
  subdomain: string;
  tenant: { id: string; name: string };
  room: Room;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [duration, setDuration] = useState(1);

  const total = room ? room.price * duration : 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!room) return;
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    formData.append("subdomain", subdomain);
    formData.append("room_id", room.id);

    const result = await processBookingAndRegistration(formData);

    if (result.error) {
      setErrorMsg(result.error);
      setLoading(false);
    } else if (result.success) {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (!room) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50 p-4">
        <div className="card w-full max-w-md p-8 text-center">
          <span className="tile tile-pending mx-auto mb-5 flex w-16 items-center justify-center" />
          <h1 className="font-display text-2xl font-bold">Pilih kamar terlebih dahulu</h1>
          <p className="mt-2 text-sm text-gray-600">
            Kamar yang Anda pilih tidak ditemukan atau belum dipilih. Kembali ke halaman {tenant.name} untuk memilih
            kamar.
          </p>
          <Link href={`/kos/${subdomain}#kamar`} className="btn btn-primary btn-lg mt-6 w-full">
            Lihat Kamar
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50 p-4">
        <div className="card w-full max-w-md p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 size-14 text-green-600" />
          <h2 className="font-display text-2xl font-bold text-gray-900">Booking Berhasil</h2>
          <p className="mb-6 mt-2 text-sm leading-relaxed text-gray-600">
            Pemesanan Anda telah tercatat. Kami juga telah membuatkan akun untuk Anda secara otomatis. Silakan cek
            email Anda untuk detail pesanan.
          </p>
          <div className="rounded-xl border border-primary-tint bg-primary-soft p-4 text-left">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <ShieldCheck className="size-4 text-primary" /> Langkah selanjutnya
            </h3>
            <p className="text-sm text-gray-700">
              Masuk ke aplikasi dengan email dan kata sandi yang baru Anda buat untuk{" "}
              <strong>mengunggah bukti pembayaran</strong>.
            </p>
          </div>
          <Link href="/login" className="btn btn-primary btn-lg mt-6 w-full">
            Masuk ke Dashboard Penyewa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
        {/* Kolom kiri: form booking dan akun penyewa otomatis */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="card overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <h1 className="font-display text-2xl font-bold">Form Pemesanan</h1>
              <p className="mt-1 text-sm text-gray-600">
                Lengkapi data diri Anda. Sistem otomatis membuatkan akun penyewa untuk {tenant.name}.
              </p>
            </div>

            <div className="space-y-6 p-6">
              {errorMsg && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {errorMsg}
                </div>
              )}

              <fieldset className="space-y-4">
                <legend className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <User className="size-5 text-gray-500" /> Data diri dan akun baru
                </legend>
                <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
                  <div>
                    <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-gray-800">
                      Nama Lengkap
                    </label>
                    <input id="full_name" type="text" name="full_name" required autoComplete="name" className="field" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-800">
                      Nomor WhatsApp
                    </label>
                    <input id="phone" type="tel" name="phone" required autoComplete="tel" className="field" />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-800">
                      Alamat Email
                    </label>
                    <input id="email" type="email" name="email" required autoComplete="email" className="field" />
                  </div>
                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-800">
                      Buat Kata Sandi
                    </label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      required
                      autoComplete="new-password"
                      className="field"
                    />
                  </div>
                </div>
              </fieldset>

              <div aria-hidden className="border-t border-gray-200" />

              <fieldset className="space-y-4">
                <legend className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <BedDouble className="size-5 text-gray-500" /> Detail sewa
                </legend>
                <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
                  <div>
                    <label htmlFor="start_date" className="mb-1.5 block text-sm font-medium text-gray-800">
                      Tanggal Masuk
                    </label>
                    <input id="start_date" type="date" name="start_date" required className="field" />
                  </div>
                  <div>
                    <label htmlFor="duration" className="mb-1.5 block text-sm font-medium text-gray-800">
                      Durasi Sewa
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      required
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="field"
                    >
                      {durations.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="flex justify-end border-t border-gray-200 bg-gray-50 p-6">
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full md:w-auto">
                {loading ? "Memproses..." : "Selesaikan Pemesanan"}
              </button>
            </div>
          </form>
        </div>

        {/* Kolom kanan: ringkasan pemesanan */}
        <aside className="md:col-span-1">
          <div className="card sticky top-6 p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-gray-900">
              <CreditCard className="size-5 text-primary" /> Ringkasan
            </h2>

            <div className="mb-6 flex items-center gap-4">
              <span aria-hidden className="tile tile-available w-16 shrink-0" />
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-gray-900">{room.name}</h3>
                <p className="mt-0.5 truncate text-xs text-gray-600">{tenant.name}</p>
              </div>
            </div>

            <div className="mb-4 space-y-3 border-b border-gray-200 pb-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">Harga sewa per bulan</span>
                <span className="font-medium text-gray-900">{rupiah(room.price)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">Durasi</span>
                <span className="font-medium text-gray-900">
                  {durations.find((d) => d.value === duration)?.label}
                </span>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between gap-3">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-display text-xl font-bold text-primary">{rupiah(total)}</span>
            </div>

            <p className="rounded-lg border border-primary-tint bg-primary-soft p-4 text-xs leading-relaxed text-gray-700">
              Dengan menyelesaikan pemesanan ini, akun <strong>Penyewa</strong> dibuat otomatis untuk Anda.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
