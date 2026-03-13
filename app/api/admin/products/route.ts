import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 👇 Tambahkan 'images' di sini
    const { name, slug, description, thumbnailUrl, images, isActive, variants } = body;

    const newProduct = await prisma.product.create({
      data: {
        name, slug, description, thumbnailUrl, isActive,
        images, // 👈 Tambahkan ini
        variants: {
          create: variants.map((v: any) => ({
            variantName: v.variantName,
            price: Number(v.price),
            stock: Number(v.stock),
            weightGram: Number(v.weightGram || 200),
          }))
        }
      }
    });

    return NextResponse.json({ message: "Berhasil", data: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menyimpan", details: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    // 👇 Tambahkan 'images' di sini
    const { id, name, slug, description, thumbnailUrl, images, isActive, variants } = body;

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id },
        // 👇 Tambahkan 'images' di sini
        data: { name, slug, description, thumbnailUrl, images, isActive }
      });

      await tx.productVariant.deleteMany({ where: { productId: id } });

      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v: any) => ({
            productId: id,
            variantName: v.variantName,
            price: Number(v.price),
            stock: Number(v.stock),
            weightGram: Number(v.weightGram || 200),
            originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
            isSale: v.isSale || false,
          }))
        });
      }
      return prod;
    });

    return NextResponse.json({ message: "Berhasil", data: updatedProduct }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal mengupdate", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Berhasil menghapus" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal", details: error.message }, { status: 500 });
  }
}