const PHOTON = "https://photon.komoot.io";
const INDONESIA_BBOX = "95,-11.2,141.1,6.2";

export type Place = {
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  street: string;
  region: string;
  hasRtRw: boolean;
};

type PhotonFeature = {
  geometry?: { coordinates?: unknown };
  properties?: Record<string, string | undefined>;
};

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

const localize = (value: string) => PROVINCE_ID[value.trim().toLowerCase()] ?? value;
const isUnit = (value: string) => /^(?:R[TW]\s*\.?\s*\d+[A-Z]?\s*[\/,]?\s*)+$/i.test(value.trim());

function unique(values: (string | undefined)[]) {
  const seen = new Set<string>();
  return values.flatMap((raw) => {
    const value = raw?.trim();
    const localized = value ? localize(value) : undefined;
    const key = localized?.toLowerCase();
    if (!localized || isUnit(localized) || !key || seen.has(key)) return [];
    seen.add(key);
    return [localized];
  });
}

function extractRtRw(values: (string | undefined)[]) {
  const units = values.flatMap((value) =>
    [...(value?.matchAll(/\bR[TW]\s*\.?\s*\d+[A-Z]?\b/gi) ?? [])].map((match) =>
      match[0].replace(/\s+/g, " ").trim(),
    ),
  );
  return [...new Set(units.map((unit) => unit.toLowerCase()))].map(
    (unit) => units.find((candidate) => candidate.toLowerCase() === unit)!,
  );
}

export function toPlace(feature: PhotonFeature): Place | null {
  const coordinates = feature.geometry?.coordinates;
  if (!Array.isArray(coordinates) || typeof coordinates[0] !== "number" || typeof coordinates[1] !== "number") {
    return null;
  }

  const [lng, lat] = coordinates as [number, number];
  const properties = feature.properties ?? {};
  const cityParts = (properties.city ?? "").split(",").map((part) => part.trim());
  if (cityParts.length > 2 && properties.state) cityParts.pop();

  const isArea = ["district", "locality", "city", "county", "state"].includes(properties.type ?? "");
  const areaParts = unique([
    isArea ? properties.name : undefined,
    properties.locality,
    properties.district,
    ...cityParts,
    properties.county,
    properties.state,
  ]);
  const streetName = properties.type === "street" ? properties.name : properties.street;
  const units = extractRtRw([
    properties.name,
    properties.locality,
    properties.district,
    ...cityParts,
    properties.county,
    properties.state,
  ]);
  const street = [...[streetName, properties.housenumber].filter(Boolean), ...units].join(", ");
  const title = [properties.name, streetName, areaParts[0]]
    .find((value) => value?.trim() && !isUnit(value))
    ?.trim();

  if (!title) return null;
  return {
    lat,
    lng,
    title,
    subtitle: areaParts.filter((part) => part.toLowerCase() !== title.toLowerCase()).join(", "),
    street,
    region: unique([...areaParts, properties.postcode]).join(", "),
    hasRtRw: units.length > 0,
  };
}

type SearchOptions = { signal?: AbortSignal; near?: { lat: number; lng: number } };

export type SearchResult = { places: Place[]; usedQuery: string };

async function searchOnce(query: string, options: SearchOptions) {
  const params = new URLSearchParams({ q: query, limit: "10", bbox: INDONESIA_BBOX });
  if (options.near) {
    params.set("lat", String(options.near.lat));
    params.set("lon", String(options.near.lng));
  }
  const response = await fetch(`${PHOTON}/api/?${params}`, { signal: options.signal });
  if (!response.ok) throw new Error(`Pencarian lokasi gagal (${response.status}).`);

  const data = (await response.json()) as { features?: PhotonFeature[] };
  const seen = new Set<string>();
  return (data.features ?? []).flatMap((feature) => {
    const properties = feature.properties ?? {};
    if (
      (properties.osm_key === "highway" && /^motorway/.test(properties.osm_value ?? ""))
      || /\bJalan Tol\b/i.test(properties.name ?? "")
    ) return [];

    const place = toPlace(feature);
    const key = place && `${place.title}|${place.subtitle}`.toLowerCase();
    if (!place || !key || seen.has(key)) return [];
    seen.add(key);
    return [place];
  });
}

export async function searchPlaces(query: string, options: SearchOptions = {}): Promise<SearchResult> {
  const words = query.trim().split(/\s+/);
  let usedQuery = words.join(" ");
  let places = await searchOnce(usedQuery, options);

  for (let count = words.length - 1; places.length === 0 && count >= 1 && count >= words.length - 2; count--) {
    const shorter = words.slice(0, count).join(" ");
    if (shorter.length < 3) break;
    places = await searchOnce(shorter, options);
    if (places.length) {
      usedQuery = shorter;
      const dropped = words.slice(count).map((word) => word.toLowerCase());
      places = places
        .map((place, index) => ({
          place,
          index,
          score: dropped.filter((word) => `${place.subtitle} ${place.region}`.toLowerCase().includes(word)).length,
        }))
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map(({ place }) => place);
    }
  }

  return { places: places.slice(0, 5), usedQuery };
}

export async function reversePlace(lat: number, lng: number, signal?: AbortSignal) {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lng), limit: "1" });
  const response = await fetch(`${PHOTON}/reverse?${params}`, { signal });
  if (!response.ok) throw new Error(`Alamat pada titik peta gagal dimuat (${response.status}).`);
  const data = (await response.json()) as { features?: PhotonFeature[] };
  return data.features?.[0] ? toPlace(data.features[0]) : null;
}
