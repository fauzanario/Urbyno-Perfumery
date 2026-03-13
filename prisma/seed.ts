import { PrismaClient, VoucherType } from "../app/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // =============================
  // PRODUCTS
  // =============================

  const product1 = await prisma.product.create({
    data: {
      slug: "urbyno-royal-oud",
      name: "Urbyno Royal Oud",
      description: "Aroma woody premium dengan sentuhan oud elegan.",
      thumbnailUrl: "/images/royal-oud.jpg",
      variants: {
        create: [
          {
            variantName: "30ml",
            price: 150000,
            stock: 50,
            weightGram: 200,
          },
          {
            variantName: "50ml",
            price: 220000,
            stock: 30,
            weightGram: 300,
          },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      slug: "urbyno-midnight-amber",
      name: "Urbyno Midnight Amber",
      description: "Wewangian amber hangat untuk malam hari.",
      thumbnailUrl: "/images/midnight-amber.jpg",
      variants: {
        create: [
          {
            variantName: "30ml",
            price: 140000,
            stock: 40,
            weightGram: 200,
          },
          {
            variantName: "50ml",
            price: 210000,
            stock: 25,
            weightGram: 300,
          },
        ],
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      slug: "urbyno-fresh-citrus",
      name: "Urbyno Fresh Citrus",
      description: "Aroma citrus segar dan energik.",
      thumbnailUrl: "/images/fresh-citrus.jpg",
      variants: {
        create: [
          {
            variantName: "30ml",
            price: 130000,
            stock: 60,
            weightGram: 200,
          },
          {
            variantName: "50ml",
            price: 200000,
            stock: 35,
            weightGram: 300,
          },
        ],
      },
    },
  });

  console.log("✅ Products created");

  // =============================
  // VOUCHER
  // =============================

  await prisma.voucher.create({
    data: {
      code: "URBYNO10",
      name: "Diskon 10%",
      description: "Diskon 10% untuk pembelian minimal 100.000",
      type: VoucherType.PERCENT,
      value: 10,
      maxDiscount: 30000,
      minPurchase: 100000,
      quota: 100,
      isActive: true,
    },
  });

  console.log("✅ Voucher created");

  // =============================
  // LANDING PAGE
  // =============================

  const landing = await prisma.landingPage.create({
    data: {
      key: "home",
      title: "Urbyno Perfumery",
      sections: {
        create: [
          {
            type: "HERO",
            position: 1,
            title: "Discover Your Signature Scent",
            subtitle:
              "Premium handcrafted perfumes made for elegance and confidence.",
            imageUrl: "/images/hero-banner.jpg",
            ctaText: "Shop Now",
            ctaLink: "/products",
          },
          {
            type: "PROMO",
            position: 2,
            title: "Best Seller Collection",
            subtitle: "Explore our most loved fragrances.",
          },
        ],
      },
    },
  });

  console.log("✅ Landing page created");

  console.log("🎉 Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
