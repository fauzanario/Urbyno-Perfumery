import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout - Urbyno Perfumery",
  description: "Secure checkout for your signature scent.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f4] pt-8 pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <h1 className="text-3xl font-bold uppercase tracking-widest mb-8 text-black">Checkout</h1>
        <CheckoutClient />
      </div>
    </div>
  );
}