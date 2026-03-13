"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  price: number;
  thumbnailUrl: string;
  quantity: number;
  stock: number;
};

type CartContextType = {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
  addToCart: (item: CartItem) => void;
  updateQuantity: (variantId: string, qty: number) => void;
  removeFromCart: (variantId: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ambil data dari LocalStorage saat web pertama kali dimuat
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("urbyno_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Simpan ke LocalStorage setiap kali keranjang berubah
  useEffect(() => {
    if (isMounted) localStorage.setItem("urbyno_cart", JSON.stringify(cart));
  }, [cart, isMounted]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.variantId === item.variantId);
      if (existing) {
        // Jika barang sudah ada, tambah quantity-nya (jangan melebihi stok)
        return prev.map(i => i.variantId === item.variantId ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) } : i);
      }
      return [...prev, item]; // Jika barang baru, masukkan ke array
    });
    setIsCartOpen(true); // Otomatis buka laci keranjang saat add to cart
  };

  const updateQuantity = (variantId: string, qty: number) => {
    setCart(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(i => i.variantId !== variantId));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, isCartOpen, setIsCartOpen, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook khusus agar komponen lain gampang manggil keranjang
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};