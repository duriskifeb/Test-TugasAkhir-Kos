"use client";

import { useSyncExternalStore } from "react";
import type { TileStatus } from "@/components/ui/StatusTile";

export type Room = {
  no: number;
  status: TileStatus;
  rent: number;
  facilities: string;
  /** Penghuni, atau pemohon bila status menunggu. */
  name?: string;
  paid?: boolean;
};

type State = { rooms: Room[]; selected: number | null };

const standar = { rent: 1450000, facilities: "AC, Wi-Fi" };
const deluxe = { rent: 1650000, facilities: "AC, Wi-Fi, kamar mandi dalam" };

// Data contoh, bukan data pelanggan. Hero dan Alur kerja langkah 2 membaca data yang sama.
const initial: State = {
  selected: null,
  rooms: [
    { no: 101, status: "occupied", name: "Adit", paid: true, ...standar },
    { no: 102, status: "occupied", name: "Rizky", paid: false, ...standar },
    { no: 103, status: "available", ...standar },
    { no: 104, status: "occupied", name: "Maya", paid: true, ...standar },
    { no: 105, status: "occupied", name: "Fajar", paid: true, ...standar },
    { no: 106, status: "pending", name: "Nadia", ...standar },
    { no: 201, status: "occupied", name: "Bagas", paid: true, ...deluxe },
    { no: 202, status: "available", ...deluxe },
    { no: 203, status: "occupied", name: "Putri", paid: true, ...deluxe },
    { no: 204, status: "occupied", name: "Hendra", paid: false, ...deluxe },
    { no: 205, status: "occupied", name: "Salsabila", paid: true, ...deluxe },
    { no: 206, status: "repair", ...deluxe },
  ],
};

let state = initial;
const listeners = new Set<() => void>();

const set = (next: State) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const selectRoom = (no: number) => set({ ...state, selected: no });

export const patchRoom = (no: number, changes: Partial<Room>) =>
  set({ ...state, rooms: state.rooms.map((room) => (room.no === no ? { ...room, ...changes } : room)) });

export const useRooms = () => useSyncExternalStore(subscribe, () => state, () => initial);

export const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
