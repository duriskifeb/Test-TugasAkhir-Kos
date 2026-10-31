"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { BedDouble, ClipboardList, House, ShieldCheck, type LucideIcon } from "lucide-react";

const roles: { id: string; name: string; icon: LucideIcon; summary: string; abilities: string[] }[] = [
  {
    id: "owner",
    name: "Pemilik kos",
    icon: House,
    summary: "Mengatur seluruh properti dan memantau hasilnya.",
    abilities: [
      "Mengelola cabang, kamar, fasilitas, dan harga",
      "Mengundang dan mencabut akses akun staf",
      "Menyusun website kos lewat Website Builder",
      "Memantau okupansi dan laporan keuangan",
    ],
  },
  {
    id: "staff",
    name: "Pengelola kos",
    icon: ClipboardList,
    summary: "Menjalankan pekerjaan harian di lapangan.",
    abilities: [
      "Mengelola data penyewa aktif dan ketersediaan kamar",
      "Memverifikasi bukti pembayaran sewa bulanan",
      "Menindaklanjuti keluhan dari penyewa",
      "Memproses pengajuan booking",
    ],
  },
  {
    id: "renter",
    name: "Penyewa",
    icon: BedDouble,
    summary: "Mencari kamar dan memesannya langsung dari halaman kos.",
    abilities: [
      "Melihat kamar, fasilitas, dan harga di halaman kos",
      "Mengajukan booking kamar dengan akun sendiri",
      "Menghubungi pemilik lewat WhatsApp",
    ],
  },
  {
    id: "admin",
    name: "Admin platform",
    icon: ShieldCheck,
    summary: "Menjaga ekosistem tetap tepercaya.",
    abilities: [
      "Memverifikasi pendaftaran pemilik kos baru",
      "Menangguhkan akun bila diperlukan",
      "Memantau pengguna di seluruh platform",
    ],
  },
];

export function RoleTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (event: KeyboardEvent, index: number) => {
    const keys: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    const step = keys[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + roles.length) % roles.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const role = roles[active];

  return (
    <>
      {/* Desktop: keempat peran terlihat sekaligus, bobotnya sama. */}
      <div className="hidden gap-8 lg:grid lg:grid-cols-4">
        {roles.map((item) => (
          <section key={item.id} className="border-t-2 border-primary pt-5">
            <h3 className="font-display text-xl font-bold tracking-tight text-gray-900">{item.name}</h3>
            <p className="mt-1 text-sm text-pretty text-gray-600">{item.summary}</p>
            <ul className="mt-5 space-y-3">
              {item.abilities.map((ability) => (
                <li key={ability} className="flex gap-3 text-sm text-gray-800">
                  <span aria-hidden className="mt-1.5 size-2 shrink-0 rotate-45 rounded-[2px] bg-primary" />
                  {ability}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Ponsel dan tablet: tab. */}
      <div className="grid gap-6 lg:hidden">
      <div
        role="tablist"
        aria-label="Peran pengguna"
        className="flex gap-2 overflow-x-auto"
      >
        {roles.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={i === active}
            aria-controls={`panel-${item.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => move(e, i)}
            className={`flex shrink-0 items-center gap-3 rounded-lg border px-4 py-3 text-left font-semibold transition-colors ${
              i === active
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <item.icon className="size-5 shrink-0" strokeWidth={1.75} />
            {item.name}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${role.id}`}
        aria-labelledby={`tab-${role.id}`}
        className="card p-6 sm:p-8"
      >
        <h3 className="font-display text-2xl font-bold tracking-tight text-gray-900">{role.name}</h3>
        <p className="mt-1 text-gray-600">{role.summary}</p>
        <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {role.abilities.map((ability) => (
            <li key={ability} className="flex gap-3 text-gray-800">
              <span aria-hidden className="mt-2 size-2 shrink-0 rotate-45 rounded-[2px] bg-primary" />
              {ability}
            </li>
          ))}
        </ul>
      </div>
      </div>
    </>
  );
}
