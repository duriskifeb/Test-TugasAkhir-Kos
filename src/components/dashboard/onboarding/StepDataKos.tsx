"use client";

import { Counter, Field } from "./fields";
import { KosMap, type PickedPlace } from "./KosMap";
import { slugify } from "@/lib/kos-options";
import type { StepProps } from "./types";

export function StepDataKos({ form, set, errors }: StepProps) {
  const onPick = (p: PickedPlace) =>
    set({
      latitude: p.lat,
      longitude: p.lng,
      ...(p.region ? { region: p.region } : {}),
      ...(p.street && (p.fromSearch || !form.street) ? { street: p.street } : {}),
    });

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

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-800">Alamat Kos</h3>
        <KosMap latitude={form.latitude} longitude={form.longitude} onPick={onPick} />
        <p className="text-xs text-gray-600">Periksa dan lengkapi alamat dengan nama jalan, nomor rumah (jika ada), serta RT/RW.</p>

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
