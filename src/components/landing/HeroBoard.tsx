"use client";

import { RoomBoard, RoomLegend, StatusBadge } from "./RoomBoard";
import { patchRoom, rupiah, useRooms } from "./rooms";

export function HeroBoard() {
  const { rooms, selected } = useRooms();

  const occupied = rooms.filter((r) => r.status === "occupied");
  const paid = occupied.filter((r) => r.paid);
  const income = paid.reduce((sum, r) => sum + r.rent, 0);
  const room = rooms.find((r) => r.no === selected);

  const stats = [
    { value: `${occupied.length}/${rooms.length}`, label: "Terisi" },
    { value: `${paid.length}/${occupied.length}`, label: "Lunas" },
    { value: `Rp ${(income / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`, label: "Masuk" },
  ];

  return (
    <div>
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-gray-200 pb-4">
          <div>
            <p className="font-display text-lg font-bold tracking-tight">Kos Sejahtera</p>
            <p className="text-sm text-gray-600">Tagihan bulan ini</p>
          </div>
          <dl className="flex gap-5">
            {stats.map((s) => (
              <div key={s.label} className="text-right">
                <dd className="font-mono text-base font-bold text-gray-900">{s.value}</dd>
                <dt className="text-xs text-gray-600">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-4">
          <RoomBoard />
        </div>

        <div aria-live="polite" className="mt-5 min-h-32 rounded-lg bg-gray-50 p-4">
          {!room && (
            <p className="text-sm text-gray-600">Pilih satu kamar untuk melihat penghuni dan tagihannya.</p>
          )}

          {room && (
            <div className="flex h-full flex-col justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 font-display font-bold">
                  <StatusBadge status={room.status} />
                  Kamar {room.no}
                  {room.name && room.status !== "available" && <span className="font-medium text-gray-700">{room.name}</span>}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {room.status === "occupied" &&
                    `Sewa ${rupiah(room.rent)} per bulan. Tagihan ${room.paid ? "sudah lunas." : "belum lunas."}`}
                  {room.status === "pending" && `Booking dari ${room.name} menunggu persetujuan.`}
                  {room.status === "available" && `Kosong dan terbuka untuk booking di halaman kos, ${rupiah(room.rent)} per bulan.`}
                  {room.status === "repair" && "Sedang diperbaiki dan belum bisa dipesan."}
                </p>
              </div>

              <div>
                {room.status === "occupied" && (
                  <button
                    type="button"
                    onClick={() => patchRoom(room.no, { paid: !room.paid })}
                    className={`btn ${room.paid ? "btn-secondary" : "btn-primary"}`}
                  >
                    {room.paid ? "Batalkan lunas" : "Tandai lunas"}
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
                  <button
                    type="button"
                    onClick={() => patchRoom(room.no, { status: "available" })}
                    className="btn btn-secondary"
                  >
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
      <p className="mt-3 text-center text-sm text-gray-600">
        Demo interaktif dengan data contoh. Pilih kamar, lalu coba tandai lunas atau setujui booking.
      </p>
    </div>
  );
}
