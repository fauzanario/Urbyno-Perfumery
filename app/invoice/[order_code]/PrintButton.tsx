"use client";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-black text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg"
    >
      <Printer className="w-4 h-4" /> Download / Print Invoice
    </button>
  );
}