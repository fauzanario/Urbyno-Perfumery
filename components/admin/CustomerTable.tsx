"use client";
import { useState } from "react";
import { Users, Mail, MessageCircle, ShoppingBag, CalendarClock, Download } from "lucide-react";

const formatIDR = (price: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
const formatDate = (dateString: string) => new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateString));

export default function CustomerTable({ initialCustomers }: { initialCustomers: any[] }) {
  const [customers] = useState(initialCustomers);

  const getWhatsAppLink = (phone: string, name: string) => {
    let formattedPhone = phone.trim().replace(/\D/g, ''); 
    if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.substring(1);
    const message = encodeURIComponent(`Halo ${name}, kami dari Urbyno Perfumery ingin menginfokan promo eksklusif...`);
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return alert("Belum ada data pelanggan untuk diekspor.");
    const headers = ["Nama Pelanggan", "Nomor WhatsApp", "Email", "Total Order", "Total Belanja (Rp)", "Tanggal Terakhir Belanja"];
    const csvRows = customers.map(c => [`"${c.name}"`, `"${c.phone}"`, `"${c.email}"`, c.totalOrders, c.totalSpent, `"${formatDate(c.lastOrderDate)}"`].join(","));
    const csvString = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Urbyno_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-amber-600" />
            Customers Database
          </h1>
          <p className="text-xs lg:text-sm text-zinc-500 mt-1">Data pelanggan yang pernah bertransaksi untuk keperluan promosi dan CRM.</p>
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="bg-white hover:bg-zinc-50 text-zinc-800 px-5 py-2.5 rounded-xl text-[10px] lg:text-xs font-bold flex items-center justify-center gap-2 border border-zinc-200 shadow-sm transition-all active:scale-95"
        >
          <Download className="w-4 h-4 text-zinc-500" />
          EXPORT DATA (CSV)
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-225">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
                <th className="px-6 py-5">Customer Info</th>
                <th className="px-6 py-5">Kontak</th>
                <th className="px-6 py-5 text-center">Total Order</th>
                <th className="px-6 py-5">Total Spent (LTV)</th>
                <th className="px-6 py-5">Order Terakhir</th>
                <th className="px-6 py-5 text-right">Promosi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {customers.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-500 text-sm">Belum ada data pelanggan.</td></tr>
              )}
              {customers.map((c, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                        <Users className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{c.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">Pelanggan Urbyno</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <p className="text-xs font-medium text-zinc-600 flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-zinc-400" /> {c.phone}
                    </p>
                    <p className="text-xs font-medium text-zinc-600 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" /> {c.email !== "-" ? c.email : <span className="text-zinc-400 italic">Tidak ada email</span>}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold">
                      <ShoppingBag className="w-3.5 h-3.5" /> {c.totalOrders}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-amber-600">{formatIDR(c.totalSpent)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-zinc-600 flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-zinc-400" /> {formatDate(c.lastOrderDate)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <a href={getWhatsAppLink(c.phone, c.name)} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 rounded-lg transition-colors inline-flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      {c.email !== "-" && (
                        <a href={`mailto:${c.email}?subject=Promo Eksklusif Urbyno`} className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-lg transition-colors inline-flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}