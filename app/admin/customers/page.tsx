export const dynamic = 'force-dynamic';
import Sidebar from "@/components/admin/Sidebar";
import { prisma } from "@/app/lib/prisma";
import CustomerTable from "@/components/admin/CustomerTable";

export default async function AdminCustomersPage() {
  const validOrders = await prisma.order.findMany({
    where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
    orderBy: { createdAt: 'desc' } 
  });

  const customerMap = new Map();
  for (const order of validOrders) {
    const phone = order.customerPhone;
    if (!customerMap.has(phone)) {
      customerMap.set(phone, {
        name: order.customerName, phone: phone, email: order.customerEmail || "-",
        totalOrders: 0, totalSpent: 0, lastOrderDate: order.createdAt.toISOString(),
      });
    }
    const customer = customerMap.get(phone);
    customer.totalOrders += 1;
    customer.totalSpent += Number(order.grandTotal);
  }
  const customersList = Array.from(customerMap.values());

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">

        <div className="p-4 lg:p-8">
          <CustomerTable initialCustomers={customersList} />
        </div>
      </main>
    </div>
  );
}