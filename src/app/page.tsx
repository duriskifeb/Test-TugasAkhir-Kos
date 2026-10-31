import Link from "next/link";
import {
  BarChart3,
  Check,
  Globe,
  History,
  LayoutGrid,
  MessageCircle,
  NotebookPen,
  Plus,
  Receipt,
  Sheet,
  UserCheck,
  Users,
  Wallet,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { HeroBoard } from "@/components/landing/HeroBoard";
import { AlurTabs } from "@/components/landing/AlurTabs";
import { RoleTabs } from "@/components/landing/RoleTabs";

const navLinks = [
  { href: "#alur", label: "Alur kerja" },
  { href: "#fitur", label: "Fitur" },
  { href: "#peran", label: "Peran" },
  { href: "#faq", label: "Tanya jawab" },
];

const heroPoints = [
  "Website kos sendiri, tanpa lewat agregator",
  "Booking masuk langsung ke dashboard",
  "Untuk pemilik, pengelola, dan penyewa",
];

const oldTools: { label: string; icon: LucideIcon }[] = [
  { label: "Buku catatan", icon: NotebookPen },
  { label: "Grup WhatsApp", icon: MessageCircle },
  { label: "Lembar Excel", icon: Sheet },
  { label: "Nota kertas", icon: Receipt },
];

const before = [
  "Data penghuni tersebar di buku dan percakapan",
  "Tagihan dicatat manual dan mudah terlewat",
  "Keluhan tenggelam di pesan pribadi",
  "Promosi bergantung pada situs iklan pihak lain",
];

const after = [
  "Semua kamar dan penghuni dalam satu denah",
  "Tagihan pertama dibuat otomatis saat booking disetujui",
  "Keluhan tercatat dengan status sampai selesai",
  "Website kos sendiri yang bisa dibagikan",
];

const faq = [
  {
    question: "Apa itu Build Kos?",
    answer:
      "Build Kos adalah platform untuk membantu pemilik kos mengelola properti, kamar, penyewa, pembayaran, dan promosi dalam satu aplikasi.",
  },
  {
    question: "Kapan kos saya bisa menerima booking?",
    answer: "Setelah admin platform memverifikasi pendaftaran kos Anda. Sebelum itu, halaman kos belum menerima pemesanan.",
  },
  {
    question: "Apakah saya perlu keahlian teknis untuk menggunakannya?",
    answer:
      "Tidak. Fitur dirancang agar mudah digunakan. Anda dapat mulai dengan membuat akun, lalu menambahkan properti dan kamar.",
  },
  {
    question: "Apakah saya bisa mengelola lebih dari satu properti?",
    answer: "Bisa. Anda dapat mengatur informasi properti dan kamar melalui dashboard yang sama.",
  },
  {
    question: "Apakah penyewa harus membuat akun?",
    answer:
      "Saat memesan dari halaman kos, calon penyewa mengisi data diri, email, dan kata sandi. Akunnya dibuat saat itu juga.",
  },
  {
    question: "Apakah uang sewa melewati Build Kos?",
    answer:
      "Tidak. Build Kos mencatat tagihan, dan staf menandainya lunas setelah pembayaran diterima. Uang sewa tidak diproses di aplikasi.",
  },
  {
    question: "Kalau harga kamar saya ubah, apakah penghuni lama ikut berubah?",
    answer:
      "Tidak. Harga saat booking disetujui tersimpan pada data penghuni dan tagihannya, sehingga perubahan harga hanya berlaku untuk transaksi berikutnya.",
  },
];

const footerLinks = [
  {
    heading: "Produk",
    links: [
      { href: "#alur", label: "Alur kerja" },
      { href: "#fitur", label: "Fitur" },
      { href: "#peran", label: "Peran" },
      { href: "#faq", label: "Tanya jawab" },
    ],
  },
  {
    heading: "Akun",
    links: [
      { href: "/login", label: "Masuk" },
      { href: "/register", label: "Daftar" },
    ],
  },
];

function FeatureTitle({
  icon: Icon,
  tone = "default",
  children,
}: {
  icon: LucideIcon;
  tone?: "default" | "soft" | "primary";
  children: React.ReactNode;
}) {
  const tones = {
    default: "bg-primary-soft text-primary",
    soft: "bg-white text-gray-900",
    primary: "bg-white/15 text-white",
  };
  return (
    <div className="flex items-center gap-3">
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="font-display text-xl font-bold tracking-tight">{children}</h3>
    </div>
  );
}

function Chip({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" | "muted" }) {
  const tones = {
    info: "bg-primary-soft text-primary",
    warn: "bg-brand-soft text-gray-900",
    muted: "bg-gray-100 text-gray-700",
  };
  return <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-gray-900">
      {/* Navigasi */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Logo />
          <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-secondary">
              Masuk
            </Link>
            <Link href="/register" className="btn btn-primary">
              Daftar
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: teks di kiri, denah interaktif di kanan */}
        <section className="border-b border-primary-tint bg-primary-soft">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:py-20">
            <div>
              <h1 className="font-display text-[clamp(2.4rem,5vw,4.25rem)] font-extrabold leading-[1.04] tracking-tight">
                Semua kamar kos Anda, rapi dalam satu lantai.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-700">
                Kelola kamar, penyewa, tagihan, dan keluhan, lalu bagikan website kos Anda sendiri tanpa lewat
                agregator.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/register" className="btn btn-primary btn-lg">
                  Daftar
                </Link>
                <a href="#alur" className="btn btn-secondary btn-lg">
                  Lihat alur kerja
                </a>
              </div>
              <ul className="mt-8 space-y-3 border-t border-primary-tint pt-6">
                {heroPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-gray-800">
                    <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-md bg-primary text-white">
                      <Check className="size-3.5" strokeWidth={2.5} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <HeroBoard />
          </div>
        </section>

        {/* Masalah: alat lama */}
        <section className="border-b border-gray-200">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-5 sm:px-8">
            <p className="font-semibold text-gray-900">Masih mengurus kos dengan ini?</p>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {oldTools.map((tool) => (
                <li key={tool.label} className="flex items-center gap-2 text-gray-500 line-through">
                  <tool.icon className="size-4" strokeWidth={1.75} aria-hidden />
                  {tool.label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Alur kerja */}
        <section id="alur" className="scroll-mt-16 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
                Dari properti sampai laporan, dalam satu alur.
              </h2>
              <p className="mt-4 text-gray-600">
                Enam hal yang Anda kerjakan di kos, sekarang di satu tempat. Pilih tiap langkah untuk melihat
                contohnya.
              </p>
            </div>
            <div className="mt-10">
              <AlurTabs />
            </div>
          </div>
        </section>

        {/* Fitur: kartu berukuran tidak seragam */}
        <section id="fitur" className="scroll-mt-16 bg-gray-50 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight md:text-5xl">
              Yang Anda dapat di dalamnya.
            </h2>
            <p className="mt-4 max-w-xl text-gray-600">
              Dari kamar kosong sampai laporan bulanan, semuanya terhubung di dashboard yang sama.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-6">
              <article className="card p-6 md:col-span-4 md:flex md:items-center md:p-8">
                <div className="grid w-full gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] sm:items-center">
                  <div>
                    <FeatureTitle icon={Globe}>Website kos sendiri</FeatureTitle>
                    <p className="mt-2 text-gray-600">
                      Setiap kos punya halaman publik dengan gaya, warna, dan huruf pilihan Anda. Calon penyewa
                      memesan atau menghubungi lewat WhatsApp dari halaman itu.
                    </p>
                  </div>
                  <div aria-hidden className="rounded-xl bg-gray-50 p-4">
                    <p className="truncate font-mono text-sm font-semibold text-primary">build-kos.id/kos-sejahtera</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip>Modern</Chip>
                      <Chip tone="muted">Minimalis</Chip>
                      <Chip tone="muted">Bold</Chip>
                    </div>
                  </div>
                </div>
              </article>

              <article className="card p-6 md:col-span-2">
                <FeatureTitle icon={LayoutGrid}>Kamar dan denah</FeatureTitle>
                <p className="mt-2 text-gray-600">Atur kamar, fasilitas, dan harga. Status terbaca dari motif ubin.</p>
                <div aria-hidden className="mt-5 grid grid-cols-8 gap-1.5">
                  {(["occupied", "occupied", "available", "pending", "occupied", "repair", "available", "occupied"] as const).map(
                    (status, i) => (
                      <span key={i} className={`tile tile-${status}`} />
                    ),
                  )}
                </div>
              </article>

              <article className="card p-6 md:col-span-2">
                <FeatureTitle icon={UserCheck}>Penyewa dan booking</FeatureTitle>
                <p className="mt-2 text-gray-600">
                  Data penghuni, riwayat tinggal, dan pengajuan booking tersimpan rapi di satu tempat.
                </p>
                <div
                  aria-hidden
                  className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-gray-900">Nadia Putri, kamar 106</span>
                  <Chip tone="warn">Menunggu</Chip>
                </div>
              </article>

              <article className="card p-6 md:col-span-4">
                <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
                  <div>
                    <FeatureTitle icon={Wallet}>Tagihan dan pembayaran</FeatureTitle>
                    <p className="mt-2 text-gray-600">
                      Tagihan pertama dibuat otomatis saat booking disetujui. Verifikasi lunas dari satu daftar.
                    </p>
                  </div>
                  <ul aria-hidden className="divide-y divide-gray-200 rounded-xl bg-gray-50 px-4">
                    {[
                      ["Kamar 101", "Lunas", "info"],
                      ["Kamar 102", "Belum lunas", "warn"],
                      ["Kamar 204", "Jatuh tempo", "warn"],
                    ].map(([room, status, tone]) => (
                      <li key={room} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span className="font-semibold text-gray-900">{room}</span>
                        <Chip tone={tone as "info" | "warn"}>{status}</Chip>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="card relative overflow-hidden bg-brand-soft p-6 pb-9 md:col-span-3">
                <FeatureTitle icon={Wrench} tone="soft">Keluhan dan perbaikan</FeatureTitle>
                <p className="mt-2 max-w-sm text-gray-800">Catat laporan kerusakan dan tindak lanjutnya sampai selesai.</p>
                <ul aria-hidden className="mt-5 space-y-2">
                  {[
                    ["Keran kamar 204 bocor", "Ditangani", "warn"],
                    ["Lampu lorong lantai 2", "Selesai", "muted"],
                  ].map(([title, status, tone]) => (
                    <li key={title} className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 text-sm">
                      <span className="font-semibold text-gray-900">{title}</span>
                      <Chip tone={tone as "warn" | "muted"}>{status}</Chip>
                    </li>
                  ))}
                </ul>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-3 bg-[repeating-linear-gradient(135deg,var(--color-brand-soft)_0_6px,#fcd980_6px_9px)]"
                />
              </article>

              <article className="card p-6 md:col-span-3">
                <FeatureTitle icon={BarChart3}>Laporan keuangan</FeatureTitle>
                <p className="mt-2 max-w-sm text-gray-600">
                  Lihat okupansi dan pemasukan per bulan untuk membantu keputusan Anda.
                </p>
                <div aria-hidden className="mt-5 flex h-16 items-end gap-2">
                  {[40, 55, 48, 70, 62, 85].map((h, i) => (
                    <span key={i} className="flex-1 rounded-t-sm bg-primary" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </article>

              <article className="card border-primary bg-primary p-6 text-white md:col-span-4 md:p-8">
                <FeatureTitle icon={History} tone="primary">Harga lama tidak ikut berubah</FeatureTitle>
                <p className="mt-2 max-w-lg text-blue-50">
                  Harga dan nama kamar saat transaksi tersimpan di tagihan dan data penghuni. Ubah harga hari ini,
                  riwayat lama tetap sama.
                </p>
                <dl className="mt-5 grid max-w-md gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-white/10 p-3">
                    <dt className="text-xs text-white">Harga kamar sekarang</dt>
                    <dd className="mt-1 font-mono text-lg font-bold">Rp 1.600.000</dd>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3">
                    <dt className="text-xs text-white">Penghuni lama tetap</dt>
                    <dd className="mt-1 font-mono text-lg font-bold">Rp 1.450.000</dd>
                  </div>
                </dl>
              </article>

              <article className="card p-6 md:col-span-2">
                <FeatureTitle icon={Users}>Tim dan hak akses</FeatureTitle>
                <p className="mt-2 text-gray-600">Undang akun pengelola untuk pekerjaan harian dan cabut aksesnya kapan saja.</p>
                <ul aria-hidden className="mt-5 divide-y divide-gray-200 rounded-xl bg-gray-50 px-4">
                  {[
                    ["Sari, pengelola", "Aktif", "info"],
                    ["Doni, pengelola", "Dicabut", "muted"],
                  ].map(([name, status, tone]) => (
                    <li key={name} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span className="font-semibold text-gray-900">{name}</span>
                      <Chip tone={tone as "info" | "muted"}>{status}</Chip>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Peran */}
        <section id="peran" className="scroll-mt-16 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight md:text-5xl">
              Setiap orang punya ruang kerjanya.
            </h2>
            <div className="mt-10">
              <RoleTabs />
            </div>
          </div>
        </section>

        {/* Sebelum dan sesudah */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <h2 className="text-center font-display text-3xl font-bold tracking-tight md:text-5xl">
              Sehari-hari di kos, sebelum dan sesudah.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
                <h3 className="font-display text-xl font-bold tracking-tight text-gray-700">Tanpa Build Kos</h3>
                <ul className="mt-5 space-y-4">
                  {before.map((item) => (
                    <li key={item} className="flex gap-3 text-gray-600">
                      <X className="mt-0.5 size-5 shrink-0 text-gray-500" strokeWidth={2} aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border-2 border-primary bg-primary-soft p-6 sm:p-8">
                <h3 className="font-display text-xl font-bold tracking-tight text-gray-900">Dengan Build Kos</h3>
                <ul className="mt-5 space-y-4">
                  {after.map((item) => (
                    <li key={item} className="flex gap-3 text-gray-800">
                      <Check className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Tanya jawab */}
        <section id="faq" className="scroll-mt-16 py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <h2 className="text-center font-display text-3xl font-bold tracking-tight md:text-5xl">
              Pertanyaan yang sering muncul.
            </h2>
            <div className="mt-10 divide-y divide-gray-200 border-y border-gray-200">
              {faq.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span
                      aria-hidden
                      className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary transition-transform group-open:rotate-45"
                    >
                      <Plus className="size-4" strokeWidth={2.25} />
                    </span>
                  </summary>
                  <p className="mt-3 max-w-prose text-gray-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Penutup */}
        <section className="bg-primary py-16 text-white md:py-24">
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">
              Mulai rapikan kos Anda.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-blue-50">
              Buat akun pemilik, tambahkan kamar pertama, dan bagikan website kos Anda.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/register" className="btn btn-lg bg-white text-primary hover:bg-primary-soft">
                Daftar
              </Link>
            </div>
            <p className="mt-5 text-blue-50">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-white underline underline-offset-4">
                Masuk ke dashboard
              </Link>
            </p>
          </div>
        </section>
      </main>

      <div aria-hidden className="tile-strip" />
      <footer className="bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-gray-600">
              Platform manajemen kos untuk pemilik, pengelola, dan penyewa, dari denah kamar sampai tagihan.
            </p>
          </div>
          {footerLinks.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <p className="text-sm font-semibold text-gray-900">{group.heading}</p>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-gray-200 px-5 pt-6 sm:px-8">
          <p className="text-sm text-gray-600">&copy; 2026 Build Kos. Hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
