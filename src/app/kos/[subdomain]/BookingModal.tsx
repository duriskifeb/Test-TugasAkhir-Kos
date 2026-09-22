"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Room {
  id: string;
  name: string;
  price: number;
}

interface BookingModalProps {
  tenantId: string;
  room: Room;
  buttonClass: string;
}

export function BookingModal({ tenantId, room, buttonClass }: BookingModalProps) {
  // Kita HAPUS MODAL LAMA, dan ganti perilakunya menjadi REDIRECT ke Halaman Checkout Baru
  const handleCheckoutRedirect = () => {
    // Ambil subdomain dari URL saat ini
    const pathParts = window.location.pathname.split('/');
    const currentSubdomain = pathParts[2] || pathParts[1]; 
    
    // Redirect ke halaman checkout yang baru kita buat
    window.location.href = `/${currentSubdomain}/checkout`;
  };

  return (
    <button onClick={handleCheckoutRedirect} className={buttonClass}>
      Booking
    </button>
  );
}