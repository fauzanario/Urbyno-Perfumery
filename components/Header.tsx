"use client";
import { useCart } from "@/app/context/CartContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, ArrowRight, Loader2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper untuk format mata uang Rupiah
const formatIDR = (price: any) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(price || 0));
};

export default function Header() {
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  
  // State Navigasi
  const [isOpen, setIsOpen] = useState(false);
  
  // State Pencarian
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State Live Search (Predictive)
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Kunci scroll saat menu mobile terbuka penuh
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Efek Debounce untuk Live Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery.trim())}&limit=4`);
        const data = await res.json();
        setSearchResults(data.items || []);
      } catch (error) {
        console.error("Gagal melakukan live search:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer); 
  }, [searchQuery]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault(); 
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 print:hidden">
      <div className="max-w-7xl mx-auto px-6 h-14 lg:h-10 flex items-center justify-between">
        
        {/* 1. MOBILE MENU TOGGLE */}
        <button 
          className="lg:hidden hover:text-amber-500 transition-colors" 
          onClick={() => {
            setIsOpen(!isOpen);
            setIsSearchOpen(false);
          }}
        >
          {isOpen ? <X className="w-6 h-6 me-10" /> : <Menu className="w-6 h-6 me-10" />}
        </button>

        {/* 2. LOGO */}
        <Link href="/" className="text-3xl lg:text-xl font-serif tracking-[0.05em] uppercase">
          URBYNO
        </Link>

        {/* 3. DESKTOP MENU */}
        <nav className="hidden lg:flex gap-10 text-[11px] font-semibold uppercase tracking-tighter text-gray-600">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <Link href="/products" className="hover:text-amber-500 transition-colors">Products</Link>
          <Link href="/contact" className="hover:text-amber-500 transition-colors">Contact Us</Link>  
        </nav>

        {/* 4. RIGHT ICONS */}
        <div className="flex items-center gap-4 lg:gap-6">
          <button 
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsOpen(false);
              setSearchQuery(""); 
            }}
          >
            {isSearchOpen ? (
              <X className="w-6 h-6 cursor-pointer hover:text-amber-500 transition-colors" />
            ) : (
              <Search className="w-6 h-6 cursor-pointer hover:text-amber-500 transition-colors" />
            )}
          </button>
          
          <div
            className="relative group cursor-pointer"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag className="w-6 h-6 group-hover:text-amber-500 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          SEARCH BAR & PREVIEW DROPDOWN 
          ========================================== */}
      <div className={`absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg overflow-y-auto transition-all duration-300 ease-in-out ${isSearchOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 lg:py-6">
          <form onSubmit={handleSearch} className="flex items-center gap-3 w-full border-b-2 border-black pb-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for your signature scent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm lg:text-base font-medium placeholder:text-gray-400 placeholder:font-normal"
              autoFocus={isSearchOpen}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-sm text-gray-400 hover:text-black transition-colors mr-2">
                Clear
              </button>
            )}
            <button type="submit" className="text-black hover:text-amber-500 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {searchQuery.trim() !== "" && (
            <div className="mt-6 animate-in fade-in duration-300">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Products</h4>
              {isSearching ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 text-black animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {searchResults.map((item) => (
                      <Link key={item.id} href={`/products/${item.slug}`} onClick={() => setIsSearchOpen(false)} className="group block">
                        <div className="relative aspect-4/5 bg-[#f8f8f8] mb-3 overflow-hidden flex items-center justify-center p-4">
                          {item.thumbnailUrl && (
                            <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                          )}
                        </div>
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-black leading-snug line-clamp-2">URBYNO - {item.name}</h3>
                        <div className="flex flex-col mt-1">
                          {item.isSale && item.originalPrice && <span className="text-zinc-400 line-through text-[10px]">{formatIDR(item.originalPrice)}</span>}
                          <span className="text-xs text-black font-medium">{formatIDR(item.startingPrice)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
                    <button onClick={() => handleSearch()} className="bg-black text-white px-8 py-3 text-sm font-bold tracking-widest hover:bg-zinc-800 transition-colors">
                      View all
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-sm text-gray-400">No products found for "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden absolute top-full left-0 w-full bg-white h-[calc(100vh-3.5rem)] shadow-2xl flex flex-col z-50 overflow-y-auto"
          >
            <nav className="flex flex-col text-2xl tracking-tighter uppercase text-black flex-1">
              <Link 
                href="/" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-between px-6 py-6 border-b border-gray-100 hover:bg-zinc-50 transition-colors"
              >
                <span>Home</span>
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              </Link>
              
              <Link 
                href="/products" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-between px-6 py-6 border-b border-gray-100 hover:bg-zinc-50 transition-colors"
              >
                <span>Products</span>
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              </Link>
              
              <Link 
                href="/contact" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-between px-6 py-6 border-b border-gray-100 hover:bg-zinc-50 transition-colors"
              >
                <span>Contact Us</span>
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              </Link>
            </nav>
            
            {/* Footer kecil di area bawah layar penuh */}
            <div className="p-6 pb-10">
              <p className="text-xs font-medium text-zinc-400 tracking-widest uppercase">Urbyno</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}