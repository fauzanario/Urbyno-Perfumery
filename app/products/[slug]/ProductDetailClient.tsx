"use client";
import { useCart } from "@/app/context/CartContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 👈 Tambahkan ini untuk navigasi
import { 
  ChevronLeft, ChevronRight, Maximize2, 
  Minus, Plus, ShoppingBag, X, Loader2
} from "lucide-react";

// Helper Format Rupiah
const formatIDR = (price: number | string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(price));
};

export default function ProductDetailClient({ product }: { product: any }) {
  const router = useRouter(); // 👈 Inisialisasi router
  const { addToCart, setIsCartOpen } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false); // 👈 State loading untuk Buy Now

  const images = [
    product.thumbnailUrl,
    ...(product.images || [])
  ];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'unset'; 
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isZoomed]);

  const nextImage = () => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const increaseQuantity = () => {
    if (quantity < selectedVariant.stock) {
      setQuantity(q => q + 1);
    }
  };
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    setTimeout(() => {
      addToCart({
        variantId: selectedVariant.id,
        productId: product.id,
        name: product.name,
        variantName: selectedVariant.variantName,
        price: selectedVariant.price,
        thumbnailUrl: product.thumbnailUrl,
        quantity: quantity,
        stock: selectedVariant.stock
      });
      setIsAddingToCart(false);
    }, 1000); 
  };

const handleBuyNow = () => {
    setIsBuyingNow(true);
    
    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      variantName: selectedVariant.variantName,
      price: selectedVariant.price,
      thumbnailUrl: product.thumbnailUrl,
      quantity: quantity,
      stock: selectedVariant.stock
    });

    if (setIsCartOpen) {
      setIsCartOpen(false); 
    }

    router.push("/checkout");
  };

  return (
    <>
      <main className="min-h-screen bg-white text-black pt-8 pb-32">
        <div className="container mx-auto px-6 lg:px-12 mb-8 text-[11px] text-zinc-400 tracking-widest uppercase font-medium">
          <Link href="/products" className="hover:text-black transition-colors tracking-tight">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-bold">{product.name}</span>
        </div>

        <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className="lg:sticky lg:top-24 flex flex-col-reverse md:flex-row gap-4">
            
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible w-full md:w-20 shrink-0 hide-scrollbar">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-square border-2 rounded-lg overflow-hidden shrink-0 w-20 md:w-full transition-all ${
                    activeImageIndex === idx ? "border-black opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover mix-blend-multiply" />
                </button>
              ))}
            </div>

            <div 
              className="relative aspect-4/5 md:aspect-square flex-1 bg-[#f8f8f8] rounded-xl flex items-center justify-center group overflow-hidden cursor-zoom-in"
              onClick={() => setIsZoomed(true)} 
            >
              <img 
                src={images[activeImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
              />
              
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }} 
                className="absolute left-3 md:left-4 p-2 bg-white/60 rounded-full shadow-md hover:bg-white text-black opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }} 
                className="absolute right-3 md:right-4 p-2 bg-white/60 rounded-full shadow-md hover:bg-white text-black opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(true);
                }} 
                className="absolute bottom-3 right-3 md:bottom-4 md:right-4 p-2.5 bg-white/90 rounded-full shadow-sm hover:bg-black hover:text-white text-black transition-all"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4 lg:pl-6 pb-20">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold leading-snug">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl text-gray-600">
                {formatIDR(selectedVariant.price)}
              </span>
              {selectedVariant.isSale && selectedVariant.originalPrice && (
                <span className="text-xl text-amber-500 line-through font-medium">
                  {formatIDR(selectedVariant.originalPrice)}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase text-zinc-800">
                Varian / Ukuran: <span className="text-black font-black">{selectedVariant.variantName}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    disabled={variant.stock <= 0}
                    className={`px-6 py-2 border rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedVariant.id === variant.id
                        ? "border-black bg-black text-white" 
                        : variant.stock <= 0
                        ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed line-through" 
                        : "border-zinc-300 text-zinc-600 hover:border-black hover:text-black" 
                    }`}
                  >
                    {variant.variantName}
                  </button>
                ))}
              </div>
              
              <p className={`text-xs mt-2 ${selectedVariant.stock > 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}`}>
                {selectedVariant.stock > 0 ? `Tersedia (${selectedVariant.stock} stok)` : "Habis Terjual"}
              </p>
            </div>

            <div className="pt-6 space-y-3">
              <div className="flex gap-4 h-14">
                <div className="flex items-center justify-between border border-black bg-white w-32 px-4">
                  <button 
                    onClick={decreaseQuantity} 
                    disabled={quantity <= 1 || selectedVariant.stock <= 0}
                    className="text-zinc-500 hover:text-black disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={increaseQuantity} 
                    disabled={quantity >= selectedVariant.stock || selectedVariant.stock <= 0}
                    className="text-zinc-500 hover:text-black disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  disabled={selectedVariant.stock <= 0 || isAddingToCart || isBuyingNow}
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#181824] hover:bg-black text-white flex items-center justify-center gap-3 font-bold tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {isAddingToCart ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShoppingBag className="w-5 h-5" />
                  )}
                  {isAddingToCart ? "Adding..." : "Add To Cart"}
                </button>
              </div>

              {/* 👇 TOMBOL BUY NOW YANG SUDAH DIREVISI 👇 */}
              <button 
                disabled={selectedVariant.stock <= 0 || isBuyingNow || isAddingToCart}
                onClick={handleBuyNow}
                className="w-full h-14 bg-[#181824] hover:bg-black text-white flex items-center justify-center gap-3 font-bold tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuyingNow ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Buy Now"
                )}
              </button>

            </div>

            <hr className="border-t-2 border-black my-10" />

            <div className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
              {product.description || "Tidak ada deskripsi untuk produk ini."}
            </div>

            <hr className="border-t-2 border-dashed border-black mt-10" />

          </div>
        </div>
      </main>

      {isZoomed && (
        <div 
          className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          
          <button 
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <button onClick={(e) => {e.stopPropagation(); prevImage();}} className="absolute left-4 md:left-8 p-3 bg-white/10 text-white rounded-full hover:bg-white/30 transition-colors z-10">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={(e) => {e.stopPropagation(); nextImage();}} className="absolute right-4 md:right-8 p-3 bg-white/10 text-white rounded-full hover:bg-white/30 transition-colors z-10">
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            <img 
              src={images[activeImageIndex]} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-300 pointer-events-auto"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </>
  );
}