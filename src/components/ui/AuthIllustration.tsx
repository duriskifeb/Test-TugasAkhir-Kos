import type { TileStatus } from "@/components/ui/StatusTile";
import { StatusBadge } from "@/components/landing/RoomBoard";

// Tiruan dashboard Build Kos untuk panel kanan halaman masuk dan daftar.
// Hanya dekorasi: datanya contoh dan sama dengan data di landing.
const floors: TileStatus[][] = [
  ["occupied", "occupied", "available", "occupied", "occupied", "pending"],
  ["occupied", "available", "occupied", "occupied", "occupied", "repair"],
];

const bills = [
  { name: "Adit", room: "Kamar 101", chip: "Lunas", tone: "bg-primary-soft text-primary" },
  { name: "Rizky", room: "Kamar 102", chip: "Belum lunas", tone: "bg-brand-soft text-gray-900" },
  { name: "Hendra", room: "Kamar 204", chip: "Jatuh tempo", tone: "bg-brand-soft text-gray-900" },
];

// Setengah lingkaran dengan jari-jari 44, terisi 8 dari 12 kamar.
const arc = Math.PI * 44;
const occupancy = 8 / 12;

export function AuthIllustration({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex h-full flex-col justify-center gap-8 px-10 py-10 xl:px-14">
      <div>
        <h2 className="max-w-md font-display text-3xl font-semibold tracking-tight text-balance text-white xl:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-white/90 [@media(max-height:680px)]:hidden">{text}</p>
      </div>

      <div aria-hidden className="pointer-events-none select-none pr-3">
        <div className="rounded-xl bg-white p-4 text-gray-900 shadow-pop">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-primary p-3 text-white">
              <p className="text-xs">Terisi</p>
              <p className="mt-1 font-mono text-sm font-bold whitespace-nowrap xl:text-lg">8/12</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-600">Pemasukan</p>
              <p className="mt-1 font-mono text-sm font-bold whitespace-nowrap xl:text-lg">Rp 9,3 jt</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-600">Belum bayar</p>
              <p className="mt-1 font-mono text-sm font-bold whitespace-nowrap xl:text-lg">2</p>
            </div>
          </div>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-600">Denah kamar</p>
              <div className="mt-2 space-y-3">
                {floors.map((row, i) => (
                  <div key={i}>
                    <p className="mb-1.5 text-xs text-gray-600">Lantai {i + 1}</p>
                    <div className="flex gap-1.5">
                      {row.map((status, j) => (
                        <StatusBadge key={j} status={status} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="-mr-7 hidden w-40 shrink-0 rounded-xl border border-gray-200 bg-white p-3 shadow-pop xl:block">
              <p className="text-xs font-semibold text-gray-600">Tingkat hunian</p>
              <div className="relative mt-2">
                <svg viewBox="0 0 100 56" className="w-full">
                  <path d="M 6 50 A 44 44 0 0 1 94 50" fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-gray-200" />
                  <path
                    d="M 6 50 A 44 44 0 0 1 94 50"
                    fill="none"
                    strokeWidth="9"
                    strokeLinecap="round"
                    className="stroke-primary"
                    strokeDasharray={`${arc * occupancy} ${arc}`}
                  />
                </svg>
                <p className="absolute inset-x-0 bottom-0 text-center font-mono text-lg font-bold">67%</p>
              </div>
              <p className="mt-2 text-center text-xs text-gray-600">8 dari 12 kamar terisi</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-600">Tagihan terbaru</p>
            <ul className="mt-1 divide-y divide-gray-200">
              {bills.map((bill, i) => (
                <li
                  key={bill.name}
                  className={`flex items-center justify-between gap-3 py-2.5 ${i === 2 ? "[@media(max-height:820px)]:hidden" : ""}`}
                >
                  <div>
                    <p className="text-sm font-semibold">{bill.name}</p>
                    <p className="text-xs text-gray-600">{bill.room}</p>
                  </div>
                  <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${bill.tone}`}>{bill.chip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
