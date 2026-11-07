"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { Loader2, LocateFixed, Search } from "lucide-react";
import { reversePlace, searchPlaces, type Place, type SearchResult } from "@/lib/geocode";

export type PickedPlace = { lat: number; lng: number; street: string; region: string };

type PinOptions = { lookup: boolean; from?: Place; accuracy?: number };
type Status = "idle" | "loading" | "empty" | "error";
const INDONESIA: [number, number] = [-2.5, 118];
const DEBOUNCE_MS = 350;
const GPS_ACCURACY_WARNING_METERS = 100;
const GPS_TARGET_ACCURACY_METERS = 20;
const GPS_SAMPLE_WINDOW_MS = 12000;
const LISTBOX_ID = "kos-map-suggestions";
const pinHtml =
  '<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#2f5bdc;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(28,37,65,.35)"></div>';

export function KosMap({
  latitude,
  longitude,
  onPick,
}: {
  latitude: number | null;
  longitude: number | null;
  onPick: (place: PickedPlace) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const pickRef = useRef(onPick);
  const placePin = useRef<(lat: number, lng: number, options: PinOptions) => Promise<void>>(async () => {});
  const reverseSeq = useRef(0);
  const cache = useRef(new Map<string, SearchResult>());
  const skipNextSearch = useRef(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [usedQuery, setUsedQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    pickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;

    void (async () => {
      try {
        const L = (await import("leaflet")).default;
        if (cancelled || !containerRef.current) return;

        const start: [number, number] =
          latitude != null && longitude != null ? [latitude, longitude] : INDONESIA;
        map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(start, latitude != null ? 19 : 5);
        mapRef.current = map;
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        const icon = L.divIcon({ className: "", html: pinHtml, iconSize: [30, 30], iconAnchor: [15, 30] });

        placePin.current = async (lat, lng, { lookup, from, accuracy }) => {
          if (!map) return;
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
          else {
            const marker = L.marker([lat, lng], {
              icon,
              draggable: true,
              keyboard: false,
              alt: "Lokasi kos",
            }).addTo(map);
            marker.on("dragend", () => {
              const position = marker.getLatLng();
              void placePin.current(position.lat, position.lng, { lookup: true });
            });
            markerRef.current = marker;
          }
          map.setView([lat, lng], Math.max(map.getZoom(), 19));

          let found = { street: from?.street ?? "", region: from?.region ?? "", hasRtRw: from?.hasRtRw ?? false };
          if (lookup) {
            const sequence = ++reverseSeq.current;
            setBusy(true);
            pickRef.current({ lat, lng, street: found.street, region: found.region });
            let addressError: string | null = null;
            try {
              const place = await reversePlace(lat, lng);
              if (sequence !== reverseSeq.current) return;
              if (place) found = place;
              else addressError = "Alamat titik ini tidak ditemukan.";
            } catch {
              if (sequence !== reverseSeq.current) return;
              addressError = "Alamat dari peta gagal dimuat.";
            } finally {
              if (sequence === reverseSeq.current) setBusy(false);
            }

            if (sequence !== reverseSeq.current) return;
            if (accuracy != null) {
              const accuracyMessage = accuracy > GPS_ACCURACY_WARNING_METERS
                ? `Akurasi GPS perangkat sekitar ±${Math.round(accuracy)} m. Geser pin langsung ke bangunan kos agar titik lebih tepat.`
                : `Akurasi GPS perangkat sekitar ±${Math.round(accuracy)} m. Pastikan pin sudah tepat pada bangunan kos.`;
              setMessage([addressError, accuracyMessage].filter(Boolean).join(" "));
            } else {
              setMessage(
                addressError
                  ? `${addressError} Geser pin atau isi alamat manual.`
                  : found.hasRtRw
                    ? "Alamat terisi dari data OpenStreetMap. Periksa kembali sebelum melanjutkan."
                    : "Data peta tidak mencantumkan RT/RW. Lengkapi RT/RW sesuai alamat resmi.",
              );
            }
          }

          if (lookup || from) pickRef.current({ lat, lng, street: found.street, region: found.region });
        };

        if (latitude != null && longitude != null) {
          void placePin.current(latitude, longitude, { lookup: false });
        }
        map.on("click", (event) => {
          void placePin.current(event.latlng.lat, event.latlng.lng, { lookup: true });
        });
      } catch {
        if (!cancelled) setMessage("Peta gagal dimuat. Periksa koneksi internet, lalu muat ulang halaman.");
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Peta dibuat sekali. Posisi awal hanya dipakai saat peta pertama dibuat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }

    const searchQuery = query.trim();
    if (searchQuery.length < 3) return;

    const key = searchQuery.toLowerCase();
    const cached = cache.current.get(key);
    if (cached) {
      setResults(cached.places);
      setUsedQuery(cached.usedQuery);
      setStatus(cached.places.length ? "idle" : "empty");
      setActive(-1);
      setOpen(true);
      return;
    }

    setStatus("loading");
    setOpen(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const map = mapRef.current;
        const center = map && map.getZoom() >= 8 ? map.getCenter() : null;
        const found = await searchPlaces(searchQuery, {
          signal: controller.signal,
          near: center ? { lat: center.lat, lng: center.lng } : undefined,
        });
        cache.current.set(key, found);
        setResults(found.places);
        setUsedQuery(found.usedQuery);
        setStatus(found.places.length ? "idle" : "empty");
        setActive(-1);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function pick(place: Place) {
    skipNextSearch.current = true;
    setQuery([place.title, place.subtitle.split(", ")[0]].filter(Boolean).join(", "));
    setOpen(false);
    setResults([]);
    setStatus("idle");
    setMessage(null);
    void placePin.current(place.lat, place.lng, { lookup: true, from: place });
  }

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setMessage("Peramban tidak mendukung lokasi. Cari alamat atau klik peta untuk memilih titik.");
      return;
    }
    setLocating(true);
    setMessage("Mencari sinyal GPS terbaik hingga 12 detik. Pastikan izin lokasi aktif dan perangkat berada di area terbuka.");

    let bestPosition: GeolocationPosition | null = null;
    let watchId: number | null = null;
    let finished = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const finish = (error?: GeolocationPositionError) => {
        if (finished) return;
        finished = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        setLocating(false);

        if (bestPosition) {
          void placePin.current(bestPosition.coords.latitude, bestPosition.coords.longitude, {
            lookup: true,
            accuracy: bestPosition.coords.accuracy,
          });
          return;
        }

        setMessage(
          error?.code === 1
            ? "Izin lokasi ditolak. Aktifkan izin lokasi peramban, atau klik titik kos langsung di peta."
            : error?.code === 2
              ? "Posisi GPS tidak tersedia. Periksa layanan lokasi perangkat, atau klik titik kos langsung di peta."
              : "GPS tidak mendapatkan posisi. Coba lagi di area terbuka atau klik titik kos langsung di peta.",
        );
    };

    watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
            bestPosition = position;
          }
          if (position.coords.accuracy <= GPS_TARGET_ACCURACY_METERS) finish();
        },
        finish,
        { enableHighAccuracy: true, timeout: GPS_SAMPLE_WINDOW_MS + 3000, maximumAge: 0 },
    );
    if (finished) {
        navigator.geolocation.clearWatch(watchId);
        return;
    }
    timeoutId = setTimeout(() => finish(), GPS_SAMPLE_WINDOW_MS);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const count = results.length;
    if (event.key === "ArrowDown" && count) {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (current + 1) % count);
    } else if (event.key === "ArrowUp" && count) {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (current <= 0 ? count - 1 : current - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (open && count) pick(results[active >= 0 ? active : 0]);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      setOpen(false);
    }
  }

  const showList = open && (results.length > 0 || status !== "idle");

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
      <div className="relative border-b border-gray-200 p-2">
        <div
          className="flex gap-2"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              role="combobox"
              aria-expanded={showList}
              aria-controls={LISTBOX_ID}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `${LISTBOX_ID}-${active}` : undefined}
              aria-label="Cari lokasi kos"
              autoComplete="off"
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                if (value.trim().length < 3) {
                  setResults([]);
                  setStatus("idle");
                  setOpen(false);
                  setActive(-1);
                }
              }}
              onFocus={() => results.length > 0 && setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Ketik nama jalan atau area, misalnya Gempol Pasuruan"
              className="field pr-9 pl-9"
            />
            {query.trim().length >= 3 && status === "loading" && (
              <Loader2 aria-hidden className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-gray-500" />
            )}

            {showList && (
              <ul
                id={LISTBOX_ID}
                role="listbox"
                aria-label="Saran lokasi"
                className="absolute inset-x-0 top-full z-[1000] mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-pop"
              >
                {results.length > 0 && status !== "loading" && usedQuery.toLowerCase() !== searchQueryNormalized(query) && (
                  <li role="presentation" className="px-3 pt-1.5 pb-1 text-xs text-gray-600">
                    Menampilkan hasil untuk &ldquo;{usedQuery}&rdquo;
                  </li>
                )}
                {results.map((place, index) => (
                  <li
                    key={`${place.lat},${place.lng},${place.title}`}
                    id={`${LISTBOX_ID}-${index}`}
                    role="option"
                    aria-selected={index === active}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => pick(place)}
                    onMouseEnter={() => setActive(index)}
                    className={`cursor-pointer px-3 py-2 ${index === active ? "bg-primary-soft" : "hover:bg-gray-50"}`}
                  >
                    <span className="block text-sm font-semibold text-gray-900">{place.title}</span>
                    {place.subtitle && <span className="block text-xs text-gray-600">{place.subtitle}</span>}
                  </li>
                ))}
                {status === "loading" && results.length === 0 && (
                  <li role="status" className="px-3 py-2 text-sm text-gray-600">Mencari lokasi...</li>
                )}
                {status === "empty" && (
                  <li role="status" className="px-3 py-2 text-sm text-gray-700">
                    Lokasi tidak ditemukan. Tambahkan nama kecamatan atau kota, lalu geser pin ke titik kos.
                  </li>
                )}
                {status === "error" && (
                  <li role="status" className="px-3 py-2 text-sm text-red-700">
                    Pencarian lokasi gagal. Klik peta untuk memilih titik atau isi alamat secara manual.
                  </li>
                )}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={locateMe}
            disabled={locating}
            aria-label="Gunakan lokasi saya"
            className="btn btn-secondary shrink-0"
          >
            {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
            <span className="hidden sm:inline">Lokasi saya</span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        role="application"
        aria-label="Peta OpenStreetMap. Klik atau geser pin untuk menandai lokasi kos."
        className="relative isolate h-56 w-full bg-gray-100 sm:h-64"
      >
        {busy && (
          <span className="absolute top-2 right-2 z-[500] inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2 py-1 text-xs text-gray-700 shadow-card">
            <Loader2 className="size-3 animate-spin" />
            Memuat alamat...
          </span>
        )}
      </div>

      <div className="px-3 py-2">
        <p aria-live="polite" className="min-h-5 text-xs text-gray-700">
          {message ??
            (latitude != null
              ? "Geser pin untuk menyesuaikan titik lokasi kos."
              : "Cari lokasi, gunakan GPS, atau klik langsung pada peta. Geser pin tepat ke bangunan kos.")}
        </p>
        <p className="mt-1 text-[11px] text-gray-600">Peta © kontributor OpenStreetMap; pencarian lokasi oleh Photon.</p>
      </div>
    </div>
  );
}

function searchQueryNormalized(query: string) {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}
