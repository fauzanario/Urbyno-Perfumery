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
      <Header />
      <main className="min-h-screen bg-white pt-24 pb-32">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="mb-10 lg:mb-16">
            <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-widest text-black mb-4">
              Our Collection
            </h1>
            <p className="text-zinc-500 max-w-xl text-sm lg:text-base leading-relaxed">
              Temukan wangi khas yang mewakili karakter unikmu. Dari aroma segar hingga maskulin yang mendalam, semuanya diracik dengan presisi.
            </p>
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
      <Footer />
    </>
  );
}