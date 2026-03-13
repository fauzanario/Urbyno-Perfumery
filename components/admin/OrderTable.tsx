"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, X, Package, MapPin, CheckCircle2, Clock, XCircle, Truck, Send, Loader2, Copy } from "lucide-react";

const formatIDR = (price: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
const formatDate = (dateString: string) => new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateString));

export default function OrderTable({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID": return <span className="px-2.5 py-1 bg-green-50 text-green-600 border border-green-200 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3"/> Paid</span>;
      case "SHIPPED": return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit"><Truck className="w-3 h-3"/> Shipped</span>;
      case "DELIVERED": return <span className="px-2.5 py-1 bg-teal-50 text-teal-600 border border-teal-200 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3"/> Delivered</span>;
      case "UNPAID": return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit"><Clock className="w-3 h-3"/> Unpaid</span>;
      case "EXPIRED":
      case "CANCELED": return <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit"><XCircle className="w-3 h-3"/> {status}</span>;
      default: return <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded font-bold text-[10px] uppercase tracking-wider w-fit">{status}</span>;
    }
  };

  const handleSubmitResi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return alert("Nomor resi tidak boleh kosong!");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/shipments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: selectedOrder.id, trackingNumber }) });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        await res.text(); alert("Server gagal membalas JSON!"); setIsSubmitting(false); return;
      }
      const data = await res.json();
      if (res.ok) { alert("Resi tersimpan! Email terkirim."); setTrackingNumber(""); setSelectedOrder(null); router.refresh(); } 
      else { alert(data.message || "Gagal."); }
    } catch (error) { alert("Kesalahan server."); } finally { setIsSubmitting(false); }
  };

  return (
    <>
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-225">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
                <th className="px-6 py-5">Order ID & Date</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Total Amount</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {initialOrders.length === 0 && (<tr><td colSpan={5} className="px-6 py-10 text-center text-zinc-500 text-sm">Belum ada pesanan masuk.</td></tr>)}
              {initialOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-zinc-900">{order.orderCode}</p>
                    <p className="text-[10px] text-zinc-500 mt-1">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-zinc-800">{order.customerName}</p>
                    <p className="text-[10px] text-zinc-500 mt-1">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-sm text-zinc-700 font-medium">{formatIDR(order.grandTotal)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedOrder(order)} className="text-[10px] font-bold uppercase tracking-widest bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm">
                      <Eye className="w-3 h-3" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{selectedOrder.orderCode}</h2>
                <p className="text-xs text-zinc-500 mt-1">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-zinc-400 hover:text-zinc-900 p-2 bg-zinc-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Status Pesanan</span>
                {getStatusBadge(selectedOrder.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-zinc-200 shadow-sm p-5 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2 mb-4"><MapPin className="w-4 h-4"/> Detail Pengiriman</h3>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Penerima</p>
                    <p className="text-sm font-medium text-zinc-900">{selectedOrder.customerName}</p>
                    <p className="text-xs text-zinc-500">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Alamat Lengkap</p>
                    <p className="text-sm font-medium text-zinc-900">{selectedOrder.addressDetail}</p>
                    <p className="text-xs text-zinc-500">{selectedOrder.cityName}, {selectedOrder.provinceName} {selectedOrder.postalCode}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Layanan Kurir</p>
                    <p className="text-sm font-medium text-zinc-900 uppercase">{selectedOrder.courierCode} - {selectedOrder.courierService}</p>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 shadow-sm p-5 rounded-xl flex flex-col">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2 mb-4"><Package className="w-4 h-4"/> Produk Dibeli</h3>
                  <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-start text-sm border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-zinc-900">{item.productNameSnapshot}</p>
                          <p className="text-xs text-zinc-500">{item.variantNameSnapshot} x {item.qty}</p>
                        </div>
                        <div className="font-medium text-zinc-700">{formatIDR(item.lineTotal)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-200 space-y-2 text-sm">
                    <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span>{formatIDR(selectedOrder.subtotal)}</span></div>
                    <div className="flex justify-between text-zinc-500"><span>Ongkir</span><span>{formatIDR(selectedOrder.shippingCost)}</span></div>
                    {selectedOrder.discountAmount > 0 && (<div className="flex justify-between text-green-600"><span>Diskon ({selectedOrder.voucherCode})</span><span>-{formatIDR(selectedOrder.discountAmount)}</span></div>)}
                    <div className="flex justify-between items-center text-zinc-900 font-bold pt-2 mt-2 border-t border-zinc-200">
                      <span className="uppercase tracking-widest text-xs">Grand Total</span>
                      <span className="text-lg text-amber-600">{formatIDR(selectedOrder.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FULFILLMENT */}
              <div className="bg-white border border-zinc-200 shadow-sm p-5 rounded-xl mt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2 mb-4"><Truck className="w-4 h-4"/> Logistik & Pengiriman</h3>
                {selectedOrder.status === "UNPAID" ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs text-center">Menunggu pelanggan menyelesaikan pembayaran.</div>
                ) : selectedOrder.status === "PAID" ? (
                  <form onSubmit={handleSubmitResi} className="flex flex-col sm:flex-row gap-3">
                    <input type="text" required placeholder="Masukkan Nomor Resi..." value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="flex-1 bg-white border border-zinc-300 rounded-lg px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:outline-none transition-colors uppercase" />
                    <button type="submit" disabled={isSubmitting || !trackingNumber.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-xs tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shrink-0">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Kirim Pesanan
                    </button>
                  </form>
                ) : (selectedOrder.status === "SHIPPED" || selectedOrder.status === "DELIVERED") ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="text-[10px] text-blue-600 uppercase tracking-widest mb-1">Nomor Resi ({selectedOrder.courierCode.toUpperCase()})</p>
                      <p className="text-lg font-bold text-blue-900 tracking-wider">{selectedOrder.shipment?.trackingNumber || "TIDAK TERSEDIA"}</p>
                    </div>
                    {selectedOrder.shipment?.trackingNumber && (
                      <button onClick={() => { navigator.clipboard.writeText(selectedOrder.shipment.trackingNumber); alert("Resi tersalin!"); }} className="mt-3 sm:mt-0 px-4 py-2 bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-sm">
                        <Copy className="w-3 h-3" /> Salin Resi
                      </button>
                    )}
                  </div>
                ) : (<div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">Pesanan dibatalkan/kadaluarsa.</div>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}