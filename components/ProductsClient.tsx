"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List, SlidersHorizontal, Square, ChevronLeft, ChevronRight, Loader2, ChevronDown, X } from "lucide-react";

const formatIDR = (price: any) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(price || 0));
};

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const globalSearchQuery = searchParams.get("q") || ""; 

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [inStock, setInStock] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sort, setSort] = useState("newest");

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileFilterOpen]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
          sort: sort
        });
        
        if (globalSearchQuery) params.append("q", globalSearchQuery);
        if (inStock) params.append("inStock", "true");
        if (outOfStock) params.append("outOfStock", "true");
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        
        setProducts(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || 0);
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [globalSearchQuery, page, inStock, outOfStock, minPrice, maxPrice, sort]);

  useEffect(() => {
    setPage(1);
  }, [inStock, outOfStock, minPrice, maxPrice, sort, globalSearchQuery]);


  return (
    <>
      {globalSearchQuery && (
        <div className="mb-6 text-xl font-bold">
          Search results for: "{globalSearchQuery}"
        </div>
      )}

      <div className="hidden md:flex justify-between items-center mb-10 border-b border-zinc-200 pb-4 relative" ref={dropdownRef}>
        <div className="flex items-center gap-8">
          
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === "availability" ? null : "availability")}
              className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition-colors"
            >
              Availability <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === "availability" ? "rotate-180" : ""}`} />
            </button>
            {activeDropdown === "availability" && (
              <div className="absolute top-full left-0 mt-4 w-64 bg-white border border-zinc-200 shadow-xl p-5 z-20 flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="w-4 h-4 accent-black cursor-pointer" />
                  <span className="text-sm group-hover:text-black text-zinc-600">In stock</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={outOfStock} onChange={(e) => setOutOfStock(e.target.checked)} className="w-4 h-4 accent-black cursor-pointer" />
                  <span className="text-sm group-hover:text-black text-zinc-600">Out of stock</span>
                </label>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === "price" ? null : "price")}
              className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition-colors"
            >
              Price <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === "price" ? "rotate-180" : ""}`} />
            </button>
            {activeDropdown === "price" && (
              <div className="absolute top-full left-0 mt-4 w-80 bg-white border border-zinc-200 shadow-xl p-5 z-20">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <span className="text-xs text-zinc-400 mb-1 block">Min Price (Rp)</span>
                    <input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                  </div>
                  <span className="text-zinc-400 mt-5">to</span>
                  <div className="flex-1">
                    <span className="text-xs text-zinc-400 mb-1 block">Max Price (Rp)</span>
                    <input type="number" placeholder="~" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm text-zinc-500">{totalItems} items</span>
          
          <div className="relative flex items-center gap-3">
            <span className="text-sm text-zinc-600">Sort</span>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="text-sm bg-transparent font-medium focus:outline-none cursor-pointer hover:text-black transition-colors"
            >
              <option value="newest">Featured / Newest</option>
              <option value="alpha-asc">Alphabetically, A-Z</option>
              <option value="alpha-desc">Alphabetically, Z-A</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex md:hidden justify-between items-center mb-6 border-b border-zinc-200 pb-3">
        <button onClick={() => setIsMobileFilterOpen(true)} className="flex items-center gap-2 text-sm text-zinc-800 font-medium">
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>
        
        <div className="flex items-center gap-3 text-zinc-400">
          <button className="hover:text-black transition-colors"><Square className="w-5 h-5" /></button>
          <button className="hover:text-black transition-colors"><LayoutGrid className="w-5 h-5 text-black" /></button>
        </div>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-start md:hidden">
          <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setIsMobileFilterOpen(false)}></div>
          
          <div className="relative w-full max-w-[320px] bg-white h-full flex flex-col animate-slide-in-left shadow-2xl">
            <div className="flex items-center justify-between p-2.5 border-b border-zinc-100">
              <h2 className="text-xl font-bold uppercase tracking-wider">Filter</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Sort By</h3>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-black rounded-none">
                  <option value="newest">Featured / Newest</option>
                  <option value="alpha-asc">Alphabetically, A-Z</option>
                  <option value="alpha-desc">Alphabetically, Z-A</option>
                  <option value="price-asc">Price, low to high</option>
                  <option value="price-desc">Price, high to low</option>
                </select>
              </div>

              <div className="space-y-4 border-t border-zinc-100 pt-6">
                <h3 className="text-sm font-semibold">Availability</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="w-5 h-5 accent-black" />
                  <span className="text-sm text-zinc-600">In stock</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={outOfStock} onChange={(e) => setOutOfStock(e.target.checked)} className="w-5 h-5 accent-black" />
                  <span className="text-sm text-zinc-600">Out of stock</span>
                </label>
              </div>

              <div className="space-y-4 border-t border-zinc-100 pt-6">
                <h3 className="text-sm font-semibold">Price</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">Rp</span>
                    <input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-black" />
                  </div>
                  <span className="text-zinc-400">to</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">Rp</span>
                    <input type="number" placeholder="~" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-black" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-zinc-100 bg-white">
              <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-black text-white py-4 font-bold tracking-wider hover:bg-zinc-800 transition-colors">
                See {totalItems} items
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Loading Collections...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-zinc-500 space-y-2">
          <p className="text-sm tracking-widest uppercase font-bold text-zinc-400">No products match your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-10 md:gap-x-8 md:gap-y-16">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                {/* 👇 REVISI: Wadah & Image dirombak agar FULL tanpa padding 👇 */}
                <div className="relative aspect-4/5 bg-[#f8f8f8] mb-3 md:mb-5 overflow-hidden">
                  
                  {/* BADGES */}
                  {product.totalStock <= 0 ? (
                    <div className="absolute top-2 right-2 bg-zinc-100 text-zinc-500 text-[9px] md:text-[10px] font-bold px-2 py-1 md:px-3 md:py-1 uppercase tracking-widest z-10 border border-zinc-200 shadow-sm">
                      Sold Out
                    </div>
                  ) : product.isSale ? (
                    <div className="absolute top-2 right-2 bg-[#1a1a1a] text-white text-[9px] md:text-[10px] font-bold px-2 py-1 md:px-3 md:py-1 uppercase tracking-widest z-10 shadow-sm">
                      Sale
                    </div>
                  ) : null}
                  
                  {/* GAMBAR FULL COVER */}
                  {product.thumbnailUrl && (
                    <img 
                      src={product.thumbnailUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                    />
                  )}
                </div>

                <div className="text-left space-y-1 pr-2">
                  <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-wider text-black leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs md:text-sm pt-1">
                    <span className="text-black font-medium">{formatIDR(product.startingPrice)}</span>
                    {product.originalPrice && product.isSale && (
                      <span className="text-zinc-400 line-through text-[10px] md:text-xs">
                        {formatIDR(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-20 border-t border-zinc-100 pt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-amber-600 disabled:opacity-30 disabled:hover:text-black transition-colors">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-sm font-medium text-zinc-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-amber-600 disabled:opacity-30 disabled:hover:text-black transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}