import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  _req: Request, 
  { params }: { params: Promise<{ slug: string }> } 
) {
  try {
    const { slug: rawSlug } = await params; 
    
    const slug = (rawSlug || "").trim();
    
    if (!slug) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "slug wajib diisi" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        thumbnailUrl: true,
        images: true,
        createdAt: true,
        updatedAt: true,
        variants: {
          where: { isActive: true },
          orderBy: { price: "asc" },
          select: {
            id: true,
            sku: true,
            variantName: true,
            price: true,
            originalPrice: true,
            isSale: true,
            stock: true,
            weightGram: true,
            isActive: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const variants = product.variants ?? [];
    const startingPrice = variants.length > 0 ? variants[0].price : null;
    const totalStock = variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);

    return NextResponse.json({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      thumbnailUrl: product.thumbnailUrl,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      startingPrice,
      totalStock,
      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        variantName: v.variantName,
        price: v.price,
        stock: v.stock,
        weightGram: v.weightGram,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
