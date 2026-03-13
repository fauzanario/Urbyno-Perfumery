import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { VoucherType } from "@/app/generated/prisma";

type ReqBody = {
  code: string;
  subtotal: number;
};

function badRequest(message: string) {
  return NextResponse.json({ valid: false, error: "INVALID_REQUEST", message }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ReqBody>;

    const code = (body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal);

    if (!code) return badRequest("code wajib diisi");
    if (!Number.isFinite(subtotal) || subtotal <= 0) return badRequest("subtotal wajib angka > 0");

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
      return NextResponse.json({
        valid: false,
        error: "VOUCHER_INVALID",
        message: "Voucher tidak ditemukan atau tidak aktif",
      });
    }

    const now = new Date();

    // ===== waktu mulai/akhir =====
    if (voucher.startsAt && now < voucher.startsAt) {
      return NextResponse.json({
        valid: false,
        error: "VOUCHER_NOT_STARTED",
        message: "Voucher belum mulai berlaku",
      });
    }
    if (voucher.endsAt && now > voucher.endsAt) {
      return NextResponse.json({
        valid: false,
        error: "VOUCHER_EXPIRED",
        message: "Voucher sudah kadaluarsa",
      });
    }

    // ===== minimal belanja =====
    const minPurchase = Number(voucher.minPurchase);
    if (subtotal < minPurchase) {
      return NextResponse.json({
        valid: false,
        error: "MIN_PURCHASE_NOT_MET",
        message: `Minimal belanja untuk voucher ini adalah ${minPurchase}`,
      });
    }

    // ===== quota =====
    if (voucher.quota !== null && voucher.quota !== undefined) {
      const quota = Number(voucher.quota);
      const used = Number(voucher.usedCount);
      if (used >= quota) {
        return NextResponse.json({
          valid: false,
          error: "VOUCHER_QUOTA_REACHED",
          message: "Kuota voucher sudah habis",
        });
      }
    }

    // ===== hitung diskon =====
    let discount = 0;

    if (voucher.type === VoucherType.PERCENT) {
      const percent = Number(voucher.value); // e.g. 10
      discount = Math.floor((subtotal * percent) / 100);

      if (voucher.maxDiscount !== null && voucher.maxDiscount !== undefined) {
        const maxDiscount = Number(voucher.maxDiscount);
        discount = Math.min(discount, maxDiscount);
      }
    } else {
      // FIXED
      discount = Number(voucher.value);
    }

    // diskon tidak boleh melebihi subtotal
    discount = Math.max(0, Math.min(discount, subtotal));

    return NextResponse.json({
      valid: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        minPurchase: voucher.minPurchase,
        maxDiscount: voucher.maxDiscount,
      },
      discount_amount: discount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: "INTERNAL_ERROR", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
