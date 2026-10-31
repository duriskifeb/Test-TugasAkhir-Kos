import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Ringkasan data yang dikumpulkan dan digunakan oleh Build Kos.",
};

const sections: { heading: string; body: string[] }[] = [
  {
    heading: "Data yang dikumpulkan",
    body: [
      "Saat mendaftar: nama lengkap, nomor telepon, email, kata sandi, dan peran akun (pemilik kos atau penyewa).",
      "Dari pemilik dan pengelola kos: data properti dan kamar, data penghuni (nama, nomor WhatsApp, tanggal check-in), tagihan, dan keluhan perawatan.",
      "Dari calon penyewa yang memesan kamar: data diri dan tanggal mulai menghuni yang diisi pada formulir booking.",
    ],
  },
  {
    heading: "Untuk apa data digunakan",
    body: [
      "Data digunakan untuk menjalankan fitur aplikasi: masuk ke akun, mengelola kos, memproses booking, mencatat tagihan, dan memverifikasi pendaftaran pemilik kos oleh admin platform.",
    ],
  },
  {
    heading: "Siapa yang dapat melihat data",
    body: [
      "Data setiap kos dipisahkan. Pemilik dan pengelola hanya mengakses data kos mereka sendiri.",
      "Admin platform dapat melihat data pengguna untuk keperluan verifikasi dan penanganan akun.",
    ],
  },
  {
    heading: "Penyimpanan dan keamanan",
    body: [
      "Data disimpan pada layanan Supabase. Kata sandi dikelola oleh layanan autentikasi dan tidak disimpan sebagai teks biasa.",
    ],
  },
  {
    heading: "Pembayaran sewa",
    body: ["Build Kos hanya mencatat tagihan. Uang sewa tidak diproses di dalam aplikasi."],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900">
          <ArrowLeft className="size-4" />
          Beranda
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-6 sm:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance text-gray-900 sm:text-4xl">
          Kebijakan Privasi
        </h1>

        <p role="note" className="mt-6 max-w-md rounded-lg bg-brand-soft p-4 text-sm text-gray-900">
          Draf. Halaman ini meringkas data yang digunakan aplikasi dan belum ditinjau oleh pemilik proyek. Isinya
          dapat berubah.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl font-bold tracking-tight text-gray-900">{section.heading}</h2>
              <div className="mt-3 max-w-xl space-y-3 text-gray-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
