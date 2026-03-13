"use client";
import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const formatForInput = (isoString: string | null) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16); 
};

export default function VoucherModal({ isOpen, onClose, voucherData, onSave }: any) {
  const [formData, setFormData] = useState({ code: "", name: "", description: "", type: "PERCENT", value: "", maxDiscount: "", minPurchase: "", quota: "", startsAt: "", endsAt: "", isActive: true });

  useEffect(() => {
    if (voucherData) setFormData({ ...voucherData, startsAt: formatForInput(voucherData.startsAt), endsAt: formatForInput(voucherData.endsAt) });
    else setFormData({ code: "", name: "", description: "", type: "PERCENT", value: "", maxDiscount: "", minPurchase: "", quota: "", startsAt: "", endsAt: "", isActive: true });
  }, [voucherData, isOpen]);

  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...formData, id: voucherData?.id }); };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 shrink-0">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{voucherData ? "Edit Voucher" : "Tambah Voucher Baru"}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 p-2 bg-zinc-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1 bg-zinc-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Kode Promo</label>
              <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })} placeholder="Contoh: URBYNO10" className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-3 text-zinc-900 uppercase focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Nama Voucher</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Diskon Kemerdekaan" className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-3 text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Deskripsi (Opsional)</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Syarat dan ketentuan singkat..." rows={2} className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-3 text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-white border border-zinc-200 shadow-sm rounded-xl">
            <div>
              <label className="block text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Tipe Diskon</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-3 text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all">
                <option value="PERCENT">Persentase (%)</option>
                <option value="FIXED">Nominal Tetap (Rp)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Nilai Diskon {formData.type === "PERCENT" ? "(%)" : "(Rp)"}</label>
              <input type="number" required min="1" max={formData.type === "PERCENT" ? "100" : ""} value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="Contoh: 10 atau 50000" className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-3 text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
            </div>
            {formData.type === "PERCENT" && (
              <div className="md:col-span-2 border-t border-zinc-100 pt-4 mt-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Maksimal Potongan (Rp)</label>
                <input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })} placeholder="Kosongkan jika tanpa batas" className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-3 text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Minimal Belanja (Rp)</label>
              <input type="number" required min="0" value={formData.minPurchase} onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })} placeholder="Contoh: 150000" className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-3 text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Kuota Penggunaan</label>
              <input type="number" min="1" value={formData.quota || ""} onChange={(e) => setFormData({ ...formData, quota: e.target.value })} placeholder="Kosongkan jika unlimited" className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-3 text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-zinc-200 pt-5">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Mulai Berlaku</label>
              <input type="datetime-local" value={formData.startsAt} onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })} className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-3 text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Berakhir Pada</label>
              <input type="datetime-local" value={formData.endsAt} onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })} className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-3 text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border border-zinc-200 p-4 rounded-xl shadow-sm mt-4">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 accent-amber-600 rounded cursor-pointer" />
            <label htmlFor="isActive" className="text-sm text-zinc-900 font-bold cursor-pointer">Voucher Aktif</label>
          </div>
        </form>

        <div className="p-6 border-t border-zinc-200 bg-white shrink-0 rounded-b-2xl">
          <button onClick={handleSubmit} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-md">
            <Save className="w-4 h-4" /> Simpan Voucher
          </button>
        </div>
      </div>
    </div>
  );
}