"use client";
import { useCart } from "@/app/context/CartContext";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const formatIDR = (price: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();

  // EFEK ANTI-GESER (LAYOUT SHIFT FIX)
  useEffect(() => {
    if (isCartOpen) {
      // Hitung lebar scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      // Tambahkan padding sebesar scrollbar yang hilang
      document.body.style.paddingRight = `${scrollbarWidth}px`; 
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isCartOpen]);

  // Kita tidak lagi memakai "if (!isCartOpen) return null" di sini
  // karena AnimatePresence butuh mendeteksi elemen saat akan menghilang.

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-100 flex justify-end">
          
          {/* OVERLAY GELAP (Fade In/Out) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* LACI KERANJANG (Slide dari Kanan dengan gaya "Spring/Pegas") */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-[85vw] sm:w-100 bg-white h-full flex flex-col shadow-2xl isolate"
          >
            
            {/* HEADER LACI */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Your Cart
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ISI KERANJANG */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="font-bold tracking-widest uppercase text-sm">Cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.variantId} className="flex gap-4">
                    <div className="w-20 h-24 bg-[#f8f8f8] rounded-lg overflow-hidden shrink-0 border border-zinc-100 p-2">
                      <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider leading-snug">{item.name}</h3>
                          <p className="text-[10px] uppercase font-bold text-zinc-500 mt-0.5">{item.variantName}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.variantId)} className="text-zinc-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-zinc-200 w-24">
                          <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1.5 text-zinc-500 hover:text-black disabled:opacity-30"><Minus className="w-3 h-3" /></button>
                          <span className="flex-1 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} disabled={item.quantity >= item.stock} className="p-1.5 text-zinc-500 hover:text-black disabled:opacity-30"><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="text-sm font-bold">{formatIDR(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER KERANJANG */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-100 bg-white space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="uppercase tracking-widest text-zinc-500">Subtotal</span>
                  <span className="text-xl">{formatIDR(cartTotal)}</span>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Shipping calculated at checkout</p>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="w-full block text-center bg-black text-white py-4 font-bold tracking-[0.2em] uppercase hover:bg-zinc-800 transition-colors shadow-xl shadow-black/10">
                  Checkout
                </Link>
              </div>
            )}
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}