import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const landing = await prisma.landingPage.findFirst({
      where: {
        key: "home",
        isActive: true,
      },
      select: {
        id: true,
        key: true,
        title: true,
        updatedAt: true,
        sections: {
          where: { isActive: true },
          orderBy: { position: "asc" },
          select: {
            id: true,
            type: true,
            position: true,
            isActive: true, // 👈 TAMBAHKAN BARIS INI
            title: true,
            subtitle: true,
            imageUrl: true,
            ctaText: true,
            ctaLink: true,
            payload: true,
          },
        },
      },
    });

    if (!landing) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Landing page tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: landing.id,
      key: landing.key,
      title: landing.title,
      updatedAt: landing.updatedAt,
      sections: landing.sections,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}