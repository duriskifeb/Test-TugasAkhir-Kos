"use client";

import { Home, Plus, Building, MapPin, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCabangBaru } from "./actions";

export function HousesClient({ 
  tenants 
}: { 
  tenants: any[] 
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", subdomain: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await createCabangBaru(formData.name, formData.subdomain);
      if (result.success) {
        setIsModalOpen(false);
        setFormData({ name: "", subdomain: "" });
        router.refresh();
      } else {
        alert("Gagal menambahkan cabang: " + result.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Cabang Kos</h1>
          <p className="text-gray-500 mt-1">
            Kelola berbagai properti kos Anda beserta alamat dan fasilitasnya.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Tambah Cabang
        </button>
      </div>

      {tenants && tenants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col relative overflow-hidden group hover:border-primary/30 transition-all">
              {tenant.status === 'UNVERIFIED' && (
                <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Clock className="w-3 h-3" /> MENUNGGU VERIFIKASI
                </div>
              )}
              {tenant.status === 'VERIFIED' && (
                <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> AKTIF
                </div>
              )}
              
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 text-primary">
                <Building className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{tenant.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <MapPin className="w-4 h-4 mr-1 opacity-70" />
                {tenant.subdomain ? `${tenant.subdomain}.kos.com` : "Domain belum diatur"}
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500">Terdaftar: {new Date(tenant.created_at).toLocaleDateString('id-ID')}</span>
                <button 
                  onClick={() => {
                    document.cookie = `active_tenant_id=${tenant.id}; path=/`;
                    router.push('/dashboard');
                    router.refresh();
                  }}
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                >
                  Kelola Cabang &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Cabang</h3>
          <p className="text-gray-500 max-w-md">
            Anda belum memiliki properti kos yang terdaftar. Klik tombol Tambah Cabang untuk memulai.
          </p>
        </div>
      )}

      {/* Modal Add Branch */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/30 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Daftarkan Cabang Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kos / Cabang</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="field"
                  placeholder="Contoh: Kos Sejahtera Cab. Melati"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain (Untuk Link Web)</label>
                <div className="flex">
                  <input 
                    type="text" 
                    required
                    value={formData.subdomain}
                    onChange={e => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="kos-melati"
                  />
                  <div className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-gray-500 font-medium">
                    .kos.com
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Hanya huruf kecil, angka, dan strip (-).</p>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex-1"
                >
                  {isLoading ? 'Menyimpan...' : 'Daftarkan Cabang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
