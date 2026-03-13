import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function normalizePhone(phone: string) {
  return phone.trim();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const orderCode = (searchParams.get("order_code") || "").trim();
    const phone = normalizePhone(searchParams.get("phone") || "");

    if (!orderCode) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "order_code wajib diisi" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "phone wajib diisi" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        orderCode,
        customerPhone: phone,
      },
      select: {
        id: true,
        orderCode: true,
        status: true,
        subtotal: true,
        shippingCost: true,
        discountAmount: true,
        grandTotal: true,
        courierCode: true,
        courierService: true,
        shippingEtd: true,
        createdAt: true,

        items: {
          select: {
            productNameSnapshot: true,
            variantNameSnapshot: true,
            qty: true,
            unitPriceSnapshot: true,
            lineTotal: true,
          },
        },

        shipment: {
          select: {
            trackingNumber: true,
            shippedAt: true,
            deliveredAt: true,
            notes: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order_code: order.orderCode,
      status: order.status,
      created_at: order.createdAt,

      pricing: {
        subtotal: order.subtotal,
        shipping_cost: order.shippingCost,
        discount_amount: order.discountAmount,
        grand_total: order.grandTotal,
      },

      shipping: {
        courier_code: order.courierCode,
        service: order.courierService,
        etd: order.shippingEtd,
        tracking_number: order.shipment?.trackingNumber || null,
        shipped_at: order.shipment?.shippedAt || null,
        delivered_at: order.shipment?.deliveredAt || null,
        notes: order.shipment?.notes || null,
      },

      items: order.items.map((it) => ({
        product_name: it.productNameSnapshot,
        variant_name: it.variantNameSnapshot,
        qty: it.qty,
        unit_price: it.unitPriceSnapshot,
        line_total: it.lineTotal,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
