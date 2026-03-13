import Link from "next/link";
import ProductsClient from "@/components/ProductsClient";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-white text-black pt-4 md:pt-8 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        
        <div className="hidden md:block text-[11px] text-zinc-400 mb-6 tracking-widest uppercase font-medium">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-bold">Products</span>
        </div>

        <ProductsClient />

      </div>
    </main>
  );
}