"use client";

import { Choice, Field, Group } from "./fields";
import { formatSize, quickSizes, sizeOptions, tenantTypeLabel, type TenantType } from "@/lib/kos-options";
import type { StepProps } from "./types";

const tenantTypes: { value: TenantType; note?: string }[] = [
  { value: "putra" },
  { value: "putri" },
  { value: "campur", note: "Campur berarti kamar dapat disewa oleh putra maupun putri." },
];

const sizeLabel = (n: number) => String(n).replace(".", ",");

export function StepKamar({ form, set, errors }: StepProps) {
  const price = form.price ? Number(form.price).toLocaleString("id-ID") : "";

  return (
    <div className="space-y-6">
      <p className="rounded-lg bg-primary-soft p-3 text-sm text-gray-800">
        Isi data satu tipe kamar. Semua kamar dibuat berstatus <strong>tersedia</strong>, dan penghuni yang sudah menempati
        kamar ditambahkan lewat menu Penyewa. Tipe kamar lain bisa ditambah nanti di menu Kamar.
      </p>

      <Field
        id="ob-roomtype"
        label="Nama Tipe Kamar"
        optional
        hint="Jika Anda punya beberapa tipe kamar, isi nama tipe sebagai pembeda. Nama ini menjadi awalan nomor kamar, misalnya Tipe A 1."
        error={errors.roomType}
      >
        <input
          id="ob-roomtype"
          type="text"
          maxLength={40}
          value={form.roomType}
          onChange={(e) => set({ roomType: e.target.value })}
          placeholder="Contoh: Tipe A"
          className="field"
          autoComplete="off"
        />
      </Field>

      <Group legend="Tipe Penyewa yang Diperbolehkan" error={errors.tenantType}>
        <div className="grid grid-cols-3 gap-2">
          {tenantTypes.map((t) => (
            <Choice key={t.value} type="radio" name="ob-tenant-type" checked={form.tenantType === t.value} onChange={() => set({ tenantType: t.value })}>
              {tenantTypeLabel[t.value]}
            </Choice>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-gray-600">{tenantTypes[2].note}</p>
      </Group>

      <Group legend="Ukuran Kamar">
        <div className="mb-2 flex flex-wrap gap-2">
          {quickSizes.map(([l, w]) => (
            <Choice
              key={`${l}x${w}`}
              type="radio"
              name="ob-size-quick"
              checked={form.sizeLength === l && form.sizeWidth === w}
              onChange={() => set({ sizeLength: l, sizeWidth: w })}
            >
              {formatSize(l, w)}
            </Choice>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="ob-size-length">Panjang kamar dalam meter</label>
          <select
            id="ob-size-length"
            value={form.sizeLength}
            onChange={(e) => set({ sizeLength: Number(e.target.value) })}
            className="field"
          >
            {sizeOptions.map((n) => (
              <option key={n} value={n}>{sizeLabel(n)}</option>
            ))}
          </select>
          <span aria-hidden className="text-gray-600">×</span>
          <label className="sr-only" htmlFor="ob-size-width">Lebar kamar dalam meter</label>
          <select
            id="ob-size-width"
            value={form.sizeWidth}
            onChange={(e) => set({ sizeWidth: Number(e.target.value) })}
            className="field"
          >
            {sizeOptions.map((n) => (
              <option key={n} value={n}>{sizeLabel(n)}</option>
            ))}
          </select>
          <span className="shrink-0 text-sm text-gray-600">meter</span>
        </div>
      </Group>

      <Field id="ob-count" label="Total Kamar" hint="Maksimal 100 kamar." error={errors.count}>
        <input
          id="ob-count"
          type="number"
          inputMode="numeric"
          min={1}
          max={100}
          value={Number.isNaN(form.count) ? "" : form.count}
          onChange={(e) => set({ count: e.target.value === "" ? NaN : Number(e.target.value) })}
          aria-invalid={!!errors.count}
          aria-describedby={errors.count ? "ob-count-error" : undefined}
          className="field sm:max-w-40"
        />
      </Field>

      <Field
        id="ob-price"
        label="Harga Sewa Per Bulan"
        hint="Wajib diisi sebagai harga sewa dasar."
        error={errors.price}
      >
        <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgb(47_91_220/0.18)] sm:max-w-xs">
          <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-600">Rp</span>
          <input
            id="ob-price"
            type="text"
            inputMode="numeric"
            value={price}
            onChange={(e) => set({ price: e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10) })}
            aria-invalid={!!errors.price}
            aria-describedby={errors.price ? "ob-price-error" : undefined}
            placeholder="1.500.000"
            className="min-h-11 w-full border-none bg-transparent px-3 text-sm outline-none"
            autoComplete="off"
          />
        </div>
      </Field>
    </div>
  );
}
