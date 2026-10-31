// Pencarian lokasi untuk peta pendaftaran kos. Memakai Photon (photon.komoot.io), layanan pencarian
// berbasis data OpenStreetMap yang mendukung saran sambil mengetik. Nominatim (layanan publik
// OpenStreetMap) tidak dipakai karena melarang pencarian sambil mengetik.
//
// Semua pemanggilan ke layanan luar ada di berkas ini, jadi penyedia mudah diganti.

const PHOTON = "https://photon.komoot.io";
/** Membatasi hasil ke Indonesia (minLon,minLat,maxLon,maxLat). */
const INDONESIA_BBOX = "95,-11.2,141.1,6.2";

export type Place = {
  lat: number;
  lng: number;
  /** Nama utama untuk daftar saran. */
  title: string;
  /** Keterangan wilayah untuk daftar saran. */
  subtitle: string;
  /** Nama jalan dan nomor, kosong bila hasilnya berupa wilayah. */
  street: string;
  /** Kelurahan, kecamatan, kota/kabupaten, provinsi, kode pos. */
  region: string;
};

type Feature = { geometry?: { coordinates?: unknown }; properties?: Record<string, string | undefined> };

// RT/RW muncul sebagai "nama wilayah" di data (misalnya "RW 04") dan bukan bagian dari alamat wilayah.
const isUnit = (s: string) => /^R[TW]\s*\d+/i.test(s.trim());

// Data kadang memuat nama provinsi berbahasa Inggris, terutama di dalam rangkaian "city".
const PROVINCE_ID: Record<string, string> = {
  "east java": "Jawa Timur",
  "central java": "Jawa Tengah",
  "west java": "Jawa Barat",
  jakarta: "DKI Jakarta",
  "special capital region of jakarta": "DKI Jakarta",
  "special region of yogyakarta": "DI Yogyakarta",
  "north sumatra": "Sumatera Utara",
  "west sumatra": "Sumatera Barat",
  "south sumatra": "Sumatera Selatan",
  "riau islands": "Kepulauan Riau",
  "bangka belitung islands": "Kepulauan Bangka Belitung",
  "west kalimantan": "Kalimantan Barat",
  "central kalimantan": "Kalimantan Tengah",
  "south kalimantan": "Kalimantan Selatan",
  "east kalimantan": "Kalimantan Timur",
  "north kalimantan": "Kalimantan Utara",
  "north sulawesi": "Sulawesi Utara",
  "central sulawesi": "Sulawesi Tengah",
  "south sulawesi": "Sulawesi Selatan",
  "southeast sulawesi": "Sulawesi Tenggara",
  "west sulawesi": "Sulawesi Barat",
  "west nusa tenggara": "Nusa Tenggara Barat",
  "east nusa tenggara": "Nusa Tenggara Timur",
  "north maluku": "Maluku Utara",
  "west papua": "Papua Barat",
  "central papua": "Papua Tengah",
  "highland papua": "Papua Pegunungan",
  "south papua": "Papua Selatan",
  "southwest papua": "Papua Barat Daya",
};
const localize = (s: string) => PROVINCE_ID[s.trim().toLowerCase()] ?? s;

const unique = (items: (string | undefined)[]) => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const raw = item?.trim();
    const value = raw ? localize(raw) : undefined;
    if (!value || isUnit(value) || seen.has(value.toLowerCase())) continue;
    seen.add(value.toLowerCase());
    out.push(value);
  }
  return out;
};

// Ruas dan jembatan jalan tol bukan lokasi kos, tetapi sering muncul paling atas untuk nama kecamatan.
const isTollRoad = (f: Feature) => {
  const p = f.properties ?? {};
  return (p.osm_key === "highway" && /^motorway/.test(p.osm_value ?? "")) || /\bJalan Tol\b/i.test(p.name ?? "");
};

/** Mengubah satu hasil Photon menjadi tempat dengan alamat yang siap diisikan ke form. */
export function toPlace(feature: Feature): Place | null {
  const coords = feature.geometry?.coordinates;
  if (!Array.isArray(coords) || typeof coords[0] !== "number" || typeof coords[1] !== "number") return null;
  const [lng, lat] = coords as [number, number];
  const p = feature.properties ?? {};

  // "city" kadang berisi rangkaian wilayah dengan provinsi berbahasa Inggris di ujung
  // ("Jagir, Wonokromo, Surabaya, East Java"). Ambil bagian wilayahnya saja.
  const cityParts = (p.city ?? "").split(",").map((s) => s.trim());
  if (cityParts.length > 2 && p.state) cityParts.pop();

  const isArea = ["district", "locality", "city", "county", "state"].includes(p.type ?? "");
  const parts = unique([isArea ? p.name : undefined, p.locality, p.district, ...cityParts, p.county, p.state]);

  const streetName = p.type === "street" ? p.name : p.street;
  const street = [streetName, p.housenumber].filter(Boolean).join(" ").trim();

  const title = (p.name ?? streetName ?? parts[0] ?? "").trim();
  if (!title) return null;
  const subtitle = parts.filter((part) => part.toLowerCase() !== title.toLowerCase()).join(", ");

  return { lat, lng, title, subtitle, street, region: unique([...parts, p.postcode]).join(", ") };
}

type SearchOptions = { signal?: AbortSignal; near?: { lat: number; lng: number } };

async function searchOnce(query: string, options: SearchOptions): Promise<Place[]> {
  const params = new URLSearchParams({ q: query, limit: "10", bbox: INDONESIA_BBOX });
  if (options.near) {
    params.set("lat", String(options.near.lat));
    params.set("lon", String(options.near.lng));
  }
  const res = await fetch(`${PHOTON}/api/?${params}`, { signal: options.signal });
  if (!res.ok) throw new Error(`Pencarian lokasi gagal (${res.status})`);
  const data = (await res.json()) as { features?: Feature[] };

  const seen = new Set<string>();
  const places: Place[] = [];
  for (const feature of data.features ?? []) {
    if (isTollRoad(feature)) continue;
    const place = toPlace(feature);
    const key = place && `${place.title}|${place.subtitle}`.toLowerCase();
    if (!place || !key || seen.has(key)) continue;
    seen.add(key);
    places.push(place);
  }
  return places;
}

export type SearchResult = { places: Place[]; /** Kata kunci yang akhirnya dipakai. Bisa lebih pendek dari yang diketik. */ usedQuery: string };

/**
 * Saran lokasi untuk kata kunci. `near` (pusat peta) membuat hasil di sekitarnya diutamakan.
 * Gabungan beberapa kata sering tidak menemukan apa pun ("Karangrejo Gempol"), jadi bila hasilnya kosong
 * dicoba lagi dengan kata-kata awal saja, paling banyak dua kali.
 */
export async function searchPlaces(query: string, options: SearchOptions = {}): Promise<SearchResult> {
  const words = query.trim().split(/\s+/);
  let usedQuery = words.join(" ");
  let places = await searchOnce(usedQuery, options);

  for (let n = words.length - 1; places.length === 0 && n >= 1 && n >= words.length - 2; n--) {
    const shorter = words.slice(0, n).join(" ");
    if (shorter.length < 3) break;
    places = await searchOnce(shorter, options);
    if (places.length) {
      usedQuery = shorter;
      // Kata yang dibuang tetap berguna: hasil yang memuatnya ("Pasuruan") diutamakan.
      const dropped = words.slice(n).map((w) => w.toLowerCase());
      const score = (p: Place) => dropped.filter((w) => `${p.subtitle} ${p.region}`.toLowerCase().includes(w)).length;
      places = places.map((p, i) => ({ p, i, s: score(p) })).sort((a, b) => b.s - a.s || a.i - b.i).map((x) => x.p);
    }
  }
  return { places: places.slice(0, 5), usedQuery };
}

/** Alamat dari sebuah titik di peta. Mengembalikan null bila tidak ada data di titik itu. */
export async function reversePlace(lat: number, lng: number, signal?: AbortSignal): Promise<Place | null> {
  const res = await fetch(`${PHOTON}/reverse?lat=${lat}&lon=${lng}&limit=1`, { signal });
  if (!res.ok) throw new Error(`Alamat titik gagal dimuat (${res.status})`);
  const data = (await res.json()) as { features?: Feature[] };
  const first = data.features?.[0];
  return first ? toPlace(first) : null;
}
