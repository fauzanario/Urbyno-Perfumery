"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Package, Image as ImageIcon, 
  ShoppingCart, Users, LogOut, Sparkles, Menu, Ticket, X 
} from "lucide-react";
import { logout } from "@/app/admin/actions";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Landing Sections", icon: ImageIcon, href: "/admin/sections" },
  { name: "Products", icon: Package, href: "/admin/products" },
  { name: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { name: "Vouchers", icon: Ticket, href: "/admin/vouchers" },
  { name: "Customers", icon: Users, href: "/admin/customers" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // State untuk mobile menu

  return (
    <>
      {/* TOMBOL HAMBURGER (Hanya muncul di Mobile) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-2.5 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-amber-500"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* OVERLAY (Background gelap saat menu buka di mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ASIDE SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-70 w-64 bg-black border-r border-zinc-800 flex flex-col h-screen transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:sticky lg:top-0
      `}>
        {/* HEADER SIDEBAR */}
        <div className="p-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-xl font-serif tracking-[0.05em] uppercase text-white">URBYNO</span>
          </Link>
          {/* Tombol Close di Mobile */}
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-zinc-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* NAVIGASI */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)} // Tutup sidebar setelah klik di mobile
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive 
                    ? "bg-amber-500/10 text-amber-500 font-bold" 
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl w-full transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}