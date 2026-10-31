import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateRoom } from "../../actions";
import { RoomForm } from "../../RoomForm";

export default async function EditRoomPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: room } = await supabase
    .from("rooms")
    .select("id, name, price, status, facilities, room_type, tenant_type, size_length, size_width")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!room) notFound();

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
          <h1 className="text-2xl font-bold text-gray-900">Ubah Kamar</h1>
          <p className="text-gray-500 mt-1">
            Perubahan nama atau harga hanya berlaku untuk transaksi berikutnya. Booking, penghuni, dan tagihan yang
            sudah ada tetap memakai nilai lamanya.
          </p>
        </div>
      </div>

      <RoomForm action={updateRoom} submitLabel="Simpan Perubahan" room={room} />
    </div>
  );
}
