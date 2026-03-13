import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// CREATE VOUCHER
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validasi kode unik
    const existing = await prisma.voucher.findUnique({ where: { code: body.code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ message: "Kode voucher sudah digunakan!" }, { status: 400 });
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: body.code.toUpperCase(),
        name: body.name,
        description: body.description,
        type: body.type, // "PERCENT" atau "FIXED"
        value: Number(body.value),
        maxDiscount: Number(body.maxDiscount) || 0,
        minPurchase: Number(body.minPurchase) || 0,
        quota: body.quota ? Number(body.quota) : null,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        isActive: body.isActive,
      }
    });
    return NextResponse.json(voucher);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// EDIT VOUCHER
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    // 👇 Ekstrak SATU PER SATU data yang dibutuhkan, abaikan data relasi seperti "redemptions"
    const { 
      id, code, name, description, type, 
      value, maxDiscount, minPurchase, quota, 
      startsAt, endsAt, isActive 
    } = body;

    // Cek jika kode diganti tapi bertabrakan dengan kode voucher lain
    if (code) {
      const existing = await prisma.voucher.findFirst({ 
        where: { code: code.toUpperCase(), NOT: { id: id } } 
      });
      if (existing) {
        return NextResponse.json({ message: "Kode voucher sudah digunakan!" }, { status: 400 });
      }
    }

    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        code: code?.toUpperCase().replace(/\s/g, ''),
        name: name,
        description: description,
        type: type,
        value: Number(value),
        maxDiscount: Number(maxDiscount) || 0,
        minPurchase: Number(minPurchase) || 0,
        quota: quota ? Number(quota) : null,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        isActive: isActive,
      }
    });
    
    return NextResponse.json(voucher);
  } catch (error: any) {
    console.error("Update Voucher Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE VOUCHER
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID diperlukan" }, { status: 400 });

    await prisma.voucher.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}