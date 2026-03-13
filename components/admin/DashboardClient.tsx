"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Calendar, Filter } from "lucide-react";

const formatIDR = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

export function DashboardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Mengambil tanggal dari URL jika ada
  const [startDate, setStartDate] = useState(searchParams.get("start") || "");
  const [endDate, setEndDate] = useState(searchParams.get("end") || "");

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (startDate) params.set("start", startDate);
    else params.delete("start");
    
    if (endDate) params.set("end", endDate);
    else params.delete("end");

    // Push URL baru, halaman otomatis me-refresh data sesuai tanggal
    router.push(`?${params.toString()}`);
  };

  return (
    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 sm:p-3 rounded-xl border border-zinc-200 w-full xl:w-auto shadow-sm">
      <div className="flex items-center gap-2 w-full">
        <Calendar className="w-4 h-4 shrink-0 hidden sm:block mx-2" />
        
        {/* Tanggal awal */}
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full sm:w-32.5 bg-transparent border border-zinc-700 rounded-lg px-3 py-2 text-[11px] font-bold text-zinc-900 focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
        />
        
        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest shrink-0">TO</span>
        
        {/* Tanggal akhir */}
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full sm:w-32.5 bg-transparent border border-zinc-700 rounded-lg px-3 py-2 text-[11px] font-bold text-zinc-900 focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
        />
      </div>

      <button type="submit" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shrink-0">
        <Filter className="w-3.5 h-3.5" /> Apply
      </button>
    </form>
  );
}


export function SalesChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-100 flex items-center justify-center text-zinc-500 text-sm font-medium">
        Tidak ada data penjualan di rentang waktu ini.
      </div>
    );
  }

  return (
    <div className="h-100 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#71717a" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.getDate()}/${d.getMonth()+1}`;
            }}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `Rp ${value / 1000}k`}
            width={70}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
            formatter={(value: any) => [formatIDR(Number(value) || 0), "Revenue"]}
            labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}