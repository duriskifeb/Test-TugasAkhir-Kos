"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, Upload, X } from "lucide-react";
import { Counter, Field } from "./fields";
import { KosMap, type PickedPlace } from "./KosMap";
import { slugify } from "@/lib/kos-options";
import type { StepProps } from "./types";

export function StepDataKos({ form, set, errors }: StepProps) {
  const [isSkuExampleOpen, setIsSkuExampleOpen] = useState(false);
  const exampleButtonRef = useRef<HTMLButtonElement>(null);
  const onPick = (p: PickedPlace) =>
    set({
      latitude: p.lat,
      longitude: p.lng,
      street: p.street,
      region: p.region,
    });

  useEffect(() => {
    if (!isSkuExampleOpen) return;
    const trigger = exampleButtonRef.current;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setIsSkuExampleOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [isSkuExampleOpen]);

  return (
    <div className="space-y-6">
      <Field id="ob-name" label="Nama Kos" hint="Tulis tanpa nama kecamatan dan kota." error={errors.name}>
        <input
          id="ob-name"
          type="text"
          maxLength={60}
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            set({ name, ...(form.subdomainTouched ? {} : { subdomain: slugify(name) }) });
          }}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "ob-name-error" : undefined}
          placeholder="Contoh: Kos Sejahtera"
          className="field"
          autoComplete="off"
        />
      </Field>

      <Field
        id="ob-subdomain"
        label="Link Website"
        hint="Alamat halaman promosi yang bisa dibagikan ke calon penyewa. Dibuat otomatis dari nama kos."
        error={errors.subdomain}
      >
        <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgb(47_91_220/0.18)]">
          <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-600">/kos/</span>
          <input
            id="ob-subdomain"
            type="text"
            value={form.subdomain}
            onChange={(e) => set({ subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"), subdomainTouched: true })}
            aria-invalid={!!errors.subdomain}
            aria-describedby={errors.subdomain ? "ob-subdomain-error" : undefined}
            placeholder="kos-sejahtera"
            className="min-h-11 w-full border-none bg-transparent px-3 text-sm outline-none"
            autoComplete="off"
          />
        </div>
      </Field>

      <Field
        id="ob-sku-document"
        label="Bukti Surat Keterangan Usaha (SKU)"
        hint={(
          <>
            Wajib diunggah. Pastikan dokumen mencantumkan perincian, tanda tangan dari desa, dan stempel desa.
            {" "}Format PDF, JPG, atau PNG; maksimal 5 MB.{" "}
            <button
              type="button"
              onClick={() => setIsSkuExampleOpen(true)}
              ref={exampleButtonRef}
              className="font-semibold text-primary underline underline-offset-2 hover:text-primary-hover"
              aria-haspopup="dialog"
            >
              Lihat contoh
            </button>
          </>
        )}
        error={errors.skuDocument}
      >
        <div className="rounded-lg border border-gray-200 p-4">
          <input
            id="ob-sku-document"
            type="file"
            accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
            className="sr-only"
            aria-invalid={!!errors.skuDocument}
            aria-describedby={errors.skuDocument
              ? "ob-sku-document-hint ob-sku-document-error"
              : "ob-sku-document-hint"}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              if (!file) return;
              set({ skuDocument: file });
              event.target.value = "";
            }}
          />
          {form.skuDocument ? (
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-sm text-gray-800">
                <FileText className="size-5 shrink-0 text-primary" />
                <span className="truncate">{form.skuDocument.name}</span>
                <span className="shrink-0 text-xs text-gray-500">
                  ({(form.skuDocument.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </span>
              <button
                type="button"
                onClick={() => set({ skuDocument: null })}
                className="shrink-0 rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Hapus bukti SKU"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="ob-sku-document"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Upload className="size-4" />
              Pilih file bukti SKU
            </label>
          )}
        </div>
      </Field>

      {isSkuExampleOpen && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden overscroll-contain bg-gray-900/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsSkuExampleOpen(false);
          }}
          onWheel={(event) => event.preventDefault()}
          onTouchMove={(event) => event.preventDefault()}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sku-example-title"
            className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-pop sm:p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="sku-example-title" className="text-base font-bold text-gray-900">
                  Contoh dokumen SKU
                </h2>
                <p className="mt-1 text-xs text-gray-600">
                  Ilustrasi kecil, bukan dokumen resmi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSkuExampleOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Tutup contoh SKU"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mx-auto mt-4 max-w-[250px] border border-gray-300 bg-white p-3 shadow-sm">
              <div className="border-b-2 border-gray-800 pb-2 text-center">
                <p className="text-[8px] font-medium uppercase tracking-wide text-gray-600">Pemerintah Desa / Kelurahan</p>
                <p className="mt-1 text-[10px] font-bold uppercase text-gray-900">Nama Desa / Kelurahan</p>
                <p className="text-[8px] text-gray-600">Alamat kantor desa · Kecamatan · Kabupaten/Kota</p>
              </div>
              <div className="py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-900">Surat Keterangan Usaha</p>
                <p className="mt-1 text-[8px] text-gray-700">Nomor: [nomor surat dari desa]</p>
              </div>
              <div className="space-y-2 text-[8px] text-gray-800">
                <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
                <div className="grid grid-cols-[4.5rem_1fr] gap-y-1">
                  <span>Nama</span><span>: [nama pemilik usaha]</span>
                  <span>Alamat</span><span>: [alamat usaha sesuai lokasi]</span>
                  <span>Jenis usaha</span><span>: [jenis usaha sesuai keterangan resmi]</span>
                  <span>Rincian usaha</span><span>: [perincian usaha yang diterangkan]</span>
                </div>
                <p className="pt-1">Surat ini dibuat untuk digunakan sebagaimana mestinya.</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center text-[8px] text-gray-700">
                <div>
                  <p>Pemilik usaha</p>
                  <div className="mt-6 border-b border-dashed border-gray-400" />
                  <p className="mt-1">Tanda tangan</p>
                </div>
                <div>
                  <p>Pejabat desa/kelurahan</p>
                  <div className="mx-auto mt-1 flex size-10 items-center justify-center rounded-full border border-dashed border-gray-400 text-[7px] text-gray-500">
                    Stempel
                  </div>
                  <div className="mt-1 border-b border-dashed border-gray-400" />
                  <p className="mt-1">Tanda tangan + nama</p>
                </div>
              </div>
            </div>

            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
              Hanya ilustrasi, bukan template. Gunakan SKU resmi dari desa/kelurahan dengan tanda tangan dan stempel.
            </p>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setIsSkuExampleOpen(false)} className="btn btn-primary px-3 py-1.5 text-sm">
                Mengerti
              </button>
            </div>
          </section>
        </div>,
        document.body,
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-800">Alamat Kos</h3>
        <KosMap latitude={form.latitude} longitude={form.longitude} onPick={onPick} />
        <p className="text-xs text-gray-600">
          Alamat jalan dan wilayah mengikuti data peta pada posisi pin. Periksa kembali, lalu lengkapi nomor rumah atau RT/RW jika belum tersedia.
        </p>

        <Field id="ob-street" label="Nama jalan, nomor, RT/RW" error={errors.street}>
          <input
            id="ob-street"
            type="text"
            value={form.street}
            onChange={(e) => set({ street: e.target.value })}
            aria-invalid={!!errors.street}
            aria-describedby={errors.street ? "ob-street-error" : undefined}
            placeholder="Contoh: Jl. Raya Bulusari No. 29, RT 03/RW 07"
            className="field"
            autoComplete="street-address"
          />
        </Field>

        <Field id="ob-region" label="Kelurahan, kecamatan, kota/kabupaten, provinsi" error={errors.region}>
          <input
            id="ob-region"
            type="text"
            value={form.region}
            onChange={(e) => set({ region: e.target.value })}
            aria-invalid={!!errors.region}
            aria-describedby={errors.region ? "ob-region-error" : undefined}
            placeholder="Contoh: Karangrejo, Gempol, Kabupaten Pasuruan, Jawa Timur 67155"
            className="field"
          />
        </Field>
      </div>

      <Field id="ob-landmark" label="Patokan Alamat" optional hint="Bantu calon penyewa menemukan kos, misalnya dekat kampus atau di sebelah minimarket." error={errors.landmark}>
        <textarea
          id="ob-landmark"
          rows={3}
          value={form.landmark}
          onChange={(e) => set({ landmark: e.target.value })}
          className="field resize-none"
        />
        <Counter value={form.landmark.length} max={500} />
      </Field>
    </div>
  );
}
