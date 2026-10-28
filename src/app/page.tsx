import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BedDouble,
  Check,
  ChevronDown,
  ClipboardList,
  CreditCard,
  House,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: House,
    title: "Kelola banyak properti",
    description:
      "Atur cabang, kamar, fasilitas, dan status hunian dari satu tempat.",
  },
  {
    icon: Users,
    title: "Data penyewa lebih rapi",
    description:
      "Simpan informasi penyewa dan riwayat tinggal tanpa berkas tercecer.",
  },
  {
    icon: CreditCard,
    title: "Tagihan dan pembayaran",
    description:
      "Pantau tagihan bulanan serta status pembayaran dengan lebih mudah.",
  },
  {
    icon: Wrench,
    title: "Keluhan terpantau",
    description:
      "Catat laporan perbaikan dan tindak lanjutnya secara terorganisir.",
  },
  {
    icon: BarChart3,
    title: "Laporan yang jelas",
    description:
      "Lihat okupansi dan pemasukan untuk membantu mengambil keputusan.",
  },
  {
    icon: Sparkles,
    title: "Website kos sendiri",
    description:
      "Tampilkan properti dalam halaman publik yang siap dibagikan.",
  },
];

const faq = [
  {
    question: "Apa itu Pintu Berkah?",
    answer:
      "Pintu Berkah adalah platform untuk membantu pemilik kos mengelola properti, kamar, penyewa, pembayaran, dan promosi dalam satu aplikasi.",
  },
  {
    question: "Apakah saya perlu keahlian teknis untuk menggunakannya?",
    answer:
      "Tidak. Fitur dirancang agar mudah digunakan. Anda dapat mulai dengan membuat akun, lalu menambahkan properti dan kamar.",
  },
  {
    question: "Apakah saya bisa mengelola lebih dari satu properti?",
    answer:
      "Bisa. Anda dapat mengatur informasi properti dan kamar melalui dashboard yang sama.",
  },
  {
    question: "Apakah penyewa bisa membuat akun?",
    answer:
      "Bisa. Saat mendaftar, pilih peran Penyewa Kos untuk menggunakan akun penyewa.",
  },
];

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 text-lg font-extrabold tracking-tight ${
        light ? "text-white" : "text-slate-950"
      }`}
    >
      <span className="flex size-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
        <House size={17} strokeWidth={2.8} />
      </span>
      Pintu Berkah
    </Link>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[570px]">
      <div className="absolute -left-8 top-16 size-28 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute -right-4 bottom-3 size-32 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="relative rounded-[26px] border border-white/15 bg-white/[0.08] p-3 shadow-2xl shadow-slate-950/30 backdrop-blur-sm sm:p-4">
        <div className="overflow-hidden rounded-[18px] bg-[#f7f9fd] text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-blue-700 text-white">
                <House size={16} />
              </span>
              <div>
                <p className="text-xs font-bold">Kos Melati Residence</p>
                <p className="text-[9px] text-slate-500">Ringkasan properti</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-700">
              ● Properti aktif
            </span>
          </div>
          <div className="grid gap-3 p-3 sm:grid-cols-[1.4fr_1fr] sm:p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Total kamar", value: "24", icon: BedDouble },
                  { label: "Kamar terisi", value: "19", icon: Users },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                  >
                    <item.icon className="mb-2 text-blue-700" size={15} />
                    <p className="text-[9px] text-slate-500">{item.label}</p>
                    <p className="mt-0.5 text-lg font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold">Ringkasan pemasukan</p>
                    <p className="text-[9px] text-slate-500">Bulan ini</p>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-700">
                    +12,8%
                  </span>
                </div>
                <div className="flex h-[92px] items-end gap-2 border-b border-slate-100 px-1">
                  {[34, 48, 39, 62, 54, 76, 63, 91, 72, 100, 82, 94].map(
                    (height, index) => (
                      <div
                        key={index}
                        className={`flex-1 rounded-t-sm ${
                          index === 9 ? "bg-amber-400" : "bg-blue-100"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    ),
                  )}
                </div>
                <div className="mt-2 flex justify-between text-[8px] text-slate-400">
                  <span>1 Okt</span>
                  <span>15 Okt</span>
                  <span>31 Okt</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold">Kamar</p>
                <span className="text-[8px] font-semibold text-blue-700">
                  Lihat semua
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {Array.from({ length: 12 }, (_, index) => (
                  <div
                    key={index}
                    className={`rounded-md px-1 py-2 text-center text-[8px] font-semibold ${
                      index === 2 || index === 8
                        ? "bg-amber-100 text-amber-800"
                        : index === 5
                          ? "bg-slate-100 text-slate-500"
                          : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                ))}
              </div>
              <div className="my-4 h-px bg-slate-100" />
              <p className="mb-2 text-[9px] font-bold">Aktivitas terbaru</p>
              {[
                ["Pembayaran diterima", "Kamar A-04"],
                ["Penyewa baru", "Kamar B-02"],
                ["Tagihan dibuat", "Oktober 2026"],
              ].map(([title, detail], index) => (
                <div
                  key={title}
                  className="flex items-center gap-2 border-t border-slate-50 py-2"
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-full ${
                      index === 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {index === 0 ? <Check size={11} /> : <ClipboardList size={11} />}
                  </span>
                  <div>
                    <p className="text-[8px] font-semibold">{title}</p>
                    <p className="text-[8px] text-slate-400">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-2 hidden items-center gap-2.5 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:flex">
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Wallet size={17} />
        </span>
        <div>
          <p className="text-[10px] text-slate-500">Pembayaran terverifikasi</p>
          <p className="text-sm font-bold text-slate-900">Rp 2.450.000</p>
        </div>
        <BadgeCheck className="ml-1 text-emerald-500" size={17} />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-x-clip bg-white font-sans text-slate-900">
      <section className="relative bg-[#0b1b3b] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_38%,rgba(46,102,185,0.28),transparent_38%),radial-gradient(ellipse_at_7%_100%,rgba(30,64,125,0.45),transparent_36%)]" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Brand light />
          <nav className="hidden items-center gap-8 text-sm text-blue-100/80 md:flex">
            <a className="transition hover:text-white" href="#fitur">
              Fitur
            </a>
            <a className="transition hover:text-white" href="#cara-kerja">
              Cara kerja
            </a>
            <a className="transition hover:text-white" href="#faq">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-4"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-amber-950/20 transition hover:bg-amber-300 sm:px-4"
            >
              Daftar gratis
            </Link>
          </div>
        </header>
        <div className="relative z-0 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-10 sm:px-8 sm:pb-24 sm:pt-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:px-12 lg:pb-28 lg:pt-16">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/15 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-blue-100">
              <Sparkles size={14} className="text-amber-300" />
              Cara lebih mudah mengelola kos
            </div>
            <h1 className="text-[2.6rem] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[3.55rem]">
              Kelola kos tanpa repot,{" "}
              <span className="text-amber-300">semua dalam satu tempat.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-blue-100/75 sm:text-lg sm:leading-8">
              Urus kamar, penyewa, pembayaran, dan promosi properti dengan
              praktis. Lebih sedikit pekerjaan manual, lebih banyak waktu
              untuk mengembangkan usaha kos Anda.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:bg-amber-300"
              >
                Mulai gratis <ArrowRight size={17} />
              </Link>
              <a
                href="#fitur"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Lihat fitur <ArrowDown size={16} />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-blue-100/75">
              {["Mudah digunakan", "Data terorganisir", "Akses kapan saja"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-300" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
          <DashboardPreview />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-5 text-center text-xs font-medium text-slate-500 sm:gap-x-12 sm:px-8 sm:py-6">
          <span>Dirancang untuk pengelolaan kos yang lebih praktis</span>
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-blue-700" /> Data tersimpan
            dengan aman
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Smartphone size={15} className="text-blue-700" /> Nyaman digunakan
            di berbagai perangkat
          </span>
        </div>
      </section>

      <section id="cara-kerja" className="scroll-mt-8 px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Fitur pengelolaan kos
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Kelola seluruh operasional kos dari satu dashboard.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              Atur properti, promosikan kos, dan pantau penyewaan serta laporan
              dengan lebih praktis.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                number: "01",
                icon: House,
                title: "Kelola Properti",
                description:
                  "Atur informasi kos dan cabang properti Anda dalam satu dashboard.",
              },
              {
                number: "02",
                icon: BedDouble,
                title: "Kelola Kamar",
                description:
                  "Catat data kamar, fasilitas, dan status ketersediaannya dengan mudah.",
              },
              {
                number: "03",
                icon: Sparkles,
                title: "Kustomisasi Website",
                description:
                  "Sesuaikan tampilan halaman publik kos melalui fitur Website Builder.",
              },
              {
                number: "04",
                icon: Megaphone,
                title: "Publikasi Promosi",
                description:
                  "Bagikan halaman properti agar calon penyewa dapat melihat informasi kos Anda.",
              },
              {
                number: "05",
                icon: Users,
                title: "Kelola Penyewaan",
                description:
                  "Atur data penyewa, penempatan kamar, dan informasi pembayaran sewa.",
              },
              {
                number: "06",
                icon: BarChart3,
                title: "Pantau Laporan",
                description:
                  "Pantau ringkasan operasional, tingkat hunian, dan pemasukan kos.",
              },
            ].map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                    <step.icon size={20} />
                  </span>
                  <span className="text-sm font-bold text-slate-300">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="fitur"
        className="scroll-mt-8 bg-[#f4f7fc] px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Satu platform, banyak kemudahan
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Semua yang Anda butuhkan untuk mengelola kos.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              Kurangi pencatatan manual dan simpan pekerjaan penting dalam
              dashboard yang mudah diakses.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <feature.icon size={20} />
                </span>
                <h3 className="mt-4 font-bold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-5 grid gap-4 rounded-2xl border border-blue-100 bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
            <div>
              <p className="font-bold text-slate-950">
                Website properti yang siap dibagikan
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Tampilkan informasi kos Anda dalam halaman publik agar calon
                penyewa lebih mudah mengenal properti.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900"
            >
              Buat akun <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0b1b3b] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
              Tidak harus selalu di depan laptop
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Informasi kos selalu mudah dijangkau.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/75 sm:text-base">
              Buka dashboard dari ponsel atau komputer untuk melihat informasi
              properti dan aktivitas operasional kapan pun dibutuhkan.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-blue-50 sm:grid-cols-2">
              {[
                "Ringkasan kamar dan penyewa",
                "Status pembayaran lebih jelas",
                "Aktivitas tercatat rapi",
                "Kelola beberapa properti",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-sm rounded-[28px] border border-white/15 bg-white/[0.08] p-3 shadow-2xl">
            <div className="rounded-[20px] bg-white p-4 text-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold">Selamat pagi, Rizky</p>
                  <p className="mt-1 text-[8px] text-slate-500">
                    Ini ringkasan kos Anda hari ini
                  </p>
                </div>
                <span className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-blue-800">
                  <LayoutDashboard size={15} />
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  ["Kamar terisi", "19 / 24"],
                  ["Pembayaran", "15 lunas"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[8px] text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold">Aktivitas terbaru</p>
                  <span className="text-[8px] text-blue-700">Lihat semua</span>
                </div>
                {[
                  ["Tagihan kamar A-04", "Menunggu pembayaran"],
                  ["Laporan keran bocor", "Sedang ditangani"],
                  ["Penyewa baru kamar B-02", "Hari ini"],
                ].map(([title, status]) => (
                  <div
                    key={title}
                    className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2"
                  >
                    <span className="flex size-6 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <ClipboardList size={12} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[8px] font-semibold">
                        {title}
                      </p>
                      <p className="text-[8px] text-slate-500">{status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f7fc] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 md:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Untuk calon penyewa
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Temukan informasi kos dengan lebih mudah.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Pemilik dapat membagikan halaman properti untuk membantu calon
              penyewa melihat informasi kos yang tersedia.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            Daftar sebagai penyewa <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section
        id="faq"
        className="scroll-mt-8 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Pertanyaan yang sering muncul.
            </h2>
          </div>
          <div className="mt-9 divide-y divide-slate-200 border-y border-slate-200">
            {faq.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left font-semibold text-slate-900">
                  <span>{item.question}</span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-blue-700 transition group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-2xl pt-3 text-sm leading-6 text-slate-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b1b3b] px-5 py-16 text-center text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
            Mulai hari ini
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Siap mengelola kos dengan lebih praktis?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-blue-100/75 sm:text-base">
            Buat akun dan mulai atur properti Anda dengan Pintu Berkah.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
          >
            Daftar gratis <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="bg-[#07142d] px-5 py-12 text-blue-100/70 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Brand light />
            <p className="mt-4 max-w-xs text-sm leading-6">
              Platform untuk membantu pemilik kos mengelola properti dan
              operasional dengan lebih teratur.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Navigasi
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a className="hover:text-white" href="#fitur">
                Fitur
              </a>
              <a className="hover:text-white" href="#faq">
                FAQ
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Akun
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link className="hover:text-white" href="/login">
                Masuk
              </Link>
              <Link className="hover:text-white" href="/register">
                Daftar
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Bantuan
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm">
              <MessageCircle size={15} />
              Jelajahi pusat bantuan
            </p>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs">
          © {new Date().getFullYear()} Pintu Berkah. Dibuat untuk pengelolaan
          kos yang lebih baik.
        </div>
      </footer>
    </main>
  );
}
