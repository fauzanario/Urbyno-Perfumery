import Link from "next/link";
import { Instagram, Music2, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-white pt-10 pb-10 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* BRAND INFO - Tetap di posisi awal */}
        <div className="space-y-6">
          <Link href="/" className="text-2xl font-serif tracking-[0.05em] uppercase">
            URBYNO
          </Link>
          <p className="text-zinc-400 text-sm leading-relaxed tracking-wide font-light mt-3">
            "Every Scent Is An Unspoken Story." <br />
            Redefining the essence of luxury through an exclusive and masterfully curated collection of fragrances, since 2024.
          </p>
        </div>

        {/* QUICK LINKS - Didorong ke kanan pada desktop */}
        <div className="lg:pl-20"> 
          <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-8">Navigation</h4>
          <ul className="space-y-4 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* CONTACT INFO - Didorong ke kanan pada desktop */}
        <div className="lg:pl-16">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-8">Contact Us</h4>
          <ul className="space-y-4 text-sm text-zinc-400 font-light">
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-zinc-500" />
              <span>contact@urbyno.com</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-zinc-500" />
              <span>+62 812 3456 7890</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <span>Pulo Gadung, DKI Jakarta, Indonesia</span>
            </li>
          </ul>
        </div>

        {/* FOLLOW US - Didorong ke kanan pada desktop agar merata ke sisi kanan layar */}
        <div className="lg:pl-12 flex flex-col lg:items-end">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-8 w-full lg:text-right">Follow Us</h4>
          <div className="flex gap-6">
            <a 
              href="https://instagram.com/urbyno.id" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <div className="p-3 border border-zinc-800 rounded-full group-hover:border-amber-500 group-hover:text-amber-500 transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Instagram</span>
            </a>

            <a 
              href="https://tiktok.com/@urbyno.id" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <div className="p-3 border border-zinc-800 rounded-full group-hover:border-amber-500 group-hover:text-amber-500 transition-all duration-300">
                <Music2 className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">TikTok</span>
            </a>
          </div>
        </div>

      </div>

      {/* COPYRIGHT AREA */}
      <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
        <p>© 2024 - 2026 URBYNO PERFUMERY. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}