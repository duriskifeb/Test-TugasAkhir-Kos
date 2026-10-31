# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Empat aktor dengan bobot setara (dikonfirmasi pemilik proyek: tidak ada aktor prioritas):

- **Admin platform**: memverifikasi dan menangguhkan akun pemilik kos baru, memantau ekosistem.
- **Pemilik kos (owner)**: mengelola cabang dan kamar, akun staf, laporan keuangan dan okupansi, serta menyusun website publik kosnya lewat Website Builder.
- **Pengelola kos (staff)**: mengelola penyewa aktif dan ketersediaan kamar, memverifikasi bukti pembayaran, menindaklanjuti keluhan, memproses pengajuan booking.
- **Calon penyewa dan penyewa**: melihat halaman publik kos, mengajukan booking dan checkout, lalu memakai dashboard penyewa.

Bahasa antarmuka: Bahasa Indonesia.

## Product Purpose

Build Kos adalah platform SaaS multi-tenant untuk sistem informasi indekos. Pemilik kos yang selama ini bergantung pada agregator pihak ketiga mendapat ruang kerja terisolasi untuk operasional harian dan website promosi sendiri tanpa keahlian coding. Proyek ini juga Tugas Akhir (Program Studi Sarjana Rekayasa Perangkat Lunak, Universitas Telkom Surabaya), sehingga seluruh alur harus berjalan dan layak didemonstrasikan.

## Positioning

Operasional kos (kamar, penyewa, tagihan, keluhan, laporan) dan website publik buatan pemilik berada dalam satu platform. Konfigurasi website disimpan sebagai section JSON dan dirender dinamis per tenant, sehingga tiap kos punya halaman sendiri tanpa agregator.

## Operating Context

- Pemilik dan staf memakai dashboard untuk pekerjaan berulang: verifikasi bukti bayar, tindak lanjut keluhan, cek okupansi.
- Pemesanan lewat halaman publik `kos/[subdomain]`, dengan tautan WhatsApp untuk tanya kamar dan lapor keluhan.
- Penyewa umumnya membuka dari ponsel.
- Mata uang Rupiah, format tanggal dan angka lokal Indonesia.

## Capabilities and Constraints

- Stack tetap: Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (Auth, Postgres, Storage) dengan Row-Level Security.
- Role: `admin`, `owner`, `staff`, `renter`. Rute: `(auth)`, `(dashboard)`, `admin`, `kos/[subdomain]`, landing `/`.
- Website Builder memakai `@dnd-kit`; dashboard memakai `chart.js`.
- Pemilik dapat mengatur tema halaman publik (warna utama, font, gaya template) sehingga halaman publik harus tetap tampil baik dengan tema tenant yang bervariasi.
- Perubahan tampilan tidak boleh mengubah logika bisnis, server action, skema database, atau slug rute.
- Alur register penyewa belum final menurut riwayat commit.

## Brand Commitments

- Nama **Build Kos** dan logo ikon rumah (amber) dipertahankan. Warna, tipografi, dan komponen di sekitarnya boleh didesain ulang.
- Tampilan terang saja (permintaan pemilik proyek): tanpa mode gelap dan tanpa warna gelap sebagai latar atau blok permukaan. Teks tetap memakai warna cukup tua demi kontras.

## Evidence on Hand

- Aset bergambar di `public/`: `auth_bg_3d.png`, `auth_bg_fluid.png`, `auth_illustration.jpg`.
- Tidak ada testimoni, pelanggan nyata, harga paket, atau metrik penggunaan. Pekerjaan berikutnya tidak boleh mengarang itu.
- Tidak ada foto properti asli di repo.

## Product Principles

1. Semua aktor mendapat kualitas rancangan yang sama; tidak ada peran yang diperlakukan sebagai halaman sisa.
2. Satu sistem desain untuk landing, auth, dashboard, admin, dan halaman publik, bukan beberapa gaya terpisah.
3. Tiap halaman menampilkan status penting (kosong, memuat, galat) dengan bahasa Indonesia yang jelas.
4. Halaman publik tenant tetap kokoh dan terbaca pada tema apa pun yang dipilih pemilik.

## Accessibility & Inclusion

Belum ada standar khusus dari pemilik. Dasar yang dipakai: kontras WCAG AA, navigasi keyboard, dan tampilan ponsel untuk halaman yang dipakai penyewa.
