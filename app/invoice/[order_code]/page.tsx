import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton"; 

const formatIDR = (price: any) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(price));

const formatDate = (date: Date) => new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);

export default async function InvoicePage({ 
  params 
}: { 
  params: Promise<{ order_code: string }> 
}) {
  const { order_code } = await params;

  const order = await prisma.order.findUnique({
    where: { orderCode: order_code },
    include: { items: true }
  });

  if (!order) return notFound();

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page { margin: 0; } 
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
          }
        `
      }} />

      <div className="min-h-screen bg-gray-100 py-6 sm:py-10 px-4 print:bg-white print:py-0 print:px-0 flex flex-col items-center">
        
        <div className="mb-6 print:hidden w-full max-w-3xl flex justify-end">
          <PrintButton />
        </div>

        {/* Padding disesuaikan: p-6 untuk mobile, sm:p-10 untuk tablet, md:p-16 untuk desktop */}
        <div className="bg-white w-full max-w-3xl p-6 sm:p-10 md:p-16 shadow-lg print:shadow-none border border-gray-200 print:border-none text-black">
          
          {/* HEADER INVOICE: Menjadi kolom pada mobile, kembali sejajar pada layar besar/print */}
          <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start gap-6 print:gap-0 border-b-2 border-black pb-6 sm:pb-8 mb-6 sm:mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-widest uppercase">URBYNO</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 tracking-widest uppercase">Perfumery</p>
            </div>
            {/* Teks rata kiri pada mobile, rata kanan pada layar besar/print */}
            <div className="text-left sm:text-right print:text-right">
              <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-gray-300 uppercase">INVOICE</h2>
              <p className="text-sm font-bold mt-2">{order.orderCode}</p>
              <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              <p className="text-[10px] sm:text-xs font-bold px-2 py-1 bg-green-100 text-green-700 uppercase tracking-widest inline-block mt-2 rounded">
                {order.status}
              </p>
            </div>
          </div>

          {/* INFO PENGIRIM & PENERIMA: Menjadi tumpukan vertikal pada mobile */}
          <div className="flex flex-col sm:flex-row print:flex-row justify-between gap-8 print:gap-0 mb-10 sm:mb-12 text-sm">
            <div className="space-y-1">
              <p className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2">Diterbitkan Oleh</p>
              <p className="font-bold">Urbyno Perfumery</p>
              <p className="text-gray-600">Jl. Siliwangi No. 123, Karawang</p>
              <p className="text-gray-600">Jawa Barat, Indonesia</p>
            </div>
            <div className="space-y-1 text-left sm:text-right print:text-right">
              <p className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2">Ditagihkan Kepada</p>
              <p className="font-bold">{order.customerName}</p>
              <p className="text-gray-600">{order.customerPhone}</p>
              <p className="text-gray-600 max-w-xs sm:ml-auto print:ml-auto">{order.addressDetail}</p>
              <p className="text-gray-600">{order.cityName}, {order.provinceName}</p>
            </div>
          </div>

          {/* TABEL PRODUK: Dibungkus dengan overflow-x-auto agar bisa di-scroll horizontal pada layar sempit */}
          <div className="overflow-x-auto print:overflow-visible mb-8">
            <table className="w-full text-left min-w-100 print:min-w-0">
              <thead>
                <tr className="border-y-2 border-black text-xs uppercase tracking-widest">
                  <th className="py-3 font-bold">Deskripsi Produk</th>
                  <th className="py-3 font-bold text-center">Qty</th>
                  <th className="py-3 font-bold text-right">Harga</th>
                  <th className="py-3 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4">
                      <p className="font-bold text-sm sm:text-base">{item.productNameSnapshot}</p>
                      <p className="text-xs text-gray-500 mt-1">Varian: {item.variantNameSnapshot}</p>
                    </td>
                    <td className="py-4 text-center text-sm sm:text-base">{item.qty}</td>
                    <td className="py-4 text-right text-xs sm:text-sm">{formatIDR(item.unitPriceSnapshot)}</td>
                    <td className="py-4 text-right font-bold text-xs sm:text-sm">{formatIDR(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* KALKULASI TOTAL: Menggunakan lebar penuh pada mobile, setengah pada layar besar */}
          <div className="flex justify-end mb-12">
            <div className="w-full sm:w-2/3 md:w-1/2 print:w-1/2 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatIDR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ongkos Kirim ({order.courierCode?.toUpperCase()})</span>
                <span>{formatIDR(order.shippingCost)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon ({order.voucherCode})</span>
                  <span>-{formatIDR(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t-2 border-black pt-3 mt-3">
                <span className="font-bold uppercase tracking-widest text-base sm:text-lg">Grand Total</span>
                <span className="font-bold text-lg sm:text-xl">{formatIDR(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-gray-200 pt-8 text-center text-[10px] sm:text-xs text-gray-400">
            <p>Terima kasih telah berbelanja di Urbyno Perfumery.</p>
            <p>Invoice ini sah dan digenerate otomatis oleh sistem.</p>
          </div>

        </div>
      </div>
    </>
  );
}