import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import midtransClient from "midtrans-client";
import { Prisma, VoucherType, OrderStatus } from "@/app/generated/prisma";

type OrderReq = {
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  shipping_address: {
    address_detail: string;
    province_id: number;
    province_name: string;
    city_id: number;
    city_name: string;
    postal_code?: string;
  };
  shipping: {
    courier_code: string;
    courier_service: string;
    shipping_cost: number;
    shipping_etd?: string;
  };
  voucher_code?: string | null;
  items: Array<{ variant_id: string; qty: number }>;
};

function badRequest(message: string, field?: string) {
  return NextResponse.json(
    {
      error: "INVALID_REQUEST",
      message,
      field: field || null,
    },
    { status: 400 }
  );
}

function toMoney(n: number) {
  return new Prisma.Decimal(Number(n.toFixed(2)));
}

function normalizePhone(phone: string) {
  return phone.trim();
}

function validatePostalCode(postalCode?: string | null) {
  const cleaned = (postalCode || "").trim();

  if (!cleaned) return "Kode pos wajib diisi";
  if (!/^\d+$/.test(cleaned)) return "Kode pos harus berupa angka";
  if (cleaned.length < 5) return "Kode pos minimal terdiri dari 5 digit";
  if (cleaned.length > 10) return "Kode pos tidak valid";

  return "";
}

function generateOrderCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `URB-${y}${m}${d}-${rand}`;
}

async function computeVoucherDiscount(params: {
  code?: string | null;
  subtotal: number;
}) {
  const code = (params.code || "").trim().toUpperCase();
  if (!code) return { voucher: null as any, discount: 0 };

  const voucher = await prisma.voucher.findFirst({
    where: { code, isActive: true },
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      maxDiscount: true,
      minPurchase: true,
      quota: true,
      usedCount: true,
      startsAt: true,
      endsAt: true,
      isActive: true,
    },
  });

  if (!voucher) {
    return {
      voucher: null,
      discount: 0,
      error: "Voucher tidak ditemukan atau tidak aktif",
    };
  }

  const now = new Date();
  if (voucher.startsAt && now < voucher.startsAt) {
    return {
      voucher: null,
      discount: 0,
      error: "Voucher belum mulai berlaku",
    };
  }
  if (voucher.endsAt && now > voucher.endsAt) {
    return { voucher: null, discount: 0, error: "Voucher sudah kadaluarsa" };
  }

  const minPurchase = Number(voucher.minPurchase);
  if (params.subtotal < minPurchase) {
    return {
      voucher: null,
      discount: 0,
      error: `Minimal belanja voucher ini ${minPurchase}`,
    };
  }

  if (voucher.quota !== null && voucher.quota !== undefined) {
    const quota = Number(voucher.quota);
    const used = Number(voucher.usedCount);
    if (used >= quota) {
      return { voucher: null, discount: 0, error: "Kuota voucher sudah habis" };
    }
  }

  let discount = 0;
  if (voucher.type === VoucherType.PERCENT) {
    const percent = Number(voucher.value);
    discount = Math.floor((params.subtotal * percent) / 100);

    if (voucher.maxDiscount !== null && voucher.maxDiscount !== undefined) {
      discount = Math.min(discount, Number(voucher.maxDiscount));
    }
  } else {
    discount = Number(voucher.value);
  }

  discount = Math.max(0, Math.min(discount, params.subtotal));
  return { voucher, discount };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<OrderReq>;

    // ===== 1) Validasi request dasar =====
    if (!body.customer?.name?.trim())
      return badRequest("Nama pelanggan wajib diisi", "lastName");
    if (!body.customer?.phone?.trim())
      return badRequest("Nomor WhatsApp wajib diisi", "phone");
    if (!body.shipping_address?.address_detail?.trim())
      return badRequest("Detail alamat wajib diisi", "address");

    const postalCodeError = validatePostalCode(
      body.shipping_address?.postal_code
    );
    if (postalCodeError) return badRequest(postalCodeError, "postalCode");

    if (!Number.isFinite(Number(body.shipping_address?.province_id)))
      return badRequest("Provinsi wajib dipilih");
    if (!Number.isFinite(Number(body.shipping_address?.city_id)))
      return badRequest("Kota/Kabupaten wajib dipilih");

    if (!body.shipping?.courier_code?.trim())
      return badRequest("Kurir pengiriman wajib dipilih");
    if (!body.shipping?.courier_service?.trim())
      return badRequest("Layanan pengiriman wajib dipilih");
    if (
      !Number.isFinite(Number(body.shipping?.shipping_cost)) ||
      Number(body.shipping?.shipping_cost) < 0
    ) {
      return badRequest("Biaya pengiriman tidak valid");
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return badRequest("Item pesanan wajib diisi minimal 1 item");
    }

    const items = body.items.map((it) => ({
      variant_id: String(it.variant_id),
      qty: Number(it.qty),
    }));

    if (items.some((it) => !it.variant_id || !Number.isInteger(it.qty) || it.qty < 1)) {
      return badRequest("Data item pesanan tidak valid");
    }

    // ===== 2) Ambil variant dari DB + validasi stok & aktif =====
    const variantIds = [...new Set(items.map((x) => x.variant_id))];

    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        isActive: true,
        product: { isActive: true },
      },
      select: {
        id: true,
        variantName: true,
        price: true,
        stock: true,
        weightGram: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (variants.length !== variantIds.length) {
      return NextResponse.json(
        {
          error: "VARIANT_NOT_FOUND",
          message: "Ada varian produk yang tidak ditemukan atau tidak aktif",
        },
        { status: 404 }
      );
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    let subtotal = 0;
    let totalWeightGram = 0;

    for (const it of items) {
      const v = variantMap.get(it.variant_id)!;
      if (it.qty > v.stock) {
        return NextResponse.json(
          {
            error: "OUT_OF_STOCK",
            message: `Stok tidak cukup untuk varian ${v.product.name} - ${v.variantName}`,
            variant_id: v.id,
            available_stock: v.stock,
          },
          { status: 409 }
        );
      }

      const price = Number(v.price);
      subtotal += price * it.qty;
      totalWeightGram += Number(v.weightGram) * it.qty;
    }

    // ===== 3) Validasi voucher + hitung diskon =====
    const voucherResult = await computeVoucherDiscount({
      code: body.voucher_code,
      subtotal,
    });

    if ((body.voucher_code || "").trim() && voucherResult.error) {
      return NextResponse.json(
        {
          error: "VOUCHER_INVALID",
          message: voucherResult.error,
        },
        { status: 400 }
      );
    }

    const discountAmount = voucherResult.discount;

    // ===== 4) Hitung grand total =====
    const shippingCost = Number(body.shipping.shipping_cost);
    const grandTotal = Math.max(0, subtotal + shippingCost - discountAmount);

    if (grandTotal <= 0) {
      return NextResponse.json(
        {
          error: "INVALID_TOTAL",
          message: "Total pembayaran tidak valid",
        },
        { status: 400 }
      );
    }

    // ===== 5) Buat order_code =====
    const orderCode = generateOrderCode();

    // ===== 6) Buat Midtrans Snap token (server-side) =====
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    const isProduction =
      String(process.env.MIDTRANS_IS_PRODUCTION || "false") === "true";
    const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

    if (!serverKey || !clientKey) {
      return NextResponse.json(
        {
          error: "SERVER_MISCONFIG",
          message:
            "Konfigurasi pembayaran belum lengkap. Silakan hubungi administrator.",
        },
        { status: 500 }
      );
    }

    const snap = new (midtransClient as any).Snap({
      isProduction,
      serverKey,
      clientKey,
    });

    const midtransItems = items.map((it) => {
      const v = variantMap.get(it.variant_id)!;
      return {
        id: v.id,
        price: Number(v.price),
        quantity: it.qty,
        name: `${v.product.name} - ${v.variantName}`.slice(0, 50),
      };
    });

    midtransItems.push({
      id: "SHIPPING",
      price: shippingCost,
      quantity: 1,
      name: "Shipping Cost",
    });

    if (discountAmount > 0) {
      midtransItems.push({
        id: "DISCOUNT",
        price: -discountAmount,
        quantity: 1,
        name: "Voucher Discount",
      });
    }

    const midtransParam = {
      transaction_details: {
        order_id: orderCode,
        gross_amount: Math.round(grandTotal),
      },
      item_details: midtransItems,
      customer_details: {
        first_name: body.customer.name,
        email: body.customer.email || undefined,
        phone: normalizePhone(body.customer.phone),
        shipping_address: {
          first_name: body.customer.name,
          phone: normalizePhone(body.customer.phone),
          address: body.shipping_address.address_detail,
          city: body.shipping_address.city_name,
          postal_code: body.shipping_address.postal_code || undefined,
          country_code: "IDN",
        },
      },
      callbacks: {
        finish: `${appBaseUrl}/payment/finish?order_code=${encodeURIComponent(
          orderCode
        )}`,
      },
    };

    const snapResp = await snap.createTransaction(midtransParam);
    const snapToken: string = snapResp?.token;

    if (!snapToken) {
      return NextResponse.json(
        {
          error: "MIDTRANS_ERROR",
          message: "Gagal membuat transaksi pembayaran.",
        },
        { status: 502 }
      );
    }

    // ===== 7) Simpan order + items + payment dalam 1 transaksi DB =====
    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderCode,
          customerName: body.customer!.name.trim(),
          customerPhone: normalizePhone(body.customer!.phone),
          customerEmail: body.customer!.email?.trim() || null,

          addressDetail: body.shipping_address!.address_detail.trim(),
          provinceId: Number(body.shipping_address!.province_id),
          provinceName: body.shipping_address!.province_name.trim(),
          cityId: Number(body.shipping_address!.city_id),
          cityName: body.shipping_address!.city_name.trim(),
          postalCode: body.shipping_address!.postal_code?.trim() || null,

          courierCode: body.shipping!.courier_code.trim().toLowerCase(),
          courierService: body.shipping!.courier_service.trim(),
          shippingCost: toMoney(shippingCost),
          shippingEtd: body.shipping!.shipping_etd?.trim() || null,

          voucherId: voucherResult.voucher?.id || null,
          voucherCode: voucherResult.voucher?.code || null,
          discountAmount: toMoney(discountAmount),

          subtotal: toMoney(subtotal),
          grandTotal: toMoney(grandTotal),

          status: OrderStatus.UNPAID,
        },
        select: { id: true, orderCode: true, status: true },
      });

      await tx.orderItem.createMany({
        data: items.map((it) => {
          const v = variantMap.get(it.variant_id)!;
          const unit = Number(v.price);
          return {
            orderId: order.id,
            productId: v.product.id,
            variantId: v.id,
            productNameSnapshot: v.product.name,
            variantNameSnapshot: v.variantName,
            unitPriceSnapshot: toMoney(unit),
            qty: it.qty,
            weightGramSnapshot: Number(v.weightGram),
            lineTotal: toMoney(unit * it.qty),
          };
        }),
      });

      await tx.payment.create({
        data: {
          orderId: order.id,
          midtransOrderId: orderCode,
          snapToken,
          grossAmount: toMoney(grandTotal),
          transactionStatus: "pending",
        },
      });

      return order;
    });

    return NextResponse.json({
      order_code: created.orderCode,
      status: created.status,
      pricing: {
        subtotal,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        grand_total: grandTotal,
        total_weight_gram: totalWeightGram,
      },
      payment: {
        midtrans_order_id: orderCode,
        snap_token: snapToken,
      },
    });
  } catch (err: any) {
    console.error("POST /api/orders error:", err);

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Terjadi kesalahan pada sistem. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}