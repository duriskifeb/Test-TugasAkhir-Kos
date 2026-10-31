// Pilihan dan teks bantu untuk pendaftaran kos (wizard) dan halaman publik kos.
// Dipakai bersama oleh form di dashboard dan oleh halaman publik, supaya label tidak ganda.

export type TenantType = "putra" | "putri" | "campur";

export const tenantTypeLabel: Record<TenantType, string> = {
  putra: "Putra",
  putri: "Putri",
  campur: "Campur",
};

// ---------------------------------------------------------------- fasilitas

export type FacilityGroup = {
  id: string;
  title: string;
  items: string[];
  /** Pasangan yang saling meniadakan, misalnya "Kasur" dan "Tanpa Kasur". */
  opposites?: Record<string, string>;
  /** Minimal satu pilihan wajib diisi. */
  required?: boolean;
};

export type FacilitySection = { id: "dasar" | "lanjutan" | "bersama"; title: string; hint: string; groups: FacilityGroup[] };

const pair = (a: string, b: string) => ({ [a]: b, [b]: a });

export const facilitySections: FacilitySection[] = [
  {
    id: "dasar",
    title: "Fasilitas Dasar",
    hint: "Wajib diisi. Calon penyewa sangat ingin tahu informasi ini.",
    groups: [
      { id: "kamar_mandi", title: "Kamar Mandi", required: true, items: ["K. Mandi Dalam", "K. Mandi Luar"], opposites: pair("K. Mandi Dalam", "K. Mandi Luar") },
      {
        id: "kamar_tidur",
        title: "Kamar Tidur",
        items: ["Kasur", "Tanpa Kasur", "Bantal", "Tanpa Bantal", "Guling", "Tanpa Guling"],
        opposites: { ...pair("Kasur", "Tanpa Kasur"), ...pair("Bantal", "Tanpa Bantal"), ...pair("Guling", "Tanpa Guling") },
      },
      { id: "udara", title: "Sirkulasi Udara Kamar Tidur", required: true, items: ["AC", "Ventilasi", "Jendela", "Kipas Angin"] },
      {
        id: "layanan",
        title: "Layanan Kos",
        items: ["Wifi", "Dispenser Bersama", "Kulkas Bersama", "Dapur Bersama", "Termasuk Listrik", "Tidak Termasuk Listrik"],
        opposites: pair("Termasuk Listrik", "Tidak Termasuk Listrik"),
      },
      { id: "keamanan", title: "Keamanan", items: ["Kunci Gerbang", "Penjaga Kos", "Pengurus Kos", "CCTV", "Kartu Akses Masuk"] },
      { id: "parkir", title: "Parkir Kendaraan", items: ["Mobil", "Motor"] },
    ],
  },
  {
    id: "lanjutan",
    title: "Fasilitas Lanjutan",
    hint: "Opsional, tetapi sebaiknya diisi karena calon penyewa juga mencari informasi ini.",
    groups: [
      { id: "perabot_tidur", title: "Perabot Kamar Tidur", items: ["Lemari Pakaian", "Meja", "Meja Rias", "Cermin", "Sofa", "Kursi"] },
      {
        id: "perabot_mandi",
        title: "Perabot Kamar Mandi",
        items: ["Kloset Duduk", "Kloset Jongkok", "Wastafel", "Ember Mandi", "Shower", "Bak Mandi", "Water Heater", "Bathtub"],
      },
      { id: "hiburan", title: "Hiburan", items: ["TV", "TV Kabel"] },
    ],
  },
  {
    id: "bersama",
    title: "Fasilitas Bersama",
    hint: "Opsional. Pilih yang tersedia dan boleh dipakai semua penyewa.",
    groups: [
      { id: "cuci", title: "Tempat Cuci dan Sumber Air", items: ["Ruang Cuci", "Ruang Jemur", "Mesin Cuci", "Laundry", "Jemuran"] },
      { id: "indoor", title: "Sarana Dalam Ruangan", items: ["Loker", "Ruang Keluarga", "Ruang Tamu", "TV Bersama", "Ruang Santai", "Mushola", "Meja Makan", "Kompor"] },
      { id: "outdoor", title: "Sarana Luar Ruangan", items: ["Rooftop", "Balkon", "Gazebo", "Taman", "Joglo"] },
      { id: "kebersihan", title: "Kebersihan", items: ["Wastafel", "Cleaning Service"] },
    ],
  },
];

export const facilityGroups: FacilityGroup[] = facilitySections.flatMap((section) => section.groups);

export type Facilities = Record<string, string[]>;

/** Grup yang melekat pada kamar. Pilihannya disalin ke daftar fasilitas tiap kamar. */
const roomGroupIds = ["kamar_mandi", "kamar_tidur", "udara", "perabot_tidur", "perabot_mandi", "hiburan"];

/** Pilihan satu grup dalam urutan baku, bukan urutan saat diklik. */
const inOrder = (facilities: Facilities, id: string): string[] =>
  facilityGroups.find((g) => g.id === id)?.items.filter((item) => facilities[id]?.includes(item)) ?? [];

export function roomFacilities(facilities: Facilities): string[] {
  return roomGroupIds.flatMap((id) => inOrder(facilities, id));
}

/** Tiga keunggulan teratas untuk bagian Fasilitas & Keunggulan di halaman publik. */
export function highlightsFrom(facilities: Facilities): string[] {
  const order = ["kamar_mandi", "udara", "layanan", "keamanan", "kamar_tidur", "perabot_tidur"];
  return order
    .flatMap((id) => inOrder(facilities, id))
    .filter((label) => !/^(Tanpa|Tidak)/i.test(label))
    .slice(0, 3);
}

export function missingRequiredGroups(facilities: Facilities): string[] {
  return facilityGroups.filter((g) => g.required && !(facilities[g.id]?.length > 0)).map((g) => g.title);
}

/** Memilih atau melepas satu fasilitas, termasuk melepas pasangannya bila saling meniadakan. */
export function toggleFacility(facilities: Facilities, group: FacilityGroup, item: string): Facilities {
  const current = facilities[group.id] ?? [];
  if (current.includes(item)) return { ...facilities, [group.id]: current.filter((x) => x !== item) };
  const opposite = group.opposites?.[item];
  return { ...facilities, [group.id]: [...current.filter((x) => x !== opposite), item] };
}

// ---------------------------------------------------------------- peraturan

export type Rules = {
  criteria: "semua" | "mahasiswa" | "karyawan";
  capacity: number;
  allowChildren: boolean;
  allowCouples: boolean;
  requireKtp: boolean;
  allowPets: boolean;
  curfew: "24jam" | "jam_malam";
  noSmoking: boolean;
  guests: { allowed: boolean; noOppositeGender: boolean; overnightAllowed: boolean; overnightFee: boolean; curfew: boolean };
  damageFine: boolean;
  pickets: boolean;
};

export const defaultRules: Rules = {
  criteria: "semua",
  capacity: 1,
  allowChildren: false,
  allowCouples: false,
  requireKtp: false,
  allowPets: false,
  curfew: "24jam",
  noSmoking: false,
  guests: { allowed: true, noOppositeGender: false, overnightAllowed: false, overnightFee: false, curfew: false },
  damageFine: false,
  pickets: false,
};

/** Membaca fasilitas dari JSON database, hanya grup dan pilihan yang dikenal. */
export function parseFacilities(value: unknown): Facilities {
  if (!value || typeof value !== "object") return {};
  const out: Facilities = {};
  for (const group of facilityGroups) {
    const raw = (value as Record<string, unknown>)[group.id];
    if (!Array.isArray(raw)) continue;
    const items = group.items.filter((item) => raw.includes(item));
    if (items.length) out[group.id] = items;
  }
  return out;
}

/** Membaca peraturan dari JSON database. Nilai yang tidak sesuai diganti nilai bawaan. */
export function parseRules(value: unknown): Rules | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const g = (v.guests && typeof v.guests === "object" ? v.guests : {}) as Record<string, unknown>;
  const bool = (x: unknown, fallback: boolean) => (typeof x === "boolean" ? x : fallback);
  const capacity = typeof v.capacity === "number" && Number.isInteger(v.capacity) && v.capacity >= 1 && v.capacity <= 20 ? v.capacity : defaultRules.capacity;
  return {
    criteria: v.criteria === "mahasiswa" || v.criteria === "karyawan" ? v.criteria : "semua",
    capacity,
    allowChildren: bool(v.allowChildren, defaultRules.allowChildren),
    allowCouples: bool(v.allowCouples, defaultRules.allowCouples),
    requireKtp: bool(v.requireKtp, defaultRules.requireKtp),
    allowPets: bool(v.allowPets, defaultRules.allowPets),
    curfew: v.curfew === "jam_malam" ? "jam_malam" : "24jam",
    noSmoking: bool(v.noSmoking, defaultRules.noSmoking),
    guests: {
      allowed: bool(g.allowed, defaultRules.guests.allowed),
      noOppositeGender: bool(g.noOppositeGender, false),
      overnightAllowed: bool(g.overnightAllowed, false),
      overnightFee: bool(g.overnightFee, false),
      curfew: bool(g.curfew, false),
    },
    damageFine: bool(v.damageFine, defaultRules.damageFine),
    pickets: bool(v.pickets, defaultRules.pickets),
  };
}

const yesNo = (v: boolean) => (v ? "Ya" : "Tidak");

/** Peraturan dalam bentuk kalimat pendek, untuk halaman publik dan teks otomatis. */
export function rulesToLines(r: Rules): string[] {
  const criteria = { semua: "Bisa untuk semua kalangan", mahasiswa: "Khusus mahasiswa", karyawan: "Khusus karyawan" }[r.criteria];
  const lines = [
    criteria,
    `Maksimum ${r.capacity} penghuni per kamar`,
    `Boleh membawa anak: ${yesNo(r.allowChildren)}`,
    `Boleh untuk pasangan suami istri: ${yesNo(r.allowCouples)}`,
    `Wajib menyertakan KTP saat pengajuan sewa: ${yesNo(r.requireKtp)}`,
    `Boleh membawa hewan: ${yesNo(r.allowPets)}`,
    r.curfew === "24jam" ? "Akses 24 jam" : "Ada jam malam",
  ];
  if (r.noSmoking) lines.push("Dilarang merokok di kamar");
  lines.push(`Boleh menerima tamu: ${yesNo(r.guests.allowed)}`);
  if (r.guests.allowed) {
    if (r.guests.noOppositeGender) lines.push("Dilarang membawa tamu lawan jenis");
    if (r.guests.overnightAllowed) lines.push("Tamu boleh menginap");
    if (r.guests.overnightFee) lines.push("Tamu menginap dikenakan biaya");
    if (r.guests.curfew) lines.push("Ada jam malam untuk tamu");
  }
  if (r.damageFine) lines.push("Denda untuk kerusakan barang kos");
  if (r.pickets) lines.push("Wajib ikut piket");
  return lines;
}

// ---------------------------------------------------------------- foto

export const photoCategories = [
  { id: "building", title: "Foto Bangunan Kos", hint: "Perlihatkan bangunan kos secara keseluruhan sebagai foto utama." },
  { id: "common", title: "Foto Fasilitas Bersama", hint: "Tunjukkan suasana di dalam dengan cahaya terang agar terlihat jelas." },
  { id: "street", title: "Foto Bangunan dari Jalan", hint: "Perlihatkan lingkungan di depan kos kepada calon penyewa." },
] as const;

export type PhotoCategoryId = (typeof photoCategories)[number]["id"];

/** Total foto yang didukung Galeri Website Builder. */
export const MAX_PHOTOS = 6;
export const MAX_PHOTOS_PER_CATEGORY = 2;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
/** Sisi terpanjang foto setelah diperkecil. Foto dengan orientasi apa pun diterima. */
export const PHOTO_MAX_SIDE = 1600;
/** Format foto yang diterima, sama dengan yang diizinkan bucket penyimpanan. */
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

// ---------------------------------------------------------------- ukuran kamar

export const sizeOptions = Array.from({ length: 15 }, (_, i) => 3 + i * 0.5); // 3, 3.5, ... 10

export const quickSizes: [number, number][] = [
  [3, 3],
  [3, 4],
  [4, 4],
];

export const formatSize = (length: number, width: number) =>
  `${String(length).replace(".", ",")} x ${String(width).replace(".", ",")} m`;

// ---------------------------------------------------------------- muatan ke server

export type KosPayload = {
  name: string;
  subdomain: string;
  address: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  facilities: Facilities;
  rules: Rules;
  highlights: string[];
  room_facilities: string[];
  photos: string[];
  room: {
    type: string;
    tenant_type: TenantType;
    size_length: number;
    size_width: number;
    count: number;
    price: number;
  };
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

export const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

/** Deskripsi awal dari data yang sudah diisi. Disusun dari templat, bukan dari layanan AI. */
export function generateDescription(input: {
  name: string;
  region: string;
  tenantType: TenantType | null;
  count: number;
  size: [number, number];
  price: number;
  facilities: Facilities;
  rules: Rules;
}): string {
  const kind = input.tenantType ? `kos ${tenantTypeLabel[input.tenantType].toLowerCase()}` : "kos";
  const where = input.region ? ` di ${input.region}` : "";
  const parts = [input.name ? `${input.name} adalah ${kind}${where}.` : `Ini adalah ${kind}${where}.`];
  if (input.count > 0 && input.price > 0) {
    parts.push(`Tersedia ${input.count} kamar berukuran ${formatSize(...input.size)} dengan harga ${formatRupiah(input.price)} per bulan.`);
  }
  const picked = [...roomFacilities(input.facilities), ...inOrder(input.facilities, "layanan"), ...inOrder(input.facilities, "keamanan")]
    .filter((label) => !/^(Tanpa|Tidak)/i.test(label))
    .slice(0, 8);
  if (picked.length) parts.push(`Fasilitas: ${picked.join(", ")}.`);
  parts.push(input.rules.curfew === "24jam" ? "Akses masuk 24 jam." : "Ada jam malam untuk akses masuk.");
  return parts.join(" ").slice(0, 1500);
}
