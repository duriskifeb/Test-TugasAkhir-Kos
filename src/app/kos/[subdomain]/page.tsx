import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BedDouble, CheckCircle2, MapPin } from "lucide-react";
import Head from "next/head";
import { BookingModal } from "./BookingModal";

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate at most every hour

// Generate static params for SSG
export async function generateStaticParams() {
  // Untuk SSG di build time, kita BUKAN menggunakan fungsi server client yang memanggil cookies(),
  // melainkan harus menggunakan standard Supabase client anonim karena tidak ada sesi pengguna aktif saat build.
  
  // Karena generateStaticParams dipanggil pada build-time (bukan request pengguna), 
  // kita cukup melakukan fetch data dasar secara publik
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/tenants?select=subdomain&status=eq.VERIFIED`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) return [];

    const tenants = await response.json();
    return tenants.map((tenant: { subdomain: string }) => ({
      subdomain: tenant.subdomain,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

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
    ]
  }
};

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
  if (!tenant || tenant.status !== 'VERIFIED') {
    notFound();
  }

  // 2. Ambil tema
  const theme: { primaryColor: string; fontFamily: string } =
    (tenant.theme as { primaryColor: string; fontFamily: string } | null) ??
    { primaryColor: "#3b23c6", fontFamily: "Inter" };

  // 3. Ambil seksi halaman (page sections)
  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("order_index", { ascending: true });

  // Parsing seksi fallback
  const heroSection = sections?.find((s) => s.section_type === "hero")?.content as any ?? defaultContent.hero;
  const featuresSection = sections?.find((s) => s.section_type === "features")?.content as any ?? defaultContent.features;
  const gallerySection = sections?.find((s) => s.section_type === "gallery")?.content as any ?? { title: "Galeri Foto", images: [] };

  // 4. Ambil data kamar aktif
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("boarding_house_id", tenant.id)
    .eq("status", "available")
    .order("price", { ascending: true });

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // 5. Tentukan Urutan Render Layout Berdasarkan Database
  const sectionTypesToRender = sections && sections.length > 0 
    ? sections.map(s => s.section_type) 
    : ["hero", "features", "rooms", "gallery"];

  // Menyiapkan pesan WhatsApp dasar
  const waNumber = featuresSection.whatsappNumber || "";
  const generateWaLink = (roomName: string) => {
    if (!waNumber) return "#";
    const cleanNumber = waNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Halo, saya tertarik dengan kamar: ${roomName} yang ada di kos ${tenant.name}. Apakah masih tersedia?`);
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  const generateComplaintLink = () => {
    if (!waNumber) return "#";
    const cleanNumber = waNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Halo Admin ${tenant.name}, saya penghuni kos ingin mengajukan laporan keluhan/kerusakan fasilitas. [Jelaskan keluhan di sini]`);
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  // Tema Template (modern, minimalist, bold)
  const templateStyle = theme.templateStyle || "modern";
  
  // Fungsi penentu gaya berdasarkan template
  const getContainerClass = () => {
    if (templateStyle === "minimalist") return "border border-gray-200 rounded-none";
    if (templateStyle === "bold") return "border-4 border-gray-900 rounded-xl shadow-[8px_8px_0px_0px_rgba(17,24,39,1)]";
    return "rounded-3xl border border-gray-100 shadow-sm"; // modern
  };
  
  const getButtonClass = () => {
    if (templateStyle === "minimalist") return "rounded-none border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white";
    if (templateStyle === "bold") return "rounded-lg border-2 border-gray-900 bg-primary text-white shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:translate-y-1 hover:shadow-none";
    return "rounded-full bg-primary text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"; // modern
  };

  return (
    <div style={{ fontFamily: theme.fontFamily }} className="min-h-screen bg-gray-50 flex flex-col selection:bg-indigo-100">
      {/* Dynamic CSS Variables */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --primary-color: ${theme.primaryColor};
        }
        .bg-primary { background-color: var(--primary-color); }
        .text-primary { color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
        html { scroll-behavior: smooth; }
      `}} />

      {/* Navbar Minimalis */}
      <nav className={`bg-white py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 ${templateStyle === 'minimalist' ? 'border-b-2 border-gray-900' : 'border-b border-gray-100 shadow-sm'}`}>
        <div className="font-bold text-xl text-primary flex items-center gap-2">
          {tenant.name}
        </div>
        <div className="hidden md:flex gap-6 items-center text-sm font-medium text-gray-600">
          <a href="#hero" className="hover:text-primary transition-colors">Beranda</a>
          <a href="#fasilitas" className="hover:text-primary transition-colors">Fasilitas</a>
          <a href="#kamar" className="hover:text-primary transition-colors">Kamar</a>
          {gallerySection.images?.length > 0 && <a href="#galeri" className="hover:text-primary transition-colors">Galeri</a>}
          
          {/* Tombol Lapor Kerusakan */}
          <a 
            href={generateComplaintLink()} 
            target="_blank"
            className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm"
          >
            Lapor Keluhan
          </a>
        </div>
      </nav>

      {/* Render Sections Dinamis sesuai urutan Drag-and-Drop */}
      {sectionTypesToRender.map((type, index) => {
        if (type === "hero") {
          return (
            <section key={`sec-${index}`} id="hero" className={`text-white py-20 md:py-32 px-6 relative overflow-hidden ${templateStyle === 'bold' ? 'bg-gray-900' : 'bg-primary'}`}>
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className={`text-4xl md:text-6xl font-extrabold mb-6 leading-tight ${templateStyle === 'minimalist' ? 'tracking-tighter' : 'tracking-tight'}`}>
                  {heroSection.title}
                </h1>
                <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
                  {heroSection.subtitle}
                </p>
                <a 
                  href="#kamar"
                  className={`inline-block px-8 py-4 text-lg font-bold transition-all transform ${
                    templateStyle === 'minimalist' ? 'bg-white text-gray-900 rounded-none border-2 border-transparent hover:bg-transparent hover:text-white hover:border-white' : 
                    templateStyle === 'bold' ? 'bg-primary text-white rounded-xl shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none border-2 border-white' :
                    'bg-white text-primary rounded-full hover:shadow-xl hover:-translate-y-1'
                  }`}
                  style={templateStyle === 'modern' ? { color: theme.primaryColor } : {}}
                >
                  {heroSection.ctaText}
                </a>
              </div>
              
              {/* Dekorasi Latar Belakang - Hanya jika bukan gaya minimalis */}
              {templateStyle !== 'minimalist' && (
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon fill="currentColor" points="0,100 100,0 100,100" />
                  </svg>
                </div>
              )}
            </section>
          );
        }

        if (type === "features") {
          return (
            <section key={`sec-${index}`} id="fasilitas" className="py-20 px-6 bg-white border-b border-gray-100">
              <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-12 uppercase tracking-wide">{featuresSection.title}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {featuresSection.items.map((item: any, idx: number) => (
                    <div key={idx} className={`p-8 bg-gray-50 hover:shadow-md transition-shadow ${getContainerClass()}`}>
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-primary">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.text}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (type === "rooms") {
          return (
            <section key={`sec-${index}`} id="kamar" className="py-20 px-6 bg-gray-50 flex-1">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 uppercase tracking-wide">{featuresSection.roomsTitle || "Pilihan Kamar"}</h2>
                  <div className={`h-1 mx-auto ${templateStyle === 'minimalist' ? 'w-full max-w-xs bg-gray-900' : 'w-24 rounded-full bg-primary'}`}></div>
                </div>

                {rooms && rooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room) => (
                      <div key={room.id} className={`bg-white overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300 ${getContainerClass()}`}>
                        {/* Status Label */}
                        <div className="p-6 pb-0 flex justify-between items-start">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wider">
                            Tersedia
                          </span>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.name}</h3>
                          <p className="text-3xl font-extrabold text-primary mb-6">
                            {formatRupiah(room.price)}<span className="text-sm font-medium text-gray-500">/bulan</span>
                          </p>
                          
                          {room.facilities && room.facilities.length > 0 && (
                            <div className="mb-8">
                              <h4 className="text-sm font-bold text-gray-900 mb-3">Fasilitas Kamar:</h4>
                              <ul className="space-y-2">
                                {room.facilities.map((fac: string, idx: number) => (
                                  <li key={idx} className="flex items-center text-sm text-gray-600">
                                    <CheckCircle2 className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                                    {fac}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-auto pt-4 border-t border-gray-100">
                            <BookingModal 
                              tenantId={tenant.id} 
                              room={{ id: room.id, name: room.name, price: room.price }} 
                              buttonClass={getButtonClass()} 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300">
                    <BedDouble className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Belum ada kamar yang tersedia</h3>
                    <p className="text-gray-500">Pemilik kos belum menambahkan data kamar.</p>
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (type === "gallery") {
          return (
            <section key={`sec-${index}`} id="galeri" className="py-20 px-6 bg-white border-b border-gray-100">
              <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">{gallerySection.title}</h2>
                
                {gallerySection.images && gallerySection.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {gallerySection.images.map((img: any, idx: number) => (
                      <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={img.url} 
                          alt={`Galeri ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-gray-400 font-medium">
                    Belum ada foto yang diunggah ke Galeri.
                  </div>
                )}
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="font-bold text-xl text-primary mb-2">{tenant.name}</div>
            {tenant.address && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin className="w-4 h-4" />
                {tenant.address}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-400">
            Dibuat menggunakan <a href="#" className="font-semibold text-primary hover:underline">SaaS Kos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
