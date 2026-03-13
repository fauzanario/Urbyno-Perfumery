import { prisma } from "@/app/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";
import Link from "next/link";
import { PackageX } from "lucide-react"; // Icon box silang

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { 
      slug: slug 
    },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { price: 'asc' }
      }
    }
  });

  if (!product || !product.isActive) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center bg-white text-black px-6">
        <PackageX className="w-24 h-24 text-zinc-200 mb-6" />
        <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-center">Product is Unavailable</h1>
        <p className="text-zinc-500 mb-10 text-center max-w-md text-sm md:text-base leading-relaxed">
          This specific fragrance is currently unavailable. Please explore our curated collection to find something equally captivating.
        </p>
        <Link 
          href="/products" 
          className="px-10 py-4 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors"
        >
          Explore Collection
        </Link>
      </main>
    );
  }

  const serializedProduct = {
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price),
      originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null,
    }))
  };

  return <ProductDetailClient product={serializedProduct} />;
}