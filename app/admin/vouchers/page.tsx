export const dynamic = 'force-dynamic';
import Sidebar from "@/components/admin/Sidebar";
import { Search, Bell } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import VoucherTable from "@/components/admin/VoucherTable";

export default async function AdminVouchersPage() {
  const rawVouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: 'desc' },
    include: { redemptions: { orderBy: { redeemedAt: 'desc' } } }
  });

  const serializedVouchers = rawVouchers.map((v) => ({
    ...v,
    value: Number(v.value),
    maxDiscount: Number(v.maxDiscount),
    minPurchase: Number(v.minPurchase),
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    startsAt: v.startsAt ? v.startsAt.toISOString() : null,
    endsAt: v.endsAt ? v.endsAt.toISOString() : null,
    redemptions: v.redemptions.map((r) => ({
      ...r, discountAmount: Number(r.discountAmount), redeemedAt: r.redeemedAt.toISOString()
    }))
  }));

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="p-4 lg:p-8">
          <VoucherTable initialVouchers={serializedVouchers} />
        </div>
      </main>
    </div>
  );
}