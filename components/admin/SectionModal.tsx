"use client";
import { useState, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";

export default function SectionModal({ isOpen, onClose, sectionData, onSave }: any) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isMediaRemoved, setIsMediaRemoved] = useState(false);

  const [formData, setFormData] = useState({
    type: "HERO",
    title: "",
    subtitle: "",
    imageUrl: "",
    ctaText: "",
    ctaLink: "",
    position: 1,
    isActive: true,
  });

  useEffect(() => {
    if (sectionData) {
      setFormData(sectionData);
    } else {
      setFormData({
        type: "HERO", title: "", subtitle: "", imageUrl: "",
        ctaText: "", ctaLink: "", position: 1, isActive: true,
      });
    }
    setSelectedFile(null);
    setIsMediaRemoved(false);
  }, [sectionData, isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const localPreviewUrl = URL.createObjectURL(file);
    setFormData({ ...formData, imageUrl: localPreviewUrl });
    setIsMediaRemoved(false); 
  };

  const handleRemoveMedia = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFile(null);
    setFormData({ ...formData, imageUrl: "" });
    setIsMediaRemoved(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* HEADER CERAH */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 shrink-0">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            {sectionData ? "Edit Section" : "New Section"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 p-2 bg-zinc-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KONTEN FORM CERAH */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1 bg-zinc-50/50">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Section Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              >
                <option value="HERO">Hero Branding</option>
                <option value="PROMO_GRID">Promo Grid</option>
                <option value="VIDEO">Video Section</option>
                <option value="CAROUSEL">Carousel / Slider</option>
                <option value="ABOUT_US">About Us</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Position & Status</label>
              <div className="flex gap-3">
                <input 
                  type="number" 
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: parseInt(e.target.value)})}
                  className="w-20 bg-white border border-zinc-300 text-zinc-900 rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`flex-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    formData.isActive 
                    ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100" 
                    : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  }`}
                >
                  {formData.isActive ? "Active" : "Hidden"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Title / Headline</label>
            <input 
              type="text" value={formData.title || ""}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Subtitle / Description</label>
            <textarea 
              value={formData.subtitle || ""}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
              className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-400 min-h-20"
            />
          </div>

          {/* AREA UPLOAD MEDIA */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Media (Image / Video)</label>
            
            {formData.imageUrl ? (
              <div className="relative w-full h-40 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 group flex items-center justify-center">
                {formData.imageUrl.includes('.mp4') ? (
                  <video src={formData.imageUrl} className="w-full h-full object-cover" autoPlay muted loop />
                ) : (
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                )}
                
                <button 
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 p-2 bg-white/90 text-red-600 rounded-xl shadow-sm transition-all active:scale-95 opacity-0 group-hover:opacity-100 hover:bg-white border border-red-100"
                  title="Remove Media"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-zinc-50 hover:border-amber-400 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                  <p className="text-sm text-zinc-600 font-medium">Click to select media</p>
                  <p className="text-xs text-zinc-400 mt-1">SVG, PNG, JPG, or MP4</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,video/mp4" 
                  onChange={handleFileSelect}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5 border-t border-zinc-200 pt-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">CTA Text</label>
              <input 
                type="text" value={formData.ctaText || ""}
                onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">CTA Link</label>
              <input 
                type="text" value={formData.ctaLink || ""}
                onChange={(e) => setFormData({...formData, ctaLink: e.target.value})}
                className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* FOOTER CERAH */}
        <div className="p-6 border-t border-zinc-200 bg-white shrink-0 rounded-b-2xl flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3.5 rounded-xl text-xs font-bold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors uppercase tracking-widest shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(formData, selectedFile, isMediaRemoved)}
            className="flex-1 px-4 py-3.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all uppercase tracking-widest shadow-md"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}