import { Suspense } from "react";
import ProductsClient from "@/components/ProductsClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: 'Products | Urbyno Perfumery',
  description: 'Explore our curated collection of signature scents.',
};

export default function ProductsPage() {
  return (
    <>
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
      <Footer />
    </>
  );
}