import Link from "next/link";

interface BookingModalProps {
  subdomain: string;
  roomId: string;
  buttonClass: string;
}

// Nama file dipertahankan; tombol ini mengarahkan ke halaman checkout untuk kamar yang dipilih.
export function BookingModal({ subdomain, roomId, buttonClass }: BookingModalProps) {
  return (
    <Link href={`/kos/${subdomain}/checkout?room=${roomId}`} className={buttonClass}>
      Booking
    </Link>
  );
}
