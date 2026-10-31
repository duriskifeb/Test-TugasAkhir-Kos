"use client";

import { Clock, DoorClosed, DoorOpen, Wrench, type LucideIcon } from "lucide-react";
import { tileStatusLabel, type TileStatus } from "@/components/ui/StatusTile";
import { selectRoom, useRooms } from "./rooms";

const statusIcon: Record<TileStatus, LucideIcon> = {
  available: DoorOpen,
  occupied: DoorClosed,
  repair: Wrench,
  pending: Clock,
};

const statusClass: Record<TileStatus, string> = {
  available: "border-gray-300 bg-white text-gray-700 hover:border-gray-400",
  occupied: "border-primary bg-primary text-white hover:bg-primary-hover",
  repair: "border-brand bg-brand-soft text-gray-900 hover:brightness-95",
  pending: "border-dashed border-primary bg-primary-soft text-primary hover:bg-primary-tint",
};

/** Penanda status: ikon pintu, kunci pas, atau jam di atas warna status. */
export function StatusBadge({ status }: { status: TileStatus }) {
  const Icon = statusIcon[status];
  return (
    <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-md border ${statusClass[status]}`}>
      <Icon className="size-4" strokeWidth={1.75} />
    </span>
  );
}

export function RoomLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
      {(Object.keys(tileStatusLabel) as TileStatus[]).map((status) => (
        <li key={status} className="flex items-center gap-2">
          <StatusBadge status={status} />
          {tileStatusLabel[status]}
        </li>
      ))}
    </ul>
  );
}

export function RoomBoard() {
  const { rooms, selected } = useRooms();

  return (
    <div className="space-y-4">
      {[1, 2].map((floor) => (
        <div key={floor}>
          <p className="mb-2 text-xs font-semibold text-gray-600">Lantai {floor}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {rooms
              .filter((room) => Math.floor(room.no / 100) === floor)
              .map((room) => {
                const Icon = statusIcon[room.status];
                return (
                  <button
                    key={room.no}
                    type="button"
                    onClick={() => selectRoom(room.no)}
                    aria-pressed={selected === room.no}
                    aria-label={`Kamar ${room.no}, ${tileStatusLabel[room.status].toLowerCase()}${room.name ? `, ${room.name}` : ""}`}
                    className={`flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1 py-3 transition-colors active:scale-[0.98] ${statusClass[room.status]} ${
                      selected === room.no ? "outline-2 outline-offset-2 outline-gray-900" : ""
                    }`}
                  >
                    <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                    <span className="font-mono text-sm font-bold">{room.no}</span>
                    <span className="w-full truncate text-center text-xs">{room.name ?? tileStatusLabel[room.status]}</span>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
