"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Sparkles, X } from "lucide-react";
import { Choice, Counter, Field, Group, SectionTitle } from "./fields";
import {
  MAX_PHOTOS,
  MAX_PHOTOS_PER_CATEGORY,
  PHOTO_ACCEPT,
  facilitySections,
  generateDescription,
  photoCategories,
  toggleFacility,
  type PhotoCategoryId,
  type Rules,
} from "@/lib/kos-options";
import { PhotoError, preparePhoto } from "@/lib/photo";
import type { StepProps } from "./types";

// ---------------------------------------------------------------- foto

// Pratinjau menampilkan foto utuh (object-contain), jadi foto potret maupun lanskap tidak terpotong.
function Thumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <div className="relative aspect-[4/3] w-28 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`Pratinjau ${file.name}`} className="size-full object-contain" />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Hapus foto ${file.name}`}
        className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-white/90 text-gray-800 shadow-card hover:bg-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function PhotoPicker({ form, set }: Pick<StepProps, "form" | "set">) {
  const [message, setMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const total = Object.values(form.photos).reduce((n, list) => n + list.length, 0);

  // Setiap foto diperiksa isinya lalu digambar ulang ke JPEG sebelum masuk daftar (lihat src/lib/photo.ts).
  async function add(category: PhotoCategoryId, files: FileList | null) {
    if (!files) return;
    const current = form.photos[category];
    const accepted: File[] = [];
    let note: string | null = null;
    setProcessing(true);
    setMessage(null);
    for (const file of Array.from(files)) {
      if (current.length + accepted.length >= MAX_PHOTOS_PER_CATEGORY) {
        note = `Maksimal ${MAX_PHOTOS_PER_CATEGORY} foto per kategori.`;
        break;
      }
      if (total + accepted.length >= MAX_PHOTOS) {
        note = `Maksimal ${MAX_PHOTOS} foto, sesuai Galeri Website Builder.`;
        break;
      }
      try {
        accepted.push(await preparePhoto(file));
      } catch (err) {
        note = err instanceof PhotoError ? err.message : `${file.name} tidak bisa diproses.`;
      }
    }
    setProcessing(false);
    setMessage(note);
    if (accepted.length) set({ photos: { ...form.photos, [category]: [...current, ...accepted] } });
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Foto Fasilitas dan Bangunan Kos</SectionTitle>
      <p className="text-sm text-gray-600">
        Foto yang jelas dan terang membuat halaman kos lebih menarik. Foto tampil di Galeri halaman publik. Opsional,
        maksimal {MAX_PHOTOS_PER_CATEGORY} foto per kategori, format JPG, PNG, atau WebP, dan 5 MB per foto.
      </p>
      <p className="text-xs text-gray-600">
        Foto diperkecil otomatis, dan data tersembunyi di dalam foto (termasuk lokasi GPS) dihapus sebelum diunggah.
      </p>
      {photoCategories.map((cat) => {
        const list = form.photos[cat.id];
        const inputId = `ob-photo-${cat.id}`;
        return (
          <div key={cat.id} className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-800">{cat.title}</p>
            <p className="mt-0.5 text-xs text-gray-600">{cat.hint}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {list.map((file, i) => (
                <Thumb key={`${file.name}-${file.lastModified}-${i}`} file={file} onRemove={() => set({ photos: { ...form.photos, [cat.id]: list.filter((_, idx) => idx !== i) } })} />
              ))}
              {list.length < MAX_PHOTOS_PER_CATEGORY && (
                <>
                  <input
                    id={inputId}
                    type="file"
                    accept={PHOTO_ACCEPT}
                    multiple
                    disabled={processing}
                    className="sr-only peer"
                    onChange={(e) => {
                      void add(cat.id, e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <label
                    htmlFor={inputId}
                    aria-disabled={processing}
                    className={`btn btn-secondary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                      processing ? "pointer-events-none opacity-60" : "cursor-pointer"
                    }`}
                  >
                    <ImagePlus className="size-4" />
                    {processing ? "Memproses..." : "Tambah Foto"}
                  </label>
                </>
              )}
            </div>
          </div>
        );
      })}
      <p aria-live="polite" className="min-h-5 text-sm font-medium text-red-700">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------- fasilitas

function FacilityPicker({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <SectionTitle>Fasilitas Kos</SectionTitle>
      <p className="text-sm text-gray-600">Lengkapi fasilitas sesuai foto agar kos lebih mudah ditemukan calon penyewa.</p>
      {errors.facilities && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">{errors.facilities}</p>
      )}
      {facilitySections.map((section) => (
        <div key={section.id} className="space-y-4 rounded-xl border border-gray-200 p-4">
          <div>
            <h4 className="font-semibold text-gray-900">{section.title}</h4>
            <p className="text-xs text-gray-600">{section.hint}</p>
          </div>
          {section.groups.map((group) => (
            <Group key={group.id} legend={group.title} optional={group.id === "parkir"}>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Choice
                    key={item}
                    type="checkbox"
                    name={`ob-fac-${group.id}`}
                    checked={form.facilities[group.id]?.includes(item) ?? false}
                    onChange={() => set({ facilities: toggleFacility(form.facilities, group, item) })}
                  >
                    {item}
                  </Choice>
                ))}
              </div>
            </Group>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- peraturan

function YesNo({ legend, name, value, onChange }: { legend: string; name: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Group legend={legend}>
      <div className="flex gap-2">
        <Choice type="radio" name={name} checked={value} onChange={() => onChange(true)}>Ya</Choice>
        <Choice type="radio" name={name} checked={!value} onChange={() => onChange(false)}>Tidak</Choice>
      </div>
    </Group>
  );
}

function RulesPicker({ form, set }: Pick<StepProps, "form" | "set">) {
  const r = form.rules;
  const patch = (p: Partial<Rules>) => set({ rules: { ...r, ...p } });
  const patchGuests = (p: Partial<Rules["guests"]>) => patch({ guests: { ...r.guests, ...p } });

  return (
    <div className="space-y-5">
      <SectionTitle>Peraturan dan Ketentuan Kos</SectionTitle>
      <p className="text-sm text-gray-600">Opsional, tetapi dianjurkan agar jelas bagi calon penyewa.</p>

      <Group legend="Kriteria Calon Penyewa">
        <div className="flex flex-wrap gap-2">
          {([["semua", "Bisa untuk Semua"], ["mahasiswa", "Khusus Mahasiswa"], ["karyawan", "Khusus Karyawan"]] as const).map(([value, label]) => (
            <Choice key={value} type="radio" name="ob-criteria" checked={r.criteria === value} onChange={() => patch({ criteria: value })}>{label}</Choice>
          ))}
        </div>
      </Group>

      <Field id="ob-capacity" label="Kapasitas Penghuni" hint="Jumlah maksimum penghuni per kamar.">
        <select id="ob-capacity" value={r.capacity} onChange={(e) => patch({ capacity: Number(e.target.value) })} className="field sm:max-w-40">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n} orang</option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <YesNo legend="Boleh bawa anak" name="ob-children" value={r.allowChildren} onChange={(v) => patch({ allowChildren: v })} />
        <YesNo legend="Boleh untuk pasangan suami istri" name="ob-couples" value={r.allowCouples} onChange={(v) => patch({ allowCouples: v })} />
        <YesNo legend="Wajib sertakan KTP saat pengajuan sewa" name="ob-ktp" value={r.requireKtp} onChange={(v) => patch({ requireKtp: v })} />
        <YesNo legend="Boleh bawa hewan" name="ob-pets" value={r.allowPets} onChange={(v) => patch({ allowPets: v })} />
      </div>

      <Group legend="Akses Jam Malam">
        <div className="flex gap-2">
          <Choice type="radio" name="ob-curfew" checked={r.curfew === "24jam"} onChange={() => patch({ curfew: "24jam" })}>Akses 24 jam</Choice>
          <Choice type="radio" name="ob-curfew" checked={r.curfew === "jam_malam"} onChange={() => patch({ curfew: "jam_malam" })}>Ada jam malam</Choice>
        </div>
      </Group>

      <Group legend="Larangan Penyewa">
        <div className="flex flex-wrap gap-2">
          <Choice type="checkbox" name="ob-nosmoking" checked={r.noSmoking} onChange={() => patch({ noSmoking: !r.noSmoking })}>Dilarang merokok di kamar</Choice>
        </div>
      </Group>

      <YesNo legend="Boleh menerima tamu" name="ob-guests" value={r.guests.allowed} onChange={(v) => patchGuests({ allowed: v })} />
      {r.guests.allowed && (
        <Group legend="Peraturan Tamu">
          <div className="flex flex-wrap gap-2">
            <Choice type="checkbox" name="ob-g1" checked={r.guests.noOppositeGender} onChange={() => patchGuests({ noOppositeGender: !r.guests.noOppositeGender })}>Dilarang membawa tamu lawan jenis</Choice>
            <Choice type="checkbox" name="ob-g2" checked={r.guests.overnightAllowed} onChange={() => patchGuests({ overnightAllowed: !r.guests.overnightAllowed })}>Tamu boleh menginap</Choice>
            <Choice type="checkbox" name="ob-g3" checked={r.guests.overnightFee} onChange={() => patchGuests({ overnightFee: !r.guests.overnightFee })}>Tamu menginap dikenakan biaya</Choice>
            <Choice type="checkbox" name="ob-g4" checked={r.guests.curfew} onChange={() => patchGuests({ curfew: !r.guests.curfew })}>Ada jam malam untuk tamu</Choice>
          </div>
        </Group>
      )}

      <Group legend="Lainnya">
        <div className="flex flex-wrap gap-2">
          <Choice type="checkbox" name="ob-fine" checked={r.damageFine} onChange={() => patch({ damageFine: !r.damageFine })}>Denda kerusakan barang kos</Choice>
          <Choice type="checkbox" name="ob-picket" checked={r.pickets} onChange={() => patch({ pickets: !r.pickets })}>Wajib ikut piket</Choice>
        </div>
      </Group>
    </div>
  );
}

// ---------------------------------------------------------------- langkah 3

export function StepFotoFasilitas({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-8">
      <PhotoPicker form={form} set={set} />
      <FacilityPicker form={form} set={set} errors={errors} />
      <RulesPicker form={form} set={set} />

      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <label htmlFor="ob-description" className="text-sm font-medium text-gray-800">
            Deskripsi Kos <span className="text-xs font-normal text-gray-600">(opsional)</span>
          </label>
          <button
            type="button"
            onClick={() =>
              set({
                description: generateDescription({
                  name: form.name.trim(),
                  region: form.region.trim(),
                  tenantType: form.tenantType,
                  count: form.count,
                  size: [form.sizeLength, form.sizeWidth],
                  price: Number(form.price),
                  facilities: form.facilities,
                  rules: form.rules,
                }),
              })
            }
            className="btn btn-secondary"
          >
            <Sparkles className="size-4" />
            Buat Otomatis
          </button>
        </div>
        <p className="text-xs text-gray-600">
          Tulis sendiri, atau klik &quot;Buat Otomatis&quot; untuk menyusun deskripsi dari data yang sudah Anda isi. Anda tetap bisa mengubahnya.
        </p>
        <textarea
          id="ob-description"
          rows={5}
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          aria-invalid={!!errors.description}
          className="field resize-none"
        />
        <Counter value={form.description.length} max={1500} />
        {errors.description && <p role="alert" className="text-sm font-medium text-red-700">{errors.description}</p>}
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => set({ agree: e.target.checked })}
            aria-invalid={!!errors.agree}
            className="mt-0.5 size-5 shrink-0"
          />
          <span className="text-sm text-gray-800">
            Saya menyetujui{" "}
            <Link href="/kebijakan-privasi" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">
              Kebijakan Privasi
            </Link>{" "}
            Build Kos dan data kos yang saya isi dapat ditampilkan di halaman promosi kos saya.
          </span>
        </label>
        {errors.agree && <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">{errors.agree}</p>}
      </div>
    </div>
  );
}
