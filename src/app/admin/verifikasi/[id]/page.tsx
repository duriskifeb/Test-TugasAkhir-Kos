import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  facilityGroups,
  formatRupiah,
  formatSize,
  parseFacilities,
  parseRules,
  rulesToLines,
  tenantTypeLabel,
  type TenantType,
} from "@/lib/kos-options";
import { setTenantStatus } from "../actions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-gray-600">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{children}</dd>
    </div>
  );
}

/** Rentang harga dari semua kamar, mis. "Rp 1.200.000" atau "Rp 1.000.000 - Rp 1.500.000". */
function priceRange(prices: number[]) {
  if (!prices.length) return "-";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatRupiah(min) : `${formatRupiah(min)} - ${formatRupiah(max)}`;
}

export default async function AdminVerifikasiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, profiles!tenants_owner_id_fkey (full_name, email, phone)")
    .eq("id", id)
    .maybeSingle();
  if (!tenant) notFound();

  let skuDocumentUrl: string | null = null;
  let skuDocumentError = false;
  if (tenant.sku_document_path) {
    const { data, error } = await supabase.storage
      .from("tenant-documents")
      .createSignedUrl(tenant.sku_document_path, 300);
    if (error) {
      console.error("Gagal membuat tautan bukti SKU:", error);
      skuDocumentError = true;
    }
    else skuDocumentUrl = data.signedUrl;
  }

  const [{ data: rooms }, { data: gallery }] = await Promise.all([
    supabase
      .from("rooms")
      .select("id, name, price, room_type, tenant_type, size_length, size_width")
      .eq("boarding_house_id", id)
      .is("deleted_at", null)
      .order("name"),
    supabase.from("page_sections").select("content").eq("tenant_id", id).eq("section_type", "gallery").maybeSingle(),
  ]);

  const owner = Array.isArray(tenant.profiles) ? tenant.profiles[0] : tenant.profiles;
  const verified = tenant.status === "VERIFIED";
  const roomList = rooms ?? [];
  const facilities = parseFacilities(tenant.facilities);
  const facilityList = facilityGroups.map((g) => ({ title: g.title, items: facilities[g.id] ?? [] })).filter((g) => g.items.length > 0);
  const rules = parseRules(tenant.rules);
  const ruleLines = rules ? rulesToLines(rules) : [];
  const hasCoords = typeof tenant.latitude === "number" && typeof tenant.longitude === "number";
  const images = ((gallery?.content as { images?: { url?: unknown }[] } | null)?.images ?? [])
    .map((i) => i?.url)
    .filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u));
  const types = [...new Set(roomList.map((r) => r.tenant_type).filter((t): t is TenantType => t === "putra" || t === "putri" || t === "campur"))];
  const first = roomList[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 sm:p-8">
      <Link href="/admin/verifikasi" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
        <ArrowLeft className="size-4" />
        Kembali ke daftar
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
            {verified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                <CheckCircle2 className="size-3.5" />
                Terverifikasi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                <Clock className="size-3.5" />
                Menunggu Verifikasi
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Didaftarkan {new Date(tenant.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · /kos/{tenant.subdomain}
          </p>
        </div>
        <form action={setTenantStatus}>
          <input type="hidden" name="id" value={tenant.id} />
          <input type="hidden" name="to" value={verified ? "UNVERIFIED" : "VERIFIED"} />
          <button
            type="submit"
            className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold ${
              verified ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" : "bg-primary text-white hover:bg-primary-hover"
            }`}
          >
            {verified ? "Cabut Akses" : "Verifikasi Kos Ini"}
          </button>
        </form>
      </header>

      <Card title="Pemilik">
        <dl className="divide-y divide-gray-100">
          <Row label="Nama">{owner?.full_name || "-"}</Row>
          <Row label="Email">{owner?.email || "-"}</Row>
          <Row label="Telepon">{owner?.phone || "-"}</Row>
        </dl>
      </Card>

      <Card title="Lokasi">
        <dl className="divide-y divide-gray-100">
          <Row label="Alamat">{tenant.address || "-"}</Row>
          <Row label="Patokan">{tenant.landmark || "-"}</Row>
          <Row label="Titik peta">
            {hasCoords ? (
              <a
                href={`https://www.openstreetmap.org/?mlat=${tenant.latitude}&mlon=${tenant.longitude}#map=17/${tenant.latitude}/${tenant.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                <MapPin className="size-4" />
                Lihat di peta ({Number(tenant.latitude).toFixed(5)}, {Number(tenant.longitude).toFixed(5)})
              </a>
            ) : (
              "Belum ditandai di peta"
            )}
          </Row>
        </dl>
      </Card>

      <Card title="Bukti Surat Keterangan Usaha (SKU)">
        {skuDocumentUrl ? (
          <a
            href={skuDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ExternalLink className="size-4" />
            Buka bukti SKU
          </a>
        ) : skuDocumentError ? (
          <p role="alert" className="text-sm text-red-700">
            Bukti SKU terdaftar, tetapi tautan dokumen gagal dibuat. Muat ulang halaman atau hubungi dukungan teknis.
          </p>
        ) : (
          <p className="text-sm text-gray-600">Bukti SKU belum tersedia.</p>
        )}
        <p className="mt-2 text-xs text-gray-600">
          Periksa apakah dokumen memuat perincian, tanda tangan desa, dan stempel desa.
        </p>
      </Card>

      <Card title="Kamar">
        <dl className="divide-y divide-gray-100">
          <Row label="Jumlah kamar">{roomList.length}</Row>
          <Row label="Jenis penghuni">{types.length ? types.map((t) => tenantTypeLabel[t]).join(", ") : "-"}</Row>
          <Row label="Harga per bulan">{priceRange(roomList.map((r) => r.price))}</Row>
          <Row label="Tipe dan ukuran">
            {[first?.room_type, first?.size_length && first?.size_width ? formatSize(first.size_length, first.size_width) : null].filter(Boolean).join(", ") || "-"}
          </Row>
        </dl>
      </Card>

      <Card title="Deskripsi">
        {tenant.description ? <p className="whitespace-pre-line text-sm text-gray-800">{tenant.description}</p> : <p className="text-sm text-gray-600">Belum diisi.</p>}
      </Card>

      <Card title="Fasilitas">
        {facilityList.length ? (
          <div className="space-y-4">
            {facilityList.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-gray-800">{group.title}</p>
                <ul className="mt-1.5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="rounded-md bg-gray-100 px-2.5 py-1 text-sm text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Belum diisi.</p>
        )}
      </Card>

      <Card title="Peraturan">
        {ruleLines.length ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-800">
            {ruleLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Belum diisi.</p>
        )}
      </Card>

      <Card title={`Foto (${images.length})`}>
        {images.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((url) => (
              <li key={url} className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Buka foto ukuran penuh" className="block size-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${tenant.name}`} className="size-full object-contain" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Pemilik belum mengunggah foto.</p>
        )}
      </Card>

      <Link href={`/kos/${tenant.subdomain}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ExternalLink className="size-4" />
        Buka halaman publik kos
      </Link>
    </div>
  );
}
