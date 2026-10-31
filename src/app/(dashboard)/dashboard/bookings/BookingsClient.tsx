"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, CalendarDays, User, Phone, FileText } from "lucide-react";
import { updateBookingStatus } from "./actions";
import { useRouter } from "next/navigation";

export function BookingsClient({ initialData }: { initialData: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    setLoadingId(id);
    const formData = new FormData();
    formData.append("id", id);
    formData.append("status", status);
    
    await updateBookingStatus(formData);
    setLoadingId(null);
    router.refresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200"><CheckCircle2 className="w-3.5 h-3.5" /> Disetujui</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3.5 h-3.5" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200"><Clock className="w-3.5 h-3.5" /> Menunggu Review</span>;
    }
  };

  if (!initialData || initialData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Belum ada pengajuan pemesanan</h3>
        <p className="text-gray-500 max-w-sm mx-auto">Pengajuan dari website publik akan muncul di sini untuk Anda tinjau.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialData.map((booking) => (
        <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md">
          <div className="p-5 border-b border-gray-50">
            <div className="flex justify-between items-start mb-4">
              {getStatusBadge(booking.status)}
              <span className="text-xs text-gray-500 font-medium">
                {new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{booking.renter_name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <Phone className="w-4 h-4" />
              <a href={`https://wa.me/${booking.renter_phone.replace(/\D/g, '')}`} target="_blank" className="hover:text-indigo-600 hover:underline">
                {booking.renter_phone}
              </a>
            </div>
          </div>
          
          <div className="p-5 flex-1 bg-gray-50/50 space-y-4">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Kamar Pilihan</span>
              <p className="text-sm font-medium text-gray-900">{booking.room_name_snapshot}</p>
            </div>
            
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Rencana Check-in</span>
              <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-500" />
                {new Date(booking.planned_check_in).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {booking.additional_notes && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Catatan</span>
                <p className="text-sm text-gray-600 italic bg-white p-3 rounded-xl border border-gray-100">
                  "{booking.additional_notes}"
                </p>
              </div>
            )}
          </div>

          {booking.status === 'pending' && (
            <div className="p-5 border-t border-gray-50 bg-white grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                disabled={loadingId === booking.id}
                className="py-2.5 px-4 rounded-xl text-sm font-bold border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
              >
                Tolak
              </button>
              <button 
                onClick={() => handleUpdateStatus(booking.id, 'approved')}
                disabled={loadingId === booking.id}
                className="py-2.5 px-4 rounded-xl text-sm font-bold bg-primary text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                Terima
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
