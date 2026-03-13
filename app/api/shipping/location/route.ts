import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "province", "city", "district", atau "subdistrict"
    const id = searchParams.get("id"); // ID parent-nya

    const apiKey = process.env.RAJAONGKIR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key belum diset" }, { status: 500 });
    }

    let url = "";
    if (type === "province") {
      url = "https://rajaongkir.komerce.id/api/v1/destination/province";
    } else if (type === "city" && id) {
      url = `https://rajaongkir.komerce.id/api/v1/destination/city/${id}`;
    } else if (type === "district" && id) {
      url = `https://rajaongkir.komerce.id/api/v1/destination/district/${id}`;
    } else {
      return NextResponse.json({ error: "Parameter tidak valid" }, { status: 400 });
    }

    const res = await fetch(url, {
      method: "GET",
      headers: { key: apiKey }
    });

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}