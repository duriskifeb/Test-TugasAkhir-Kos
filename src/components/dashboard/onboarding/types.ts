import {
  defaultRules,
  highlightsFrom,
  missingRequiredGroups,
  parseFacilities,
  roomFacilities,
  SKU_DOCUMENT_MAX_BYTES,
  SKU_DOCUMENT_MIME_TYPES,
  type Facilities,
  type KosPayload,
  type PhotoCategoryId,
  type Rules,
  type TenantType,
} from "@/lib/kos-options";

export type WizardForm = {
  name: string;
  subdomain: string;
  subdomainTouched: boolean;
  skuDocument: File | null;
  street: string;
  region: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  roomType: string;
  tenantType: TenantType | null;
  sizeLength: number;
  sizeWidth: number;
  count: number;
  /** Hanya angka, tanpa pemisah ribuan. */
  price: string;
  photos: Record<PhotoCategoryId, File[]>;
  facilities: Facilities;
  rules: Rules;
  description: string;
  agree: boolean;
};

export const initialForm: WizardForm = {
  name: "",
  subdomain: "",
  subdomainTouched: false,
  skuDocument: null,
  street: "",
  region: "",
  landmark: "",
  latitude: null,
  longitude: null,
  roomType: "",
  tenantType: null,
  sizeLength: 3,
  sizeWidth: 3,
  count: 1,
  price: "",
  photos: { building: [], common: [], street: [] },
  facilities: {},
  rules: defaultRules,
  description: "",
  agree: false,
};

/** Menyusun muatan untuk fungsi database dari isian wizard dan alamat foto yang sudah diunggah. */
export function buildPayload(form: WizardForm, photoUrls: string[], skuDocumentPath: string): KosPayload {
  return {
    name: form.name.trim(),
    subdomain: form.subdomain,
    sku_document_path: skuDocumentPath,
    address: `${form.street.trim()}, ${form.region.trim()}`,
    landmark: form.landmark.trim(),
    latitude: form.latitude,
    longitude: form.longitude,
    description: form.description.trim(),
    facilities: parseFacilities(form.facilities),
    rules: form.rules,
    highlights: highlightsFrom(form.facilities),
    room_facilities: roomFacilities(form.facilities),
    photos: photoUrls,
    room: {
      type: form.roomType.trim(),
      tenant_type: form.tenantType as TenantType,
      size_length: form.sizeLength,
      size_width: form.sizeWidth,
      count: form.count,
      price: Number(form.price),
    },
  };
}

export type Errors = Partial<Record<string, string>>;

export type StepProps = {
  form: WizardForm;
  set: (patch: Partial<WizardForm>) => void;
  errors: Errors;
};

export const stepTitles = ["Data Kos", "Kamar Kos", "Foto & Fasilitas"] as const;

export function validateStep(form: WizardForm, step: number): Errors {
  const errors: Errors = {};

  if (step === 0) {
    if (form.name.trim().length < 3) errors.name = "Nama kos minimal 3 karakter.";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.subdomain) || form.subdomain.length < 3) {
      errors.subdomain = "Link website minimal 3 karakter: huruf kecil, angka, dan tanda hubung.";
    }
    if (!form.skuDocument) errors.skuDocument = "Bukti SKU wajib diunggah.";
    else if (!SKU_DOCUMENT_MIME_TYPES.some((type) => type === form.skuDocument?.type)) {
      errors.skuDocument = "Bukti SKU harus berupa PDF, JPG, atau PNG.";
    } else if (form.skuDocument.size > SKU_DOCUMENT_MAX_BYTES) {
      errors.skuDocument = "Ukuran bukti SKU maksimal 5 MB.";
    }
    if (!form.street.trim()) errors.street = "Alamat jalan wajib diisi.";
    if (!form.region.trim()) errors.region = "Kelurahan, kecamatan, dan kota wajib diisi.";
    if (form.landmark.length > 500) errors.landmark = "Patokan alamat maksimal 500 karakter.";
  }

  if (step === 1) {
    if (!form.tenantType) errors.tenantType = "Pilih tipe penyewa yang diperbolehkan.";
    if (!Number.isInteger(form.count) || form.count < 1 || form.count > 100) {
      errors.count = "Jumlah kamar harus antara 1 dan 100.";
    }
    if (!(Number(form.price) > 0)) errors.price = "Harga sewa per bulan wajib diisi.";
    if (form.roomType.length > 40) errors.roomType = "Nama tipe kamar maksimal 40 karakter.";
  }

  if (step === 2) {
    const missing = missingRequiredGroups(form.facilities);
    if (missing.length) errors.facilities = `Lengkapi fasilitas dasar: ${missing.join(", ")}.`;
    if (form.description.length > 1500) errors.description = "Deskripsi maksimal 1500 karakter.";
    if (!form.agree) errors.agree = "Anda perlu menyetujui Kebijakan Privasi untuk melanjutkan.";
  }

  return errors;
}
