"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { Loader2, LocateFixed, Search } from "lucide-react";
import { reversePlace, searchPlaces, type Place, type SearchResult } from "@/lib/geocode";

// Peta memakai Leaflet dan ubin OpenStreetMap. Saran lokasi muncul sambil mengetik (Photon, data OpenStreetMap).
// Layanan luar hanya dipanggil dari src/lib/geocode.ts.

export type PickedPlace = { lat: number; lng: number; street: string; region: string };

type PinOptions = { lookup: boolean; from?: Place };
type Status = "idle" | "loading" | "empty" | "error";

const INDONESIA: [number, number] = [-2.5, 118];
const DEBOUNCE_MS = 350;
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

  // ---------------------------------------------------------------- peta
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const start: [number, number] = latitude != null && longitude != null ? [latitude, longitude] : INDONESIA;
      map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(start, latitude != null ? 17 : 5);
      mapRef.current = map;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const icon = L.divIcon({ className: "", html: pinHtml, iconSize: [30, 30], iconAnchor: [15, 30] });

      // Menaruh pin, memusatkan peta, lalu mengisi alamat dari hasil pilihan atau dari titik itu.
      placePin.current = async (lat, lng, { lookup, from }) => {
        if (!map) return;
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        else {
          const marker = L.marker([lat, lng], { icon, draggable: true, keyboard: false, alt: "Lokasi kos" }).addTo(map);
          marker.on("dragend", () => {
            const p = marker.getLatLng();
            void placePin.current(p.lat, p.lng, { lookup: true });
          });
          markerRef.current = marker;
        }
        map.setView([lat, lng], Math.max(map.getZoom(), 17));

        let found = { street: from?.street ?? "", region: from?.region ?? "" };
        let seq: number | null = null;
        if (lookup) {
          seq = ++reverseSeq.current;
          setBusy(true);
          pickRef.current({ lat, lng, ...found });
          try {
            const place = await reversePlace(lat, lng);
            if (seq !== reverseSeq.current) return; // ada titik yang lebih baru, abaikan hasil lama
            if (place) found = { street: place.street, region: place.region };
            setMessage(place ? null : "Alamat di titik ini tidak ditemukan. Isi alamat secara manual.");
          } catch {
            if (seq !== reverseSeq.current) return;
            setMessage("Alamat dari titik ini tidak bisa dimuat. Isi kolom alamat secara manual.");
          } finally {
            if (seq === reverseSeq.current) setBusy(false);
          }
        }
        if (lookup || from) pickRef.current({ lat, lng, street: found.street, region: found.region });
      };

      if (latitude != null && longitude != null) void placePin.current(latitude, longitude, { lookup: false });
      map.on("click", (e) => void placePin.current(e.latlng.lat, e.latlng.lng, { lookup: true }));
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Peta dibuat sekali. Posisi awal hanya dipakai saat dibuat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------- saran sambil mengetik
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setStatus("idle");
      setOpen(false);
      return;
    }

    const key = q.toLowerCase();
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
        const found = await searchPlaces(q, { signal: controller.signal, near: center ? { lat: center.lat, lng: center.lng } : undefined });
        cache.current.set(key, found);
        setResults(found.places);
        setUsedQuery(found.usedQuery);
        setStatus(found.places.length ? "idle" : "empty");
        setActive(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setStatus("error");
      }
    }, DEBOUNCE_MS);

    // Mengetik lagi membatalkan permintaan sebelumnya, jadi hasil lama tidak menimpa hasil baru.
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

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const n = results.length;
    if (e.key === "ArrowDown" && n) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % n);
    } else if (e.key === "ArrowUp" && n) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a <= 0 ? n - 1 : a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault(); // Enter di sini tidak boleh mengirim formulir
      if (open && n) pick(results[active >= 0 ? active : 0]);
    } else if (e.key === "Escape" && open) {
      // Menutup saran saja, bukan seluruh wizard. Wizard mendengarkan Esc di document, tempat React juga
      // memasang pendengarnya, jadi selain stopPropagation perlu preventDefault dan stopImmediatePropagation.
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      setOpen(false);
    }
  }

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setMessage("Peramban Anda tidak mendukung penentuan lokasi. Cari lokasi atau klik peta.");
      return;
    }
    setLocating(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        void placePin.current(pos.coords.latitude, pos.coords.longitude, { lookup: true });
      },
      (err) => {
        setLocating(false);
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Aktifkan izin lokasi di peramban, atau cari lokasi dan klik peta."
            : "Lokasi Anda tidak bisa ditentukan. Coba cari lokasi atau klik peta.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  const showList = open && (results.length > 0 || status !== "idle");

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
      <div className="relative border-b border-gray-200 p-2">
        <div
          className="flex gap-2"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
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
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Ketik nama jalan atau area, misalnya Gempol Pasuruan"
              className="field pr-9 pl-9"
            />
            {status === "loading" && (
              <Loader2 aria-hidden className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-gray-500" />
            )}

            {showList && (
              <ul
                id={LISTBOX_ID}
                role="listbox"
                aria-label="Saran lokasi"
                className="absolute inset-x-0 top-full z-[1000] mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-pop"
              >
                {results.length > 0 && status !== "loading" && usedQuery.toLowerCase() !== query.trim().replace(/\s+/g, " ").toLowerCase() && (
                  <li role="presentation" className="px-3 pt-1.5 pb-1 text-xs text-gray-600">
                    Menampilkan hasil untuk &ldquo;{usedQuery}&rdquo;
                  </li>
                )}
                {results.map((place, i) => (
                  <li
                    key={`${place.lat},${place.lng},${place.title}`}
                    id={`${LISTBOX_ID}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(place)}
                    onMouseEnter={() => setActive(i)}
                    className={`cursor-pointer px-3 py-2 ${i === active ? "bg-primary-soft" : "hover:bg-gray-50"}`}
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
                    Lokasi tidak ditemukan. Tambahkan nama kecamatan atau kota, lalu geser pin di peta ke titik kos Anda.
                  </li>
                )}
                {status === "error" && (
                  <li role="status" className="px-3 py-2 text-sm text-red-700">
                    Pencarian lokasi gagal. Klik langsung di peta atau isi alamat secara manual.
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

      <div ref={containerRef} role="application" aria-label="Peta lokasi kos. Klik atau geser pin untuk menandai lokasi." className="relative isolate h-56 w-full bg-gray-100 sm:h-64">
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
              ? "Geser pin untuk menyesuaikan lokasi."
              : "Ketik nama jalan atau area beserta kecamatan atau kota, pilih saran, lalu geser pin ke titik kos Anda.")}
        </p>
        <p className="mt-1 text-[11px] text-gray-600">Pencarian oleh Photon, data © kontributor OpenStreetMap.</p>
      </div>
    </div>
  );
}
