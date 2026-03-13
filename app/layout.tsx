import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { CartProvider } from "@/app/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">
        <CartProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <CartDrawer/>         
        </CartProvider>
      </body>
    </html>
  );
}