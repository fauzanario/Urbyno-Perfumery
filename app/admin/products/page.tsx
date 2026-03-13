export const dynamic = 'force-dynamic';
import Sidebar from "@/components/admin/Sidebar"; // Sesuaikan path jika berbeda
import { prisma } from "@/app/lib/prisma";
import ProductTable from "@/components/admin/ProductTable"; // Sesuaikan path jika berbeda

export default async function AdminProductsPage() {
  const rawProducts = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: 'desc' }
  });

  const serializedProducts = rawProducts.map(product => ({
    ...product,
    variants: product.variants.map(v => ({
      ...v,
      price: Number(v.price),
      originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
    }))
  }));

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="p-4 lg:p-8">
          <ProductTable initialProducts={serializedProducts} />
        </div>
      </main>
    </div>
  );
}