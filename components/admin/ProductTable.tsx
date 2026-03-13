"use client";
import { useState } from "react";
import { Plus, Package, Loader2, Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';
import ProductModal from "./ProductModal";

const formatIDR = (price: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
};

export default function ProductTable({ initialProducts }: { initialProducts: any[] }) {
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (product: any) => { setSelectedProduct(product); setIsModalOpen(true); };
  const handleNew = () => { setSelectedProduct(null); setIsModalOpen(true); };

  // FUNGSI SAVE TETAP SAMA
  const handleSave = async (formData: any, existingImages: string[], newFiles: File[]) => {
    setIsLoading(true);
    try {
      const newlyUploadedUrls: string[] = [];
      for (const file of newFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `product_${Math.random().toString(36).substring(2, 10)}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        newlyUploadedUrls.push(publicUrl);
      }
      const finalAllImages = [...existingImages, ...newlyUploadedUrls];
      const thumbnailUrl = finalAllImages.length > 0 ? finalAllImages[0] : "";
      const imagesArray = finalAllImages.length > 1 ? finalAllImages.slice(1) : [];

      const dataToSave = { ...formData, thumbnailUrl: thumbnailUrl, images: imagesArray };
      const method = dataToSave.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/products", { method: method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(dataToSave) });
      if (!res.ok) throw new Error("Gagal menyimpan data");
      setIsModalOpen(false); router.refresh();
    } catch (error: any) { alert("Error: " + error.message); } finally { setIsLoading(false); }
  };

  // FUNGSI DELETE TETAP SAMA
  const handleDelete = async (id: string, allImageUrls: string[]) => {
    if (!confirm("Hapus produk ini secara permanen?")) return;
    setIsLoading(true);
    try {
      const fileNamesToRemove = allImageUrls.filter(url => url && url.includes('supabase.co')).map(url => url.split('/').pop()).filter(Boolean) as string[];
      if (fileNamesToRemove.length > 0) { await supabase.storage.from('images').remove(fileNamesToRemove); }
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus produk");
      router.refresh();
    } catch (error: any) { alert("Error: " + error.message); } finally { setIsLoading(false); }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-120 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white border border-zinc-200 p-8 rounded-2xl flex flex-col items-center shadow-2xl">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-zinc-900 font-bold tracking-wider">PROCESSING...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            <Package className="w-6 h-6 text-amber-600" /> Product Catalog
          </h1>
          <p className="text-xs lg:text-sm text-zinc-500 mt-1">Manage all your perfumes, variants, and stock here.</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-[10px] lg:text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> NEW PRODUCT
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
                <th className="px-6 py-5">Image</th>
                <th className="px-6 py-5">Product Name</th>
                <th className="px-6 py-5">Starting Price</th>
                <th className="px-6 py-5">Variants</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {initialProducts.map((item) => {
                const totalStock = item.variants.reduce((sum: number, v: any) => sum + v.stock, 0);
                const startingPrice = item.variants.length > 0 ? item.variants[0].price : 0;
                const allImages = [item.thumbnailUrl, ...(item.images || [])].filter(Boolean);

                return (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                        {item.thumbnailUrl && <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-zinc-900">{item.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">{item.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-700 font-medium">{formatIDR(startingPrice)}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-zinc-700">{item.variants.length} Sizes</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Total Stock: {totalStock}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${item.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                        {item.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(item)} className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id, allImages)} className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} productData={selectedProduct} onSave={handleSave} />
    </>
  );
}