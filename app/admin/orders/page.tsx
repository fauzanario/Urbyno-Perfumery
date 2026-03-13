export const dynamic = 'force-dynamic';
import Sidebar from "@/components/admin/Sidebar";
import { Search, Bell, ShoppingCart } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import OrderTable from "@/components/admin/OrderTable";

export default async function AdminOrdersPage() {
  const rawOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true, shipment: true }
  });

  const serializedOrders = rawOrders.map(order => ({
    ...order,
    shippingCost: Number(order.shippingCost),
    discountAmount: Number(order.discountAmount),
    subtotal: Number(order.subtotal),
    grandTotal: Number(order.grandTotal),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map(item => ({
      ...item,
      unitPriceSnapshot: Number(item.unitPriceSnapshot),
      lineTotal: Number(item.lineTotal),
      createdAt: item.createdAt.toISOString(),
    })),
    shipment: order.shipment ? {
      ...order.shipment,
      shippedAt: order.shipment.shippedAt?.toISOString() || null,
      deliveredAt: order.shipment.deliveredAt?.toISOString() || null,
      createdAt: order.shipment.createdAt.toISOString(),
      updatedAt: order.shipment.updatedAt.toISOString(),
    } : null
  }));

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        <div className="p-4 lg:p-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-amber-600" /> Order Management
              </h1>
              <p className="text-xs lg:text-sm text-zinc-500 mt-1">Pantau pesanan masuk, status pembayaran, dan proses pengiriman barang.</p>
            </div>
          </div>

          <OrderTable initialOrders={serializedOrders} />
        </div>
      </main>
    </div>
  );
}