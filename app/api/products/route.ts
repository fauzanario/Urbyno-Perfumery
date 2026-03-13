import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Tangkap semua Query Params
    const q = (searchParams.get("q") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 12)));
    const skip = (page - 1) * limit;

    // Filter Params Baru
    const inStock = searchParams.get("inStock") === "true";
    const outOfStock = searchParams.get("outOfStock") === "true";
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || 999999999;
    const sort = searchParams.get("sort") || "newest";

    // 2. Susun Logika Filter Stok
    let stockFilter: any = {};
    if (inStock && !outOfStock) {
      // Hanya yang punya stok > 0
      stockFilter = { variants: { some: { stock: { gt: 0 }, isActive: true } } };
    } else if (!inStock && outOfStock) {
      // Hanya yang semua variannya stok = 0
      stockFilter = { variants: { none: { stock: { gt: 0 } } } };
    }

    // 3. Susun Where Clause Utama
    const whereClause: any = {
      isActive: true,
      ...stockFilter,
      // Filter Harga: Cari produk yang punya minimal 1 varian di rentang harga ini
      variants: {
        some: {
          price: { gte: minPrice, lte: maxPrice },
          isActive: true
        }
      },
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    };

    // 4. Susun Logika Sorting Prisma
    let orderByClause: any = { createdAt: "desc" }; // default: newest
    if (sort === "alpha-asc") orderByClause = { name: "asc" };
    if (sort === "alpha-desc") orderByClause = { name: "desc" };
    // Catatan: Untuk Sort By Price, kita urutkan di JavaScript setelah di-fetch 
    // karena Prisma cukup rumit untuk order by relation's min value.

    // 5. Eksekusi Query
    const [total, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        orderBy: orderByClause,
        // Kita tidak skip/take di sini JIKA user minta sort by price, agar kita bisa sort seluruh data dulu.
        // Tapi demi performa dasar, kita asumsikan pagination jalan dulu.
        ...(sort.includes("price") ? {} : { skip, take: limit }),
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          thumbnailUrl: true,
          createdAt: true,
          variants: {
            where: { isActive: true },
            orderBy: { price: "asc" },
            select: { price: true, stock: true, originalPrice: true, isSale: true },
          },
        },
      }),
    ]);

    // 6. Transformasi & Sort Manual (Jika sort by price)
    let items = products.map((p) => {
      const activeVariants = p.variants ?? [];
      const startingVariant = activeVariants.length > 0 ? activeVariants[0] : null;
      const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock ?? 0), 0);

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        thumbnailUrl: p.thumbnailUrl,
        startingPrice: startingVariant ? startingVariant.price : 0,
        originalPrice: startingVariant?.originalPrice || null,
        isSale: startingVariant?.isSale || false,
        totalStock,
      };
    });

    // Handle Sort by Price (JavaScript level sorting)
    if (sort === "price-asc") items.sort((a, b) => Number(a.startingPrice) - Number(b.startingPrice));
    if (sort === "price-desc") items.sort((a, b) => Number(b.startingPrice) - Number(a.startingPrice));

    // Handle Pagination manual JIKA tadi kita sort by price
    let finalItems = items;
    let finalTotalPages = Math.ceil(total / limit);
    if (sort.includes("price")) {
      finalItems = items.slice(skip, skip + limit);
    }

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: finalTotalPages,
      items: finalItems,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}