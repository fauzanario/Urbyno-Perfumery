import { NextResponse } from "next/server";

type ReqBody = {
  destination_city_id: number;
  couriers: string[];
  total_weight_gram: number;
  price?: "lowest" | "highest";
};

function badRequest(message: string) {
  return NextResponse.json(
    { error: "INVALID_REQUEST", message },
    { status: 400 }
  );
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms = 15000
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("REQUEST_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ReqBody>;

    const destinationId = Number(body.destination_city_id);
    const weight = Math.round(Number(body.total_weight_gram));

    const allowedCouriers = ["jne", "jnt", "sicepat", "pos", "tiki"];
    const couriers = Array.isArray(body.couriers)
      ? body.couriers
          .map((c) => String(c).trim().toLowerCase())
          .filter((c) => allowedCouriers.includes(c))
      : [];

    const price = body.price ? String(body.price).toLowerCase() : undefined;
    const priceFilter =
      price === "lowest" || price === "highest" ? price : undefined;

    if (!Number.isFinite(destinationId) || destinationId <= 0) {
      return badRequest("Kota tujuan pengiriman tidak valid.");
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      return badRequest("Berat total pesanan tidak valid.");
    }

    if (couriers.length === 0) {
      return badRequest("Kurir pengiriman tidak valid.");
    }

    const baseUrl =
      process.env.RAJAONGKIR_BASE_URL ||
      "https://rajaongkir.komerce.id/api/v1";
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    const originId = Number(process.env.URBYNO_ORIGIN_ID);

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "SERVER_MISCONFIG",
          message:
            "Konfigurasi layanan pengiriman belum lengkap. Silakan hubungi administrator.",
        },
        { status: 500 }
      );
    }

    if (!Number.isFinite(originId) || originId <= 0) {
      return NextResponse.json(
        {
          error: "SERVER_MISCONFIG",
          message:
            "Konfigurasi lokasi pengiriman belum valid. Silakan hubungi administrator.",
        },
        { status: 500 }
      );
    }

    const results = await Promise.all(
      couriers.map(async (courier) => {
        try {
          const form = new URLSearchParams();
          form.set("origin", String(originId));
          form.set("destination", String(destinationId));
          form.set("weight", String(weight));
          form.set("courier", courier);
          if (priceFilter) form.set("price", priceFilter);

          const res = await fetchWithTimeout(
            `${baseUrl}/calculate/domestic-cost`,
            {
              method: "POST",
              headers: {
                key: apiKey,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: form.toString(),
            }
          );

          const json = await res.json().catch(() => null);

          if (!res.ok || !json?.data) {
            return {
              courier_code: courier,
              courier_name: courier.toUpperCase(),
              services: [],
              _error:
                json?.meta?.message ||
                `RajaOngkir error (HTTP ${res.status})`,
            };
          }

          const rows: any[] = Array.isArray(json?.data) ? json.data : [];
          const courierName =
            (rows?.[0]?.name as string) ?? courier.toUpperCase();

          const services = rows.map((row) => ({
            service: String(row.service ?? ""),
            description: String(row.description ?? ""),
            cost: Number(row.cost ?? 0),
            etd: String(row.etd ?? ""),
            note: "",
          }));

          return {
            courier_code: courier,
            courier_name: courierName,
            services,
          };
        } catch (error: any) {
          return {
            courier_code: courier,
            courier_name: courier.toUpperCase(),
            services: [],
            _error:
              error?.message === "REQUEST_TIMEOUT"
                ? "Request timeout"
                : "Gagal menghubungi layanan ongkir",
          };
        }
      })
    );

    const cleaned = results
      .filter((r) => Array.isArray(r.services) && r.services.length > 0)
      .map((r) => ({
        courier_code: r.courier_code,
        courier_name: r.courier_name,
        services: r.services,
      }));

    if (cleaned.length === 0) {
      return NextResponse.json(
        {
          error: "SHIPPING_UNAVAILABLE",
          message:
            "Layanan pengiriman tidak tersedia untuk alamat yang dipilih.",
          results: [],
          meta: {
            requested_couriers: couriers,
            price: priceFilter ?? null,
            empty_couriers: results
              .filter((r) => r.services.length === 0)
              .map((r) => r.courier_code),
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      origin_city_id: originId,
      destination_city_id: destinationId,
      total_weight_gram: weight,
      results: cleaned,
      meta: {
        requested_couriers: couriers,
        price: priceFilter ?? null,
        empty_couriers: results
          .filter((r) => r.services.length === 0)
          .map((r) => r.courier_code),
      },
    });
  } catch (err: any) {
    console.error("POST /api/shipping/cost error:", err);

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Terjadi kesalahan saat mengambil data ongkos kirim.",
      },
      { status: 500 }
    );
  }
}