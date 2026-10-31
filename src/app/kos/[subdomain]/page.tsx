import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BedDouble, MapPin } from "lucide-react";
import { BookingModal } from "./BookingModal";
import {
  facilityGroups,
  formatSize,
  parseFacilities,
  parseRules,
  rulesToLines,
  tenantTypeLabel,
  type TenantType,
} from "@/lib/kos-options";

export const dynamic = "force-dynamic";

// Default content if not configured
const defaultContent = {
  hero: {
    title: "Selamat Datang di Kos Kami",
    subtitle: "Pilihan terbaik untuk kenyamanan dan keamanan tempat tinggal Anda.",
    ctaText: "Lihat Kamar",
  },
  features: {
    title: "Fasilitas & Keunggulan",
    items: [
      { icon: "CheckCircle2", text: "Lokasi Strategis" },
      { icon: "CheckCircle2", text: "Keamanan 24 Jam" },
      { icon: "CheckCircle2", text: "Kebersihan Terjamin" },
    ],
  },
};

const fontStacks: Record<string, string> = {
  Inter: "var(--font-tenant-inter), ui-sans-serif, system-ui, sans-serif",
  "Plus Jakarta Sans": "var(--font-tenant-jakarta), ui-sans-serif, system-ui, sans-serif",
  Merriweather: "var(--font-tenant-merriweather), Georgia, serif",
};

const DEFAULT_PRIMARY = "#2f5bdc";

// Pilih teks putih atau tua mana yang kontrasnya lebih tinggi terhadap warna pilihan pemilik.
function onColor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const inkL = 0.019;
  return 1.05 / (L + 0.05) >= (L + 0.05) / (inkL + 0.05) ? "#ffffff" : "#1c2541";
}

export default async function PublicTenantPage(props: {
  params: Promise<{ subdomain: string }>;
}) {
  const params = await props.params;
  const supabase = await createClient();

  // 1. Ambil data tenant (Gunakan maybeSingle agar tidak melempar error keras jika tidak ketemu)
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("subdomain", params.subdomain)
    .maybeSingle();

  if (tenantError) {
    console.error("Error fetching tenant:", JSON.stringify(tenantError));
  }

  // Jika tidak ditemukan atau belum diverifikasi, tampilkan 404
  if (!tenant || tenant.status !== "VERIFIED") {
    notFound();
  }

  // 2. Ambil tema
  const theme: { primaryColor: string; fontFamily: string; templateStyle?: string } =
    (tenant.theme as { primaryColor: string; fontFamily: string; templateStyle?: string } | null) ?? {
      primaryColor: DEFAULT_PRIMARY,
      fontFamily: "Inter",
    };

  // Nilai warna dari database divalidasi sebelum masuk ke style, bukan disisipkan sebagai CSS mentah.
  const primary = /^#[0-9a-f]{6}$/i.test(theme.primaryColor ?? "") ? theme.primaryColor : DEFAULT_PRIMARY;
  const themeVars = {
    fontFamily: fontStacks[theme.fontFamily] ?? fontStacks.Inter,
    "--color-primary": primary,
    "--color-primary-hover": `color-mix(in srgb, ${primary} 86%, #000)`,
    "--color-primary-soft": `color-mix(in srgb, ${primary} 9%, #fff)`,
    "--color-primary-tint": `color-mix(in srgb, ${primary} 22%, #fff)`,
    "--color-on-primary": onColor(primary),
  } as React.CSSProperties;

  // 3. Ambil seksi halaman (page sections)
  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("order_index", { ascending: true });

  // Parsing seksi fallback
  const heroSection = (sections?.find((s) => s.section_type === "hero")?.content as any) ?? defaultContent.hero;
  const featuresSection =
    (sections?.find((s) => s.section_type === "features")?.content as any) ?? defaultContent.features;
  const gallerySection =
    (sections?.find((s) => s.section_type === "gallery")?.content as any) ?? { title: "Galeri Foto", images: [] };

  // Informasi kos dari pendaftaran (lokasi, fasilitas, peraturan). JSON dari database dibaca lewat penyaring.
  const facilities = parseFacilities(tenant.facilities);
  const facilityList = facilityGroups.map((g) => ({ title: g.title, items: facilities[g.id] ?? [] })).filter((g) => g.items.length > 0);
  const rules = parseRules(tenant.rules);
  const ruleLines = rules ? rulesToLines(rules) : [];
  const hasCoords = typeof tenant.latitude === "number" && typeof tenant.longitude === "number";
  const hasInfo = !!tenant.landmark || hasCoords || facilityList.length > 0 || ruleLines.length > 0;

  // 4. Ambil data kamar aktif
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("boarding_house_id", tenant.id)
    .eq("status", "available")
    .is("deleted_at", null)
    .order("price", { ascending: true });

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // 5. Tentukan Urutan Render Layout Berdasarkan Database
  const sectionTypesToRender =
    sections && sections.length > 0 ? sections.map((s) => s.section_type) : ["hero", "features", "rooms", "gallery"];

  // Menyiapkan pesan WhatsApp dasar
  const waNumber = featuresSection.whatsappNumber || "";
  const generateComplaintLink = () => {
    if (!waNumber) return "#";
    const cleanNumber = waNumber.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Halo Admin ${tenant.name}, saya penghuni kos ingin mengajukan laporan keluhan/kerusakan fasilitas. [Jelaskan keluhan di sini]`,
    );
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  // Gaya template: modern, minimalist, bold
  const templateStyle = theme.templateStyle || "modern";

  const containerClass =
    templateStyle === "minimalist"
      ? "rounded-none border border-gray-300 bg-white"
      : templateStyle === "bold"
        ? "rounded-xl border-2 border-primary bg-white shadow-card"
        : "rounded-xl border border-gray-200 bg-white shadow-card";

  const buttonClass =
    templateStyle === "minimalist"
      ? "btn btn-lg w-full !rounded-none border-primary bg-white text-primary hover:bg-primary-soft"
      : templateStyle === "bold"
        ? "btn btn-primary btn-lg w-full border-2 border-primary"
        : "btn btn-primary btn-lg w-full";

  return (
    <div style={themeVars} className="flex min-h-dvh flex-col bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-40 flex h-16 items-center justify-between gap-4 bg-white px-5 md:px-12 ${
          templateStyle === "minimalist" ? "border-b border-gray-300" : "border-b border-gray-200"
        }`}
      >
        <div className="truncate text-xl font-bold text-primary">{tenant.name}</div>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#hero" className="hidden hover:text-primary md:block">
            Beranda
          </a>
          <a href="#fasilitas" className="hidden hover:text-primary md:block">
            Fasilitas
          </a>
          <a href="#kamar" className="hidden hover:text-primary md:block">
            Kamar
          </a>
          {gallerySection.images?.length > 0 && (
            <a href="#galeri" className="hidden hover:text-primary md:block">
              Galeri
            </a>
          )}
          <a href={generateComplaintLink()} target="_blank" rel="noreferrer" className="btn btn-secondary">
            Lapor Keluhan
          </a>
        </div>
      </nav>

      {/* Render Sections Dinamis sesuai urutan Drag-and-Drop */}
      {sectionTypesToRender.map((type, index) => {
        if (type === "hero") {
          return (
            <section key={`sec-${index}`} id="hero" className="scroll-mt-16 border-b border-primary-tint bg-primary-soft">
              <div className="mx-auto max-w-6xl px-5 py-16 md:px-6 md:py-24">
                <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                  {heroSection.title}
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-700">{heroSection.subtitle}</p>
                <a
                  href="#kamar"
                  className={`mt-8 inline-flex ${buttonClass.replace("w-full", "w-auto")}`}
                >
                  {heroSection.ctaText}
                </a>
              </div>
              <div aria-hidden className="tile-strip" />
            </section>
          );
        }

        if (type === "features") {
          return (
            <section key={`sec-${index}`} id="fasilitas" className="scroll-mt-16 bg-white py-16 md:py-20">
              <div className="mx-auto max-w-6xl px-5 md:px-6">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{featuresSection.title}</h2>
                <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                  {featuresSection.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-lg text-gray-800">
                      <span aria-hidden className="mt-2.5 size-2.5 shrink-0 rotate-45 rounded-[2px] bg-primary" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        }

        if (type === "rooms") {
          return (
            <section key={`sec-${index}`} id="kamar" className="flex-1 scroll-mt-16 bg-gray-50 py-16 md:py-20">
              <div className="mx-auto max-w-6xl px-5 md:px-6">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {featuresSection.roomsTitle || "Pilihan Kamar"}
                </h2>

                {rooms && rooms.length > 0 ? (
                  <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {rooms.map((room) => (
                      <div key={room.id} className={`flex flex-col ${containerClass}`}>
                        <div className="flex flex-1 flex-col p-6">
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-800">
                            <span aria-hidden className="tile tile-sm tile-available" />
                            Tersedia
                          </span>
                          <h3 className="mt-3 text-2xl font-bold">{room.name}</h3>
                          {(room.tenant_type || (room.size_length && room.size_width)) && (
                            <p className="mt-1 text-sm text-gray-600">
                              {[
                                room.tenant_type && `Kamar ${tenantTypeLabel[room.tenant_type as TenantType] ?? ""}`.trim(),
                                room.size_length && room.size_width && formatSize(room.size_length, room.size_width),
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                          <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary">
                            {formatRupiah(room.price)}
                            <span className="text-sm font-medium text-gray-600">/bulan</span>
                          </p>

                          {room.facilities && (room.facilities as any).length > 0 && (
                            <ul className="mt-5 flex flex-wrap gap-2">
                              {(room.facilities as string[]).map((fac: string, idx: number) => (
                                <li key={idx} className="rounded-md bg-gray-100 px-2.5 py-1 text-sm text-gray-700">
                                  {fac}
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="mt-auto pt-6">
                            <BookingModal subdomain={params.subdomain} roomId={room.id} buttonClass={buttonClass} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                    <BedDouble className="mx-auto mb-4 size-10 text-gray-500" />
                    <h3 className="text-lg font-bold text-gray-900">Belum ada kamar yang tersedia</h3>
                    <p className="mt-1 text-gray-600">Pemilik kos belum menambahkan data kamar.</p>
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (type === "gallery") {
          return (
            <section key={`sec-${index}`} id="galeri" className="scroll-mt-16 bg-white py-16 md:py-20">
              <div className="mx-auto max-w-6xl px-5 md:px-6">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{gallerySection.title}</h2>

                {gallerySection.images && gallerySection.images.length > 0 ? (
                  <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
                    {gallerySection.images.map((img: any, idx: number) => (
                      <div key={idx} className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={`Foto galeri ${tenant.name} ${idx + 1}`}
                          className="size-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center font-medium text-gray-600">
                    Belum ada foto yang diunggah ke Galeri.
                  </div>
                )}
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* Informasi kos: lokasi, fasilitas, dan peraturan dari pendaftaran */}
      {hasInfo && (
        <section id="info" className="scroll-mt-16 bg-gray-50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-6">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Tentang Kos</h2>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {(tenant.address || tenant.landmark || hasCoords) && (
                <div className={`p-6 ${containerClass}`}>
                  <h3 className="text-lg font-bold">Lokasi</h3>
                  {tenant.address && <p className="mt-3 text-gray-700">{tenant.address}</p>}
                  {tenant.landmark && (
                    <p className="mt-3 text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">Patokan: </span>
                      {tenant.landmark}
                    </p>
                  )}
                  {hasCoords && (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${tenant.latitude}&mlon=${tenant.longitude}#map=17/${tenant.latitude}/${tenant.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      <MapPin className="size-4" />
                      Lihat di peta
                    </a>
                  )}
                </div>
              )}

              {facilityList.length > 0 && (
                <div className={`p-6 ${containerClass}`}>
                  <h3 className="text-lg font-bold">Fasilitas</h3>
                  <div className="mt-3 space-y-4">
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
                </div>
              )}

              {ruleLines.length > 0 && (
                <div className={`p-6 ${containerClass}`}>
                  <h3 className="text-lg font-bold">Peraturan Kos</h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {ruleLines.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rotate-45 bg-primary" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-5 py-10 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-2 text-xl font-bold text-primary">{tenant.name}</div>
            {tenant.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="size-4" />
                {tenant.address}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Dibuat dengan{" "}
            <Link href="/" className="font-semibold text-primary hover:underline">
              Build Kos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
