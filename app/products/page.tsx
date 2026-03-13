import { Suspense } from "react";
import Link from "next/link";
import ProductsClient from "@/components/ProductsClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: 'Products | Urbyno Perfumery',
  description: 'Explore our curated collection of signature scents.',
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-white text-black pt-6 md:pt-10 pb-20">
      
      {/* 👇 KUNCI PERBAIKAN: Pakai max-w-7xl agar lebarnya terkunci elegan di tengah 👇 */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Breadcrumb aslimu aku kembalikan! */}
        <div className="hidden md:block text-[11px] text-zinc-400 mb-6 tracking-widest uppercase font-medium">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-bold">Products</span>
        </div>

        <Suspense 
          fallback={
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Loading Catalog...</p>
            </div>
          }
        >
          <ProductsClient />
        </Suspense>

      </div>
    </main>
  );
}