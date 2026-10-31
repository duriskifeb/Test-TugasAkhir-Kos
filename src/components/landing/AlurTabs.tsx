"use client";

import { Fragment, useRef, useState, type KeyboardEvent } from "react";
import { tileStatusLabel } from "@/components/ui/StatusTile";
import { RoomBoard, RoomLegend, StatusBadge } from "./RoomBoard";
import { patchRoom, rupiah, useRooms } from "./rooms";
import { WebsiteBuilderDemo } from "./WebsiteBuilderDemo";

type Tone = "info" | "warn" | "muted";
type Row = { title: string; sub: string; chip: string; tone: Tone };
type Step = {
  title: string;
  text: string;
  path: string;
  heading: string;
  rows: Row[];
  /** Tampilkan papan kamar interaktif yang tersambung dengan hero. */
  board?: boolean;
  /** Tampilkan mini Website Builder interaktif. */
  builder?: boolean;
};

const toneClass: Record<Tone, string> = {
  info: "bg-primary-soft text-primary",
  warn: "bg-brand-soft text-gray-900",
  muted: "bg-gray-100 text-gray-700",
};

// Semua tampilan di bawah hanya ilustrasi dengan data contoh.
const steps: Step[] = [
  {
    title: "Kelola Properti",
    text: "Atur informasi kos dan cabang properti Anda dalam satu dashboard.",
    path: "build-kos.id/dashboard/houses",
    heading: "Cabang kos",
    rows: [
      { title: "Kos Sejahtera", sub: "12 kamar", chip: "Terverifikasi", tone: "info" },
      { title: "Kos Sejahtera Cabang Selatan", sub: "8 kamar", chip: "Menunggu", tone: "warn" },
    ],
  },
  {
    title: "Kelola Kamar",
    text: "Catat data kamar, fasilitas, dan status ketersediaannya dengan mudah.",
    path: "build-kos.id/dashboard/rooms",
    heading: "Denah kamar",
    board: true,
    rows: [],
  },
  {
    title: "Kustomisasi Website",
    text: "Sesuaikan tampilan halaman publik kos melalui fitur Website Builder.",
    path: "build-kos.id/dashboard/website-builder",
    heading: "Website Builder",
    builder: true,
    rows: [],
  },
  {
    title: "Publikasi Promosi",
    text: "Bagikan halaman properti agar calon penyewa dapat melihat informasi kos Anda.",
    path: "build-kos.id/kos-sejahtera",
    heading: "Kamar tersedia",
    rows: [
      { title: "Kamar Standar", sub: "AC, Wi-Fi, Rp 1.450.000 per bulan", chip: "Pesan", tone: "info" },
      { title: "Kamar Deluxe", sub: "AC, Wi-Fi, kamar mandi dalam, Rp 1.650.000 per bulan", chip: "Pesan", tone: "info" },
      { title: "Hubungi pemilik", sub: "Tanya langsung sebelum memesan", chip: "WhatsApp", tone: "muted" },
    ],
  },
  {
    title: "Kelola Penyewaan",
    text: "Atur data penyewa, penempatan kamar, dan informasi pembayaran sewa.",
    path: "build-kos.id/dashboard/tenants",
    heading: "Daftar penghuni",
    rows: [
      { title: "Adit", sub: "Kamar 101, check-in 3 Agustus, sewa Rp 1.450.000", chip: "Aktif", tone: "info" },
      { title: "Hendra", sub: "Kamar 204, check-in 1 Oktober, sewa Rp 1.650.000", chip: "Aktif", tone: "info" },
      { title: "Agus", sub: "Kamar 103, check-in 2 Maret, sewa Rp 1.450.000", chip: "Pindah keluar", tone: "muted" },
    ],
  },
  {
    title: "Pantau Laporan",
    text: "Pantau ringkasan operasional, tingkat hunian, dan pemasukan kos.",
    path: "build-kos.id/dashboard/financial-report",
    heading: "Laporan keuangan",
    rows: [
      { title: "Total pendapatan", sub: "Akumulasi semua cabang", chip: "Rp 41.850.000", tone: "info" },
      { title: "Tingkat hunian", sub: "8 dari 12 kamar terisi", chip: "67%", tone: "info" },
      { title: "Menunggu pembayaran", sub: "Belum lunas atau menunggu verifikasi", chip: "2 tagihan", tone: "warn" },
    ],
  },
];

function RoomsDemo() {
  const { rooms, selected } = useRooms();
  const room = rooms.find((r) => r.no === selected);

  return (
    <div>
      <RoomBoard />

      <div aria-live="polite" className="mt-4 min-h-28 rounded-lg bg-gray-50 p-4">
        {!room && <p className="text-sm text-gray-600">Pilih satu kamar untuk melihat fasilitas dan harganya.</p>}

        {room && (
          <div className="flex h-full flex-col justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-display font-bold">
                <StatusBadge status={room.status} />
                Kamar {room.no}
                <span className="font-medium text-gray-700">{tileStatusLabel[room.status]}</span>
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {room.facilities}, {rupiah(room.rent)} per bulan.{" "}
                {room.status === "occupied" && `Dihuni ${room.name}.`}
                {room.status === "pending" && `Booking dari ${room.name} menunggu persetujuan.`}
                {room.status === "available" && "Terbuka untuk booking."}
                {room.status === "repair" && "Belum bisa dipesan selama perbaikan."}
              </p>
            </div>

            <div>
              {room.status === "available" && (
                <button type="button" onClick={() => patchRoom(room.no, { status: "repair" })} className="btn btn-secondary">
                  Tandai perbaikan
                </button>
              )}
              {room.status === "pending" && (
                <button
                  type="button"
                  onClick={() => patchRoom(room.no, { status: "occupied", paid: false })}
                  className="btn btn-primary"
                >
                  Setujui booking
                </button>
              )}
              {room.status === "repair" && (
                <button type="button" onClick={() => patchRoom(room.no, { status: "available" })} className="btn btn-secondary">
                  Tandai selesai
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <RoomLegend />
      </div>
    </div>
  );
}

export function AlurTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = steps[active];

  const move = (event: KeyboardEvent, index: number) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const delta = keys[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + steps.length) % steps.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Langkah alur kerja" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((item, i) => (
          <button
            key={item.title}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`alur-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`alur-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => move(e, i)}
            className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left text-sm font-bold transition-colors ${
              i === active
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span
              className={`grid h-7 min-w-7 place-items-center rounded-md px-1.5 font-mono text-xs ${
                i === active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {item.title}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`alur-panel-${active}`}
        aria-labelledby={`alur-tab-${active}`}
        className={`mt-4 grid items-center gap-8 rounded-2xl bg-primary-soft p-6 sm:p-8 lg:gap-12 lg:p-10 ${
          step.builder ? "" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
        }`}
      >
        <div>
          <p className="font-mono text-sm font-semibold text-primary">Langkah {active + 1} dari {steps.length}</p>
          <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">{step.title}</h3>
          <p className="mt-4 max-w-md text-lg text-gray-700">{step.text}</p>
        </div>

        <div aria-hidden={step.board || step.builder ? undefined : true} className="overflow-clip rounded-xl border border-gray-200 bg-white shadow-pop">
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
            <span className="hidden gap-1.5 sm:flex">
              <span className="size-2.5 rounded-full bg-gray-300" />
              <span className="size-2.5 rounded-full bg-gray-300" />
              <span className="size-2.5 rounded-full bg-gray-300" />
            </span>
            <span className="min-w-0 flex-1 break-words rounded-md bg-gray-50 px-3 py-1 font-mono text-xs text-gray-600">
              {step.path.split("/").map((part, i) => (
                <Fragment key={i}>
                  {i > 0 && "/"}
                  <wbr />
                  {part}
                </Fragment>
              ))}
            </span>
          </div>
          <div className="p-4 sm:p-5">
            <p className="font-display font-bold">{step.heading}</p>
            {step.board && (
              <div className="mt-3">
                <RoomsDemo />
              </div>
            )}
            {step.builder && (
              <div className="mt-3">
                <WebsiteBuilderDemo />
              </div>
            )}
            {step.rows.length > 0 && (
              <ul className="mt-2 divide-y divide-gray-200">
                {step.rows.map((row) => (
                  <li key={row.title} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{row.title}</p>
                      <p className="text-xs text-gray-600">{row.sub}</p>
                    </div>
                    <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${toneClass[row.tone]}`}>
                      {row.chip}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-gray-600">Semua tampilan di atas hanya ilustrasi dengan data contoh.</p>
    </div>
  );
}
