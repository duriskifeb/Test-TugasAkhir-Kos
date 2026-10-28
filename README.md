# 🏠 Platform SaaS Sistem Informasi Indekos dengan Website Builder

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

> **Tugas Akhir - Program Studi Sarjana Rekayasa Perangkat Lunak**  
> **Universitas Telkom Surabaya**  
> **Penulis:** Muhammad Rizky Febriyanto (NIM: 1201230037)  
> **Pembimbing:** Dahliar Ananda, S.T., M.T. & Arni Muarifah Amri, S.T., M.T.

---

## 📖 Deskripsi Proyek

Proyek ini merupakan implementasi dari penelitian Tugas Akhir berjudul **"Rancang Bangun Platform Software as a Service (SaaS) pada Sistem Informasi Indekos dengan Fitur Kustomisasi Antarmuka Dinamis Berbasis Web"**.

Platform ini dirancang menggunakan metodologi **Waterfall** untuk memberikan solusi digital bagi pemilik indekos yang selama ini bergantung pada agregator pihak ketiga. Dengan arsitektur **Multi-Tenant**, platform ini memungkinkan setiap pemilik indekos memiliki ruang kerja (workspace) yang terisolasi secara aman, lengkap dengan fitur **Website Builder** dinamis (drag-and-drop) untuk membuat halaman promosi kos mereka sendiri tanpa perlu keahlian coding, serta sistem manajemen operasional harian yang terintegrasi.

---

## 👥 Aktor dan Peran (Role-Based Access Control)

Sistem ini menerapkan isolasi hak akses yang ketat sesuai dengan 4 (empat) aktor utama:

1. **Admin Platform (Super Admin)**
   - Memverifikasi dan menyetujui pendaftaran Pemilik Kos (Tenant) baru.
   - Memantau kesehatan ekosistem platform dan manajemen langganan global.
2. **Pemilik Kos (Owner)**
   - Mengelola data multi-cabang indekos (Branch Management).
   - Menambah, mengubah, atau mencabut akses akun Pengelola Kos (Staff).
   - Menggunakan **Website Builder** untuk mengkustomisasi tema, warna, dan tata letak halaman publik.
   - Memantau laporan okupansi dan profitabilitas.
3. **Pengelola Kos (Staff)**
   - Mengelola data penyewa aktif dan ketersediaan kamar (FR07, FR08).
   - Memverifikasi bukti pembayaran sewa bulanan.
   - Menangani tiket keluhan (maintenance) dari penyewa.
4. **Calon Penyewa / Pengunjung (Public)**
   - Mengakses halaman publik indekos (hasil render dari Website Builder).
   - Melihat detail kamar, fasilitas, dan mengajukan pemesanan.

---

## ✨ Kebutuhan Fungsional Utama (Sesuai Proposal)

| Kode        | Fitur                       | Deskripsi Implementasi                                                                                                                                                           |
| :---------- | :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR01-02** | Autentikasi & Otorisasi     | Login/Logout aman menggunakan Supabase Auth dengan validasi peran (Role).                                                                                                        |
| **FR03**    | Registrasi Tenant           | Alur pendaftaran Pemilik Kos yang otomatis membuat workspace terisolasi.                                                                                                         |
| **FR04**    | Manajemen Staff             | Owner dapat mengundang/menghapus staff untuk cabang tertentu.                                                                                                                    |
| **FR05**    | Dashboard Analitik          | Visualisasi data okupansi dan pendapatan menggunakan `Chart.js`.                                                                                                                 |
| **FR06-07** | Manajemen Cabang & Kamar    | CRUD data properti, unggah foto, dan pengaturan status kamar (Kosong/Terisi).                                                                                                    |
| **FR08**    | Manajemen Penyewa & Tagihan | Pencatatan data penghuni, generate tagihan, dan validasi pelunasan.                                                                                                              |
| **FR09-10** | **Website Builder (Core)**  | Editor visual (menggunakan `@dnd-kit`) untuk menyusun section halaman. Konfigurasi disimpan sebagai JSON di tabel `page_sections` dan dirender secara dinamis via Next.js (SSR). |
| **FR11**    | Eksplorasi & Pemesanan      | Form pemesanan publik yang terintegrasi dengan ketersediaan kamar real-time.                                                                                                     |
| **FR12**    | Pelaporan Keluhan           | Modul tiket maintenance untuk staff menindaklanjuti kerusakan fasilitas.                                                                                                         |
| **FR13**    | Verifikasi Tenant Global    | Dashboard Admin untuk approve/suspend akun pemilik kos.                                                                                                                          |

---

## 🛠️ Arsitektur & Teknologi

- **Frontend:** Next.js (App Router), React 19, TypeScript.
- **Styling:** Tailwind CSS v4, `lucide-react` (Ikon).
- **Backend & Database:** Supabase (PostgreSQL), Supabase Auth, Supabase Storage.
- **Keamanan Data:** **Row-Level Security (RLS)** diaktifkan pada seluruh tabel untuk menjamin isolasi data Multi-Tenant (Pemilik A tidak bisa melihat data Kos B).
- **Fitur Dinamis:** `@dnd-kit/core` & `@dnd-kit/sortable` untuk mekanisme drag-and-drop pada Website Builder.
- **Visualisasi Data:** `chart.js` & `react-chartjs-2`.

---

## 📂 Struktur Direktori (Rekomendasi)

> ⚠️ **Catatan Pengembangan:** Untuk menjaga kebersihan kode (codebase hygiene), seluruh file skrip debug/fix (`.mjs`) telah dipindahkan ke folder `/scripts`.

```text
├── .github/                  # Konfigurasi CI/CD (Opsional)
├── public/                   # Aset statis (gambar, favicon)
├── scripts/                  # ⚠️ Tempat semua file .mjs (debug, fix, check_rls) disimpan
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Rute login, registrasi, verifikasi
│   │   ├── (dashboard)/      # Rute terlindungi untuk Owner, Staff, Admin
│   │   ├── kos/[subdomain]/  # 🌟 Rute dinamis untuk halaman publik kos (SSR)
│   │   └── layout.tsx        # Root layout dengan provider Supabase
│   ├── components/           # Komponen UI yang dapat digunakan ulang
│   │   ├── builder/          # Komponen khusus Website Builder (Drag & Drop)
│   │   ├── dashboard/        # Komponen tabel, kartu statistik, form
│   │   └── ui/               # Komponen dasar (button, input, modal)
│   ├── lib/                  # Utilitas dan konfigurasi
│   │   ├── supabase/         # Klien Supabase (Client & Server)
│   │   └── utils.ts          # Fungsi helper (e.g., cn() untuk Tailwind)
│   └── types/                # Definisi tipe TypeScript (Database, Props)
├── supabase/                 # Skema database, migrasi, dan seed data
├── .env.example              # Contoh variabel lingkungan
├── next.config.ts            # Konfigurasi Next.js
├── package.json              # Dependensi proyek
└── README.md                 # Dokumentasi ini
```
