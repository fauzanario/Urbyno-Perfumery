import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// ==========================================
// CREATE: Menyimpan Section Baru
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, position, isActive, title, subtitle, imageUrl, ctaText, ctaLink, payload } = body;

    // 1. Cari ID untuk Landing Page "home"
    const homePage = await prisma.landingPage.findFirst({
      where: { key: "home" }
    });

    if (!homePage) {
      return NextResponse.json({ error: "Halaman Home tidak ditemukan di database" }, { status: 404 });
    }

    // 2. Simpan data baru ke database
    const newSection = await prisma.landingSection.create({
      data: {
        pageId: homePage.id,
        type,
        position: Number(position),
        isActive,
        title,
        subtitle,
        imageUrl,
        ctaText,
        ctaLink,
        payload: payload ? payload : null, // Jaga-jaga kalau ada JSON payload
      }
    });

    return NextResponse.json({ message: "Berhasil membuat section baru", data: newSection }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menyimpan", details: error.message }, { status: 500 });
  }
}

// ==========================================
// UPDATE: Mengubah Section yang Sudah Ada
// ==========================================
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, type, position, isActive, title, subtitle, imageUrl, ctaText, ctaLink, payload } = body;

    if (!id) {
      return NextResponse.json({ error: "ID Section tidak diberikan" }, { status: 400 });
    }

    // Update data di database berdasarkan ID
    const updatedSection = await prisma.landingSection.update({
      where: { id },
      data: {
        type,
        position: Number(position),
        isActive,
        title,
        subtitle,
        imageUrl,
        ctaText,
        ctaLink,
        payload: payload ? payload : null,
      }
    });

    return NextResponse.json({ message: "Berhasil mengupdate section", data: updatedSection }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal mengupdate", details: error.message }, { status: 500 });
  }
}