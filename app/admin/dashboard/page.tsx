export const dynamic = 'force-dynamic';
import Sidebar from "@/components/admin/Sidebar";
import { TrendingUp, Package, Users, DollarSign } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { DashboardFilter, SalesChart } from "@/components/admin/DashboardClient";

const formatIDR = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

export default async function AdminOverviewPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ start?: string, end?: string }> 
}) {
  const params = await searchParams;
  
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const startDate = params.start ? new Date(params.start) : thirtyDaysAgo;
  const endDate = params.end ? new Date(params.end) : today;
  endDate.setHours(23, 59, 59, 999); 

  const validStatuses = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  const [orders, totalProducts] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: { in: validStatuses as any[] },
        createdAt: { gte: startDate, lte: endDate }
      },
      select: { grandTotal: true, createdAt: true, customerPhone: true }
    }),
    prisma.product.count({ where: { isActive: true } })
  ]);

  let totalRevenue = 0;
  const uniqueCustomers = new Set();
  const chartDataMap: Record<string, number> = {};

  orders.forEach((order) => {
    const amount = Number(order.grandTotal);
    totalRevenue += amount;
    uniqueCustomers.add(order.customerPhone);

    const dateStr = order.createdAt.toISOString().split('T')[0];
    chartDataMap[dateStr] = (chartDataMap[dateStr] || 0) + amount;
  });

  const chartData = Object.entries(chartDataMap)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const stats = [
    { title: "Total Revenue", value: formatIDR(totalRevenue), icon: DollarSign, trend: "Valid", isPositive: true },
    { title: "Total Orders", value: orders.length.toString(), icon: Package, trend: "Valid", isPositive: true },
    { title: "Active Products", value: totalProducts.toString(), icon: TrendingUp, trend: "Live", isPositive: true },
    { title: "Customers", value: uniqueCustomers.size.toString(), icon: Users, trend: "Unique", isPositive: true },
  ];

  return (
    // 👇 Background utama diubah jadi terang (zinc-50) 👇
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50">
      {/* Sidebar tetap komponen lama (Dark Mode) */}
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        
        {/* KONTEN UTAMA */}
        <div className="p-4 lg:p-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Dashboard Overview</h1>
              <p className="text-sm text-zinc-500 mt-1">Pantau performa penjualan dan pelanggan tokomu di sini.</p>
            </div>
            <DashboardFilter />
          </div>

          {/* Cards Grid (Tema Terang) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <stat.icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${stat.isPositive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Grafik Penjualan */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Revenue Trend</h2>
              <p className="text-xs text-zinc-500">Total pendapatan berdasarkan rentang waktu yang dipilih.</p>
            </div>
            <SalesChart data={chartData} />
          </div>

        </div>
      </main>
    </div>
  );
}