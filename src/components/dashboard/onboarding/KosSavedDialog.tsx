"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Clock } from "lucide-react";

/** Popup setelah kos berhasil disimpan: data masuk antrean verifikasi dan pemilik diminta menunggu konfirmasi admin. */
export function KosSavedDialog({ name, onDone }: { name: string; onDone: () => void }) {
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    button.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kos-saved-title"
      aria-describedby="kos-saved-desc"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/30 p-3 sm:p-6"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-pop sm:p-8">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-50 text-green-700">
          <CheckCircle2 className="size-8" />
        </span>
        <h2 id="kos-saved-title" className="mt-5 font-display text-2xl font-bold tracking-tight text-gray-900">
          Data kos berhasil disimpan
        </h2>
        <p id="kos-saved-desc" className="mt-2 text-gray-700">
          Kos &quot;{name}&quot; sudah terdaftar dan datanya sudah dikirim ke admin.
        </p>

        <div role="status" className="mt-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-left">
          <Clock className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-bold text-amber-900">Menunggu konfirmasi admin</p>
            <p className="mt-1 text-sm text-amber-900">
              Mohon tunggu. Admin akan memeriksa data kos Anda. Dashboard dan website kos bisa dipakai setelah admin
              mengonfirmasi.
            </p>
          </div>
        </div>

        <button ref={button} type="button" onClick={onDone} className="btn btn-primary btn-lg mt-6 w-full">
          Mengerti
        </button>
      </div>
    </div>
  );
}
