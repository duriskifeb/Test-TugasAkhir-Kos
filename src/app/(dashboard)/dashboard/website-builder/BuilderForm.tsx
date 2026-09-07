"use client";

import { useEffect, useState } from "react";
import { saveWebsiteSettings } from "./actions";
import { 
  Loader2, Save, LayoutTemplate, Type, Palette, 
  MonitorSmartphone, CheckCircle2, GripVertical, Image as ImageIcon, BedDouble
} from "lucide-react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Komponen Sortable Item (Blok Drag & Drop)
function SortableSectionItem({ 
  id, 
  title, 
  icon: Icon,
  isActive,
  onClick
}: { 
  id: string, 
  title: string, 
  icon: any,
  isActive: boolean,
  onClick: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center justify-between p-3 mb-2 rounded-lg border ${
        isActive ? 'border-[#3b23c6] bg-indigo-50/50' : 'border-gray-200 bg-white hover:border-gray-300'
      } cursor-pointer transition-colors shadow-sm`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
          <GripVertical className="w-4 h-4" />
        </div>
        <Icon className={`w-4 h-4 ${isActive ? 'text-[#3b23c6]' : 'text-gray-500'}`} />
        <span className={`text-sm font-medium ${isActive ? 'text-[#3b23c6]' : 'text-gray-700'}`}>
          {title}
        </span>
      </div>
    </div>
  );
}

export function BuilderForm({ 
  tenant, 
  heroData, 
  featuresData 
}: { 
  tenant: any;
  heroData: any;
  featuresData: any;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const theme = tenant.theme || { primaryColor: "#3b23c6", fontFamily: "Inter" };
  const features = featuresData?.items || [];

  // State untuk Drag and Drop Layout
  const [sections, setSections] = useState([
    { id: 'hero', title: 'Teks Pembuka (Hero)', icon: Type },
    { id: 'features', title: 'Fasilitas & Keunggulan', icon: CheckCircle2 },
    { id: 'rooms', title: 'Daftar Kamar (Otomatis)', icon: BedDouble },
    { id: 'gallery', title: 'Galeri Foto', icon: ImageIcon },
  ]);

  // Fix Hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // State untuk tab aktif (Theme atau Section ID tertentu)
  const [activeTab, setActiveTab] = useState<string>('theme');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    // Tambahkan urutan layout ke formData
    const layoutOrder = sections.map(s => s.id).join(',');
    formData.append("layoutOrder", layoutOrder);

    try {
      const result = await saveWebsiteSettings(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result?.success) {
        setMessage({ type: "success", text: result.success });
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)]">
      
      {/* Kiri: Editor Sidebar */}
      <div className="w-full lg:w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col min-w-[320px]">
        <div className="p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-[#3b23c6]" />
            Website Builder
          </h1>
          <p className="text-xs text-gray-500 mt-1">Kustomisasi dinamis (Drag & Drop)</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {message && (
            <div className={`m-4 p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {message.text}
            </div>
          )}

          {/* Pengaturan Tema Global */}
          <div className="p-4 mb-2">
            <h2 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">Pengaturan Global</h2>
            <div 
              className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${activeTab === 'theme' ? 'border-[#3b23c6] bg-indigo-50/50 text-[#3b23c6]' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}`}
              onClick={() => setActiveTab('theme')}
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm font-medium">Tema Visual</span>
            </div>
          </div>

          {/* Susunan Blok (Drag and Drop) */}
          <div className="p-4 border-t border-gray-200">
            <h2 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">Susunan Layout</h2>
            {isMounted ? (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((section) => (
                    <SortableSectionItem 
                      key={section.id} 
                      id={section.id} 
                      title={section.title}
                      icon={section.icon}
                      isActive={activeTab === section.id}
                      onClick={() => setActiveTab(section.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="space-y-2 opacity-50">
                {sections.map(section => (
                  <div key={section.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-gray-400 mt-2 italic">*Geser icon titik-titik untuk mengubah urutan blok pada website.</p>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            form="builder-form"
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b23c6] text-white rounded-lg px-4 py-2.5 font-bold text-sm hover:bg-[#2d1b99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan & Publikasikan
          </button>
        </div>
      </div>

      {/* Tengah: Form Editor Detail (Berdasarkan Tab Aktif) */}
      <div className="hidden lg:flex w-1/3 border-r border-gray-200 bg-white flex-col overflow-y-auto">
        <form id="builder-form" onSubmit={handleSubmit} className="p-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
            {activeTab === 'theme' && 'Pengaturan Tema & Template'}
            {activeTab === 'hero' && 'Pengaturan Hero Section'}
            {activeTab === 'features' && 'Pengaturan Fasilitas'}
            {activeTab === 'rooms' && 'Pengaturan Daftar Kamar'}
            {activeTab === 'gallery' && 'Pengaturan Galeri'}
          </h2>

          <div className={activeTab === 'theme' ? 'block' : 'hidden'}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Template Layout</label>
                <select name="templateStyle" defaultValue={theme.templateStyle || "modern"} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6]">
                  <option value="modern">Modern (Tepi Melengkung, Bayangan Halus)</option>
                  <option value="minimalist">Minimalis (Garis Tegas, Bersih)</option>
                  <option value="bold">Bold (Kontras Tinggi, Elegan)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Warna Utama (Primary Color)</label>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <input 
                    type="color" 
                    name="primaryColor" 
                    defaultValue={theme.primaryColor}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-sm text-gray-600 font-mono">{theme.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Huruf (Font)</label>
                <select name="fontFamily" defaultValue={theme.fontFamily} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6]">
                  <option value="Inter">Inter (Modern & Bersih)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Elegan)</option>
                  <option value="Merriweather">Merriweather (Klasik Serif)</option>
                </select>
              </div>
            </div>
          </div>

          <div className={activeTab === 'hero' ? 'block' : 'hidden'}>
             <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Besar (Headline)</label>
                <input type="text" name="heroTitle" defaultValue={heroData?.title || ""} placeholder="Kos Eksklusif Ternyaman" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6]" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-judul (Penjelasan)</label>
                <textarea name="heroSubtitle" defaultValue={heroData?.subtitle || ""} placeholder="Berada di pusat kota dengan fasilitas lengkap..." rows={4} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6] resize-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teks Tombol Aksi</label>
                <input type="text" name="heroCtaText" defaultValue={heroData?.ctaText || "Lihat Kamar"} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6]" required />
              </div>
            </div>
          </div>

          <div className={activeTab === 'features' ? 'block' : 'hidden'}>
             <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Keunggulan 1</label>
                <input type="text" name="feature1Text" defaultValue={features[0]?.text || ""} placeholder="Lokasi Strategis" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Keunggulan 2</label>
                <input type="text" name="feature2Text" defaultValue={features[1]?.text || ""} placeholder="Keamanan 24 Jam" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Keunggulan 3</label>
                <input type="text" name="feature3Text" defaultValue={features[2]?.text || ""} placeholder="Kamar Mandi Dalam" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6]" />
              </div>
            </div>
          </div>

          <div className={activeTab === 'rooms' ? 'block' : 'hidden'}>
             <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Bagian Kamar</label>
                <input type="text" name="roomsTitle" defaultValue={(featuresData as any)?.roomsTitle || "Pilihan Kamar"} placeholder="Kamar yang Tersedia" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor WhatsApp Booking</label>
                <input type="text" name="whatsappNumber" defaultValue={(featuresData as any)?.whatsappNumber || ""} placeholder="6281234567890 (Gunakan 62)" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b23c6]" />
                <p className="text-xs text-gray-500 mt-1">Nomor ini akan digunakan saat calon penyewa mengklik tombol "Pesan via WhatsApp".</p>
              </div>
              <div className="p-4 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 mt-4">
                <p className="text-sm font-medium">Info: Daftar kamar akan diambil secara otomatis dari menu <strong>Manajemen Kamar</strong>.</p>
              </div>
            </div>
          </div>

          <div className={activeTab === 'gallery' ? 'block' : 'hidden'}>
             <div className="space-y-4">
               <p className="text-sm text-gray-600 mb-4">Unggah maksimal 6 foto untuk galeri kos Anda.</p>
               
               <div className="grid grid-cols-2 gap-4">
                 {[0, 1, 2, 3, 4, 5].map((index) => {
                   const existingImage = (featuresData as any)?.images?.[index]?.url;
                   return (
                     <div key={`gallery-${index}`} className="relative group aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center overflow-hidden hover:bg-gray-100 transition-colors">
                       <input 
                         type="file" 
                         name={`galleryImage${index}`} 
                         accept="image/*"
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                       />
                       {existingImage && (
                         <input type="hidden" name={`existingGalleryUrl${index}`} value={existingImage} />
                       )}
                       
                       {existingImage ? (
                         // eslint-disable-next-line @next/next/no-img-element
                         <img src={existingImage} alt="Gallery item" className="absolute inset-0 w-full h-full object-cover z-10" />
                       ) : (
                         <>
                           <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                           <span className="text-[10px] font-medium text-gray-500">Pilih Foto</span>
                         </>
                       )}
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                         <span className="text-white text-xs font-bold">Ubah Foto</span>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        </form>
      </div>

      {/* Kanan: Live Preview */}
      <div className="hidden lg:flex flex-1 bg-gray-200 p-6 flex-col items-center justify-center relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3 text-gray-600 text-sm font-medium bg-white/50 px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
          <MonitorSmartphone className="w-4 h-4" />
          Live Preview 
          <a href={`/kos/${tenant.subdomain}`} target="_blank" className="text-[#3b23c6] hover:underline ml-1">
            (Buka di tab baru ↗)
          </a>
        </div>
        
        <div className="w-full max-w-[375px] h-[800px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border-[8px] border-gray-800 relative">
          {/* Notch Mockup */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>
          
          <div className="flex-1 bg-gray-50 relative w-full h-full pt-6">
             <iframe
               key={refreshKey}
               src={`/kos/${tenant.subdomain}`}
               className="absolute top-0 left-0 w-full h-full border-0 bg-white"
               title="Live Preview"
               sandbox="allow-scripts allow-same-origin"
             />
          </div>
        </div>
      </div>
      
    </div>
  );
}
