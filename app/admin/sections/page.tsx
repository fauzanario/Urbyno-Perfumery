export const dynamic = 'force-dynamic';
import Sidebar from "@/components/admin/Sidebar";
import LandingTable from "@/components/admin/LandingTable";
import { prisma } from "@/app/lib/prisma";

export default async function AdminSectionsPage() {
  const sections = await prisma.landingSection.findMany({
    orderBy: { position: 'asc' }
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        <div className="p-4 lg:p-8">
          <LandingTable initialSections={sections} />
        </div>
      </main>
    </div>
  );
}