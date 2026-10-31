import { createRoom } from "../actions";
import { RoomForm } from "../RoomForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateRoomPage() {
  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/rooms"
          aria-label="Kembali ke daftar kamar"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Kamar Baru</h1>
          <p className="text-gray-500 mt-1">Masukkan detail tipe kamar yang akan disewakan.</p>
        </div>
      </div>

      <RoomForm action={createRoom} submitLabel="Simpan Kamar Baru" />
    </div>
  );
}
