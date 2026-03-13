"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, X, CheckCircle2, XCircle, Ticket, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import VoucherModal from "./VoucherModal";

const formatIDR = (price: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
const formatDate = (dateString: string) => new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateString));

export default function VoucherTable({ initialVouchers }: { initialVouchers: any[] }) {
  const router = useRouter();
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [selectedRedemptions, setSelectedRedemptions] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { setVouchers(initialVouchers); }, [initialVouchers]);

  const handleSave = async (formData: any) => {
    setIsLoading(true); setIsFormOpen(false);
    try {
      const method = formData.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/vouchers", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal");
      if (method === "PUT") setVouchers(prev => prev.map(v => v.id === formData.id ? { ...v, ...data } : v));
      else setVouchers(prev => [{ ...data, redemptions: [] }, ...prev]);
      router.refresh(); 
    } catch (err: any) { alert(err.message); setIsFormOpen(true); } finally { setIsLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus voucher?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/vouchers?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal");
      setVouchers(prev => prev.filter(v => v.id !== id));
      router.refresh();
    } catch (err: any) { alert(err.message); } finally { setIsLoading(false); }
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
            <Ticket className="w-6 h-6 text-amber-600" /> Promo & Vouchers
          </h1>
          <p className="text-xs lg:text-sm text-zinc-500 mt-1">Kelola kode diskon dan lihat riwayat penggunaannya oleh pelanggan.</p>
        </div>
        <button onClick={() => { setEditingVoucher(null); setIsFormOpen(true); }} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-[10px] lg:text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> NEW VOUCHER
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-225">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
                <th className="px-6 py-5">Kode Promo</th>
                <th className="px-6 py-5">Nilai Diskon</th>
                <th className="px-6 py-5">Syarat Minimum</th>
                <th className="px-6 py-5 text-center">Terpakai</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {vouchers.length === 0 && (<tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-500 text-sm">Belum ada voucher.</td></tr>)}
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100"><Ticket className="w-5 h-5 text-amber-600" /></div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 tracking-widest">{v.code}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">{v.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-amber-600">{v.type === "PERCENT" ? `${v.value}%` : formatIDR(v.value)}</p>
                    {v.type === "PERCENT" && v.maxDiscount > 0 && (<p className="text-[10px] text-zinc-500 mt-1">Maks: {formatIDR(v.maxDiscount)}</p>)}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 font-medium">{formatIDR(v.minPurchase)}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setSelectedRedemptions(v)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors">
                      <Users className="w-3.5 h-3.5" /> {v.usedCount} / {v.quota || '∞'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {v.isActive ? (<span className="px-2.5 py-1 bg-green-50 text-green-600 border border-green-200 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3"/> Active</span>) 
                    : (<span className="px-2.5 py-1 bg-zinc-100 text-zinc-500 border border-zinc-200 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit"><XCircle className="w-3 h-3"/> Hidden</span>)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setEditingVoucher(v); setIsFormOpen(true); }} className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRedemptions && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Riwayat Penggunaan</h2>
                <p className="text-xs text-zinc-500 mt-1">Voucher: <span className="text-amber-600 font-bold tracking-widest">{selectedRedemptions.code}</span></p>
              </div>
              <button onClick={() => setSelectedRedemptions(null)} className="text-zinc-400 hover:text-zinc-900 p-2 bg-zinc-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {selectedRedemptions.redemptions.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-sm">Belum ada pelanggan yang menggunakan voucher ini.</div>
              ) : (
                <div className="space-y-4">
                  {selectedRedemptions.redemptions.map((r: any) => (
                    <div key={r.id} className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{r.customerEmail}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">{r.customerPhone} • Order ID: {r.orderId.substring(0,8)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">-{formatIDR(r.discountAmount)}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">{formatDate(r.redeemedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <VoucherModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} voucherData={editingVoucher} onSave={handleSave} />
    </>
  );
}