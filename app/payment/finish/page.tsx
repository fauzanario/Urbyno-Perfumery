"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Home, Loader2 } from "lucide-react";
import Link from "next/link";

function FinishPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("order_code") || "URBYNO";
  
  // Waktu mundur lebih cepat (5 detik)
  const [countdown, setCountdown] = useState(5); 

  useEffect(() => {
    // Jalankan timer untuk auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/"); // Redirect ke halaman utama
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    // Latar belakang cerah (Zinc 50)
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
      
      {/* Card Putih Bersih dengan Shadow Halus */}
      <div className="max-w-md w-full bg-white p-10 md:p-12 text-center shadow-lg rounded-sm border border-zinc-100 flex flex-col items-center">
        
        {/* Icon Centang Hijau Simpel */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-inner">
          <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
        </div>
        
        {/* Teks Judul Hitam Besar */}
        <h1 className="text-3xl font-extrabold text-black mb-4 tracking-tight">
          Pembayaran Sukses!
        </h1>
        
        {/* Teks Deskripsi Abu-abu, Ringkas & Padat */}
        <p className="text-zinc-600 mb-10 text-base leading-relaxed">
          Terima kasih. Pesanan <span className="font-bold text-black uppercase tracking-wider">{orderCode}</span> sedang kami siapkan. Invoice digital sudah kami kirimkan ke <span className="font-semibold text-black">Email Anda</span>.
        </p>
        
        {/* Bagian Tombol & Timer */}
        <div className="w-full space-y-4 pt-4 mt-auto">
          <p className="text-xs text-zinc-400 font-medium">
            Kembali ke Beranda dalam <span className="text-amber-600 font-bold text-sm">{countdown}</span> detik...
          </p>
          
          <Link 
            href="/"
            className="w-full bg-black hover:bg-zinc-800 text-white py-4 rounded-xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2.5 transition active:scale-95 shadow-md shadow-black/10"
          >
            <Home className="w-4 h-4" /> Kembali ke Home
          </Link>
        </div>

      </div>
    </div>
  );
}

// Komponen wajib Loading (Fallback) juga disesuaikan tema cerah
export default function FinishPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
        <Loader2 className="w-9 h-9 text-amber-500 animate-spin mb-5" />
        <p className="text-xs tracking-widest uppercase font-bold text-zinc-400">Memuat Status...</p>
      </div>
    }>
      <FinishPaymentContent />
    </Suspense>
  );
}