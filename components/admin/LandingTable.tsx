"use client";
import { useState } from "react";
import { Plus, ImageIcon, Loader2, Edit, Trash2, ArrowUp, ArrowDown, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';
import SectionModal from "./SectionModal";

export default function LandingTable({ initialSections }: { initialSections: any[] }) {
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getFileNameFromUrl = (url: string) => {
    if (!url || !url.includes('supabase.co')) return null;
    return url.split('/').pop();
  };

  const handleSave = async (formData: any, file: File | null, isMediaRemoved: boolean) => {
    setIsSaving(true);
    let finalImageUrl = formData.imageUrl; 

    try {
      if ((isMediaRemoved || file) && selectedSection?.imageUrl) {
        const oldFileName = getFileNameFromUrl(selectedSection.imageUrl);
        if (oldFileName) {
          await supabase.storage.from('images').remove([oldFileName]);
        }
        if (isMediaRemoved) finalImageUrl = ""; 
      }

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        finalImageUrl = publicUrl; 
      }

      const dataToSave = { ...formData, imageUrl: finalImageUrl };
      const method = dataToSave.id ? "PUT" : "POST";

      const res = await fetch("/api/admin/sections", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Terjadi kesalahan pada server");

      setIsModalOpen(false);
      router.refresh(); 

    } catch (error: any) {
      console.error(error);
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Yakin ingin menghapus section ini?")) return;
    setIsSaving(true);
    try {
      if (imageUrl) {
        const oldFileName = getFileNameFromUrl(imageUrl);
        if (oldFileName) await supabase.storage.from('images').remove([oldFileName]);
      }
      const res = await fetch(`/api/admin/sections?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus data");
      router.refresh();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* OVERLAY LOADING SPINNER - VERSI TERANG */}
      {isSaving && (
        <div className="fixed inset-0 z-120 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white border border-zinc-200 p-8 rounded-2xl flex flex-col items-center shadow-2xl">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-zinc-900 font-bold tracking-wider">SAVING TO DATABASE...</p>
            <p className="text-zinc-500 text-sm mt-2">Uploading media and updating sections</p>
          </div>
        </div>
      )}

      {/* HEADER TABEL CERAH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-amber-600" />
            Landing Sections
          </h1>
          <p className="text-xs lg:text-sm text-zinc-500 mt-1">Manage the visual flow of Urbyno.</p>
        </div>
        <button 
          onClick={() => { setSelectedSection(null); setIsModalOpen(true); }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-[10px] lg:text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          NEW SECTION
        </button>
      </div>

      {/* TABEL CERAH */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-800px">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
                <th className="px-6 py-5 text-center w-20">Posisi</th>
                <th className="px-6 py-5 w-32">Visual</th>
                <th className="px-6 py-5">Tipe & Judul</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {initialSections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-sm">
                    Belum ada seksi halaman yang dibuat. Klik "New Section" untuk mulai membangun halaman depan.
                  </td>
                </tr>
              ) : (
                initialSections.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    
                    {/* POSISI */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold text-zinc-900 bg-zinc-100 w-8 h-8 rounded-full flex items-center justify-center border border-zinc-200">
                          {item.position}
                        </span>
                      </div>
                    </td>

                    {/* VISUAL IMAGE */}
                    <td className="px-6 py-4">
                      <div className="w-20 h-12 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="Section Visual" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                    </td>

                    {/* TIPE & JUDUL */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold text-[9px] uppercase tracking-widest mb-2">
                        {item.type.replace('_', ' ')}
                      </span>
                      <p className="text-sm font-bold text-zinc-900 line-clamp-1">{item.title || "Tanpa Judul"}</p>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      {item.isActive ? (
                        <span className="px-2.5 py-1 bg-green-50 text-green-600 border border-green-200 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3"/> Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-zinc-100 text-zinc-500 border border-zinc-200 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3"/> Hidden
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { setSelectedSection(item); setIsModalOpen(true); }} className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id, item.imageUrl)} className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        sectionData={selectedSection}
        onSave={handleSave}
      />
    </>
  );
}