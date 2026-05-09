"use client";

import { useCart } from "@/app/context/CartContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import Script from "next/script";

const formatIDR = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const validatePostalCode = (postalCode: string) => {
  const cleaned = postalCode.trim();

  if (!cleaned) return "Kode pos wajib diisi.";
  if (!/^\d+$/.test(cleaned)) return "Kode pos harus berupa angka.";
  if (cleaned.length < 5) return "Kode pos minimal terdiri dari 5 digit.";
  if (cleaned.length > 10) return "Kode pos tidak valid.";

  return "";
};

type FieldErrors = Record<string, string>;

export default function CheckoutClient() {
  const { cart, cartTotal } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [voucherError, setVoucherError] = useState("");

  // 1. STATE FORM UTAMA
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    postalCode: "",
    phone: "",
    saveInfo: false,
  });

  // 2. STATE LOKASI (Dinamis dari RajaOngkir)
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const [selectedLocation, setSelectedLocation] = useState({
    provinceId: "",
    provinceName: "",
    cityId: "",
    cityName: "",
    districtId: "",
    districtName: "",
  });

  // 3. STATE PENGIRIMAN & VOUCHER
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [isFetchingShipping, setIsFetchingShipping] = useState(false);

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    amount: number;
  } | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  // Mount & Load Provinces
  useEffect(() => {
    setIsMounted(true);
    fetch("/api/shipping/location?type=province")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) setProvinces(data.data);
      })
      .catch((error) => {
        console.error("Gagal mengambil data provinsi:", error);
      });
  }, []);

  const validateCheckoutForm = () => {
    const errors: FieldErrors = {};

    if (!formData.email.trim()) {
      errors.email = "Email wajib diisi.";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Nama wajib diisi.";
    }

    if (!formData.address.trim()) {
      errors.address = "Detail alamat wajib diisi.";
    }

    const postalCodeError = validatePostalCode(formData.postalCode);
    if (postalCodeError) {
      errors.postalCode = postalCodeError;
    }

    if (!formData.phone.trim()) {
      errors.phone = "Nomor WhatsApp wajib diisi.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Perubahan Provinsi -> Fetch Kota
  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const provId = e.target.value;
    const provName = e.target.options[e.target.selectedIndex].text;

    setSelectedLocation((prev) => ({
      ...prev,
      provinceId: provId,
      provinceName: provName,
      cityId: "",
      cityName: "",
      districtId: "",
      districtName: "",
    }));
    setCities([]);
    setDistricts([]);
    setShippingOptions([]);
    setSelectedShipping(null);
    setSubmitError("");

    try {
      const res = await fetch(`/api/shipping/location?type=city&id=${provId}`);
      const data = await res.json();
      if (data?.data) setCities(data.data);
    } catch (error) {
      console.error("Gagal mengambil data kota:", error);
      setSubmitError("Terjadi kesalahan saat memuat data kota/kabupaten.");
    }
  };

  // Handle Perubahan Kota -> Fetch Kecamatan & Hitung Ongkir
  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    const cityName = e.target.options[e.target.selectedIndex].text;

    setSelectedLocation((prev) => ({
      ...prev,
      cityId,
      cityName,
      districtId: "",
      districtName: "",
    }));
    setDistricts([]);
    setSubmitError("");
    setShippingOptions([]);
    setSelectedShipping(null);

    try {
      const res = await fetch(
        `/api/shipping/location?type=district&id=${cityId}`
      );
      const data = await res.json();
      if (data?.data) setDistricts(data.data);
    } catch (error) {
      console.error("Gagal mengambil data kecamatan:", error);
      setSubmitError("Terjadi kesalahan saat memuat data kecamatan.");
    }

    fetchShipping(cityId);
  };

  // Handle Perubahan Kecamatan
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distId = e.target.value;
    const distName = e.target.options[e.target.selectedIndex].text;
    setSelectedLocation((prev) => ({
      ...prev,
      districtId: distId,
      districtName: distName,
    }));
    setSubmitError("");
  };

  // ==========================================
  // FETCH API RAJAONGKIR COST
  // ==========================================
  const fetchShipping = async (cityId: string) => {
    if (cart.length === 0 || !cityId) return;
    setIsFetchingShipping(true);
    setSubmitError("");

    try {
      const totalWeight = cart.reduce(
        (sum, item) => sum + 100 * item.quantity,
        0
      );

      const res = await fetch("/api/shipping/cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_city_id: Number(cityId),
          couriers: ["jne", "jnt", "sicepat"],
          total_weight_gram: totalWeight,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setShippingOptions([]);
        setSelectedShipping(null);
        setSubmitError(
          data?.message ||
            "Gagal mengambil data ongkos kirim. Silakan coba lagi."
        );
        return;
      }

      if (data.results) {
        const options: any[] = [];

        data.results.forEach((courier: any) => {
          courier.services.forEach((srv: any) => {
            options.push({
              code: courier.courier_code,
              name: courier.courier_name,
              service: srv.service,
              description: srv.description,
              cost: srv.cost,
              etd: srv.etd,
            });
          });
        });

        setShippingOptions(options);

        if (options.length > 0) {
          const cheapest = options.reduce((prev, curr) =>
            prev.cost < curr.cost ? prev : curr
          );
          setSelectedShipping(cheapest);
        } else {
          setSelectedShipping(null);
          setSubmitError(
            "Layanan pengiriman tidak tersedia untuk alamat yang dipilih."
          );
        }
      } else {
        setShippingOptions([]);
        setSelectedShipping(null);
        setSubmitError(
          "Data ongkos kirim tidak tersedia untuk alamat yang dipilih."
        );
      }
    } catch (error) {
      console.error("Gagal ambil ongkir:", error);
      setShippingOptions([]);
      setSelectedShipping(null);
      setSubmitError(
        "Terjadi kesalahan saat memproses ongkos kirim. Silakan coba lagi."
      );
    } finally {
      setIsFetchingShipping(false);
    }
  };

  // ==========================================
  // VOUCHER & CHECKOUT LOGIC (DARI API)
  // ==========================================
  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;

    setIsApplyingVoucher(true);
    setVoucherError("");

    try {
      const res = await fetch("/api/vouchers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherInput, subtotal: cartTotal }),
      });

      const data = await res.json();

      if (data.valid) {
        setAppliedVoucher({
          code: data.voucher.code,
          amount: data.discount_amount,
        });
        setVoucherError("");
      } else {
        setAppliedVoucher(null);
        setVoucherError(data.message || "Voucher tidak valid.");
      }
    } catch (error) {
      console.error("Voucher error:", error);
      setAppliedVoucher(null);
      setVoucherError("Terjadi kesalahan saat mengecek voucher.");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateCheckoutForm()) return;

    if (!selectedLocation.districtId) {
      setSubmitError("Pilih kecamatan terlebih dahulu.");
      return;
    }

    if (!selectedShipping) {
      setSubmitError("Pilih metode pengiriman terlebih dahulu.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        customer: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          email: formData.email,
        },
        shipping_address: {
          address_detail: `${formData.address}, Kec. ${selectedLocation.districtName}`,
          province_id: Number(selectedLocation.provinceId),
          province_name: selectedLocation.provinceName,
          city_id: Number(selectedLocation.cityId),
          city_name: selectedLocation.cityName,
          postal_code: formData.postalCode,
        },
        shipping: {
          courier_code: selectedShipping.code,
          courier_service: selectedShipping.service,
          shipping_cost: selectedShipping.cost,
          shipping_etd: selectedShipping.etd,
        },
        voucher_code: appliedVoucher?.code || null,
        items: cart.map((i) => ({ variant_id: i.variantId, qty: i.quantity })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.payment && data.payment.snap_token) {
        (window as any).snap.pay(data.payment.snap_token, {
          onSuccess: function () {
            localStorage.removeItem("urbyno_cart");
            window.location.href = `/payment/finish?order_code=${data.order_code}`;
          },
          onPending: function () {
            localStorage.removeItem("urbyno_cart");
            window.location.href = `/payment/finish?order_code=${data.order_code}`;
          },
          onError: function () {
            setSubmitError("Pembayaran gagal diproses. Silakan coba lagi.");
            setIsLoading(false);
          },
          onClose: function () {
            setSubmitError(
              "Pop-up pembayaran ditutup sebelum transaksi diselesaikan."
            );
            setIsLoading(false);
          },
        });
      } else {
        if (data?.field) {
          setFieldErrors((prev) => ({
            ...prev,
            [data.field]: data.message || "Input tidak valid.",
          }));
        } else {
          setSubmitError(data?.message || "Gagal membuat transaksi.");
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setSubmitError(
        "Terjadi kesalahan saat memproses checkout. Silakan coba lagi."
      );
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  // Hitung Grand Total
  const grandTotal =
    cartTotal - (appliedVoucher?.amount || 0) + (selectedShipping?.cost || 0);

  if (!isMounted) return null;

  if (cart.length === 0) {
    return (
      <div className="min-h-[50vh] bg-white flex flex-col items-center justify-center p-6 border border-zinc-200 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Keranjang Kosong</h2>
        <p className="text-zinc-500 mb-6">
          Silakan pilih parfum signature Anda terlebih dahulu.
        </p>
        <Link
          href="/products"
          className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-zinc-800"
        >
          Kembali ke Toko
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-white text-[#333] flex flex-col-reverse lg:flex-row border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {/* KIRI: FORM CHECKOUT */}
        <div className="flex-1 px-6 lg:px-16 py-10 lg:py-12">
          <div className="flex items-center text-xs text-zinc-500 mb-10">
            <Link href="/cart" className="hover:text-black">
              Keranjang
            </Link>
            <ChevronRight className="w-3 h-3 mx-2" />
            <span className="font-bold text-black">Informasi</span>
            <ChevronRight className="w-3 h-3 mx-2" />
            <span>Pengiriman & Pembayaran</span>
          </div>

          <form
            id="checkout-form"
            onSubmit={handleCheckout}
            className="space-y-10 max-w-2xl"
          >
            {submitError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {/* KONTAK */}
            <section>
              <h2 className="text-xl font-medium mb-4">Kontak</h2>
              <div>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-zinc-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </section>

            {/* PENGANTARAN */}
            <section>
              <h2 className="text-xl font-medium mb-4">Pengantaran</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Nama depan"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full border border-zinc-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <input
                      required
                      type="text"
                      name="lastName"
                      placeholder="Nama belakang"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full border border-zinc-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    {fieldErrors.lastName && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    required
                    type="text"
                    name="address"
                    placeholder="Detail Alamat (Jalan, Blok, No Rumah)"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border border-zinc-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  {fieldErrors.address && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.address}
                    </p>
                  )}
                </div>

                {/* DYNAMIC DROPDOWNS: PROVINSI -> KOTA -> KECAMATAN */}
                <select
                  required
                  value={selectedLocation.provinceId}
                  onChange={handleProvinceChange}
                  className="w-full border border-zinc-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                >
                  <option value="" disabled>
                    Pilih Provinsi...
                  </option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    required
                    disabled={!selectedLocation.provinceId}
                    value={selectedLocation.cityId}
                    onChange={handleCityChange}
                    className="w-full border border-zinc-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white disabled:bg-zinc-100"
                  >
                    <option value="" disabled>
                      Pilih Kota/Kabupaten...
                    </option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    required
                    disabled={!selectedLocation.cityId}
                    value={selectedLocation.districtId}
                    onChange={handleDistrictChange}
                    className="w-full border border-zinc-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white disabled:bg-zinc-100"
                  >
                    <option value="" disabled>
                      Pilih Kecamatan...
                    </option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      required
                      type="text"
                      name="postalCode"
                      placeholder="Kode Pos"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full border border-zinc-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    {fieldErrors.postalCode && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldErrors.postalCode}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      required
                      type="tel"
                      name="phone"
                      placeholder="No. WhatsApp"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-zinc-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* METODE PENGIRIMAN */}
            <section>
              <h2 className="text-xl font-medium mb-4">Metode pengiriman</h2>
              <div className="border border-zinc-300 rounded-md divide-y divide-zinc-200 overflow-hidden relative">
                {isFetchingShipping && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex justify-center items-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}
                {shippingOptions.length === 0 && !isFetchingShipping ? (
                  <div className="p-4 text-sm text-zinc-500 text-center">
                    Isi alamat pengiriman untuk melihat kurir.
                  </div>
                ) : (
                  shippingOptions.map((option, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                        selectedShipping?.name === option.name &&
                        selectedShipping?.service === option.service
                          ? "bg-blue-50/50"
                          : "bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={
                            selectedShipping?.name === option.name &&
                            selectedShipping?.service === option.service
                          }
                          onChange={() => {
                            setSelectedShipping(option);
                            setSubmitError("");
                          }}
                          className="w-4 h-4 text-blue-600 border-zinc-300 focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium uppercase">
                            {option.name} - {option.service}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {option.description} (Est: {option.etd} hari)
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {option.cost === 0 ? "GRATIS" : formatIDR(option.cost)}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </section>

            {/* PEMBAYARAN MIDTRANS */}
            <section>
              <h2 className="text-xl font-medium mb-1">Pembayaran</h2>
              <p className="text-xs text-zinc-500 mb-4">
                Aman dan dienkripsi via Midtrans.
              </p>
              <div className="border border-zinc-300 rounded-md overflow-hidden bg-zinc-50">
                <div className="p-4 border-b border-zinc-200 bg-white flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Virtual Account, QRIS, E-Wallet, Card
                  </span>
                  <CreditCard className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="p-8 text-center flex flex-col items-center">
                  <ShieldCheck className="w-10 h-10 text-zinc-300 mb-3" />
                  <p className="text-sm text-zinc-600">
                    Mengalihkan Anda ke antarmuka Midtrans untuk menyelesaikan
                    pembelian dengan aman.
                  </p>
                </div>
              </div>
            </section>

            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  isFetchingShipping ||
                  !selectedShipping ||
                  !selectedLocation.districtId
                }
                className="w-full lg:w-auto px-10 py-4 bg-black hover:bg-zinc-800 text-white font-medium rounded-md transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Memproses..." : "Bayar sekarang"}
              </button>
            </div>
          </form>
        </div>

        {/* KANAN: RINGKASAN PESANAN */}
        <div className="w-full lg:w-[45%] bg-[#fafafa] lg:border-l border-zinc-200 px-6 lg:px-12 py-10 lg:py-12">
          <div className="lg:sticky lg:top-10 max-w-md">
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.variantId} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 bg-white border border-zinc-200 rounded-lg shrink-0">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="w-full h-full object-cover p-1 rounded-lg mix-blend-multiply"
                    />
                    <span className="absolute -top-2 -right-2 bg-zinc-500/90 backdrop-blur-sm text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-[#333] leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      {item.variantName}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-[#333]">
                    {formatIDR(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-zinc-200 mb-6" />

            <div className="flex gap-3 mb-2 relative">
              <input
                type="text"
                placeholder="Kode diskon"
                value={voucherInput}
                onChange={(e) => {
                  setVoucherInput(e.target.value);
                  setVoucherError("");
                }}
                className="flex-1 border border-zinc-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:border-black uppercase"
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                disabled={isApplyingVoucher || !voucherInput.trim()}
                className="px-5 py-3 rounded-md text-sm font-medium transition-colors bg-black text-white disabled:bg-zinc-200 disabled:text-zinc-400"
              >
                {isApplyingVoucher ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Pakai"
                )}
              </button>
            </div>

            {voucherError && (
              <p className="mb-4 text-xs text-red-500">{voucherError}</p>
            )}

            <hr className="border-zinc-200 mb-6" />

            <div className="space-y-3 text-sm text-[#555]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#333]">
                  {formatIDR(cartTotal)}
                </span>
              </div>

              {appliedVoucher && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center gap-1">
                    Diskon{" "}
                    <span className="text-[10px] bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                      {appliedVoucher.code}
                    </span>
                  </span>
                  <span className="font-medium">
                    - {formatIDR(appliedVoucher.amount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Pengiriman</span>
                <span className="font-medium text-[#333]">
                  {!selectedShipping ? "-" : formatIDR(selectedShipping.cost)}
                </span>
              </div>
            </div>

            <hr className="border-zinc-200 my-6" />

            <div className="flex justify-between items-end">
              <span className="text-base text-[#333] font-medium">Total</span>
              <div className="text-right">
                <span className="text-xs text-zinc-500 mr-2">IDR</span>
                <span className="text-2xl font-semibold text-[#333]">
                  {formatIDR(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}