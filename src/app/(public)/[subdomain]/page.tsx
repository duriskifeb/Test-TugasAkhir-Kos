import { getTenantBySubdomain } from "./actions";
import { notFound } from "next/navigation";
import { MapPin, Wifi, Wind, Shield, CheckCircle2 } from "lucide-react";

export default async function TenantLandingPage({ params }: { params: { subdomain: string } }) {
  const tenant = await getTenantBySubdomain(params.subdomain);

  if (!tenant) {
    notFound();
  }

  // Parse Section Data dari JSONB yang disimpan via Website Builder
  const heroSection = tenant.page_sections?.find((s: any) => s.section_type === 'hero');
  const heroContent = heroSection?.content || {
    tagline: "Kenyamanan Anda Adalah Prioritas Kami",
    description: "Nikmati pengalaman ngekos yang aman, nyaman, dan modern dengan fasilitas lengkap.",
    primary_color: "#3b23c6"
  };

  const primaryColor = heroContent.primary_color || "#3b23c6";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Minimalis */}
      <nav className="bg-white border-b border-gray-100 py-4 px-6 sm:px-8 lg:px-12 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: primaryColor }}>
               {tenant.name.charAt(0)}
             </div>
             <div>
               <h1 className="font-bold text-gray-900 text-lg leading-tight">{tenant.name}</h1>
               <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {tenant.address.substring(0, 30)}...
               </p>
             </div>
          </div>
          <a href={`/${params.subdomain}/checkout`} className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm" style={{ backgroundColor: primaryColor }}>
            Pesan Sekarang
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 sm:px-8 lg:px-12 overflow-hidden" style={{ backgroundColor: primaryColor }}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            {heroContent.tagline}
          </h1>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            {heroContent.description}
          </p>
          <a href={`/${params.subdomain}/checkout`} className="bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all shadow-xl inline-block" style={{ color: primaryColor }}>
            Lihat Kamar & Booking
          </a>
        </div>
      </section>

      {/* Fasilitas Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Fasilitas Unggulan</h2>
          <p className="text-gray-500 mt-2">Segala yang Anda butuhkan untuk kenyamanan maksimal.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
             <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <Wifi className="w-7 h-7" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Internet Cepat</h3>
             <p className="text-gray-500 text-sm">Akses WiFi kencang 24 jam tanpa batas kuota untuk menunjang produktivitas Anda.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
             <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <Wind className="w-7 h-7" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Full AC</h3>
             <p className="text-gray-500 text-sm">Setiap kamar dilengkapi AC modern yang terawat untuk kenyamanan istirahat Anda.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
             <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <Shield className="w-7 h-7" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Aman 24 Jam</h3>
             <p className="text-gray-500 text-sm">Dilengkapi CCTV dan akses gerbang kartu pintar untuk keamanan penghuni.</p>
          </div>
        </div>
      </section>

      {/* Daftar Kamar (Dummy) */}
      <section className="py-20 bg-gray-100 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Pilihan Kamar</h2>
              <p className="text-gray-500 mt-2">Pilih kamar yang sesuai dengan kebutuhan Anda.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col sm:flex-row">
              <div className="sm:w-2/5 h-48 sm:h-auto bg-gray-200">
                 <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Room" />
              </div>
              <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Kamar Tipe A (AC)</h3>
                  <p className="text-sm text-gray-500 mb-4">Kasur Springbed, Lemari, Meja Belajar, AC, Kamar Mandi Dalam.</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded border border-green-100">
                    <CheckCircle2 className="w-4 h-4" /> Sisa 2 Kamar
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">Rp 1.500.000</span>
                    <span className="text-gray-500 text-sm">/bulan</span>
                  </div>
                  <a href={`/${params.subdomain}/checkout`} className="px-4 py-2 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>
                    Booking
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {tenant.name}. Diberdayakan oleh Platform SaaS Indekos.</p>
      </footer>
    </div>
  );
}