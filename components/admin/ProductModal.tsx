"use client";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, ImagePlus } from "lucide-react";

export default function ProductModal({ isOpen, onClose, productData, onSave }: any) {
  
  // State untuk Data Form Database
  const [formData, setFormData] = useState({
    id: "", name: "", slug: "", description: "", isActive: true,
    // 👇 DEFAULT VARIAN DITAMBAH isSale DAN originalPrice 👇
    variants: [{ variantName: "50ML", price: 0, originalPrice: "", isSale: false, stock: 0 }] 
  });

  const [existingImages, setExistingImages] = useState<string[]>([]); 
  const [newFiles, setNewFiles] = useState<File[]>([]); 

  useEffect(() => {
    if (productData) {
      setFormData({
        id: productData.id, name: productData.name, slug: productData.slug, 
        description: productData.description, isActive: productData.isActive,
        // 👇 PASTIKAN DATA VARIAN LAMA JUGA MEMBAWA isSale & originalPrice 👇
        variants: productData.variants.length > 0 
          ? productData.variants.map((v: any) => ({
              ...v, 
              originalPrice: v.originalPrice || "", 
              isSale: v.isSale || false
            }))
          : [{ variantName: "50ML", price: 0, originalPrice: "", isSale: false, stock: 0 }]
      });
      const allDBImages = [productData.thumbnailUrl, ...(productData.images || [])].filter(Boolean);
      setExistingImages(allDBImages);
    } else {
      setFormData({
        id: "", name: "", slug: "", description: "", isActive: true,
        variants: [{ variantName: "50ML", price: 0, originalPrice: "", isSale: false, stock: 0 }]
      });
      setExistingImages([]);
    }
    setNewFiles([]); 
  }, [productData, isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name: val, slug: generatedSlug });
  };

  const addVariant = () => setFormData({ 
    ...formData, 
    variants: [...formData.variants, { variantName: "", price: 0, originalPrice: "", isSale: false, stock: 0 }] 
  });
  
  const removeVariant = (index: number) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants: any = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const removeNewFile = (indexToRemove: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      {/* KOTAK MODAL CERAH */}
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 sticky top-0 bg-white z-10 shrink-0">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{productData ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* KONTEN */}
        <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar bg-zinc-50/50">
          
          {/* BAGIAN 1: BASIC INFO */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest border-b border-zinc-200 pb-2">1. Basic Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Product Name</label>
                <input type="text" value={formData.name} onChange={handleNameChange} className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-400" placeholder="e.g. Calido Extrait" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">URL Slug (Auto)</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Description</label>
              <textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all min-h-25 placeholder:text-zinc-400" placeholder="Deskripsi wangi parfum..." />
            </div>

            {/* AREA UPLOAD GAMBAR CERAH */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Product Images <span className="text-zinc-400 normal-case tracking-normal">(Gambar pertama akan menjadi Thumbnail Utama)</span>
              </label>
              
              <div className="flex flex-wrap gap-4 pt-2">
                {existingImages.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative w-24 h-24 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 group">
                    <img src={url} alt="existing" className="w-full h-full object-cover" />
                    {idx === 0 && <span className="absolute bottom-0 left-0 w-full bg-amber-500/90 text-white text-[9px] font-bold text-center py-0.5">THUMBNAIL</span>}
                    <button onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 p-1 bg-white/90 text-red-600 shadow-sm rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white border border-red-100"><X className="w-3 h-3" /></button>
                  </div>
                ))}

                {newFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative w-24 h-24 bg-zinc-100 rounded-xl overflow-hidden border-2 border-amber-400 group">
                    <img src={URL.createObjectURL(file)} alt="new preview" className="w-full h-full object-cover" />
                    {existingImages.length === 0 && idx === 0 && <span className="absolute bottom-0 left-0 w-full bg-amber-500/90 text-white text-[9px] font-bold text-center py-0.5">THUMBNAIL</span>}
                    <button onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 p-1 bg-white/90 text-red-600 shadow-sm rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white border border-red-100"><X className="w-3 h-3" /></button>
                  </div>
                ))}

                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-zinc-300 border-dashed rounded-xl cursor-pointer hover:border-amber-400 hover:bg-white transition-all bg-zinc-50">
                  <ImagePlus className="w-6 h-6 text-zinc-400 mb-1" />
                  <span className="text-[10px] text-zinc-500 font-medium">Add Images</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
              </div>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer pt-4 w-fit">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 accent-green-600" />
              <span className="text-sm text-zinc-700 font-medium">Publish this product immediately</span>
            </label>
          </div>

          {/* BAGIAN 2: VARIAN & HARGA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest">2. Variants & Pricing</h3>
              <button onClick={addVariant} className="flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                <Plus className="w-3 h-3" /> Add Size
              </button>
            </div>

            <div className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={index} className="flex flex-col gap-3 bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                  
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Size / Variant</label>
                      <input type="text" placeholder="e.g. 50ML" value={variant.variantName} onChange={(e) => updateVariant(index, 'variantName', e.target.value)} className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                    </div>
                    
                    {/* 👇 HARGA JUAL 👇 */}
                    <div className="flex-1">
                      <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Price (Harga Jual)</label>
                      <input type="number" value={variant.price} onChange={(e) => updateVariant(index, 'price', e.target.value)} className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                    </div>

                    {/* 👇 HARGA ASLI / CORET (BARU) 👇 */}
                    <div className="flex-1">
                      <label className="text-[9px] uppercase font-bold mb-1 block text-amber-600">Original Price (Coret)</label>
                      <input type="number" placeholder="Kosongkan jika tidak sale" value={variant.originalPrice} onChange={(e) => updateVariant(index, 'originalPrice', e.target.value)} className="w-full bg-white border border-amber-200 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-zinc-300" />
                    </div>

                    <div className="w-24">
                      <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Stock</label>
                      <input type="number" value={variant.stock} onChange={(e) => updateVariant(index, 'stock', e.target.value)} className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-center" />
                    </div>
                    
                    <div className="flex items-end pb-0.5">
                      <button onClick={() => removeVariant(index)} disabled={formData.variants.length === 1} className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 👇 TOGGLE STATUS SALE (BARU) 👇 */}
                  <div className="flex items-center gap-2 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                      <input 
                        type="checkbox" 
                        checked={variant.isSale} 
                        onChange={(e) => updateVariant(index, 'isSale', e.target.checked)} 
                        className="w-4 h-4 accent-amber-600" 
                      />
                      <span className="text-xs font-bold text-zinc-600">Aktifkan Status "SALE" untuk Varian ini</span>
                    </label>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* FOOTER CERAH */}
        <div className="p-6 border-t border-zinc-200 flex gap-3 bg-white shrink-0 rounded-b-2xl">
          <button onClick={onClose} className="flex-1 px-4 py-3.5 rounded-xl text-xs font-bold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors uppercase tracking-widest shadow-sm">Cancel</button>
          <button onClick={() => onSave(formData, existingImages, newFiles)} className="flex-1 px-4 py-3.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all uppercase tracking-widest">Save Product</button>
        </div>
      </div>
    </div>
  );
}